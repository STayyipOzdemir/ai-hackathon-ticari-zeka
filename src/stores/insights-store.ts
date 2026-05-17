"use client";
import { create } from "zustand";
import type {
  BudgetPlanResponse,
  ProductInsight,
  TitleOptimizeResponse,
} from "@/contracts";

interface InsightsState {
  insights: ProductInsight[];
  weeklyHeadline?: string;
  trendSource?: "live" | "partial" | "fallback" | "cache";
  trendsFetchedAt?: string;
  setInsights: (data: {
    insights: ProductInsight[];
    weeklyHeadline?: string;
    trendSource?: "live" | "partial" | "fallback";
    trendsFetchedAt?: string;
  }) => void;
  clearInsights: () => void;

  // Optimizer
  lastOptimization?: { productId: string; result: TitleOptimizeResponse };
  setLastOptimization: (productId: string, result: TitleOptimizeResponse) => void;

  // Bulk optimizer
  bulkOptimizations: Record<string, TitleOptimizeResponse>;
  upsertBulkOptimization: (productId: string, result: TitleOptimizeResponse) => void;
  clearBulkOptimizations: () => void;

  // Budget
  budgetPlan?: BudgetPlanResponse;
  setBudgetPlan: (plan?: BudgetPlanResponse) => void;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  insights: [],
  setInsights: (data) =>
    set({
      insights: data.insights,
      weeklyHeadline: data.weeklyHeadline,
      trendSource: data.trendSource,
      trendsFetchedAt: data.trendsFetchedAt,
    }),
  clearInsights: () =>
    set({
      insights: [],
      weeklyHeadline: undefined,
      trendSource: undefined,
      trendsFetchedAt: undefined,
    }),
  setLastOptimization: (productId, result) =>
    set({ lastOptimization: { productId, result } }),
  bulkOptimizations: {},
  upsertBulkOptimization: (productId, result) =>
    set((state) => ({
      bulkOptimizations: { ...state.bulkOptimizations, [productId]: result },
    })),
  clearBulkOptimizations: () => set({ bulkOptimizations: {} }),
  setBudgetPlan: (plan) => set({ budgetPlan: plan }),
}));
