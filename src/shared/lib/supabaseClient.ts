import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnvValidated } from "./publicEnv";

export function getSupabaseClient() {
  const { url, anon } = getPublicEnvValidated();
  return createBrowserClient(url as string, anon as string);
}
