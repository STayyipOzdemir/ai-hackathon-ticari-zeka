"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import {
  CategoryTrendsResponseSchema,
  LiveTrendsResponseSchema,
  type TrendRange,
} from "@/contracts";

export function useCategoryTrends() {
  return useQuery({
    queryKey: ["category-trends"],
    queryFn: () =>
      apiFetch("/api/category-trends", CategoryTrendsResponseSchema),
    staleTime: 5 * 60 * 1000,
  });
}

export function useKeywordTrends(keyword: string, range: TrendRange) {
  return useQuery({
    queryKey: ["keyword-trends", keyword, range],
    queryFn: () =>
      apiFetch(
        `/api/trends?q=${encodeURIComponent(keyword)}&geo=TR&range=${range}`,
        LiveTrendsResponseSchema
      ),
    enabled: keyword.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
