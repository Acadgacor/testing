"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { addToCart } from "@/actions/cart";
import { Loader2, ShoppingBag } from "lucide-react";

type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    ingredients?: string[];
    tokopedia_url?: string | null;
    shopee_url?: string | null;
};

export default function MobileProductActionBar({ product }: { product: Product }) {
    // const router = useRouter(); // Removing unused router
    const [loading, setLoading] = useState(false);
    const addToCartClient = useCartStore((s) => s.add);

    const handleAddToCart = async () => {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Optimistic UI Update for Cart Store
            addToCartClient(
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    ingredients: product.ingredients,
                },
                1
            );

            // 2. Persist to Server Action
            const formData = new FormData();
            formData.append("productId", product.id);
            formData.append("qty", "1");
            await addToCart(formData);

            // Optional: Show toast or feedback
        } catch (error) {
            console.error("Failed to add to cart:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 px-4 py-3 flex items-center gap-3 lg:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

            {/* Cart Button (Yellow) */}
            <button
                onClick={handleAddToCart}
                disabled={loading}
                className="h-11 w-12 flex-none rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 active:scale-95 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm border border-yellow-500"
                aria-label="Add to Cart"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShoppingBag size={20} className="stroke-[2.5]" />}
            </button>

            {/* Tokopedia Button (Green) */}
            {product.tokopedia_url ? (
                <a
                    href={product.tokopedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 rounded-xl bg-[#42b549] text-white font-bold text-sm hover:bg-[#3ca342] active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                    Tokopedia
                </a>
            ) : (
                <button disabled className="flex-1 h-11 rounded-xl bg-neutral-200 text-neutral-400 font-bold text-sm cursor-not-allowed flex items-center justify-center">
                    Tokopedia
                </button>
            )}

            {/* Shopee Button (Orange) */}
            {product.shopee_url ? (
                <a
                    href={product.shopee_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 rounded-xl bg-[#ee4d2d] text-white font-bold text-sm hover:bg-[#d64428] active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                    Shopee
                </a>
            ) : (
                <button disabled className="flex-1 h-11 rounded-xl bg-neutral-200 text-neutral-400 font-bold text-sm cursor-not-allowed flex items-center justify-center">
                    Shopee
                </button>
            )}

        </div>
    );
}
