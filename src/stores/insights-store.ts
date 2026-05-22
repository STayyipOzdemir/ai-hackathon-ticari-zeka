"use client";
import { create } from "zustand";
import { toast } from "sonner";
import type {
  BudgetPlanResponse,
  Product,
  ProductInsight,
  TitleOptimizeResponse,
} from "@/contracts";

interface SSEEvent {
  type: "start" | "delta" | "complete" | "error";
  trendSource?: "live" | "partial" | "fallback";
  trendsFetchedAt?: string;
  accumulated?: string;
  insights?: ProductInsight[];
  weeklyHeadline?: string;
  message?: string;
}

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

  // Stream — sayfa değişse bile yaşar
  streaming: boolean;
  accumulated: string;
  charCount: number;
  streamError?: string;
  startStream: (products: Product[]) => Promise<void>;
  cancelStream: () => void;

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

let activeController: AbortController | null = null;

export const useInsightsStore = create<InsightsState>((set, get) => ({
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

  streaming: false,
  accumulated: "",
  charCount: 0,
  streamError: undefined,

  startStream: async (products) => {
    if (get().streaming) return;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    set({
      streaming: true,
      accumulated: "",
      charCount: 0,
      streamError: undefined,
    });

    let trendSource: "live" | "partial" | "fallback" | undefined;
    let trendsFetchedAt: string | undefined;

    try {
      const res = await fetch("/api/insights/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error("Stream cevabı boş.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          let parsed: SSEEvent;
          try {
            parsed = JSON.parse(payload) as SSEEvent;
          } catch {
            continue;
          }

          if (parsed.type === "start") {
            trendSource = parsed.trendSource;
            trendsFetchedAt = parsed.trendsFetchedAt;
            set({ trendSource });
          } else if (parsed.type === "delta") {
            const acc = parsed.accumulated ?? "";
            set({ accumulated: acc, charCount: acc.length });
          } else if (parsed.type === "complete") {
            set({
              insights: parsed.insights ?? [],
              weeklyHeadline: parsed.weeklyHeadline,
              trendSource,
              trendsFetchedAt,
              streaming: false,
            });
            toast.success(`${parsed.insights?.length ?? 0} öneri hazır`);
          } else if (parsed.type === "error") {
            set({ streaming: false, streamError: parsed.message });
            toast.error(parsed.message ?? "Bilinmeyen hata");
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      if (message.includes("abort")) {
        set({ streaming: false });
      } else {
        set({ streaming: false, streamError: message });
        toast.error(message);
      }
    } finally {
      if (activeController === controller) activeController = null;
    }
  },

  cancelStream: () => {
    activeController?.abort();
    activeController = null;
    set({ streaming: false });
  },

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
