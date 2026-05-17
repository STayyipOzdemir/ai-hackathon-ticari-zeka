import { generate } from "@/lib/gemini";
import { insightsSchema } from "@/lib/gemini/schemas";
import {
  GeminiInsightsResponseSchema,
  type Product,
  type ProductInsight,
} from "@/contracts";
import { TOP_KEYWORDS } from "@/lib/mock-data";
import { getLiveCategoryTrends } from "@/features/trends/server";
import { buildInsightsPrompt } from "./prompt";
import { computeRevenueLift } from "@/features/budget/math";

export interface InsightsResult {
  insights: ProductInsight[];
  weeklyHeadline: string;
  trendSource: "live" | "partial" | "fallback";
  trendsFetchedAt: string;
}

export async function generateInsights(
  products: Product[]
): Promise<InsightsResult> {
  const trendData = await getLiveCategoryTrends();

  const data = await generate({
    operation: "insights",
    prompt: buildInsightsPrompt(products, trendData.categoryTrends, TOP_KEYWORDS),
    responseSchema: insightsSchema,
    validate: GeminiInsightsResponseSchema,
    temperature: 0.7,
  });

  const productsById = new Map(products.map((p) => [p.id, p]));
  const enriched: ProductInsight[] = data.insights
    .map((ins) => {
      const { ctrLift, revenueLift } = computeRevenueLift(
        ins.estimatedCtrLift,
        productsById.get(ins.productId)
      );
      return {
        ...ins,
        estimatedCtrLift: ctrLift,
        estimatedRevenueLift: revenueLift,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    insights: enriched,
    weeklyHeadline: data.weeklyHeadline,
    trendSource: trendData.source,
    trendsFetchedAt: trendData.fetchedAt,
  };
}
