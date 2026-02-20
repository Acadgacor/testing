import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/shared/ui/Badge";
import Rating from "@/shared/ui/Rating";
import MobileProductActionBar from "@/features/products/components/MobileProductActionBar";
import MobileProductHeader from "@/features/products/components/MobileProductHeader";
import ReviewForm from "@/features/reviews/components/ReviewForm";
import ReviewList from "@/features/reviews/components/ReviewList";
import type { Product } from "@/features/products/types";

export interface ProductDetailMobileProps {
    user: any;
    product: Product & {
        description?: string;
        ingredients?: string[];
        skin_type?: string[];
        concerns?: string[];
        how_to_use?: string;
        brand?: string;
        tokopedia_url?: string | null;
        shopee_url?: string | null;
    };
    clickCount: number;
    hasRating: boolean;
    ratingVal: number;
    reviewCount: number;
    ingredients: string[];
    skinTypeText: string;
    formatRp: (n: number) => string;
}

export default function ProductDetailMobile({
    user,
    product,
    clickCount,
    hasRating,
    ratingVal,
    reviewCount,
    ingredients,
    skinTypeText,
    formatRp,
}: ProductDetailMobileProps) {
    return (
        <>
            <MobileProductHeader user={user} product={product} />

            <section className="pb-28 lg:py-12 bg-white">
                <div className="mx-auto max-w-7xl lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
                        {/* LEFT: Image Section */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="relative w-full aspect-square bg-white lg:rounded-2xl lg:overflow-hidden lg:border lg:border-neutral-100">
                                {product.image ? (
                                    <Image src={product.image as string} alt={product.name} fill className="object-cover" priority />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-neutral-300">No Image</div>
                                )}
                            </div>
                        </div>

                        {/* MIDDLE: Product Info */}
                        <div className="lg:col-span-5">
                            {/* Main Info Block */}
                            <div className="px-4 pt-4 lg:px-0 lg:pt-0">
                                <div className="flex items-end gap-2 mb-2">
                                    <h1 className="text-2xl font-bold text-brand-dark">{formatRp(Number(product.price) || 0)}</h1>
                                    <span className="text-sm text-neutral-400 line-through mb-1.5 opacity-0 hidden">Rp300.000</span>
                                </div>

                                <h2 className="text-lg leading-snug text-brand-dark font-medium mb-2">{product.name}</h2>

                                <div className="flex items-center gap-4 text-sm mb-4">
                                    <span className="text-brand-dark font-medium">
                                        {clickCount > 0 ? `${clickCount} orang tertarik` : "New Product"}
                                    </span>
                                    <div className="w-px h-3 bg-neutral-300"></div>
                                    {hasRating && (
                                        <div className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-0.5">
                                            <Rating value={ratingVal} />
                                            <span className="text-neutral-600 font-medium">({ratingVal.toFixed(1)}) / {reviewCount} reviews</span>
                                        </div>
                                    )}
                                    {!hasRating && (
                                        <div className="text-neutral-500 text-xs">No reviews yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Thick Divider Mobile */}
                            <div className="h-2 bg-neutral-100 w-full lg:hidden"></div>

                            {/* Detail Section */}
                            <div className="px-4 py-4 lg:px-0 lg:py-0 space-y-4">
                                <h3 className="text-lg font-bold text-brand-dark">Detail Produk</h3>
                                <div className="space-y-4">
                                    {/* Specs List */}
                                    <div className="space-y-3 pb-2 border-b border-neutral-100 lg:border-none">
                                        {product.category && (
                                            <div className="flex justify-between lg:justify-start lg:gap-10">
                                                <span className="text-neutral-500 text-sm">Kategori</span>
                                                <span className="text-brand-primary font-medium text-sm">{product.category}</span>
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div className="flex justify-between lg:justify-start lg:gap-10">
                                                <span className="text-neutral-500 text-sm">Etalase</span>
                                                <span className="text-brand-primary font-medium text-sm">{product.brand}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between lg:justify-start lg:gap-10">
                                            <span className="text-neutral-500 text-sm">Skin Type</span>
                                            <span className="text-brand-dark font-medium text-sm">{skinTypeText}</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm mb-2">Deskripsi produk</h4>
                                        <div className="text-sm text-brand-light leading-relaxed whitespace-pre-line text-justify">
                                            {product.description}
                                        </div>
                                        {product.how_to_use && (
                                            <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                                                <h4 className="font-semibold text-brand-dark text-sm mb-1">How to Use:</h4>
                                                <p className="text-sm text-brand-light">{product.how_to_use}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ingredients chip view */}
                                    {ingredients.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="font-bold text-brand-dark text-sm mb-2">Key Ingredients</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {ingredients.map((ing, i) => (
                                                    <Badge key={i} variant="outline" className="bg-neutral-50 border-neutral-200 text-neutral-600">{ing}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thick Divider Mobile */}
                            <div className="h-2 bg-neutral-100 w-full lg:hidden"></div>

                            <div className="px-4 py-4 lg:hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-brand-dark">Ulasan Pembeli</h3>
                                    {hasRating && <Link href="#" className="text-brand-primary text-sm font-semibold">Lihat Semua</Link>}
                                </div>
                                {hasRating ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-brand-dark">{ratingVal.toFixed(1)}</span>
                                        <div className="text-xs text-neutral-500">
                                            <p>/5.0</p>
                                            <p className="font-medium text-brand-dark">{reviewCount} Ulasan</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-neutral-500 italic">Belum ada ulasan</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Bottom Bar */}
                    <MobileProductActionBar product={product} />

                    {/* Mobile Reviews List (Visible) */}
                    <div className="lg:hidden px-4 pb-4 space-y-6">
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                            <h3 className="text-sm font-bold text-brand-dark mb-3">Tulis Ulasan</h3>
                            <ReviewForm productId={product.id} userId={user?.id} />
                        </div>

                        <Suspense fallback={<div className="text-sm text-brand-light">Loading reviews…</div>}>
                            <ReviewList productId={product.id} />
                        </Suspense>
                    </div>
                </div>
            </section>
        </>
    );
}
