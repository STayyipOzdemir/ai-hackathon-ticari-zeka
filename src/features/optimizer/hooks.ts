"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import { TitleOptimizeResponseSchema, type Product } from "@/contracts";
import { useInsightsStore } from "@/stores/insights-store";

export function useOptimizeTitle() {
  const setLast = useInsightsStore((s) => s.setLastOptimization);

  return useMutation({
    mutationKey: ["title-optimize"],
    mutationFn: async (product: Product) =>
      apiFetch("/api/title-optimize", TitleOptimizeResponseSchema, {
        method: "POST",
        body: JSON.stringify({ product }),
      }).then((result) => ({ product, result })),
    onSuccess: ({ product, result }) => {
      setLast(product.id, result);
      toast.success("Yeni başlık önerisi hazır");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
