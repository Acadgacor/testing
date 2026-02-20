import { NextResponse } from "next/server";
import { getServerSupabase } from "@/shared/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  const body = await req.json();
  const productIds: string[] = body?.productIds ?? [];
  if (user && productIds.length) {
    await supabase.from("product_comparison_log").insert({ user_id: user.id, product_ids: productIds });
  }
  return NextResponse.json({ ok: true });
}
