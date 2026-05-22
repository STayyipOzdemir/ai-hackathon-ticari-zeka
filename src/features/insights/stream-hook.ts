"use client";
import { useInsightsStore } from "@/stores/insights-store";

/**
 * Stream state'i Zustand store'da yaşıyor — sayfa değiştirilse bile
 * aktif Gemini akışı kesilmiyor, kullanıcı dashboard'a dönünce
 * mevcut state'i (üretiliyor / hazır / hata) tekrar görüyor.
 */
export function useStreamInsights() {
  const streaming = useInsightsStore((s) => s.streaming);
  const accumulated = useInsightsStore((s) => s.accumulated);
  const charCount = useInsightsStore((s) => s.charCount);
  const error = useInsightsStore((s) => s.streamError);
  const start = useInsightsStore((s) => s.startStream);
  const cancel = useInsightsStore((s) => s.cancelStream);

  return { streaming, accumulated, charCount, error, start, cancel };
}
