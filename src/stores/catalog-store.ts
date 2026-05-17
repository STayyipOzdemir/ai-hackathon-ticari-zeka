"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PRODUCTS } from "@/lib/mock-data";
import ahmetData from "@/data/ahmet-kirtasiye.json";
import type { Product } from "@/contracts";

interface AhmetPersona {
  name: string;
  shopName: string;
  city: string;
  monthlyRevenue: number;
  monthlyAdSpend: number;
  monthlyAdRevenue: number;
  monthlyAdGrossProfit: number;
  monthlyAdNetProfit: number;
  currentRoas: number;
  currentMarginRate: number;
  tagline: string;
}

interface AhmetCampaign {
  keyword: string;
  spent: number;
  clicks: number;
  revenue: number;
  grossProfit: number;
  netProfit: number;
  roas: number;
  verdict: string;
  issue: string;
}

interface CatalogState {
  catalog: Product[];
  persona?: AhmetPersona;
  currentCampaigns?: AhmetCampaign[];
  setCatalog: (next: Product[]) => void;
  loadDemo: () => void;
  loadAhmetDemo: () => void;
  reset: () => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      catalog: [],
      persona: undefined,
      currentCampaigns: undefined,
      setCatalog: (next) =>
        set({ catalog: next, persona: undefined, currentCampaigns: undefined }),
      loadDemo: () =>
        set({ catalog: PRODUCTS, persona: undefined, currentCampaigns: undefined }),
      loadAhmetDemo: () =>
        set({
          catalog: ahmetData.products as Product[],
          persona: ahmetData.persona,
          currentCampaigns: ahmetData.lastWeekCampaigns,
        }),
      reset: () =>
        set({ catalog: [], persona: undefined, currentCampaigns: undefined }),
    }),
    {
      name: "ticari-zeka:catalog",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
