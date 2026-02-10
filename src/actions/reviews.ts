"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";
import { ReviewSchema } from "@/lib/schemas";

export async function submitReview(_prevState: any, formData: FormData) {
  const supabase = await getServerSupabaseRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = ReviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: "Invalid data format" };
  }

  const { productId, rating, comment } = parsed.data;

  // Check if review exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  let error;

  if (existingReview) {
    // Update existing review
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        rating: Number(rating),
        comment,
      })
      .eq("id", existingReview.id);
    error = updateError;
  } else {
    // Insert new review
    const { error: insertError } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: productId,
      rating: Number(rating),
      comment,
    });
    error = insertError;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/products/[id]");
  return { success: true };
}
