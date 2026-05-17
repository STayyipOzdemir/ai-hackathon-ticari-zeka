"use client";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/fetcher";
import {
  TitleOptimizeResponseSchema,
  type Product,
  type TitleOptimizeResponse,
} from "@/contracts";
import { useInsightsStore } from "@/stores/insights-store";

interface BulkState {
  running: boolean;
  done: number;
  total: number;
  current?: string;
  failed: string[];
}

/**
 * Birden fazla ürün için sıralı title optimization. Gemini API'ye eş zamanlı
 * basmak rate-limit riski; sıralı + her istek arası 200ms gecikme.
 */
export function useBulkOptimize() {
  const upsert = useInsightsStore((s) => s.upsertBulkOptimization);
  const abortRef = useRef(false);
  const [state, setState] = useState<BulkState>({
    running: false,
    done: 0,
    total: 0,
    failed: [],
  });

  const start = useCallback(
    async (products: Product[]) => {
      if (state.running) return;
      abortRef.current = false;
      setState({
        running: true,
        done: 0,
        total: products.length,
        failed: [],
      });

      const failed: string[] = [];
      let done = 0;
      for (const p of products) {
        if (abortRef.current) break;
        setState((prev) => ({ ...prev, current: p.title }));
        try {
          const result = await apiFetch<TitleOptimizeResponse>(
            "/api/title-optimize",
            TitleOptimizeResponseSchema,
            {
              method: "POST",
              body: JSON.stringify({ product: p }),
            }
          );
          upsert(p.id, result);
        } catch {
          failed.push(p.id);
        }
        done++;
        setState((prev) => ({ ...prev, done, failed }));
        await new Promise((r) => setTimeout(r, 200));
      }

      setState((prev) => ({ ...prev, running: false, current: undefined }));
      if (failed.length === 0) {
        toast.success(`${done} ürün için yeni başlık önerisi hazır`);
      } else {
        toast.warning(
          `${done - failed.length}/${done} başarılı, ${failed.length} başarısız`
        );
      }
    },
    [state.running, upsert]
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { ...state, start, cancel };
}
