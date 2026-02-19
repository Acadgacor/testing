"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Product } from "@/types/product";

export default function ProductGrid() {
  const params = useSearchParams();
  const key = params.toString();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const supabase = getSupabaseClient();
        const category = params.get("category") || undefined;
        const sort = params.get("sort") || "new";
        const priceMin = params.get("min") ? Number(params.get("min")) : undefined;
        const priceMax = params.get("max") ? Number(params.get("max")) : undefined;

        let query = supabase
          .from("products")
          .select("id,name,price,image,rating,category_id,product_type_id,how_to_use,category,reviews(rating),outbound_clicks(id)");

        if (category) query = query.eq("category", category);
        if (priceMin !== undefined) query = query.gte("price", priceMin);
        if (priceMax !== undefined) query = query.lte("price", priceMax);

        if (sort === "price_asc") {
          query = query.order("price", { ascending: true });
        } else if (sort === "price_desc") {
          query = query.order("price", { ascending: false });
        } else {
          // default/new
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        const list: Product[] = (data || []).map((r: any) => {
          // Calculate relational counts safely
          const reviews = r.reviews || [];
          const reviewCount = reviews.length;
          const totalRating = reviews.reduce((sum: number, rev: any) => sum + (rev.rating || 0), 0);
          const avgRating = reviewCount > 0 ? totalRating / reviewCount : (Number(r.rating) || 0);

          const clicks = r.outbound_clicks || [];
          const clickCount = clicks.length;

          return {
            id: String(r.id),
            name: r.name,
            price: Number(r.price) || 0,
            image: r.image || "",
            rating: avgRating,
            review_count: reviewCount,
            click_count: clickCount,
            skinType: r.skinType || "",
            keyIngredients: Array.isArray(r.keyIngredients) ? r.keyIngredients : [],
            benefits: Array.isArray(r.benefits) ? r.benefits : [],
            size: r.size || "",
            category: r.category || "",
            category_id: Number(r.category_id) || 0,
            product_type_id: Number(r.product_type_id) || 0,
            how_to_use: r.how_to_use || "",
            ingredients: Array.isArray(r.keyIngredients) ? r.keyIngredients : [],
          };
        });
        if (active) setItems(list);
      } catch (e: any) {
        console.error("🔥 ProductGrid Error:", e?.message || e);
        if (e?.details) {
          console.error("Details:", e.details);
        }
        if (active) setError(e?.message || "Gagal memuat produk");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [key, params]);

  return (
    <div key={key}>
      {error ? (
        <div className="mb-4 rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{error}</div>
      ) : null}
      {loading ? (
        <div className="text-sm text-brand-light">Loading products…</div>
      ) : null}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image,
              rating: p.rating,
              category: p.category,
              review_count: p.review_count,
              click_count: p.click_count,
            }}
          />
        ))}
      </div>
    </div>
  );
}
