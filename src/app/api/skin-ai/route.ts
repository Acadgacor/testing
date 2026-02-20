import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { processSkinAnalysis } from "@/features/chat/services/aiService";

// Schema Validation
const contentSchema = z.union([
  z.string(),
  z.array(
    z.union([
      z.object({ type: z.literal("text"), text: z.string() }),
      z.object({ type: z.literal("image_url"), image_url: z.object({ url: z.string() }) }),
    ])
  ),
]);

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: contentSchema,
    })
  ),
  mode: z.enum(["chat", "analysis", "diagnosis"]).optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (Upstash)
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.NEXT_UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.NEXT_UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.error("Critical Security Misconfiguration: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing.");
      return NextResponse.json({ error: "Service unavailable due to configuration error." }, { status: 500 });
    }

    try {
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
      });

      const identifier = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "anon";
      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        return NextResponse.json({ error: "Too Many Requests. Please try again later." }, { status: 429 });
      }
    } catch (error) {
      console.error("Rate Limit Error:", error);
      return NextResponse.json({ error: "Rate limit service error" }, { status: 500 });
    }

    // 2. Authentication (Supabase)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Input Validation (Zod)
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request body", details: validation.error.format() }, { status: 400 });
    }

    const { messages, mode } = validation.data;
    const apiKey = process.env.NEXT_GROQ_API || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ API key" }, { status: 500 });
    }

    // 4. Business Logic (Service Layer)
    const content = await processSkinAnalysis({ messages: messages as any, mode: mode as any, apiKey });

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("Route Handler Error:", error);
    const status = error?.status || 500;
    const detail = error?.message || "Internal Server Error";
    return NextResponse.json({ error: "Request failed", detail }, { status });
  }
}