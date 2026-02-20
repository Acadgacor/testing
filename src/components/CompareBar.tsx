'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '@/features/compare/store';

export default function CompareBar() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  if (items.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl bg-white/95 backdrop-blur p-3 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-secondary px-2 py-1">
                  <div className="relative h-8 w-8 overflow-hidden rounded-md bg-white">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="text-xs font-medium text-neutral-800">{p.name}</div>
                  <button onClick={() => remove(p.id)} className="rounded-full bg-white px-2 py-1 text-xs text-brand-dark ring-1 ring-brand-primary/40" aria-label={`Remove ${p.name} from compare`}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clear} className="rounded-full border border-brand-primary/40 bg-brand-secondary px-3 py-2 text-xs font-medium text-brand-dark" aria-label="Clear compare list">Clear</button>
              <Link href="/compare" className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover" aria-label="Compare now">Compare Now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

