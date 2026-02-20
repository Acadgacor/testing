"use server";
import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const full_name = String(formData.get("full_name") || "");
  const avatar_url = String(formData.get("avatar_url") || "");
  const supabase = await getServerSupabaseRSC();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    console.log("updateProfile - No user found");
    return;
  }

  console.log("updateProfile - Updating:", { id: user.id, full_name, avatar_url });

  // 1. Update Auth Metadata (Backup/Primary for Dashboard)
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name, avatar_url }
  });

  if (authError) {
    console.error("updateProfile - Auth Update Error:", authError);
  }

  // 2. Try to update public.users table (Best Practice for Relations)
  const { error } = await supabase.from("users").upsert({
    id: user.id,
    full_name,
    avatar_url
  });

  if (error) {
    console.error("updateProfile - Table Update Error (Public table might be missing):", error);
  } else {
    console.log("updateProfile - Table Update Success");
  }

  revalidatePath("/dashboard");
}