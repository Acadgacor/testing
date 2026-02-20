import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnvValidated } from "./publicEnv";

export async function getServerSupabase() {
  const { url, anon } = getPublicEnvValidated();
  const cookieStore = (await cookies()) as any;
  return createServerClient(url as string, anon as string, {
    cookies: {
      get(name: string) {
        try { return cookieStore.get(name)?.value; } catch {}
      },
      set(name: string, value: string, options: any) {
        try { cookieStore.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: any) {
        try { cookieStore.set({ name, value: "", ...options, maxAge: 0 }); } catch {}
      },
    },
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      autoRefreshToken: true,
    },
  });
}
