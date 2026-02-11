import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const MODEL = process.env.NEXT_GROQ_MODEL || "openai/gpt-oss-120b";
const CHAT_MAX_TOKENS = Number(process.env.NEXT_GROQ_MAX_TOKENS || 2048);
const ANALYSIS_MAX_TOKENS = Number(process.env.NEXT_GROQ_ANALYSIS_MAX_TOKENS || 256);

const ANALYSIS_PROMPT =
  "You are an Indonesian dermatology assistant. Analyze the user's skin profile based on their answers. " +
  "Return ONLY a comma-separated list of short keywords (max 2-3 words per keyword). " +
  "Example: 'Kulit Berminyak, Rentan Jerawat, Pori Besar'. " +
  "No bullet points, no numbering, no introductions or conclusions—just the keywords.";

const CHAT_PROMPT =
  "You are a friendly and personal skincare and body care bestie. You speak in a warm, engaging, and casual Indonesian tone (using terms like 'Kak', 'Bestie'). " +
  "Your ONLY purpose is to help with skincare, body care, and dermatology concerns. " +
  "If the user asks about anything unrelated to skin or body care (e.g., math, politics, coding, general life advice not related to self-care), you MUST politely refuse. " +
  "Say something like: 'Maaf ya Bestie, aku cuma ngerti soal skincare dan body care nih. Yuk ngobrol soal kulit glowing aja! ✨' " +
  "Do NOT answer off-topic questions. " +
  "Give routine suggestions, ingredient tips, and safety notes conversationally.";

// Schema Validation (Strict: Role must be "user" or "assistant" only. "system" is forbidden to prevent injection)
const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]), // FIX: Allow "assistant" so chat history works, but BLOCK "system"
      content: z.string().max(1000, "Message content exceeds 1000 characters"),
    })
  ),
  mode: z.enum(["chat", "analysis"]).optional(),
});

export async function POST(req: Request) {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.NEXT_UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.NEXT_UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.error("Critical Security Misconfiguration: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing.");
      return NextResponse.json({ error: "Service unavailable due to configuration error." }, { status: 500 });
    }

    try {
      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
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

    // 4. Existing Logic
    const apiKey = process.env.NEXT_GROQ_API || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ API key" }, { status: 500 });
    }

    const isAnalysis = mode === "analysis";
    const systemPrompt = isAnalysis ? ANALYSIS_PROMPT : CHAT_PROMPT;
    const temperature = isAnalysis ? 0.3 : 0.6;
    const maxTokens = isAnalysis ? ANALYSIS_MAX_TOKENS : CHAT_MAX_TOKENS;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: chatMessages as any,
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("Groq route error", error);
    const status = error?.status || error?.response?.status;
    const detail = error?.message || error?.response?.data || "Unknown error";
    return NextResponse.json({ error: "Groq request failed", status, detail }, { status: 500 });
  }
}