"use client";

import { useCompareStore } from "@/features/compare/store";
import Button from "@/shared/ui/Button";
import type { Product } from "@/features/products/types";

export default function CompareButton({ product }: { product: Product }) {
    const { items, add, remove } = useCompareStore();
    const isCompared = items.some((p) => p.id === product.id);

    const toggleCompare = () => {
        if (isCompared) {
            remove(product.id);
        } else {
            add(product);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={toggleCompare}
            className={`flex items-center gap-2 text-sm w-fit ${isCompared
                    ? "border-brand-primary text-brand-primary bg-brand-primary/10"
                    : "border-neutral-300 text-neutral-600 hover:border-brand-primary hover:text-brand-primary"
                }`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
            </svg>
            {isCompared ? "Hapus Komparasi" : "Bandingkan Produk"}
        </Button>
    );
}
