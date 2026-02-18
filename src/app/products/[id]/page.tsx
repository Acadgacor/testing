import { Suspense } from "react";
import { getServerSupabase } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewList from "@/components/reviews/ReviewList";
import type { Product } from "@/types/product";
import type { Metadata, ResolvingMetadata } from "next";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata(
  { params }: Params,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return {
      title: "Product Not Found - Beaulytics",
    };
  }

  const supabase = await getServerSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, category, ingredients")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product Not Found - Beaulytics",
    };
  }

  // Use description or fallback to a generated description
  const description =
    product.description ||
    `Buy ${product.name}. Category: ${product.category}. Key ingredients: ${Array.isArray(product.ingredients)
      ? product.ingredients.slice(0, 3).join(", ")
      : "various"
    }.`;

  return {
    title: `${product.name} - Beli di Beaulytics`,
    description: description.slice(0, 160), // SEO best practice: limit description length
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("products")
    .select(
      "id,name,price,description,brand,ingredients,skin_type,how_to_use,size,image,concerns,category,tokopedia_url,shopee_url,category_id,product_type_id,rating"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const product: Product & {
    description?: string;
    ingredients?: string[];
    skin_type?: string[];
    concerns?: string[];
    how_to_use?: string;
    brand?: string;
    tokopedia_url?: string | null;
    shopee_url?: string | null;
  } = {
    id: data.id,
    name: data.name ?? "Product",
    price: Number(data.price) || 0,
    image: data.image ?? "",
    rating: Number(data.rating ?? 0) || 0,
    skinType: String(data.skin_type ?? ""),
    keyIngredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    benefits: Array.isArray(data.concerns) ? data.concerns : [],
    size: data.size ?? "",
    category: data.category ?? "",
    category_id: Number(data.category_id) || 0,
    product_type_id: Number(data.product_type_id) || 0,
    description: data.description ?? "",
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    skin_type: Array.isArray(data.skin_type) ? data.skin_type : [],
    concerns: Array.isArray(data.concerns) ? data.concerns : [],
    how_to_use: data.how_to_use ?? "",
    brand: data.brand ?? "",
    tokopedia_url: data.tokopedia_url ?? null,
    shopee_url: data.shopee_url ?? null,
  };

  const ingredients: string[] = Array.isArray(product.ingredients) ? product.ingredients : [];
  const skinTypeText = Array.isArray(product.skin_type) ? product.skin_type.join(", ") : String(product.skin_type ?? "All");

  function formatRp(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }
  const ratingVal = Number((product as any)?.rating);
  const hasRating = Number.isFinite(ratingVal);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.price,
      availability: "https://schema.org/InStock", // Assuming in stock for now
      url: `https://www.beaulytics.com/products/${product.id}`,
    },
    brand: {
      "@type": "Brand",
      name: product.brand || "Unknown",
    },
    // Add aggregateRating if available
    ...(hasRating
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingVal,
          reviewCount: 1, // Placeholder if review count isn't available in this query
        },
      }
      : {}),
  };

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
          {/* Image Section */}
          <div className="relative rounded-3xl overflow-hidden bg-neutral-50 aspect-square shadow-sm">
            {product.image ? (
              <Image src={product.image as string} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-300">No Image</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-semibold text-brand-dark">{formatRp(Number(product.price) || 0)}</p>
            {hasRating ? <Rating value={ratingVal} /> : null}
          </div>

          {/* Details Section */}
          <div className="mt-10 lg:mt-0">
            <h5 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-4xl">{product.name}</h5>
            <div className="mt-6 space-y-6">
              <p className="text-base text-brand-light leading-relaxed">{product.description}</p>

              <div className="border-t border-neutral-100 pt-6">
                <h3 className="text-sm font-semibold text-brand-dark">Key Ingredients</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ingredients.length > 0 ? (
                    ingredients.map((ing, i) => (
                      <Badge key={i} variant="outline" className="bg-white">{ing}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-brand-light">N/A</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-brand-dark">Skin Type</h3>
                  <p className="mt-2 text-sm text-brand-light">{skinTypeText || "All"}</p>
                </div>
                {product.size && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-dark">Size</h3>
                    <p className="mt-2 text-sm text-brand-light">{product.size}</p>
                  </div>
                )}
              </div>

              {product.how_to_use && (
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-brand-dark">How to use</h3>
                  <p className="mt-2 text-sm text-brand-light text-pretty">{product.how_to_use}</p>
                </div>
              )}
            </div>
            {/* Action Buttons - Fixed Bottom on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md border-t border-neutral-100 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:static sm:z-auto sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none sm:mt-8 sm:flex-row sm:w-full sm:max-w-lg">
              <div className="flex-none">
                <AddToCartButton product={product} />
              </div>

              <div className="flex flex-1 gap-3 sm:flex-none sm:gap-4">
                <a
                  href={product.tokopedia_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center rounded-full h-12 text-sm font-semibold text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42b549] active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-[#42b549] hover:bg-[#3ca341] sm:flex-none sm:h-14 sm:px-8 sm:min-w-[140px]"
                >
                  Tokopedia
                </a>

                <a
                  href={product.shopee_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center rounded-full h-12 text-sm font-semibold text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ee4d2d] active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-[#ee4d2d] hover:bg-[#d74425] sm:flex-none sm:h-14 sm:px-8 sm:min-w-[140px]"
                >
                  Shopee
                </a>
              </div>
            </div>
            {/* Spacer for fixed bottom bar on mobile */}
            <div className="h-24 sm:hidden"></div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 lg:mt-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-bold text-brand-dark">Customer Reviews</h2>
              <p className="text-brand-light">Share your experience with this product.</p>
              <Card className="p-6 border-0 shadow-lg shadow-neutral-100">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Write a review</h3>
                <ReviewForm productId={product.id} userId={user?.id} />
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="p-6 sm:p-8 min-h-[300px] border-0 shadow-sm">
                <Suspense fallback={<div className="text-sm text-brand-light">Loading reviews…</div>}>
                  <ReviewList productId={product.id} />
                </Suspense>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
