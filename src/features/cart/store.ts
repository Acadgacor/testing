"use client";
import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
  category?: string;
  ingredients?: string[];
};

type State = {
  items: CartItem[];
  add: (p: { id: string; name: string; price: number; image?: string; category?: string; ingredients?: string[] }, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  setItems: (items: CartItem[]) => void;
};

export const useCartStore = create<State>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  add: (p, qty = 1) =>
    set((s) => {
      const i = s.items.findIndex((it) => it.id === p.id);
      if (i >= 0) {
        const next = s.items.slice();
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return { items: next };
      }
      return { items: [...s.items, { ...p, qty }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  update: (id, qty) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)) })),
  clear: () => set({ items: [] }),
}));
