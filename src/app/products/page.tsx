import { Suspense } from "react";
import FilterBar from "@/features/products/components/FilterBar";
import ProductGrid from "@/features/products/components/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  return (
    <section className="min-h-screen py-16 sm:py-24 bg-neutral-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl">Skincare Collection</h1>
          <p className="mt-4 text-lg text-brand-light">Discover science-backed formulas tailored for your unique skin journey.</p>
        </div>

        <div className="flex flex-col gap-10">
          <Suspense fallback={<div className="animate-pulse h-16 w-full bg-neutral-100 rounded-2xl"></div>}>
            <FilterBar />
          </Suspense>

          <div className="min-h-[400px]">
            <Suspense fallback={<div className="text-center py-20 text-brand-light">Loading collection...</div>}>
              <ProductGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
