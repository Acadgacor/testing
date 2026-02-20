"use client";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function FilterBar() {
  const params = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(() => params.get("category") || "");
  const [sort, setSort] = useState(() => params.get("sort") || "new");
  const [min, setMin] = useState(() => params.get("min") || "");
  const [max, setMax] = useState(() => params.get("max") || "");
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
    router.push(`/products?${q.toString()}`);
  }

  function clear() {
    router.push(`/products`);
  }

  const key = params.toString();
  return (
    <div key={key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {(categories.length ? categories : ["cleanser", "toner", "serum", "moisturizer", "sunscreen", "sunblock"])?.map((c) => (
            <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Newest</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
          <option value="rating">Best Rated</option>
        </Select>
        <Input placeholder="Min Price" value={min} onChange={(e) => setMin(e.target.value)} />
        <Input placeholder="Max Price" value={max} onChange={(e) => setMax(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button onClick={apply}>Apply</Button>
          <Button variant="ghost" onClick={clear}>Clear</Button>
        </div>
      </div>
    </div>
  );
}
