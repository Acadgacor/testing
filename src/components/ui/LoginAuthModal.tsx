"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Lock, X } from "lucide-react";
import { useEffect, useState } from "react";

interface LoginAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginAuthModal({ isOpen, onClose }: LoginAuthModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="h-14 w-14 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock size={28} className="text-brand-primary" />
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Login Dulu Yuk!</h3>

                    <p className="text-neutral-600 mb-6 mx-4">
                        Kamu harus login atau daftar akun untuk menyimpan produk ke Skincare Pouch.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <Link
                            href="/auth/login"
                            className="w-full h-11 flex items-center justify-center rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors"
                        >
                            Login Sekarang
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full h-11 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition-colors"
                        >
                            Nanti Saja
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
