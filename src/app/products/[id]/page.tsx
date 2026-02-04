import { Suspense } from "react";
import { getServerSupabase } from "@/lib/supabaseServer";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-brand-secondary">
              {product.image ? (
                <Image src={product.image as string} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </Card>
          <div>
            <div className="text-3xl font-semibold text-brand-dark">{product.name}</div>
            <div className="mt-2 text-brand-dark">{formatRp(Number(product.price) || 0)}</div>
            {hasRating ? <Rating className="mt-3" value={ratingVal} /> : null}
            <div className="mt-4 text-sm text-brand-light">{product.description}</div>
            <div className="mt-6">
              <div className="text-sm font-semibold text-brand-dark">Ingredients</div>
              <div className="mt-2 text-sm text-brand-light">{ingredients.join(", ") || "N/A"}</div>
            </div>
            <div className="mt-6">
              <div className="text-sm font-semibold text-brand-dark">Skin Type</div>
              <div className="mt-2 text-sm text-brand-light">{skinTypeText || "All"}</div>
            </div>
            {product.how_to_use ? (
              <div className="mt-6">
                <div className="text-sm font-semibold text-brand-dark">How to use</div>
                <div className="mt-2 text-sm text-brand-light">{product.how_to_use}</div>
              </div>
            ) : null}
            {product.size ? (
              <div className="mt-6">
                <div className="text-sm font-semibold text-brand-dark">Size</div>
                <div className="mt-2 text-sm text-brand-light">{product.size}</div>
              </div>
            ) : null}
            <div className="mt-8 flex items-center gap-3">
              <form action={addToCart}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="qty" value={1} />
                <Button type="submit">Add to Cart</Button>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="p-6 space-y-4">
            <div className="text-lg font-semibold text-brand-dark">Write a review</div>
            <ReviewForm productId={product.id} userId={user?.id} />
          </Card>
          <Card className="p-6 space-y-4 lg:col-span-2">
            <div className="text-lg font-semibold text-brand-dark">Customer Reviews</div>
            <Suspense fallback={<div className="text-sm text-brand-light">Loading reviews…</div>}>
              <ReviewList productId={product.id} />
            </Suspense>
          </Card>
        </div>
      </div>
    </section>
  );
}
