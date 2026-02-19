
"use client";

import { useState } from "react";
import { trackOutboundClick } from "@/actions/tracking";
import { Loader2, ExternalLink } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import LoginAuthModal from "@/components/ui/LoginAuthModal";

type Props = {
    productId: string;
    url: string;
    platform: "shopee" | "tokopedia" | "other";
    className?: string;
    children?: React.ReactNode;
};

export default function AddToCartButton({ productId, url, platform, className, children }: Props) {
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    async function handleAffiliateClick(e: React.MouseEvent) {
        e.preventDefault();
        if (loading || !url) return;

        // Validate Auth
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);

        try {
            // Track the click
            await trackOutboundClick(productId, platform);

            // Open in new tab
            window.open(url, "_blank");
        } catch (error) {
            console.error("Failed to track click:", error);
            // Fallback: open anyway if tracking fails? 
            // Better to prioritize user experience and open it.
            window.open(url, "_blank");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleAffiliateClick}
            disabled={loading || !url}
            className={`flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className || "bg-brand-primary text-white px-4 py-2 rounded-lg"}`}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                children || (
                    <>
                        <span>Beli Sekarang</span>
                        <ExternalLink size={16} />
                    </>
                )
            )}

            <LoginAuthModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </button>
    );
}
