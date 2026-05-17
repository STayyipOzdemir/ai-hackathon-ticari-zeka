import { describe, expect, it } from "vitest";
import {
  CPC,
  computeAllocation,
  computeOpportunityCost,
  computeRevenueLift,
  normalizeCategory,
  normalizeCompetition,
} from "../math";
import type { Product } from "@/contracts";

const PRODUCT_A: Product = {
  id: "A",
  title: "Test A",
  category: "kirtasiye",
  price: 100,
  cost: 60,
  stock: 20,
  views30d: 1000,
  sales30d: 50,
  rating: 4.5,
  reviewCount: 100,
};

const PRODUCT_B: Product = {
  ...PRODUCT_A,
  id: "B",
  category: "elektronik",
  price: 200,
  cost: 100,
};

describe("normalizeCompetition", () => {
  it("d ile başlayan → dusuk", () => {
    expect(normalizeCompetition("Düşük")).toBe("dusuk");
    expect(normalizeCompetition("dusuk")).toBe("dusuk");
  });
  it("y ile başlayan → yuksek", () => {
    expect(normalizeCompetition("Yüksek")).toBe("yuksek");
  });
  it("diğer her şey → orta", () => {
    expect(normalizeCompetition("orta")).toBe("orta");
    expect(normalizeCompetition("medium")).toBe("orta");
    expect(normalizeCompetition("???")).toBe("orta");
  });
});

describe("normalizeCategory", () => {
  it("geçerli kategori → aynısını döner", () => {
    expect(normalizeCategory("elektronik")).toBe("elektronik");
    expect(normalizeCategory("MODA-KADIN")).toBe("moda-kadin");
  });
  it("geçersiz → kirtasiye fallback", () => {
    expect(normalizeCategory("uydurma")).toBe("kirtasiye");
  });
});

describe("computeAllocation", () => {
  const productsById = new Map([
    [PRODUCT_A.id, PRODUCT_A],
    [PRODUCT_B.id, PRODUCT_B],
  ]);

  it("orta rekabet için CPC=5, tıklama = bütçe / cpc", () => {
    const a = computeAllocation(
      {
        keyword: "test",
        category: "kirtasiye",
        recommendedBudget: 1000,
        competition: "orta",
        conversionRate: 0.05,
        matchedProductIds: ["A"],
        rationale: "x",
      },
      productsById
    );
    expect(a.cpc).toBe(CPC.orta);
    expect(a.expectedClicks).toBe(200); // 1000 / 5
    expect(a.expectedConversions).toBe(10); // 200 * 0.05
    expect(a.expectedRevenue).toBe(1000); // 10 * 100
    expect(a.expectedProfit).toBe(-600); // 10 * 40 - 1000
    expect(a.roi).toBeCloseTo(-0.6, 3);
  });

  it("matchedProductIds boşsa kategori havuzundan ortalama alır", () => {
    const a = computeAllocation(
      {
        keyword: "test",
        category: "kirtasiye",
        recommendedBudget: 500,
        competition: "dusuk",
        conversionRate: 0.08,
        matchedProductIds: [],
        rationale: "x",
      },
      productsById
    );
    // sadece A kirtasiye kategorisinde, avgPrice=100, avgMargin=40
    expect(a.cpc).toBe(CPC.dusuk);
    expect(a.expectedClicks).toBe(Math.round(500 / 2.25));
    expect(a.expectedRevenue).toBeGreaterThan(0);
  });

  it("conversionRate 0.12 üstü clamp edilir", () => {
    const a = computeAllocation(
      {
        keyword: "test",
        category: "elektronik",
        recommendedBudget: 200,
        competition: "yuksek",
        conversionRate: 0.5,
        matchedProductIds: ["B"],
        rationale: "x",
      },
      productsById
    );
    expect(a.conversionRate).toBe(0.12);
  });

  it("ROI = profit / budget eşitliği her zaman doğru", () => {
    const a = computeAllocation(
      {
        keyword: "test",
        category: "elektronik",
        recommendedBudget: 880,
        competition: "yuksek",
        conversionRate: 0.04,
        matchedProductIds: ["B"],
        rationale: "x",
      },
      productsById
    );
    expect(a.roi).toBeCloseTo(a.expectedProfit / a.recommendedBudget, 6);
  });

  it("bütçe 0 ise tüm metrikler 0", () => {
    const a = computeAllocation(
      {
        keyword: "test",
        category: "elektronik",
        recommendedBudget: 0,
        competition: "orta",
        conversionRate: 0.03,
        matchedProductIds: ["B"],
        rationale: "x",
      },
      productsById
    );
    expect(a.expectedClicks).toBe(0);
    expect(a.roi).toBe(0);
  });
});

