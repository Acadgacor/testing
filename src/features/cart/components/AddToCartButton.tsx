
"use client";

import { useState } from "react";
import { trackOutboundClick } from "@/shared/lib/tracking";
import { Loader2, ExternalLink } from "lucide-react";
import { getSupabaseClient } from "@/shared/lib/supabaseClient";
import LoginAuthModal from "@/features/auth/components/LoginAuthModal";

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
}
