import Hero from "@/components/Hero";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/ProductCard";
import { getServerSupabaseRSC } from "@/lib/supabaseServerRSC";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await getServerSupabaseRSC();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .limit(4);

  const { data: bestSellers } = await supabase
    .from("products")
    .select("id,name,price,image")
    .eq("featured", true)
    .limit(4);

  let rows = bestSellers ?? [];
  if (!rows || rows.length === 0) {
    const { data: top } = await supabase
      .from("products")
      .select("id,name,price,image")
      .limit(4);
    rows = top ?? [];
  }

  const bestSellerItems = rows.map((r: any) => ({ id: String(r.id), name: r.name, price: Number(r.price) || 0, image: r.image || "/vercel.svg", rating: 0 }));
  const featuredItems = (featuredProducts ?? []).map((r: any) => ({ id: String(r.id), name: r.name, price: Number(r.price) || 0, image: r.image || "/vercel.svg", rating: r.rating || 0, category: r.category }));

  return (
    <main>
      <Hero />

      {/* Featured Products Section */}
      {featuredItems.length > 0 && (
        <section className="py-12 sm:py-16 bg-neutral-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <Badge variant="outline">Featured</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-dark">Produk Unggulan</h2>
              <p className="mt-2 text-sm text-brand-light">Koleksi istimewa pilihan kami untuk Anda.</p>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x md:grid md:grid-cols-4 md:gap-6 md:pb-0 scrollbar-hide">
              {featuredItems.map((p: any) => (
                <div key={p.id} className="w-[200px] md:w-auto snap-center shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Badge>Best Sellers</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-dark">Produk unggulan</h2>
            <p className="mt-2 text-sm text-brand-light">Pilihan populer dengan rating tinggi.</p>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x md:grid md:grid-cols-4 md:gap-6 md:pb-0 scrollbar-hide">
            {bestSellerItems.map((p) => (
              <div key={p.id} className="w-[200px] md:w-auto snap-center shrink-0">
                <ProductCard product={{ id: p.id, name: p.name, price: p.price, image: p.image, rating: p.rating }} />
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