describe("computeRevenueLift", () => {
  it("ctrLift'i 0.01-0.6 arasına clamp eder", () => {
    expect(computeRevenueLift(0, PRODUCT_A).ctrLift).toBe(0.01);
    expect(computeRevenueLift(0.8, PRODUCT_A).ctrLift).toBe(0.6);
    expect(computeRevenueLift(0.2, PRODUCT_A).ctrLift).toBe(0.2);
  });

  it("revenueLift = sales × price × ctrLift, deterministik", () => {
    const r = computeRevenueLift(0.2, PRODUCT_A);
    expect(r.revenueLift).toBe(Math.round(50 * 100 * 0.2)); // 1000
  });

  it("product yoksa revenueLift = 0", () => {
    expect(computeRevenueLift(0.2, undefined).revenueLift).toBe(0);
  });
});

describe("computeOpportunityCost", () => {
  it("ROAS yüksek + marj düşük → net kâr negatif (Ahmet abi senaryosu)", () => {
    const campaigns = [
      { keyword: "k1", spent: 2400, revenue: 1800, netProfit: -1590 },
      { keyword: "k2", spent: 1800, revenue: 2900, netProfit: -495 },
      { keyword: "k3", spent: 2200, revenue: 3200, netProfit: -760 },
      { keyword: "k4", spent: 1600, revenue: 4400, netProfit: 380 },
    ];
    const result = computeOpportunityCost(campaigns, {
      expectedRevenue: 20000,
      expectedProfit: 6000,
      totalBudget: 8000,
    });
    // ROAS = 12300/8000 = 1.5375
    expect(result.currentRoas).toBeCloseTo(1.5375, 3);
    // Net kâr toplam: -1590-495-760+380 = -2465 (negatif → reklam zarar)
    expect(result.currentTotalNetProfit).toBe(-2465);
    // ROAS pozitif ama net ROI negatif → demin yakaladığımız hata
    expect(result.currentRoas).toBeGreaterThan(0);
    expect(result.currentNetRoi).toBeLessThan(0);
  });

  it("netProfit verilmezse ciro × marj - spent ile tahmin yapar", () => {
    const campaigns = [{ keyword: "k1", spent: 1000, revenue: 3000 }];
    const result = computeOpportunityCost(
      campaigns,
      { expectedRevenue: 5000, expectedProfit: 1500, totalBudget: 1000 },
      0.5 // %50 marj varsayımı
    );
    // gross = 3000 × 0.5 = 1500, net = 1500 - 1000 = 500
    expect(result.currentTotalNetProfit).toBe(500);
  });

  it("yeni plan daha iyiyse moneyLeftOnTable pozitif", () => {
    const campaigns = [{ keyword: "k1", spent: 1000, revenue: 1500, netProfit: -250 }];
    const result = computeOpportunityCost(campaigns, {
      expectedRevenue: 5000,
      expectedProfit: 2000,
      totalBudget: 1000,
    });
    // projeNetRate = 2000/1000 = 2x. Aynı 1000₺ harcasa 2000₺ net.
    // moneyLeft = 2000 - (-250) = 2250
    expect(result.moneyLeftOnTable).toBe(2250);
    expect(result.annualMoneyLeftOnTable).toBe(2250 * 52);
  });
});
