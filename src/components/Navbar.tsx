"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCartStore } from "@/store/cartStore";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Compare", href: "/compare" },
  { label: "Skin Check", href: "/diagnosis" },
  { label: "AI Chat", href: "/Ai" },
];

const LINK_CLASSES = "text-sm font-medium text-brand-light hover:text-brand-dark transition-colors duration-200";
const MOBILE_LINK_CLASSES = "rounded-full px-4 py-3 text-sm font-medium text-brand-light hover:bg-brand-secondary hover:text-brand-dark transition-all";
const ICON_BUTTON_CLASSES = "hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-brand-dark hover:bg-brand-secondary transition-all";
const MOBILE_ICON_BUTTON_CLASSES = "flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary text-brand-dark transition-all";

type NavbarProps = {
  user: User | null;
};

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const userInitial = user?.email?.[0]?.toUpperCase() ?? "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const isProductDetailPage = pathname?.startsWith("/products/") && pathname.split("/").length > 2;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-neutral-100" : "bg-transparent"} ${isProductDetailPage ? "hidden md:block" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="group inline-flex items-center gap-2">
              {/* <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white font-bold">B</span> */}
              <span className="text-xl font-bold text-brand-dark tracking-tight">Beaulytics.</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={LINK_CLASSES}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                aria-label="Account"
                href="/dashboard"
                className={ICON_BUTTON_CLASSES}
                title={user.email || "Dashboard"}
              >
                <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {userInitial || "•"}
                </div>
              </Link>
            ) : (
              <Link
                aria-label="Login"
                href="/auth/login"
                className="hidden md:inline-flex items-center rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-all active:scale-95"
              >
                Login
              </Link>
            )}

            <Link aria-label="Cart" href="/cart" className="flex relative h-10 w-10 items-center justify-center rounded-full bg-brand-secondary text-brand-dark hover:bg-brand-secondary/80 transition-all">
              <CartIcon className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white shadow-sm border border-white">
                  {count}
                </span>
              )}
            </Link>

            <button
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary text-brand-dark"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col space-y-2 rounded-3xl bg-neutral-50 p-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={MOBILE_LINK_CLASSES} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}

            <div className="mt-4 flex items-center justify-between px-4 pt-4 border-t border-neutral-200">
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-brand-dark" onClick={() => setOpen(false)}>
                  <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center">{userInitial}</div>
                  <span>My Account</span>
                </Link>
              ) : (
                <Link href="/auth/login" className="text-sm font-semibold text-brand-dark" onClick={() => setOpen(false)}>Login</Link>
              )}
              <Link href="/cart" className="flex items-center gap-2 text-sm font-semibold text-brand-dark" onClick={() => setOpen(false)}>
                <CartIcon className="h-5 w-5" />
                <span>Cart ({count})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
