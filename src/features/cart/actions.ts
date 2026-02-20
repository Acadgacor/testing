"use server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

// Helper: Get existing Cart ID OR Create new Cart for LOGGED IN USER
async function getOrCreateCartId(supabase: any, userId: string): Promise<string> {
  // 1. Try to find existing cart for this user
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cart) return cart.id;

  // 2. Create new cart
  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) {
    console.error("Cart creation failed. Full Error Object:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to create cart. Error: ${JSON.stringify(error)}`);
  }

  if (!created) {
    throw new Error("Cart creation failed: No data returned.");
  }

  return created.id;
}

export async function addToCart(formData: FormData) {
  const productId = String(formData.get("productId"));
  const qty = Math.max(1, Number(formData.get("qty") ?? 1)); // Validate qty >= 1

  console.log("addToCart Action Called", { productId, qty });

  const supabase = await getServerSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    // Should not happen if client-side checks are working, but good for security
    throw new Error("User must be logged in to add to cart");
  }

  console.log("Current User:", user.id);

  const cartId = await getOrCreateCartId(supabase, user.id);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id,quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, quantity: qty });
  }

  revalidatePath("/cart");
}

export async function updateCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const qty = Number(formData.get("qty"));

  if (qty <= 0) {
    return removeCartItem(formData);
  }

  const supabase = await getServerSupabase();
  await supabase.from("cart_items").update({ quantity: qty }).eq("id", itemId);
  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId"));
  const supabase = await getServerSupabase();
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
}

export async function clearCart() {
  const supabase = await getServerSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) return;

  const cartId = await getOrCreateCartId(supabase, user.id);

  if (cartId) {
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
    revalidatePath("/cart");
  }
}

export async function getCartItems() {
  const supabase = await getServerSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) return [];

  const cartId = await getOrCreateCartId(supabase, user.id);

  const { data: items, error } = await supabase
    .from("cart_items")
    .select(`
      quantity,
      product_id,
      products (
        id,
        name,
        price,
        image,
        category
      )
    `)
    .eq("cart_id", cartId);

  if (error || !items) {
    console.error("Failed to fetch cart items:", error);
    return [];
  }

  // Format the result to match the Zustand CartItem type
  return items.map((item: any) => ({
    id: item.product_id,
    name: item.products?.name || "Unknown Product",
    price: item.products?.price || 0,
    image: item.products?.image || "",
    category: item.products?.category || "",
    qty: item.quantity,
  }));
}
