import Button from "@/components/ui/Button";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-brand-primary/20 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary px-3 py-1 text-xs font-medium text-brand-dark ring-1 ring-black/5">New • Smart Beauty Platform</div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-brand-dark">Kenali Jenis Kulitmu, Temukan Skincare Terbaik</h1>
            <p className="mt-4 text-base sm:text-lg text-brand-light">Platform cerdas untuk <span className="font-semibold text-brand-primary-hover">Analisa Kulit</span>, <span className="font-semibold text-brand-primary-hover">Bandingkan Produk</span>, dan <span className="font-semibold text-brand-primary-hover">Konsultasi AI</span> agar kamu tidak salah pilih lagi.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/products">Shop Now</Button>
              <Button variant="ai" href="/Ai">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Chat
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="row-span-2 relative rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 aspect-[2/3]">
                <Image
                  src="/1.webp"
                  alt="Skin Analysis Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 aspect-square">
                <Image
                  src="/2.webp"
                  alt="Product Comparison"
                  fill
                  className="object-cover scale-100"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 aspect-square">
                <Image
                  src="/3.webp"
                  alt="AI Chat Consultant"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -left-4 -top-4 hidden h-28 w-28 rounded-full bg-brand-primary/40 blur-xl sm:block" />
            <div className="absolute -right-8 -bottom-8 hidden h-24 w-24 rounded-full bg-brand-primary/30 blur-xl sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
