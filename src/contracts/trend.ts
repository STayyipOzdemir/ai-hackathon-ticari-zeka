import { z } from "zod";
import { CategorySchema, CompetitionSchema } from "./category";

export const TrendRangeSchema = z.enum(["1d", "7d", "1m", "3m"]);
export type TrendRange = z.infer<typeof TrendRangeSchema>;

export const CategoryTrendSchema = z.object({
  category: CategorySchema,
  heat: z.number().min(0).max(100),
  weekOverWeek: z.number(),
  topKeywords: z.array(z.string()),
});
export type CategoryTrend = z.infer<typeof CategoryTrendSchema>;

export const TrendKeywordSchema = z.object({
  keyword: z.string(),
  category: CategorySchema,
  searchScore: z.number().min(0).max(100),
  weekOverWeek: z.number(),
  competition: CompetitionSchema,
});
export type TrendKeyword = z.infer<typeof TrendKeywordSchema>;

export const LiveTrendPointSchema = z.object({
  time: z.string(),
  value: z.number(),
  isoTime: z.string(),
});
export type LiveTrendPoint = z.infer<typeof LiveTrendPointSchema>;

export const LiveRelatedQuerySchema = z.object({
  query: z.string(),
  value: z.number(),
  link: z.string().optional(),
});
export type LiveRelatedQuery = z.infer<typeof LiveRelatedQuerySchema>;

export const TrendSourceSchema = z.enum([
  "google-trends",
  "cache",
  "fallback",
  "live",
  "partial",
]);
export type TrendSource = z.infer<typeof TrendSourceSchema>;

export const LiveTrendsResponseSchema = z.object({
  keyword: z.string(),
  geo: z.string(),
  range: TrendRangeSchema,
  averageInterest: z.number(),
  peakInterest: z.number(),
  latestInterest: z.number(),
  weekOverWeek: z.number().nullable(),
  points: z.array(LiveTrendPointSchema),
  risingQueries: z.array(LiveRelatedQuerySchema),
  topQueries: z.array(LiveRelatedQuerySchema),
  source: TrendSourceSchema,
  fetchedAt: z.string(),
  warning: z.string().optional(),
});
export type LiveTrendsResponse = z.infer<typeof LiveTrendsResponseSchema>;

export const CategoryTrendsResponseSchema = z.object({
  weekOf: z.string(),
  categoryTrends: z.array(CategoryTrendSchema),
  source: z.enum(["live", "partial", "fallback"]),
  failedCategories: z.array(CategorySchema),
  fetchedAt: z.string(),
});
export type CategoryTrendsResponse = z.infer<typeof CategoryTrendsResponseSchema>;
