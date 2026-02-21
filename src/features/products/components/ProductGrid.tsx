"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { getSupabaseClient } from "@/shared/lib/supabaseClient";
import type { Product } from "../types";

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

        // Ambil parameter dari URL
        const category = params.get("category") || undefined;
        const sort = params.get("sort") || "new";
        const priceMin = params.get("min") ? Number(params.get("min")) : undefined;
        const priceMax = params.get("max") ? Number(params.get("max")) : undefined;
        const includeTerms = params.get("include")?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const excludeTerms = params.get("exclude")?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];

        // Tambahin "ingredients" ke dalam .select()
        let query = supabase
          .from("products")
          .select("id,name,price,image,rating,category_id,product_type_id,how_to_use,category,ingredients,reviews(rating),outbound_clicks(id)");

        if (category) query = query.eq("category", category);
        if (priceMin !== undefined) query = query.gte("price", priceMin);
        if (priceMax !== undefined) query = query.lte("price", priceMax);

        if (sort === "price_asc") {
          query = query.order("price", { ascending: true });
        } else if (sort === "price_desc") {
          query = query.order("price", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        // 1. Mapping data mentah dari database
        let list: Product[] = (data || []).map((r: any) => {
          const reviews = r.reviews || [];
          const reviewCount = reviews.length;
          const totalRating = reviews.reduce((sum: number, rev: any) => sum + (rev.rating || 0), 0);
          const avgRating = reviewCount > 0 ? totalRating / reviewCount : (Number(r.rating) || 0);
          const clickCount = (r.outbound_clicks || []).length;

          // Parsing ingredients biar pasti jadi array of strings
          let parsedIngredients: string[] = [];
          if (Array.isArray(r.ingredients)) parsedIngredients = r.ingredients;
          else if (typeof r.ingredients === 'string') parsedIngredients = r.ingredients.split(',');

          return {
            id: String(r.id),
            name: r.name,
            price: Number(r.price) || 0,
            image: r.image || "",
            rating: avgRating,
            review_count: reviewCount,
            click_count: clickCount,
            category: r.category || "",
            ingredients: parsedIngredients, // Dibutuhkan buat filter Dewa
          } as Product;
        });

        // 2. FILTER DEWA (JavaScript Logic untuk Akurasi Tinggi)
        if (includeTerms.length > 0 || excludeTerms.length > 0) {
          list = list.filter(p => {
            const joinedIng = (p.ingredients || []).join(' ').toLowerCase();

            // Cek apakah produk punya SEMUA bahan yang dicari
            const hasAllIncluded = includeTerms.every(term => joinedIng.includes(term));
            if (includeTerms.length > 0 && !hasAllIncluded) return false;

            // Cek apakah produk BEBAS DARI bahan yang diblacklist
            const hasAnyExcluded = excludeTerms.some(term => joinedIng.includes(term));
            if (excludeTerms.length > 0 && hasAnyExcluded) return false;

            return true;
          });
        }

        if (active) setItems(list);
      } catch (e: any) {
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
      {error && (
        <div className="mb-4 rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{error}</div>
      )}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <div className="text-4xl mb-4">🏜️</div>
          <h3 className="text-lg font-bold text-brand-dark mb-2">Produk tidak ditemukan</h3>
          <p className="text-sm text-brand-light">Coba kurangi filter kandungan atau ganti kategori pencarianmu.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}