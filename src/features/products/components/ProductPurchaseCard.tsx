"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCartStore } from "@/features/cart/store";
import { addToCart } from "@/features/cart/actions";
import { trackOutboundClick } from "@/actions/tracking";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Loader2, Minus, Plus, X, Check, Copy } from "lucide-react";
import LoginAuthModal from "@/features/auth/components/LoginAuthModal";

type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    ingredients?: string[];
    stock?: number;
    tokopedia_url?: string | null;
    shopee_url?: string | null;
};

// --- Icons ---
const WhatsappIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);
const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
);
const LineIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M20.25 12c0-4.665-4.575-8.25-9.75-8.25S.75 7.335.75 12c0 4.14 3.525 7.47 8.16 8.085.315.06.75.225.855.51.09.3.06.765.045 1.065-.045.54-.255 2.115-.3 2.88-.045.57.255.9.84.45 3.51-2.43 6.645-5.91 6.645-5.91C19.005 16.92 20.25 14.61 20.25 12z" /></svg>
);
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);
const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const CopyIcon = () => (
    <div className="text-neutral-700">
        <Copy size={20} />
    </div>
);

function ShareButton({ color, label, icon, onClick, textColor = "white" }: { color: string, label: string, icon: React.ReactNode, onClick: () => void, textColor?: string }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div
                className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95 group-hover:scale-105`}
                style={{ backgroundColor: color, color: textColor }}
            >
                {icon}
            </div>
            <span className="text-xs text-neutral-600 font-medium">{label}</span>
        </button>
    );
}

export default function ProductPurchaseCard({ product }: { product: Product }) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [loadingCode, setLoadingCode] = useState<"cart" | "buy" | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addToCartClient = useCartStore((s) => s.add);

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const handleAction = async (action: "cart" | "buy") => {
        if (loadingCode) return;

        // Validate Auth
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setShowLoginModal(true);
            return;
        }

        setLoadingCode(action);

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
                quantity
            );

            // 2. Persist to Server Action
            const formData = new FormData();
            formData.append("productId", product.id);
            formData.append("qty", quantity.toString());
            await addToCart(formData);

            if (action === "buy") {
                router.push("/cart");
            }
        } catch (error) {
            console.error("Failed to perform action:", error);
        } finally {
            setLoadingCode(null);
        }
    };

    const handleShare = (platform: string) => {
        const shareUrl = typeof window !== "undefined" ? window.location.href : "";
        const shareText = `Check out ${product.name} on Beaulytics!`;
        let url = "";

        switch (platform) {
            case "whatsapp": url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`; break;
            case "telegram": url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; break;
            case "line": url = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + " " + shareUrl)}`; break;
            case "facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
            case "twitter": url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`; break;
            case "email": url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`; break;
            case "copy":
                navigator.clipboard.writeText(shareUrl);
                setShowCopiedToast(true);
                setTimeout(() => setShowCopiedToast(false), 2000);
                return;
        }
        if (url) window.open(url, "_blank");
    };

    const handleTrackClick = (platform: "shopee" | "tokopedia") => {
        // Did not await to avoid blocking UI navigation
        trackOutboundClick(product.id, platform);
    };

    const subtotal = product.price * quantity;

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm h-fit sticky top-24">
            <h3 className="mb-4 font-bold text-lg text-brand-dark">Atur jumlah dan catatan</h3>

            {/* Quantity & Stock */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center rounded-lg border border-neutral-200 p-1">
                    <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1 || !!loadingCode}
                        className="p-2 text-brand-dark hover:bg-neutral-100 rounded-md disabled:opacity-50 transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus size={16} />
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) setQuantity(val);
                        }}
                        className="w-12 text-center text-sm font-semibold text-brand-dark outline-none border-none bg-transparent appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={!!loadingCode}
                        className="p-2 text-brand-dark hover:bg-neutral-100 rounded-md transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="text-sm text-brand-light">
                    Stok: <span className="font-medium text-brand-dark">{product.stock || "Tersedia"}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-brand-light">Subtotal</span>
                <span className="text-lg font-bold text-brand-dark">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(subtotal)}
                </span>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => handleAction("cart")}
                    disabled={!!loadingCode}
                    className="w-full h-10 rounded-lg bg-yellow-500 text-white font-semibold text-sm hover:bg-yellow-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loadingCode === "cart" ? <Loader2 className="animate-spin" size={18} /> : "+ Keranjang"}
                </button>

                {/* Marketplace Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {product.tokopedia_url ? (
                        <a
                            href={product.tokopedia_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackClick("tokopedia")}
                            className="flex items-center justify-center h-10 rounded-lg bg-[#42b549] text-white text-sm font-semibold hover:bg-[#3aa342] transition-colors"
                        >
                            Tokopedia
                        </a>
                    ) : (
                        <button disabled className="flex items-center justify-center h-10 rounded-lg bg-neutral-200 text-neutral-400 text-sm font-semibold cursor-not-allowed">
                            Tokopedia
                        </button>
                    )}

                    {product.shopee_url ? (
                        <a
                            href={product.shopee_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackClick("shopee")}
                            className="flex items-center justify-center h-10 rounded-lg bg-[#ee4d2d] text-white text-sm font-semibold hover:bg-[#d64126] transition-colors"
                        >
                            Shopee
                        </a>
                    ) : (
                        <button disabled className="flex items-center justify-center h-10 rounded-lg bg-neutral-200 text-neutral-400 text-sm font-semibold cursor-not-allowed">
                            Shopee
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-brand-light font-medium">
                <button
                    onClick={() => setIsShareOpen(true)}
                    className="hover:text-brand-dark transition-colors flex items-center gap-1 p-2"
                >
                    Share
                </button>
            </div>

            {/* Desktop Share Modal - Portal */}
            {mounted && isShareOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsShareOpen(false)}>
                    <div className="bg-white rounded-2xl w-[500px] p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-neutral-900">Belanja rame-rame pasti lebih seru!</h3>
                            <button onClick={() => setIsShareOpen(false)} className="p-1 rounded-full hover:bg-neutral-100 transition-colors">
                                <X size={24} className="text-neutral-500" />
                            </button>
                        </div>

                        <div className="flex gap-4 p-4 bg-neutral-50 rounded-xl mb-6 items-center">
                            <div className="h-16 w-16 bg-white rounded-md border border-neutral-200 relative overflow-hidden flex-shrink-0">
                                {product.image && <img src={product.image} alt={product.name} className="object-cover w-full h-full" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-900 line-clamp-1">{product.name}</h4>
                                <span className="text-sm text-neutral-500">beaulytics.com</span>
                            </div>
                        </div>

                        <p className="font-bold text-neutral-900 mb-4">Mau bagikan lewat mana?</p>

                        <div className="flex flex-wrap gap-4 justify-between px-2">
                            {/* Icons Row */}
                            <ShareButton
                                color="#25D366" label="Whatsapp" onClick={() => handleShare('whatsapp')}
                                icon={<WhatsappIcon />}
                            />
                            <ShareButton
                                color="#0088cc" label="Telegram" onClick={() => handleShare('telegram')}
                                icon={<TelegramIcon />}
                            />
                            <ShareButton
                                color="#06C755" label="Line" onClick={() => handleShare('line')}
                                icon={<LineIcon />}
                            />
                            <ShareButton
                                color="#1877F2" label="Facebook" onClick={() => handleShare('facebook')}
                                icon={<FacebookIcon />}
                            />
                            <ShareButton
                                color="#000000" label="X" onClick={() => handleShare('twitter')}
                                icon={<XIcon />}
                            />
                            <ShareButton
                                color="#f3f4f6" textColor="black" label="Salin Link" onClick={() => handleShare('copy')}
                                icon={<CopyIcon />}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* Toast - Portal */}
            {mounted && showCopiedToast && createPortal(
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-neutral-900/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-green-500 rounded-full p-1"><Check size={12} className="text-white" strokeWidth={4} /></div>
                    <span className="font-medium">Link berhasil disalin</span>
                </div>,
                document.body
            )}

            {/* Login Auth Modal */}
            <LoginAuthModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </div>
    );
}
