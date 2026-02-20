import { NextResponse } from "next/server";

import { getServerSupabase } from "@/shared/lib/supabaseServer";

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

  // Check user metadata to route dynamically
  const hasProfile = !!authData.session.user.user_metadata?.skin_profile;
  const destinationPath = hasProfile ? "/dashboard" : "/questionnaire";
  return NextResponse.redirect(new URL(destinationPath, requestUrl.origin));
}
