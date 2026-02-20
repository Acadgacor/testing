import { NextResponse } from "next/server";

import { getServerSupabase } from "@/shared/lib/supabaseServer";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
