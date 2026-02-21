"use client";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/shared/lib/supabaseClient";

export default function FilterBar() {
  const params = useSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(() => params.get("category") || "");
  const [sort, setSort] = useState(() => params.get("sort") || "new");
  const [min, setMin] = useState(() => params.get("min") || "");
  const [max, setMax] = useState(() => params.get("max") || "");

  // State baru untuk Filter Dewa (Ingredients)
  const [include, setInclude] = useState(() => params.get("include") || "");
  const [exclude, setExclude] = useState(() => params.get("exclude") || "");

  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        setLoadingCats(true);
        const supabase = getSupabaseClient();
        const { data } = await supabase.from("products").select("category");
        const vals = (data || [])
          .map((r: any) => (r?.category ? String(r.category) : null))
          .filter((v: any): v is string => !!v);
        const distinct = Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b));
        if (active) setCategories(distinct);
      } finally {
        if (active) setLoadingCats(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  function apply() {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (sort) q.set("sort", sort);
    if (min) q.set("min", min);
    if (max) q.set("max", max);
    if (include) q.set("include", include);
    if (exclude) q.set("exclude", exclude);
    router.push(`/products?${q.toString()}`);
  }

  function clear() {
    setCategory("");
    setSort("new");
    setMin("");
    setMax("");
    setInclude("");
    setExclude("");
    router.push(`/products`);
  }

  const key = params.toString();
  return (
    <div key={key} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
        <h3 className="font-bold text-brand-dark">Filter Produk</h3>
      </div>

      {/* Baris 1: Filter Umum */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua Kategori</option>
          {(categories.length ? categories : ["cleanser", "toner", "serum", "moisturizer", "sunscreen", "sunblock"])?.map((c) => (
            <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Terbaru</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
          <option value="rating">Rating Tertinggi</option>
        </Select>
        <Input placeholder="Harga Min (Rp)" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
        <Input placeholder="Harga Max (Rp)" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
      </div>

      {/* Baris 2: Filter Dewa (Kandungan) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end pt-2 border-t border-neutral-100">
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-emerald-600 mb-1.5 ml-1">✨ MENGANDUNG Bahan (pisahkan koma)</label>
          <Input placeholder="Cth: Niacinamide, Ceramide" value={include} onChange={(e) => setInclude(e.target.value)} className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500" />
        </div>
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-rose-600 mb-1.5 ml-1">🚫 BEBAS Bahan (pisahkan koma)</label>
          <Input placeholder="Cth: Alcohol, Fragrance" value={exclude} onChange={(e) => setExclude(e.target.value)} className="border-rose-200 focus:border-rose-500 focus:ring-rose-500" />
        </div>
        <div className="lg:col-span-4 flex items-center gap-3">
          <Button onClick={apply} className="w-full">Terapkan Filter</Button>
          <Button variant="outline" onClick={clear} className="w-full sm:w-auto">Reset</Button>
        </div>
      </div>
    </div>
  );
}