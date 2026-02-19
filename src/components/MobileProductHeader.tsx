"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, ShoppingCart, Menu as MenuIcon, X, Copy, Mail, MoreHorizontal, MessageSquare, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
};

type MobileProductHeaderProps = {
    user: User | null;
    product?: Product;
};

// Brand Icons
const WhatsappIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);


export default function MobileProductHeader({ user, product }: MobileProductHeaderProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
    const userInitial = user?.email?.[0]?.toUpperCase() ?? "";

    const handleBack = () => {
        router.back();
    };

    const handleShareClick = () => {
        setIsShareOpen(true);
    };

    // Auto-hide toast after 2 seconds
    useEffect(() => {
        if (showCopiedToast) {
            const timer = setTimeout(() => setShowCopiedToast(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showCopiedToast]);

    const productUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Check out ${product?.name} on Beaulytics!`;

    const shareTo = (platform: string) => {
        let url = "";
        switch (platform) {
            case "whatsapp":
                url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + productUrl)}`;
                break;
            case "telegram":
                url = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case "line":
                url = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + " " + productUrl)}`;
                break;
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
                break;
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
                break;
            case "sms":
                url = `sms:?body=${encodeURIComponent(shareText + " " + productUrl)}`;
                break;
            case "email":
                url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(productUrl)}`;
                break;
            case "copy":
                navigator.clipboard.writeText(productUrl);
                setShowCopiedToast(true);
                setIsShareOpen(false);
                return;
            case "more":
                if (navigator.share) {
                    navigator.share({
                        title: product?.name,
                        text: shareText,
                        url: productUrl,
                    }).catch(console.error);
                }
                setIsShareOpen(false);
                return;
        }
        if (url) {
            window.open(url, "_blank");
            setIsShareOpen(false);
        }
    };

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Compare", href: "/compare" },
        { label: "Skin Check", href: "/diagnosis" },
        { label: "AI Chat", href: "/Ai" },
    ];

    // Helper for Social Icon is now defined outside

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-neutral-100">
                <button
                    onClick={handleBack}
                    className="text-neutral-700 hover:text-brand-dark transition-colors -ml-2 p-2"
                    aria-label="Back"
                >
                    <ChevronLeft size={26} />
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleShareClick}
                        className="p-2 text-neutral-700 hover:text-brand-dark transition-colors"
                        aria-label="Share"
                    >
                        <Share2 size={22} />
                    </button>

                    <Link href="/cart" className="p-2 text-neutral-700 hover:text-brand-dark transition-colors relative" aria-label="Cart">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-neutral-700 hover:text-brand-dark transition-colors"
                        aria-label="Menu"
                    >
                        <MenuIcon size={22} />
                    </button>
                </div>
            </div>

            {/* Dropdown Menu Overlay */}
            <div className={`lg:hidden fixed left-0 right-0 top-[60px] z-[59] px-4 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"}`}>
                <div className="flex flex-col space-y-2 rounded-3xl bg-neutral-50 p-4 shadow-xl border border-neutral-200">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-full px-4 py-3 text-sm font-medium text-brand-light hover:bg-white hover:text-brand-dark hover:shadow-sm transition-all"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div className="mt-4 flex items-center justify-between px-4 pt-4 border-t border-neutral-200">
                        {user ? (
                            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-brand-dark" onClick={() => setIsMenuOpen(false)}>
                                <div className="h-8 w-8 rounded-full bg-yellow-400 text-white flex items-center justify-center shadow-sm text-xs border border-white">
                                    {userInitial}
                                </div>
                                <span>My Account</span>
                            </Link>
                        ) : (
                            <Link href="/auth/login" className="text-sm font-semibold text-brand-dark hover:text-brand-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                        )}
                        <Link href="/cart" className="flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                            <ShoppingCart size={20} />
                            <span>Cart ({cartCount})</span>
                        </Link>
                    </div>
                </div>
                {/* Backdrop to close menu */}
                {isMenuOpen && <div className="fixed inset-0 z-[-1] bg-black/20" onClick={() => setIsMenuOpen(false)}></div>}
            </div>

            {/* Share Sheet Overlay */}
            {isShareOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-[70] bg-black/50 transition-opacity" onClick={() => setIsShareOpen(false)}></div>
                    <div className="lg:hidden fixed bottom-1 left-1 right-1 z-[71] bg-white rounded-3xl p-5 animate-in slide-in-from-bottom duration-300 mb-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-neutral-900">Bagikan ke teman kamu</h3>
                            <button onClick={() => setIsShareOpen(false)} className="p-1 rounded-full hover:bg-neutral-100">
                                <X size={20} className="text-neutral-500" />
                            </button>
                        </div>

                        {/* Product Preview */}
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl mb-6 border border-neutral-100">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-neutral-200">
                                {product?.image ? (
                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-neutral-200" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">{product?.name || "Product Name"}</p>
                        </div>

                        {/* Social Grid */}
                        <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-4 place-items-center">
                            <SocialIcon label="Whatsapp" color="#25D366" icon={<WhatsappIcon />} onClick={() => shareTo("whatsapp")} />
                            <SocialIcon label="Telegram" color="#29b6f6" icon={<TelegramIcon />} onClick={() => shareTo("telegram")} />
                            <SocialIcon label="Facebook" color="#1877F2" icon={<FacebookIcon />} onClick={() => shareTo("facebook")} />
                            <SocialIcon label="X" color="#000000" icon={<XIcon />} onClick={() => shareTo("twitter")} />

                            <SocialIcon label="Salin Link" color="#f3f4f6" icon={<Copy size={22} className="text-neutral-700" />} onClick={() => shareTo("copy")} />
                            <div onClick={() => shareTo("sms")} className="cursor-pointer flex flex-col items-center gap-2 group w-full">
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 shadow-sm transition-transform active:scale-95 group-hover:scale-105"><MessageSquare size={22} /></div>
                                <span className="text-xs text-neutral-600 font-medium text-center w-full truncate">SMS</span>
                            </div>
                            <div onClick={() => shareTo("email")} className="cursor-pointer flex flex-col items-center gap-2 group w-full">
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shadow-sm transition-transform active:scale-95 group-hover:scale-105"><Mail size={22} /></div>
                                <span className="text-xs text-neutral-600 font-medium text-center w-full truncate">Email</span>
                            </div>
                            <div onClick={() => shareTo("more")} className="cursor-pointer flex flex-col items-center gap-2 group w-full">
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600 shadow-sm transition-transform active:scale-95 group-hover:scale-105"><MoreHorizontal size={22} /></div>
                                <span className="text-xs text-neutral-600 font-medium text-center w-full truncate">Lainnya</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Custom Toast Notification */}
            {showCopiedToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] bg-neutral-900/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-green-500 rounded-full p-0.5">
                        <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">Link berhasil disalin</span>
                </div>
            )}
        </>
    );
}

// Helper for Social Icon
function SocialIcon({ color, label, icon, onClick }: { color: string, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group w-full">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 group-hover:scale-105`} style={{ backgroundColor: color }}>
                {icon}
            </div>
            <span className="text-xs text-neutral-600 font-medium text-center truncate w-full">{label}</span>
        </button>
    );
}
