"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { BudgetPlanResponseSchema, type Product } from "@/contracts";
import { useInsightsStore } from "@/stores/insights-store";

export function useGenerateBudgetPlan() {
  const setBudgetPlan = useInsightsStore((s) => s.setBudgetPlan);

  return useMutation({
    mutationKey: ["budget-plan"],
    mutationFn: async ({
      products,
      totalBudget,
      suggestedKeywords,
    }: {
      products: Product[];
      totalBudget: number;
      suggestedKeywords?: string[];
    }) =>
      apiFetch("/api/budget-plan", BudgetPlanResponseSchema, {
        method: "POST",
        body: JSON.stringify({ products, totalBudget, suggestedKeywords }),
      }),
    onSuccess: (data) => {
      setBudgetPlan(data);
      toast.success(
        `${data.allocations.length} kelimeye dağıtıldı · ROI ${data.expectedRoi.toFixed(2)}×`
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
