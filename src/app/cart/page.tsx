"use client";
import Button from "@/shared/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/features/cart/store";
import { generateRoutine } from "@/lib/routineGenerator";
import RoutineSuggestion from "@/components/RoutineSuggestion";
import { useMemo, useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { clearCart } from "@/features/cart/actions";

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function PouchPage() {
  const items = useCartStore((s) => s.items);
  const update = useCartStore((s) => s.update);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  // State untuk ngatur popup muncul atau nggak
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const routine = useMemo(() => generateRoutine(items), [items]);

  // Fungsi buat eksekusi hapus dari Supabase + Store
  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      // Panggil Server Action buat hapus di database
      await clearCart();

      // Bersihin tampilan di layar (Zustand)
      clear();
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
      setShowClearModal(false); // Tutup popup
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-neutral-50/30 min-h-screen relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-6">Skincare Pouch</h1>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-neutral-200">
            <div className="mx-auto h-20 w-20 rounded-full bg-brand-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-brand-dark opacity-50" />
            </div>
            <h2 className="text-lg font-semibold text-brand-dark">Pouch kamu masih kosong</h2>
            <p className="mt-2 text-sm text-brand-light">Yuk, cari skincare yang pas buat kebutuhan kulitmu!</p>
            <Link href="/products">
              <Button className="mt-6 px-8">Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">

              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-sm font-medium text-brand-dark">
                  Koleksi Pilihanmu ({items.reduce((a, b) => a + b.qty, 0)} barang)
                </span>
                {/* Tombol ini sekarang buka popup, bukan langsung hapus */}
                <button onClick={() => setShowClearModal(true)} className="text-sm text-red-500 font-medium hover:text-red-600 transition-colors">
                  Hapus Semua
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-100">
                      <Image src={(item as any).image || "/vercel.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <Link href={`/products/${item.id}`} className="text-sm sm:text-base font-medium text-brand-dark line-clamp-2 hover:text-brand-primary transition-colors">
                          {item.name}
                        </Link>
                        <div className="mt-1 font-bold text-brand-dark">
                          {formatRp(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 mt-4">
                        <button onClick={async () => {
                          // Opsional: Boleh ditambahin logika hapus per-item di database juga di sini nantinya
                          remove(item.id);
                        }} className="text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden">
                          <button onClick={() => update(item.id, Math.max(1, item.qty - 1))} className="px-3 py-1 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 text-sm font-medium text-brand-dark border-x border-neutral-300 min-w-[40px] text-center">
                            {item.qty}
                          </span>
                          <button onClick={() => update(item.id, item.qty + 1)} className="px-3 py-1 bg-white hover:bg-neutral-50 text-brand-primary transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <RoutineSuggestion routine={routine} />
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Ringkasan Pouch</h3>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-brand-light">Estimasi Total Harga</span>
                  <span className="text-lg font-bold text-brand-dark">{formatRp(subtotal)}</span>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-100 mb-4">
                    💡 <b>Catatan:</b> Ini adalah daftar keinginanmu. Untuk membeli produk, silakan klik nama produk dan gunakan tombol pembelian yang tersedia di halaman detail.
                  </div>
                  <Button className="w-full text-base font-semibold py-6" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                    Lihat Urutan Pakai
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP HAPUS SEMUA (Ala Tokopedia) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 sm:p-0">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 fade-in shadow-xl">
            <h3 className="text-lg font-bold text-brand-dark">Hapus semua barang?</h3>
            <p className="mt-2 text-sm text-neutral-500">Semua barang yang kamu pilih akan dihapus dari keranjang.</p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
              >
                Kembali
              </Button>
              <Button
                className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white"
                onClick={handleConfirmClear}
                disabled={isClearing}
              >
                {isClearing ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}