import { getServerSupabase } from "@/shared/lib/supabaseServer";
import { notFound } from "next/navigation";
import { getProductRatingSummary } from "@/features/reviews/actions";
import { getOutboundClickCount } from "@/shared/lib/tracking";
import type { Product } from "@/features/products/types";
import type { Metadata, ResolvingMetadata } from "next";

import ProductDetailDesktop from "@/features/products/components/ProductDetailDesktop";
import ProductDetailMobile from "@/features/products/components/ProductDetailMobile";

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

  const description =
    product.description ||
    `Buy ${product.name}. Category: ${product.category}. Key ingredients: ${Array.isArray(product.ingredients)
      ? product.ingredients.slice(0, 3).join(", ")
      : "various"
    }.`;

  return {
    title: `${product.name} - Beli di Beaulytics`,
    description: description.slice(0, 160),
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

  let userProfile = null;
  if (user && user.user_metadata?.skin_profile?.answers) {
    const answers = user.user_metadata.skin_profile.answers;
    userProfile = {
      skin_type: String(answers["q1_sebum_after_wash"] || ""),
      skin_concerns: answers["q12_skin_concerns"] || [],
    };
  }

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
    ingredients: Array.isArray(data.ingredients)
      ? data.ingredients
      : (typeof data.ingredients === 'string' ? data.ingredients.split(',').map(i => i.trim()) : []),
    skin_type: Array.isArray(data.skin_type)
      ? data.skin_type
      : (typeof data.skin_type === 'string' ? data.skin_type.split(',').map(i => i.trim()) : []),
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

  const { average: ratingAverage, count: reviewCount } = await getProductRatingSummary(id);
  const clickCount = await getOutboundClickCount(id);
  const ratingVal = reviewCount > 0 ? ratingAverage : 0;
  const hasRating = reviewCount > 0;

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
      availability: "https://schema.org/InStock",
      url: `https://www.beaulytics.com/products/${product.id}`,
    },
    brand: {
      "@type": "Brand",
      name: product.brand || "Unknown",
    },
    ...(hasRating
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingVal,
          reviewCount: 1, // Placeholder
        },
      }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="hidden lg:block">
        <ProductDetailDesktop
          user={user}
          userProfile={userProfile}
          product={product}
          clickCount={clickCount}
          hasRating={hasRating}
          ratingVal={ratingVal}
          reviewCount={reviewCount}
          ingredients={ingredients}
          skinTypeText={skinTypeText}
          formatRp={formatRp}
        />
      </div>

      <div className="block lg:hidden">
        <ProductDetailMobile
          user={user}
          userProfile={userProfile}
          product={product}
          clickCount={clickCount}
          hasRating={hasRating}
          ratingVal={ratingVal}
          reviewCount={reviewCount}
          ingredients={ingredients}
          skinTypeText={skinTypeText}
          formatRp={formatRp}
        />
      </div>
    </>
  );
}
