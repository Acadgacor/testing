"use client";
import ProductComparison from "@/components/ProductComparison";
import { useCompareStore } from "@/store/compareStore";
import type { Product } from "@/features/products/types";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getUserProfile } from "@/lib/ingredientMatcher";
import type { UserProfile } from "@/types/user";

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function run() {
      if (ids.length === 0) {
        setSelected([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const supabase = getSupabaseClient();

        // Fetch User
        const { data: { user } } = await supabase.auth.getUser();
        if (active && user) {
          setUserProfile(getUserProfile(user));
        }

        const { data, error } = await supabase
          .from("products")
          .select("id,name,price,ingredients,concerns,skin_type,size,image")
          .in("id", ids);
        if (error) throw error;
        const rows = (data || []).map((r: any) => ({
          id: String(r.id),
          name: r.name,
          price: Number(r.price) || 0,
          image: r.image || "/vercel.svg",
          rating: 0,
          skinType: Array.isArray(r.skin_type) ? r.skin_type.join(", ") : String(r.skin_type ?? ""),
          keyIngredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [], // Populate ingredients
          benefits: Array.isArray(r.concerns) ? r.concerns : [],
          size: String(r.size ?? ""),
          category: "",
        })) as Product[];
        if (active) setSelected(rows);
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load compared products");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [ids]);

  return (
    <div>
      {error ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="my-4 rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{error}</div>
        </div>
      ) : null}
      {loading ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="my-4 text-sm text-brand-light">Loading…</div>
        </div>
      ) : null}
      <ProductComparison products={selected} userProfile={userProfile} />
    </div>
  );
}
