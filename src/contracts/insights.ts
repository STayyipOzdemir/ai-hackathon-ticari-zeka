import { z } from "zod";
import { CatalogSchema } from "./product";

export const InsightsRequestSchema = z.object({
  products: CatalogSchema.min(1, "Ürün listesi boş."),
});
export type InsightsRequest = z.infer<typeof InsightsRequestSchema>;

export const GeminiInsightSchema = z.object({
  productId: z.string(),
  newTitle: z.string(),
  rationale: z.string(),
  matchedKeywords: z.array(z.string()),
  estimatedCtrLift: z.number(),
  priorityScore: z.number(),
});
export type GeminiInsight = z.infer<typeof GeminiInsightSchema>;

export const GeminiInsightsResponseSchema = z.object({
  insights: z.array(GeminiInsightSchema),
  weeklyHeadline: z.string(),
});
export type GeminiInsightsResponse = z.infer<typeof GeminiInsightsResponseSchema>;

export const ProductInsightSchema = GeminiInsightSchema.extend({
  estimatedRevenueLift: z.number(),
});
export type ProductInsight = z.infer<typeof ProductInsightSchema>;

export const InsightsResponseSchema = z.object({
  insights: z.array(ProductInsightSchema),
  weeklyHeadline: z.string(),
  trendSource: z.enum(["live", "partial", "fallback"]).optional(),
  trendsFetchedAt: z.string().optional(),
});
export type InsightsResponse = z.infer<typeof InsightsResponseSchema>;
