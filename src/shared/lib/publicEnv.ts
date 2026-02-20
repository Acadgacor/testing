export type PublicEnv = { url?: string; anon?: string };

function trimOrUndefined(v?: string | null) {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

export function getPublicEnv(): PublicEnv {
  const g: any = typeof window !== "undefined" ? (window as any) : (globalThis as any);
  const fromWindow = (g.__env as Record<string, string>) || {};

  // Prefer NEXT_PUBLIC_* then fallback to non-prefixed common names
  const url =
    trimOrUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
    trimOrUndefined(process.env.SUPABASE_URL as string | undefined) ||
    trimOrUndefined(fromWindow.NEXT_PUBLIC_SUPABASE_URL) ||
    trimOrUndefined(fromWindow.SUPABASE_URL) ||
    (typeof document !== "undefined"
      ? trimOrUndefined(
          document.querySelector('meta[name="x-public-supabase-url"]')?.getAttribute("content")
        )
      : undefined);

  const anon =
    trimOrUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    trimOrUndefined(process.env.SUPABASE_ANON_KEY as string | undefined) ||
    trimOrUndefined(fromWindow.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trimOrUndefined(fromWindow.SUPABASE_ANON_KEY) ||
    (typeof document !== "undefined"
      ? trimOrUndefined(
          document.querySelector('meta[name="x-public-supabase-anon-key"]')?.getAttribute("content")
        )
      : undefined);

  return { url, anon };
}

export function getPublicEnvValidated(): Required<PublicEnv> {
  const { url, anon } = getPublicEnv();
  if (!url || !anon) {
    throw new Error(
      "Missing public Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }
  return { url, anon };
}
