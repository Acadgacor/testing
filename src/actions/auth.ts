"use server";

import { redirect } from "next/navigation";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";
import { LoginSchema, RegisterSchema } from "@/lib/schemas";
import { type SupabaseClient } from "@supabase/supabase-js";

async function checkQuestionnaire(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("skin_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  return !!data;
}

export async function loginAction(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: "Invalid data format" };
  }

  const { email, password } = parsed.data;
  const supabase = await getServerSupabaseRSC();

  // Smart Login: Try to sign in first
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  let userId = authData?.user?.id;

  if (authError) {
    // Fallback: Auto-register if sign-in fails
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: email.split("@")[0] }
      }
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    userId = signUpData?.user?.id;
  }

  if (!userId) {
    return { error: "Authentication failed" };
  }

  const hasProfile = await checkQuestionnaire(supabase, userId);
  redirect(hasProfile ? "/dashboard" : "/questionnaire");
}

export async function registerAction(formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: "Invalid data format" };
  }

  const { email, password, full_name } = parsed.data;
  const supabase = await getServerSupabaseRSC();

  // Smart Register: Try to sign up first
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } }
  });

  let userId = authData?.user?.id;

  if (authError) {
    // Fallback: Auto-login if sign-up fails (e.g., user already exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      return { error: signInError.message };
    }

    userId = signInData?.user?.id;
  }

  if (!userId) {
    return { error: "Authentication failed" };
  }

  const hasProfile = await checkQuestionnaire(supabase, userId);
  redirect(hasProfile ? "/dashboard" : "/questionnaire");
}
