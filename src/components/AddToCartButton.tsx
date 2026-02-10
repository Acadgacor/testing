"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { addToCart } from "@/actions/cart";

// Reusing the CartIcon from page.tsx (or create centralized icons later)
function CartIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

// Spinner Icon for loading state
function Spinner({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}

type Props = {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
        category?: string;
        ingredients?: string[];
    };
};

export default function AddToCartButton({ product }: Props) {
    const [loading, setLoading] = useState(false);
    const addToCartClient = useCartStore((s) => s.add);

    async function handleAddToCart() {
        if (loading) return;
        setLoading(true);

        try {
            // 1. Optimistic UI Update (Instant feedback)
            addToCartClient({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                ingredients: product.ingredients,
            }, 1);

            // 2. Persist to Server
            const formData = new FormData();
            formData.append("productId", product.id);
            formData.append("qty", "1");

            await addToCart(formData);

        } catch (error) {
            console.error("Failed to add to cart:", error);
            // Optional: Show toast error here
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading}
            className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-brand-primary text-brand-dark shadow-md active:scale-95 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:h-20 sm:w-20 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={loading ? "Adding to cart..." : "Add to cart"}
        >
            {loading ? (
                <Spinner className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            ) : (
                <CartIcon className="h-6 w-6 sm:h-10 sm:w-10" />
            )}
        </button>
    );
}
