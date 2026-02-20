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

  // --- NEW: Calculate and Update Product Rating ---
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (allReviews && allReviews.length > 0) {
    const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalRating / allReviews.length;

    await supabase
      .from("products")
      .update({
        rating: averageRating,
        review_count: allReviews.length,
      })
      .eq("id", productId);
  } else {
    // If no reviews (unlikely since we just added one, but good for safety), set to 0 or keep as is
    // For now, let's just update if we have data
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export async function getProductRatingSummary(productId: string) {
  const supabase = await getServerSupabaseRSC();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching rating summary:", error);
    return { average: 0, count: 0 };
  }

  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  const average = total / data.length;

  // --- NEW: Sync to products table for catalog consistency ---
  await supabase
    .from("products")
    .update({
      rating: average,
      review_count: data.length,
    })
    .eq("id", productId);

  return { average, count: data.length };
}

