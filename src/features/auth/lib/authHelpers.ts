import { redirect } from "next/navigation";
import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";

// Use this to PROTECT pages (e.g. Dashboard)
export async function requireUser() {
  const supabase = await getServerSupabaseRSC();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }
  return user;
}

// Use this to REDIRECT logged-in users (e.g. away from Login page)
export async function redirectIfAuthenticated(path = "/dashboard") {
  const supabase = await getServerSupabaseRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(path);
  }
}
