import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/features/products/types";

type State = {
  items: Product[];
  add: (item: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((s) => {
        const exists = s.items.some((i) => i.id === item.id);
        const next = exists ? s.items : [...s.items, item].slice(-3);
        return { items: next };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
