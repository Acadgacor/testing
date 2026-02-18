import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CompareBar from "@/components/CompareBar";
import FooterWrapper from "@/components/FooterWrapper";
import ServiceWorkerRemover from "@/components/ServiceWorkerRemover";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Beaulytics: Discover Skincare Products & Routines",
    template: "%s | Beaulytics",
  },
  description:
    "Beaulytics analyzes your skin type, ingredient preferences, and cosmetic needs to recommend the best products for your routine. Compare ingredients and find your perfect match instantly.",
  keywords: [
    "Skincare",
    "Skincare Routine",
    "Ingredient Analysis",
    "Cosmetic Ingredients",
    "Skin Type",
    "Product Comparison",
    "Beauty Analysis",
    "Clean Beauty",
    "Skin Health",
  ],
  authors: [{ name: "Beaulytics Team" }],
  creator: "Beaulytics",
  publisher: "Beaulytics",
  openGraph: {
    title: "Beaulytics: Discover Skincare Products & Routines",
    description:
      "Beaulytics analyzes your skin type, ingredient preferences, and cosmetic needs to recommend the best products for your routine.",
    url: "https://www.beaulytics.com",
    siteName: "Beaulytics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beaulytics: Discover Skincare Products & Routines",
    description:
      "Beaulytics analyzes your skin type, ingredient preferences, and cosmetic needs to recommend the best products for your routine.",
    creator: "@beaulytics",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getServerSupabaseRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  };
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__env = ${JSON.stringify(publicEnv)};`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-brand-dark min-h-screen flex flex-col`}
      >
        <ServiceWorkerRemover />
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <CompareBar />
        <FooterWrapper />
      </body>
    </html>
  );
}
