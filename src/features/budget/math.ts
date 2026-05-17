import type {
  BudgetAllocation,
  Category,
  Competition,
  GeminiAllocation,
  Product,
} from "@/contracts";
import { CATEGORY_VALUES } from "@/contracts";

export const CPC: Record<Competition, number> = {
  dusuk: 2.25,
  orta: 5,
  yuksek: 11,
};

export function normalizeCompetition(s: string): Competition {
  const v = s.toLowerCase().trim();
  if (v.startsWith("d")) return "dusuk";
  if (v.startsWith("y")) return "yuksek";
  return "orta";
}

export function normalizeCategory(s: string): Category {
  const v = s.toLowerCase().trim() as Category;
  return CATEGORY_VALUES.includes(v) ? v : "kirtasiye";
}

/**
 * Gemini'nin (keyword + budget + competition + matchedProductIds) önerisini
 * deterministik finansal sonuca dönüştürür. Bu fonksiyon saf — input ne ise
 * output her zaman aynı. Test edilebilir.
 */
export function computeAllocation(
  raw: GeminiAllocation,
  productsById: Map<string, Product>
): BudgetAllocation {
  const competition = normalizeCompetition(raw.competition);
  const category = normalizeCategory(raw.category);
  const cpc = CPC[competition];
  const conversionRate = Math.max(
    0.005,
    Math.min(0.12, raw.conversionRate || 0.03)
  );
  const budget = Math.max(0, Math.round(raw.recommendedBudget));

  const matched = raw.matchedProductIds
    .map((id) => productsById.get(id))
    .filter((p): p is Product => Boolean(p));

  const fallbackPool = Array.from(productsById.values()).filter(
    (p) => p.category === category
  );
  const pool = matched.length > 0 ? matched : fallbackPool;

  const avgPrice =
    pool.length > 0
      ? pool.reduce((a, p) => a + p.price, 0) / pool.length
      : 400;
  const avgCost =
    pool.length > 0
      ? pool.reduce((a, p) => a + p.cost, 0) / pool.length
      : avgPrice * 0.5;
  const avgMargin = avgPrice - avgCost;

  const expectedClicks = budget > 0 ? Math.round(budget / cpc) : 0;
  const expectedConversions = Math.round(expectedClicks * conversionRate);
  const expectedRevenue = Math.round(expectedConversions * avgPrice);
  const expectedProfit = Math.round(expectedConversions * avgMargin - budget);
  const roi = budget > 0 ? expectedProfit / budget : 0;

  return {
    keyword: raw.keyword,
    category,
    competition,
    cpc,
    conversionRate,
    recommendedBudget: budget,
    expectedClicks,
    expectedConversions,
    expectedRevenue,
    expectedProfit,
    roi,
    rationale: raw.rationale,
  };
}

/**
 * Insights için: Gemini'nin estimatedCtrLift'ini reasonable aralığa clamp
 * eder ve gerçek satış × fiyat ile çarparak 30g ek ciro tahmini üretir.
 */
export function computeRevenueLift(
  estimatedCtrLift: number,
  product: Product | undefined
): { ctrLift: number; revenueLift: number } {
  const ctrLift = Math.max(0.01, Math.min(0.6, estimatedCtrLift));
  const revenueLift = product
    ? Math.round(product.sales30d * product.price * ctrLift)
    : 0;
  return { ctrLift, revenueLift };
}

/**
 * Satıcının mevcut reklam performansıyla, Gemini'nin yeni planını karşılaştırır.
 *
 * "Para Masada" = aynı reklam bütçesiyle yeni planın getireceği NET KÂR ile
 * mevcut net kârın farkı. Ciro değil — ciro yanıltıcı (yüksek ciro + düşük
 * marj = zarar). Net kâr satıcının cebine giren rakam.
 *
 * Mevcut net kârı hesaplamak için campaign'lere `netProfit` ya da `grossProfit`
 * verilmişse onu kullanır; yoksa ciroyu marj oranıyla çarpıp varsayım yapar.
 */
export function computeOpportunityCost(
  currentCampaigns: Array<{
    spent: number;
    revenue: number;
    grossProfit?: number;
    netProfit?: number;
  }>,
  newPlan: {
    expectedRevenue: number;
    expectedProfit: number;
    totalBudget: number;
  },
  assumedMarginRate = 0.45
) {
  const currentTotalSpend = currentCampaigns.reduce((a, c) => a + c.spent, 0);
  const currentTotalRevenue = currentCampaigns.reduce(
    (a, c) => a + c.revenue,
    0
  );
  // Net kâr önceliği: kampanya net > kampanya gross-spent > ciro × marj - spent
  const currentTotalNetProfit = currentCampaigns.reduce((a, c) => {
    if (typeof c.netProfit === "number") return a + c.netProfit;
    if (typeof c.grossProfit === "number") return a + (c.grossProfit - c.spent);
    return a + (c.revenue * assumedMarginRate - c.spent);
  }, 0);

  const currentRoas =
    currentTotalSpend > 0 ? currentTotalRevenue / currentTotalSpend : 0;
  const currentNetRoi =
    currentTotalSpend > 0 ? currentTotalNetProfit / currentTotalSpend : 0;

  const projectedRevenue = newPlan.expectedRevenue;
  const projectedProfit = newPlan.expectedProfit;
  const projectedRoi =
    newPlan.totalBudget > 0 ? projectedProfit / newPlan.totalBudget : 0;

  // Aynı bütçeyle yeni plan ne kadar fazla NET KÂR getirir?
  const newPlanProfitRate =
    newPlan.totalBudget > 0 ? projectedProfit / newPlan.totalBudget : 0;
  const projectedNetAtCurrentSpend = newPlanProfitRate * currentTotalSpend;
  const moneyLeftOnTable = Math.round(
    projectedNetAtCurrentSpend - currentTotalNetProfit
  );
  const annualMoneyLeftOnTable = moneyLeftOnTable * 52;

  return {
    currentTotalSpend,
    currentTotalRevenue,
    currentTotalNetProfit: Math.round(currentTotalNetProfit),
    currentRoas,
    currentNetRoi,
    /** geriye uyumluluk için (eski isim) */
    currentRoi: currentRoas,
    projectedRevenue,
    projectedProfit,
    projectedRoi,
    moneyLeftOnTable,
    annualMoneyLeftOnTable,
  };
}
