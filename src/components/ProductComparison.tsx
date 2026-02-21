"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/shared/ui/Button";
import Badge from "@/shared/ui/Badge";
import type { Product } from "@/features/products/types";
import { useCartStore } from "@/features/cart/store";
import { useCompareStore } from "@/features/compare/store";
import { analyzeIngredients, type UserSkinProfile } from "@/features/products/lib/ingredientAnalyzer";

type Props = {
  products?: Product[];
  userProfile?: UserSkinProfile | null;
};

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ProductComparison({ products, userProfile }: Props) {
  const [mounted, setMounted] = useState(false);

  // LOG DEBUGGER: Untuk mengecek apakah data profil berhasil sampai ke Client
  console.log("Data Profil untuk AI di Halaman Compare:", userProfile);

  const storeItems = useCompareStore((s) => s.items);
  const items = products && products.length > 0 ? products : storeItems;
  const removeFromCompare = useCompareStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const bestPrice = items.length ? Math.min(...items.map((p) => p.price)) : undefined;
  const bestRating = items.length ? Math.max(...items.map((p) => p.rating)) : undefined;

  if (items.length === 0) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 bg-neutral-50/50 min-h-[60vh] flex flex-col justify-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary/10 text-brand-primary mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" /></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Bandingkan Produk</h1>
          <p className="text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Pilih produk yang ingin kamu adu untuk melihat perbandingan harga, kandungan AI, serta manfaat yang paling pas dengan profil kulitmu.
          </p>
          <div className="pt-6">
            <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-all duration-200">
              Cari Produk Sekarang
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Helper arrays to map exactly 3 columns
  const emptySlotsCount = Math.max(0, 3 - items.length);
  const emptySlots = Array.from({ length: emptySlotsCount });

  return (
    <section className="py-12 sm:py-16 bg-neutral-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl mb-3">Komparasi</h1>
            <p className="text-sm text-neutral-500">
              Mengevaluasi {items.length} produk untuk melihat mana yang terbaik untuk kulitmu.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-dark border border-neutral-300 shadow-sm hover:bg-neutral-50 hover:border-brand-primary transition-all duration-200">
            + Tambah Produk (Maks 3)
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm table-fixed">
              <thead>
                <tr>
                  {/* Spesifikasi Header */}
                  <th className="w-56 bg-neutral-50/80 p-6 border-b border-neutral-200 align-bottom">
                    <span className="font-semibold text-neutral-500 uppercase tracking-widest text-xs">Kriteria</span>
                  </th>
                  {/* Product Cards */}
                  {items.map((p) => (
                    <th key={p.id} className="w-80 p-8 text-center border-b border-l border-neutral-200 align-top relative group bg-white">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 hover:bg-rose-100 hover:text-rose-600 transition-colors z-10 border border-neutral-100"
                        title="Hapus dari komparasi"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>

                      <div className="flex flex-col items-center justify-between h-full">
                        <div className="w-full flex flex-col items-center">
                          <Link href={`/products/${p.id}`} className="relative block h-44 w-44 overflow-hidden rounded-2xl bg-neutral-50 border border-neutral-100 mb-5 transition-transform hover:scale-105">
                            {p.image ? (
                              <Image src={p.image} alt={p.name} fill className="object-cover p-2 mix-blend-multiply" />
                            ) : (
                              <div className="h-full w-full bg-neutral-50 flex items-center justify-center text-neutral-400 text-xs">No Image</div>
                            )}
                          </Link>

                          <Link href={`/products/${p.id}`} className="block w-full" title={p.name}>
                            <h3 className="font-bold text-brand-dark text-base leading-snug line-clamp-2 hover:text-brand-primary transition-colors">
                              {p.name}
                            </h3>
                          </Link>

                          {p.category && (
                            <span className="mt-3 inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                              {p.category}
                            </span>
                          )}
                        </div>

                        <div className="mt-6 w-full">
                          <Button
                            className="w-full text-sm py-3 rounded-xl font-semibold bg-brand-primary text-white hover:bg-yellow-600 transition-colors shadow-sm"
                            onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, category: p.category, ingredients: p.ingredients })}
                          >
                            Masukkan Keranjang
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty space if less than 3 products */}
                  {emptySlots.map((_, i) => (
                    <th key={`empty-${i}`} className="w-80 p-6 border-b border-l border-neutral-100 bg-neutral-50/50 align-middle text-center">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 bg-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        </div>
                        <span className="text-sm font-medium text-neutral-500 tracking-wide">Slot Kosong</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {/* Analisa AI (KANDUNGAN PERSONAL) */}
                <tr className="hover:bg-neutral-50/30 transition-colors">
                  <th className="bg-white p-6 font-semibold text-brand-dark align-top border-r border-neutral-100">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                      Analisa AI
                    </div>
                    <p className="mt-2 text-xs text-neutral-400 font-normal leading-relaxed">Pencocokan kandungan berdasarkan profil kulitmu.</p>
                  </th>
                  {items.map((p) => (
                    <td key={p.id} className="p-6 align-top border-l border-neutral-100 bg-white">
                      <div className="flex flex-wrap gap-2.5">
                        {(!p.ingredients || p.ingredients.length === 0) ? (
                          <span className="text-sm text-neutral-400 italic">Data kandungan belum tersedia</span>
                        ) : (
                          analyzeIngredients(p.ingredients, userProfile).map((badge, idx) => {
                            let badgeClass = "";
                            if (badge.status === 'negative') badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                            else if (badge.status === 'positive') badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            else if (badge.status === 'highlight') badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                            else badgeClass = "bg-neutral-50 text-neutral-600 border-neutral-200";

                            return (
                              <Badge key={idx} variant="outline" className={`px-2.5 py-1.5 text-xs font-medium rounded-lg ${badgeClass}`}>
                                {badge.label}
                              </Badge>
                            );
                          })
                        )}
                      </div>
                    </td>
                  ))}
                  {emptySlots.map((_, i) => (
                    <td key={`empty-ai-${i}`} className="p-6 bg-neutral-50/50 border-l border-neutral-100"></td>
                  ))}
                </tr>

                {/* Harga */}
                <tr className="hover:bg-neutral-50/30 transition-colors">
                  <th className="bg-white p-6 font-semibold text-brand-dark align-middle border-r border-neutral-100">Harga</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-6 text-center border-l border-neutral-100 bg-white align-middle">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className={`text-xl font-bold tracking-tight ${p.price === bestPrice ? "text-emerald-600" : "text-brand-dark"}`}>
                          {formatRp(p.price)}
                        </span>
                        {p.price === bestPrice && items.length > 1 && (
                          <span className="inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                            Termurah
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {emptySlots.map((_, i) => (
                    <td key={`empty-price-${i}`} className="p-6 bg-neutral-50/50 border-l border-neutral-100"></td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="hover:bg-neutral-50/30 transition-colors">
                  <th className="bg-white p-6 font-semibold text-brand-dark align-middle border-r border-neutral-100">Rating & Ulasan</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-6 text-center border-l border-neutral-100 bg-white align-middle">
                      <div className="inline-flex items-center justify-center gap-2 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className={`font-bold text-base ${p.rating === bestRating ? "text-brand-dark" : "text-neutral-600"}`}>
                          {p.rating > 0 ? p.rating.toFixed(1) : "0.0"}
                        </span>
                        <span className="text-neutral-400 text-xs font-medium">/ 5.0</span>
                      </div>
                    </td>
                  ))}
                  {emptySlots.map((_, i) => (
                    <td key={`empty-rating-${i}`} className="p-6 bg-neutral-50/50 border-l border-neutral-100"></td>
                  ))}
                </tr>

                {/* Tipe Kulit */}
                <tr className="hover:bg-neutral-50/30 transition-colors">
                  <th className="bg-white p-6 font-semibold text-brand-dark align-top border-r border-neutral-100">Rekomendasi Kulit</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-6 text-center border-l border-neutral-100 bg-white align-top">
                      <span className="inline-flex items-center justify-center rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200">
                        {p.skinType || "Semua Tipe Kulit"}
                      </span>
                    </td>
                  ))}
                  {emptySlots.map((_, i) => (
                    <td key={`empty-skintype-${i}`} className="p-6 bg-neutral-50/50 border-l border-neutral-100"></td>
                  ))}
                </tr>

                {/* Manfaat */}
                <tr className="hover:bg-neutral-50/30 transition-colors">
                  <th className="bg-white p-6 font-semibold text-brand-dark align-top border-r border-neutral-100">Manfaat Utama</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-6 align-top text-left border-l border-neutral-100 bg-white">
                      {p.benefits && p.benefits.length > 0 ? (
                        <ul className="space-y-3">
                          {p.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                              <div className="rounded-full bg-emerald-100 p-1 mt-0.5 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12" /></svg>
                              </div>
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-neutral-400 italic">Data manfaat belum tersedia</span>
                      )}
                    </td>
                  ))}
                  {emptySlots.map((_, i) => (
                    <td key={`empty-benefits-${i}`} className="p-6 bg-neutral-50/50 border-l border-neutral-100"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
