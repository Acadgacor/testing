"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveSkinProfile(_prevState: { error?: string } | null, formData: FormData) {
  // Data user_metadata sudah diupdate via Supabase Client di QuestionnaireForm.tsx
  // Action ini hanya tinggal me-refresh cache halaman dan memindahkan rute.

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
