import { Suspense } from "react";
import { getServerSupabase } from "@/lib/supabaseServer";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import { addToCart } from "@/actions/cart";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewList from "@/components/reviews/ReviewList";
import type { Product } from "@/types/product";

type Params = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Params) {
  const { id } = await params;
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

  const fallback: Product & {
    ingredients?: string[];
    skin_type?: string[];
    concerns?: string[];
    how_to_use?: string;
    brand?: string;
    tokopedia_url?: string | null;
    shopee_url?: string | null;
  } = {
    id,
    name: "Product",
    price: 0,
    image: "",
    rating: 0,
    skinType: "",
    keyIngredients: [],
    benefits: [],
    size: "",
    category: "",
    category_id: 0,
    product_type_id: 0,
    ingredients: [],
    skin_type: [],
    concerns: [],
    how_to_use: "",
    brand: "",
    tokopedia_url: null,
    shopee_url: null,
  };

  const product: Product & {
    description?: string;
    ingredients?: string[];
    skin_type?: string[];
    concerns?: string[];
    how_to_use?: string;
    brand?: string;
    tokopedia_url?: string | null;
    shopee_url?: string | null;
  } = data
      ? {
        id: String(data.id),
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
      }
      : fallback;

  const ingredients: string[] = Array.isArray(product.ingredients) ? product.ingredients : [];
  const skinTypeText = Array.isArray(product.skin_type) ? product.skin_type.join(", ") : String(product.skin_type ?? "All");

  function formatRp(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }
  const ratingVal = Number((product as any)?.rating);
  const hasRating = Number.isFinite(ratingVal);

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-white">
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

          {/* Details Section */}
          <div className="mt-10 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">{product.name}</h1>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-2xl font-semibold text-brand-dark">{formatRp(Number(product.price) || 0)}</p>
              {hasRating ? <Rating value={ratingVal} /> : null}
            </div>

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

            <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-2xl">
              <form action={addToCart} className="flex-1 min-w-[200px]">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="qty" value={1} />
                <Button type="submit" className="w-full text-lg py-4">Add to Cart</Button>
              </form>

              <a
                href={product.tokopedia_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42b549] active:scale-95 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-[#42b549] hover:bg-[#3ca341] flex-1 min-w-[140px]"
              >
                Tokopedia
              </a>

              <a
                href={product.shopee_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ee4d2d] active:scale-95 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-[#ee4d2d] hover:bg-[#d74425] flex-1 min-w-[140px]"
              >
                Shopee
              </a>
            </div>
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
