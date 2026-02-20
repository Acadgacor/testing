"use client";
import Image from "next/image";
import Link from "next/link";
import Button from "@/shared/ui/Button";
import Badge from "@/shared/ui/Badge";
import type { Product } from "@/features/products/types";
import { useCartStore } from "@/features/cart/store";
import { useCompareStore } from "@/store/compareStore";
import { analyzeIngredients } from "@/lib/ingredientMatcher";
import type { UserProfile } from "@/types/user";

type Props = {
  products?: Product[];
  userProfile?: UserProfile | null;
};

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ProductComparison({ products, userProfile }: Props) {
  const items = products ?? [];
  const removeFromCompare = useCompareStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);

  const bestPrice = items.length ? Math.min(...items.map((p) => p.price)) : undefined;
  const bestRating = items.length ? Math.max(...items.map((p) => p.rating)) : undefined;

  if (items.length === 0) {
    return (
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-brand-dark">Compare Products</h1>
            <p className="mt-2 text-sm text-brand-light">Highlight shows better value per metric.</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-brand-light">No products selected for comparison.</p>
            <div className="mt-4">
              <Link href="/products" className="inline-flex rounded-2xl bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover">Browse products</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark">Compare Products</h1>
          <p className="mt-2 text-sm text-brand-light">Highlight shows better value per metric.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm table-fixed">
              <thead>
                <tr>
                  <th className="w-48 bg-neutral-50 p-4 border-b border-neutral-200 font-medium text-brand-dark"></th>
                  {items.map((p) => (
                    <th key={p.id} className="w-72 p-4 text-center border-b border-l border-neutral-200 align-top relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-brand-light hover:bg-neutral-200 hover:text-brand-dark transition-colors"
                        title="Remove from comparison"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="relative mx-auto mt-2 h-32 w-32 overflow-hidden rounded-xl bg-neutral-100">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-neutral-400">No Image</div>
                        )}
                      </div>
                      <div className="mt-3 font-semibold text-brand-dark leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">{p.name}</div>
                      <div className="mt-3">
                        <Button
                          className="w-full text-xs py-2 h-auto"
                          onClick={() => addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            category: p.category,
                            ingredients: p.ingredients
                          })}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {/* Price */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark">Price</th>
                  {items.map((p) => (
                    <td key={p.id} className={`p-4 text-center border-l border-neutral-200 ${p.price === bestPrice ? "bg-success/10" : ""}`}>
                      <span className={`font-semibold ${p.price === bestPrice ? "text-success" : "text-brand-dark"}`}>
                        {formatRp(p.price)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark">Rating</th>
                  {items.map((p) => (
                    <td key={p.id} className={`p-4 text-center border-l border-neutral-200 ${p.rating === bestRating ? "bg-brand-secondary" : ""}`}>
                      <div className="inline-flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className={`font-semibold ${p.rating === bestRating ? "text-yellow-700" : "text-brand-dark"}`}>
                          {p.rating}
                        </span>
                        <span className="text-brand-light text-xs">/ 5</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Skin Type */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark">Skin Type</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-center border-l border-neutral-200 text-brand-light">
                      {p.skinType || "-"}
                    </td>
                  ))}
                </tr>

                {/* Size */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark">Size</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-center border-l border-neutral-200 text-brand-light">
                      {p.size || "-"}
                    </td>
                  ))}
                </tr>

                {/* Benefits */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark align-top">Benefits</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 align-top text-left border-l border-neutral-200">
                      {p.benefits && p.benefits.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-brand-light space-y-1">
                          {p.benefits.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-brand-light">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Key Ingredients */}
                <tr>
                  <th className="bg-neutral-50 p-4 font-medium text-brand-dark align-top">Key Ingredients</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 align-top text-left border-l border-neutral-200">
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {p.keyIngredients && p.keyIngredients.length > 0 ? (
                          p.keyIngredients.map((ing, idx) => {
                            const warnings = userProfile ? analyzeIngredients([ing], userProfile) : [];
                            const hasWarning = warnings.length > 0;
                            return (
                              <Badge
                                key={idx}
                                variant={hasWarning ? "outline" : "brand"}
                                className={hasWarning ? "bg-red-50 text-error border-error border" : ""}
                                title={hasWarning ? warnings.join("\n") : undefined}
                              >
                                {hasWarning && <span className="mr-1">⚠️</span>}
                                {ing}
                              </Badge>
                            )
                          })
                        ) : (
                          <span className="text-xs text-brand-light">-</span>
                        )}
                      </div>
                    </td>
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
