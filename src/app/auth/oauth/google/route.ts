import { NextResponse } from "next/server";

import { getServerSupabase } from "@/shared/lib/supabaseServer";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const nextPath = next.startsWith("/") ? next : `/${next}`;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent("auth_failed")}`, requestUrl.origin));
  }

  return NextResponse.redirect(data.url);
}
