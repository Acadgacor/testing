import Hero from "@/components/Hero";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/ProductCard";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await getServerSupabaseRSC();

  // 1. Helper function to format product data with relational math
  function formatProductData(r: any) {
    const reviews = r.reviews || [];
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? reviews.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0) / reviewCount
        : 0;
    const clickCount = r.outbound_clicks?.length || 0;

    return {
      id: String(r.id),
      name: r.name,
      price: Number(r.price) || 0,
      image: r.image || "/vercel.svg",
      rating: avgRating,
      category: r.category,
      review_count: reviewCount,
      click_count: clickCount,
    };
  }

  // 2. Select string for all queries
  const selectQuery = "id,name,price,image,rating,category,reviews(rating),outbound_clicks(id)";

  // Fetch Best Sellers
  const { data: bestSellers } = await supabase
    .from("products")
    .select(selectQuery)
    .eq("featured", true) // Assuming 'featured' field is used for best sellers logic or it's a specific flag
    .limit(4);

  // Fallback if no best sellers
  let rows = bestSellers ?? [];
  if (!rows || rows.length === 0) {
    const { data: top } = await supabase
      .from("products")
      .select(selectQuery)
      .limit(4);
    rows = top ?? [];
  }

  // 3. Map the data using the helper function
  const bestSellerItems = rows.map(formatProductData);

  return (
    <main>
      <Hero />
      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Badge>Best Sellers</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-dark">Produk unggulan</h2>
            <p className="mt-2 text-sm text-brand-light">Pilihan produk terbaik.</p>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x md:grid md:grid-cols-4 md:gap-6 md:pb-0 scrollbar-hide">
            {bestSellerItems.map((p: any) => (
              <div key={p.id} className="w-[200px] md:w-auto snap-center shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">Kenapa Beaulytics?</h2>
            <p className="mt-2 text-sm text-brand-light">Solusi lengkap untuk perjalanan kulit sehatmu.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-brand-dark">Analisa Kulit</h3>
              <p className="mt-2 text-sm text-brand-light">Ketahui jenis & kondisi kulitmu secara akurat dalam hitungan detik dengan teknologi AI.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-brand-dark">Bandingkan Produk</h3>
              <p className="mt-2 text-sm text-brand-light">Adu kandungan, manfaat, dan harga produk untuk keputusan belanja yang paling cerdas.</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-brand-dark">AI Chat Consultant</h3>
              <p className="mt-2 text-sm text-brand-light">Curhat masalah kulit kapan saja dan dapatkan rekomendasi rutinitas yang personal.</p>
            </Card>
          </div>
        </div>
      </section>
      {/* <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-dark">Apa kata mereka</h2>
            <p className="mt-2 text-sm text-brand-light">Kulit lembut, glowing, dan sehat bersama Beaulytics.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm text-brand-dark">&quot;Fitur bandingin produknya bantu banget! Akhirnya nemu moisturizer yang pas di kulit & dompet.&quot;</p>
              <div className="mt-3 text-xs text-brand-light">— Sarah, Mahasiswi</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-brand-dark">&quot;AI Chat-nya pinter banget, saran rutinnya simpel tapi bikin jerawatku reda dalam 2 minggu.&quot;</p>
              <div className="mt-3 text-xs text-brand-light">— Rina, Karyawan Swasta</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-brand-dark">&quot;Suka banget sama analisa kulitnya, akurat! Jadi tau kenapa selama ini sering breakout salah produk.&quot;</p>
              <div className="mt-3 text-xs text-brand-light">— Dinda, Content Creator</div>
            </Card>
          </div>
        </div>
      </section> */}
    </main>
  );
}

