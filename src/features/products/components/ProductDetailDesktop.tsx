import { Suspense } from "react";
import Image from "next/image";
import Card from "@/shared/ui/Card";
import Badge from "@/shared/ui/Badge";
import Rating from "@/shared/ui/Rating";
import ProductPurchaseCard from "@/features/products/components/ProductPurchaseCard";
import ReviewForm from "@/features/reviews/components/ReviewForm";
import ReviewList from "@/features/reviews/components/ReviewList";
import type { Product } from "@/features/products/types";
import CompareButton from "@/features/compare/components/CompareButton";

export interface ProductDetailDesktopProps {
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

export default function ProductDetailDesktop({
    user,
    product,
    clickCount,
    hasRating,
    ratingVal,
    reviewCount,
    ingredients,
    skinTypeText,
    formatRp,
}: ProductDetailDesktopProps) {
    return (
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
                            <div className="mt-4">
                                <CompareButton product={product as any} />
                            </div>
                        </div>

                        <hr className="hidden lg:block my-6 border-neutral-100" />

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

                                {/* Komposisi Produk */}
                                <div className="pt-4 border-t border-neutral-100 mt-2 lg:border-none lg:mt-0 lg:pt-2">
                                    <h4 className="font-bold text-brand-dark text-base mb-3">Komposisi Produk</h4>
                                    {(!product.ingredients || product.ingredients.length === 0) ? (
                                        <p className="text-sm text-neutral-500 italic">Data kandungan belum tersedia.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {product.ingredients.map((ing, i) => (
                                                <Badge key={i} variant="outline" className="bg-neutral-50 border-neutral-200 text-neutral-600">
                                                    {ing}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="hidden lg:block border-neutral-100 my-6" />
                    </div>

                    {/* RIGHT: Action Card (Desktop Only) */}
                    <div className="hidden lg:col-span-3 lg:block relative">
                        <ProductPurchaseCard product={product} />
                    </div>
                </div>

                {/* Desktop Reviews Section */}
                <div className="hidden lg:block mt-16 border-t border-neutral-100 pt-10">
                    <div className="grid gap-10 grid-cols-12">
                        <div className="col-span-4 space-y-6">
                            <h2 className="text-xl font-bold text-brand-dark">Ulasan Pembeli</h2>
                            <Card className="p-6 border-0 shadow-sm bg-neutral-50">
                                <h3 className="text-base font-semibold text-brand-dark mb-4">Tulis Ulasan</h3>
                                <ReviewForm productId={product.id} userId={user?.id} />
                            </Card>
                        </div>
                        <div className="col-span-8">
                            <Suspense fallback={<div className="text-sm text-brand-light">Loading reviews…</div>}>
                                <ReviewList productId={product.id} />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
