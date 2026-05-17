"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { InsightsResponseSchema, type Product } from "@/contracts";
import { useInsightsStore } from "@/stores/insights-store";

export function useGenerateInsights() {
  const setInsights = useInsightsStore((s) => s.setInsights);

  return useMutation({
    mutationKey: ["insights"],
    mutationFn: async (products: Product[]) =>
      apiFetch("/api/insights", InsightsResponseSchema, {
        method: "POST",
        body: JSON.stringify({ products }),
      }),
    onSuccess: (data) => {
      setInsights({
        insights: data.insights,
        weeklyHeadline: data.weeklyHeadline,
        trendSource: data.trendSource,
        trendsFetchedAt: data.trendsFetchedAt,
      });
      toast.success(`${data.insights.length} öneri hazır`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
