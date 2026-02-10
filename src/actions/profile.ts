"use server";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const full_name = String(formData.get("full_name") || "");
  const avatar_url = String(formData.get("avatar_url") || "");
  const supabase = await getServerSupabaseRSC();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return;
  await supabase.from("users").upsert({ id: user.id, full_name, avatar_url });
  revalidatePath("/dashboard");
}

export async function syncProfile() {
  const supabase = await getServerSupabaseRSC();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    console.log("No user found in syncProfile");
    return;
  }

  // DEBUGGING: Check products table visibility
  const { count, error: productsError } = await supabase.from("products").select("*", { count: "exact", head: true });
  console.log("SyncProfile - Products Check:", { count, error: productsError });

  const meta = user.user_metadata;
  console.log("SyncProfile - User Metadata:", meta);

  const full_name = meta.full_name || meta.name || "";
  const avatar_url = meta.avatar_url || meta.picture || "";

  console.log("SyncProfile - Extracted:", { full_name, avatar_url });

  /*
   * DEBUGGING: Check if we can read the user first.
   */
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("SyncProfile - Existing User Check:", { found: !!existingUser, selectError: selectError ? JSON.stringify(selectError) : null });

  const { data, error } = await supabase.from("users").upsert({
    id: user.id,
    full_name,
    avatar_url
  }).select();

  if (error) {
    console.log("SyncProfile - Upsert FAILED");
    // console.dir is better for Error objects sometimes
    console.dir(error, { depth: null });
  } else {
    console.log("SyncProfile - Upsert SUCCEEDED", data);
  }

  revalidatePath("/dashboard");
}
