import { z } from "zod";
import { CatalogSchema } from "./product";
import { CategorySchema, CompetitionSchema } from "./category";

export const BudgetPlanRequestSchema = z.object({
  products: CatalogSchema.min(1, "Ürün listesi boş."),
  totalBudget: z.number().min(100, "Bütçe en az 100₺ olmalı."),
  /** Insights ekranından gelen öncelikli kelime önerileri */
  suggestedKeywords: z.array(z.string()).optional(),
});
export type BudgetPlanRequest = z.infer<typeof BudgetPlanRequestSchema>;

export const GeminiAllocationSchema = z.object({
  keyword: z.string(),
  category: z.string(),
  recommendedBudget: z.number().nonnegative(),
  competition: z.string(),
  conversionRate: z.number().min(0).max(1),
  matchedProductIds: z.array(z.string()),
  rationale: z.string(),
});
export type GeminiAllocation = z.infer<typeof GeminiAllocationSchema>;

export const GeminiBudgetResponseSchema = z.object({
  allocations: z.array(GeminiAllocationSchema),
  summary: z.string(),
});
export type GeminiBudgetResponse = z.infer<typeof GeminiBudgetResponseSchema>;

export const BudgetAllocationSchema = z.object({
  keyword: z.string(),
  category: CategorySchema,
  competition: CompetitionSchema,
  cpc: z.number().positive(),
  conversionRate: z.number().min(0).max(1),
  recommendedBudget: z.number().nonnegative(),
  expectedClicks: z.number().int().nonnegative(),
  expectedConversions: z.number().int().nonnegative(),
  expectedRevenue: z.number(),
  expectedProfit: z.number(),
  roi: z.number(),
  rationale: z.string(),
});
export type BudgetAllocation = z.infer<typeof BudgetAllocationSchema>;

export const BudgetPlanResponseSchema = z.object({
  totalBudget: z.number(),
  expectedTotalRevenue: z.number(),
  expectedTotalProfit: z.number(),
  expectedRoi: z.number(),
  allocations: z.array(BudgetAllocationSchema),
  summary: z.string(),
  trendSource: z.enum(["live", "partial", "fallback"]).optional(),
  trendsFetchedAt: z.string().optional(),
});
export type BudgetPlanResponse = z.infer<typeof BudgetPlanResponseSchema>;
