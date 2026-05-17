"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/contracts";

interface CatalogState {
  catalog: Product[];
  setCatalog: (next: Product[]) => void;
  loadDemo: () => void;
  reset: () => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      catalog: [],
      setCatalog: (next) => set({ catalog: next }),
      loadDemo: () => set({ catalog: PRODUCTS }),
      reset: () => set({ catalog: [] }),
    }),
    {
      name: "ticari-zeka:catalog",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
