"use client";
import { useEffect, useState } from "react";

/**
 * Persisted Zustand store'lar tarayıcıda hydrate olmadan önce server'da
 * boş gözükür. UI'ın "ilk state'ten farklı görünmeye" başlamadan
 * SSR-safe render yapmasını sağlar.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
