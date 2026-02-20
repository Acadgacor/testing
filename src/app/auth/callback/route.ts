import { NextResponse } from "next/server";

import { getServerSupabase } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", requestUrl.origin));
  }

  const supabase = await getServerSupabase();
  const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError || !authData.session) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", requestUrl.origin));
  }

  // Check skin_profiles to route dynamically
  const { data: profile } = await supabase
    .from("skin_profiles")
    .select("id")
    .eq("user_id", authData.session.user.id)
    .single();

  const destinationPath = profile ? "/dashboard" : "/questionnaire";
  return NextResponse.redirect(new URL(destinationPath, requestUrl.origin));
}
