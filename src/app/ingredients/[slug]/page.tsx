import { getServerSupabase } from "@/shared/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/features/products/components/ProductCard";
import { ArrowLeft, ShieldCheck, Sparkles, AlertTriangle, Info } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await getServerSupabase();

    const { data: ingredient } = await supabase
        .from("ingredients")
        .select("name, description")
        .eq("slug", slug)
        .single();

    if (!ingredient) {
        return {
            title: "Kandungan Tidak Ditemukan | Kamus Skincare Beaulytics",
        };
    }

    const title = `${ingredient.name}: Manfaat & Keamanan | Kamus Skincare Beaulytics`;
    const description = ingredient.description
        ? ingredient.description.substring(0, 150)
        : `Pelajari manfaat, tingkat keamanan, dan fungsi dari ${ingredient.name} untuk kulit Anda.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
        },
    };
}

export default async function IngredientDetailPage({ params }: Params) {
    const { slug } = await params;
    const supabase = await getServerSupabase();

    const { data: ingredient, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !ingredient) {
        notFound();
    }

    const { data: relatedProducts } = await supabase
        .from("products")
        .select("id, name, price, image, rating, category, description")
        .or(`ingredients.ilike.%${ingredient.name}%,name.ilike.%${ingredient.name}%`)
        .limit(4);

    const safeLevel = ingredient.safety_level ? String(ingredient.safety_level).toLowerCase() : "";
    const isSafe = safeLevel.includes("rendah") || safeLevel.includes("aman") || safeLevel.includes("low");
    const isDanger = safeLevel.includes("tinggi") || safeLevel.includes("bahaya") || safeLevel.includes("high");

    // Parse benefits if it's formatted like "MANFAAT SPESIFIK ✓ benefit 1 ✓ benefit 2"
    let benefitsList: string[] = [];
    let benefitsIntro = "";
    if (ingredient.benefits) {
        if (ingredient.benefits.includes("✓")) {
            const parts = ingredient.benefits.split("✓").map((s: string) => s.trim()).filter(Boolean);
            benefitsIntro = parts.shift() || ""; // Take the first part before the first checkmark, if any
            benefitsList = parts;
        } else if (ingredient.benefits.includes("-")) {
            const parts = ingredient.benefits.split("-").map((s: string) => s.trim()).filter(Boolean);
            benefitsList = parts;
        } else {
            benefitsList = [ingredient.benefits];
        }
    }

    return (
        <main className="min-h-screen bg-white pb-20 font-sans selection:bg-brand-primary/20">
            {/* Editorial Header */}
            <header className="pt-12 pb-10 border-b border-neutral-100 bg-neutral-50/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/ingredients"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-brand-primary transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Kembali ke Kamus Kandungan
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary">
                            Kamus Kandungan
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-6 leading-[1.15] tracking-tight">
                        {ingredient.name}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-500">
                                B
                            </div>
                            <span>Beaulytics Editorial</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                        <span>Skincare Deep Dive</span>
                    </div>
                </div>
            </header>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {/* Quick Facts / Editorial Callout Box */}
                {(ingredient.safety_level || ingredient.benefits) && (
                    <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 mb-12 border border-neutral-200/60 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 border-b border-neutral-200 pb-4 mb-6">
                            <Sparkles className="w-5 h-5 text-brand-primary" />
                            Sekilas Fakta (Key Takeaways)
                        </h3>

                        <div className="flex flex-col gap-6">
                            {ingredient.safety_level && (
                                <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSafe ? "bg-green-100 text-green-600" : isDanger ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>
                                        {isSafe ? <ShieldCheck className="w-4 h-4" /> : isDanger ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-1">
                                            Tingkat Keamanan
                                        </h4>
                                        <span
                                            className={`inline-block font-semibold text-lg ${isSafe ? "text-green-700" : isDanger ? "text-red-700" : "text-yellow-700"
                                                }`}
                                        >
                                            {ingredient.safety_level}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {benefitsList.length > 0 && (
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-2">
                                            Manfaat Utama
                                        </h4>
                                        {benefitsIntro && <p className="text-neutral-700 mb-2 font-medium">{benefitsIntro}</p>}
                                        <ul className="space-y-3">
                                            {benefitsList.map((benefit, idx) => (
                                                <li key={idx} className="flex gap-3 text-neutral-700 leading-snug">
                                                    <span className="text-brand-primary shrink-0 font-bold">•</span>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Article Body */}
                <div className="prose prose-lg prose-neutral max-w-none text-neutral-800 leading-relaxed prose-headings:font-bold prose-headings:text-neutral-900 prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline">
                    {ingredient.description ? (
                        <div className="whitespace-pre-wrap font-medium text-[17px] md:text-[19px]">
                            {ingredient.description}
                        </div>
                    ) : (
                        <p className="italic text-neutral-400">
                            Deskripsi informasi lebih detail mengenai kandungan ini belum tersedia.
                        </p>
                    )}
                </div>

                <div className="mt-16 pt-8 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500 text-center max-w-xl mx-auto">
                        Informasi ini disediakan untuk tujuan edukasi dan bukan merupakan pengganti saran medis profesional. Selalu lakukan patch test sebelum menggunakan produk baru, terutama jika Anda memiliki kulit sensitif.
                    </p>
                </div>
            </article>

            {/* Product Injection Section - Editorial Style */}
            <section className="mt-20 border-t border-neutral-100 bg-neutral-50/50 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center mb-10">
                        <span className="text-brand-primary font-bold tracking-widest uppercase text-sm mb-2">
                            Kurasi Produk
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
                            Rekomendasi Skincare dengan {ingredient.name}
                        </h2>
                    </div>

                    {relatedProducts && relatedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product as any} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6 bg-white border border-neutral-200 rounded-2xl shadow-sm max-w-2xl mx-auto">
                            <p className="text-neutral-900 font-semibold text-lg">
                                Belum ada rekomendasi produk spesifik.
                            </p>
                            <p className="text-neutral-500 mt-2">
                                Kami sedang mengkurasi produk terbaik yang mengandung {ingredient.name}. Cek kembali nanti!
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
