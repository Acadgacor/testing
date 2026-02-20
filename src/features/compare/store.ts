import { create } from "zustand";

export type CompareItem = {
  id: string;
  name: string;
  image: string;
};

type State = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<State>((set) => ({
  items: [],
  add: (item) => set((s) => {
    const exists = s.items.some((i) => i.id === item.id);
    const next = exists ? s.items : [...s.items.slice(-2), item];
    return { items: next };
  }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

