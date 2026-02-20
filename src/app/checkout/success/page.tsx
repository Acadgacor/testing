import { getServerSupabaseRSC } from "@/shared/lib/supabaseServerRSC";

export default async function SuccessPage() {
  const supabase = await getServerSupabaseRSC();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (user) {
    const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
    const cartId = cart?.id as string | undefined;
    const { data: items } = await supabase
      .from("cart_items")
      .select("qty, products(id, name, price)")
      .eq("cart_id", cartId);
    const rows = (items ?? []) as any[];
    const total = rows.reduce((s: number, r: any) => s + Number(r.products?.price) * r.qty, 0);
    const { data: order } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total, status: "paid" })
      .select("id")
      .single();
    const orderId = order?.id as string | undefined;
    if (orderId) {
      const orderItems = rows.map((r: any) => ({ order_id: orderId, product_id: r.products?.id, qty: r.qty, price: r.products?.price }));
      if (orderItems.length) await supabase.from("order_items").insert(orderItems);
    }
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
  }
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto h-16 w-16 rounded-full bg-brand-primary/40" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-brand-dark">Payment Successful</h1>
          <p className="mt-2 text-sm text-brand-light">Thanks for your purchase. Your order is confirmed.</p>
        </div>
      </div>
    </section>
  );
}
