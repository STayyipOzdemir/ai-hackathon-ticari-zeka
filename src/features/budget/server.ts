import { generate } from "@/lib/gemini";
import { budgetPlanSchema } from "@/lib/gemini/schemas";
import {
  GeminiBudgetResponseSchema,
  type BudgetPlanResponse,
  type CurrentCampaign,
  type Product,
} from "@/contracts";
import { TOP_KEYWORDS } from "@/lib/mock-data";
import { getLiveCategoryTrends } from "@/features/trends/server";
import { buildBudgetPrompt } from "./prompt";
import { computeAllocation, computeOpportunityCost } from "./math";

export async function generateBudgetPlan(
  products: Product[],
  totalBudget: number,
  suggestedKeywords: string[] = [],
  currentCampaigns?: CurrentCampaign[]
): Promise<BudgetPlanResponse> {
  const trendData = await getLiveCategoryTrends();

  const data = await generate({
    operation: "budget-plan",
    prompt: buildBudgetPrompt(
      products,
      totalBudget,
      trendData.categoryTrends,
      TOP_KEYWORDS,
      suggestedKeywords
    ),
    responseSchema: budgetPlanSchema,
    validate: GeminiBudgetResponseSchema,
    temperature: 0.4,
  });

  const productsById = new Map(products.map((p) => [p.id, p]));
  const allocations = data.allocations
    .map((raw) => computeAllocation(raw, productsById))
    .sort((a, b) => b.roi - a.roi);

  const expectedTotalRevenue = allocations.reduce(
    (a, x) => a + x.expectedRevenue,
    0
  );
  const expectedTotalProfit = allocations.reduce(
    (a, x) => a + x.expectedProfit,
    0
  );
  const actualBudget = allocations.reduce(
    (a, x) => a + x.recommendedBudget,
    0
  );
  const expectedRoi =
    actualBudget > 0 ? expectedTotalProfit / actualBudget : 0;

  const opportunityCost =
    currentCampaigns && currentCampaigns.length > 0
      ? computeOpportunityCost(currentCampaigns, {
          expectedRevenue: expectedTotalRevenue,
          expectedProfit: expectedTotalProfit,
          totalBudget: actualBudget || totalBudget,
        })
      : undefined;

  return {
    totalBudget: actualBudget || totalBudget,
    expectedTotalRevenue,
    expectedTotalProfit,
    expectedRoi,
    allocations,
    summary: data.summary,
    trendSource: trendData.source,
    trendsFetchedAt: trendData.fetchedAt,
    opportunityCost,
  };
}
