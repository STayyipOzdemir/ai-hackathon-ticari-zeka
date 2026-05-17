import { z } from "zod";
import { CatalogSchema } from "./product";
import { CategorySchema, CompetitionSchema } from "./category";

export const CurrentCampaignSchema = z.object({
  keyword: z.string().min(1),
  spent: z.number().nonnegative(),
  clicks: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative(),
  /** Marj sonrası, reklam düşülmeden brüt kâr. Verilmezse ciro × marj ile tahmin */
  grossProfit: z.number().optional(),
  /** Reklam düşülmüş net kâr (negatif olabilir). Verilmezse grossProfit - spent */
  netProfit: z.number().optional(),
});
export type CurrentCampaign = z.infer<typeof CurrentCampaignSchema>;

export const BudgetPlanRequestSchema = z.object({
  products: CatalogSchema.min(1, "Ürün listesi boş."),
  totalBudget: z.number().min(100, "Bütçe en az 100₺ olmalı."),
  /** Insights ekranından gelen öncelikli kelime önerileri */
  suggestedKeywords: z.array(z.string()).optional(),
  /** Satıcının şu anki reklam kampanyaları — fırsat maliyeti hesabı için */
  currentCampaigns: z.array(CurrentCampaignSchema).optional(),
});
export type BudgetPlanRequest = z.infer<typeof BudgetPlanRequestSchema>;

export const OpportunityCostSchema = z.object({
  currentTotalSpend: z.number(),
  currentTotalRevenue: z.number(),
  /** Marj sonrası, reklam düşülmüş net kâr — negatif ise zarar */
  currentTotalNetProfit: z.number(),
  /** ROAS = ciro / reklam. Pazarlama jargonu, yanıltıcı olabilir */
  currentRoas: z.number(),
  /** Net ROI = net kâr / reklam. Asıl finansal metrik */
  currentNetRoi: z.number(),
  /** Geriye uyumluluk: currentRoas ile aynı */
  currentRoi: z.number(),
  projectedRevenue: z.number(),
  projectedProfit: z.number(),
  projectedRoi: z.number(),
  /** Pozitifse "masada NET KÂR var", negatifse "yeni plan daha kötü" */
  moneyLeftOnTable: z.number(),
  /** Yıllık projeksiyon (haftalık × 52) */
  annualMoneyLeftOnTable: z.number(),
});
export type OpportunityCost = z.infer<typeof OpportunityCostSchema>;

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
  /** Mevcut kampanyalarla karşılaştırma (varsa) */
  opportunityCost: OpportunityCostSchema.optional(),
});
export type BudgetPlanResponse = z.infer<typeof BudgetPlanResponseSchema>;
