"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import {
  CreditSuggestionResponseSchema,
  type CreditSuggestionRequest,
} from "@/contracts";

export function useCreditSuggestion() {
  return useMutation({
    mutationKey: ["credit-suggestion"],
    mutationFn: async (req: CreditSuggestionRequest) =>
      apiFetch(
        "/api/credit-suggestion",
        CreditSuggestionResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(req),
        }
      ),
    onError: (err) => toast.error(err.message),
  });
}
