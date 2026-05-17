"use client";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product, ProductInsight } from "@/contracts";
import { useInsightsStore } from "@/stores/insights-store";

interface StreamState {
  streaming: boolean;
  accumulated: string;
  charCount: number;
  trendSource?: string;
  error?: string;
}

interface SSEEvent {
  type: "start" | "delta" | "complete" | "error";
  trendSource?: "live" | "partial" | "fallback";
  trendsFetchedAt?: string;
  accumulated?: string;
  insights?: ProductInsight[];
  weeklyHeadline?: string;
  message?: string;
}

/**
 * Gemini cevabı stream olarak gelirken UI'a karakter karakter aktarır.
 * `accumulated`: şu ana kadar gelen ham metin (kullanıcıya gösterilebilir).
 * Stream bittiğinde Zod-validated insights zustand store'a yazılır.
 */
export function useStreamInsights() {
  const setInsights = useInsightsStore((s) => s.setInsights);
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<StreamState>({
    streaming: false,
    accumulated: "",
    charCount: 0,
  });

  const start = useCallback(
    async (products: Product[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        streaming: true,
        accumulated: "",
        charCount: 0,
        error: undefined,
      });

      try {
        const res = await fetch("/api/insights/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products }),
          signal: controller.signal,
        });

        if (!res.body) {
          throw new Error("Stream cevabı boş.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let trendSource: string | undefined;
        let trendsFetchedAt: string | undefined;

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
              setState((prev) => ({
                ...prev,
                trendSource: parsed.trendSource,
              }));
            } else if (parsed.type === "delta") {
              setState((prev) => ({
                ...prev,
                accumulated: parsed.accumulated ?? "",
                charCount: (parsed.accumulated ?? "").length,
              }));
            } else if (parsed.type === "complete") {
              setInsights({
                insights: parsed.insights ?? [],
                weeklyHeadline: parsed.weeklyHeadline,
                trendSource: trendSource as "live" | "partial" | "fallback",
                trendsFetchedAt,
              });
              setState((prev) => ({
                ...prev,
                streaming: false,
              }));
              toast.success(`${parsed.insights?.length ?? 0} öneri hazır`);
            } else if (parsed.type === "error") {
              setState((prev) => ({
                ...prev,
                streaming: false,
                error: parsed.message,
              }));
              toast.error(parsed.message ?? "Bilinmeyen hata");
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        if (!message.includes("abort")) {
          setState((prev) => ({ ...prev, streaming: false, error: message }));
          toast.error(message);
        } else {
          setState((prev) => ({ ...prev, streaming: false }));
        }
      } finally {
        abortRef.current = null;
      }
    },
    [setInsights]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, streaming: false }));
  }, []);

  return { ...state, start, cancel };
}
