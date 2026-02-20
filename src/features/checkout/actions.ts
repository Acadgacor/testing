"use server";
import Stripe from "stripe";
import { getServerSupabase } from "@/shared/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
  const supabase = await getServerSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return;
  const secret = process.env.STRIPE_SECRET_KEY as string;
  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
  const cartId = cart?.id as string | undefined;
  const { data: items } = await supabase
    .from("cart_items")
    .select("qty, products(name, price, image)")
    .eq("cart_id", cartId);

  type CartItemJoin = { qty: number; products: { name: string; price: number; image?: string | null } };
  const rows = (items ?? []) as any[];
  const lineItems = rows.map((r) => ({
    price_data: {
      currency: "usd",
      product_data: { name: r.products?.name, images: r.products?.image ? [r.products.image] : undefined },
      unit_amount: Math.round(Number(r.products?.price) * 100),
    },
    quantity: r.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
  });

  redirect(session.url as string);
}
