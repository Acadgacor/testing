"use client";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { MoreHorizontal, Star } from "lucide-react";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    rating?: number;
    category?: string;
    review_count?: number;
    click_count?: number;
  };
};

export default function ProductCard({ product }: Props) {
  function formatRp(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }

  const rating = product.rating || 0;
  const reviewCount = product.review_count || 0;
  const clickCount = product.click_count || 0;

  return (
    <Card className="group relative flex flex-col bg-white border border-neutral-200 overflow-hidden rounded-lg hover:shadow-md transition-shadow duration-300">
      {/* Image Section */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full bg-neutral-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">No Image</div>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-col p-3 gap-1">
        {/* Product Name */}
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-sm text-neutral-800 leading-snug hover:text-brand-primary transition-colors"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mt-1 text-base font-bold text-neutral-900">
          {formatRp(product.price)}
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-neutral-700">
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>
          {reviewCount > 0 && (
            <span className="text-neutral-400">({reviewCount})</span>
          )}
          {clickCount > 0 && (
            <>
              <span className="text-neutral-300">•</span>
              <span>{clickCount} diminati</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
