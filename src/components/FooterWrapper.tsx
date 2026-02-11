"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function FooterWrapper() {
    const pathname = usePathname();
    const isAiPage = pathname?.startsWith("/Ai");

    if (isAiPage) {
        return null;
    }

    return <Footer />;
}
