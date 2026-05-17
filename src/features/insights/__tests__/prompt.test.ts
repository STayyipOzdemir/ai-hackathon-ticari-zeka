import { describe, expect, it } from "vitest";
import { buildInsightsPrompt } from "../prompt";
import type { CategoryTrend, Product, TrendKeyword } from "@/contracts";

const products: Product[] = [
  {
    id: "P001",
    title: "Okul çantası",
    category: "kirtasiye",
    price: 449,
    cost: 230,
    stock: 120,
    views30d: 4200,
    sales30d: 138,
    rating: 4.4,
    reviewCount: 312,
  },
];

const trends: CategoryTrend[] = [
  {
    category: "kirtasiye",
    heat: 92,
    weekOverWeek: 0.34,
    topKeywords: ["okul çantası", "suluk"],
  },
];

const keywords: TrendKeyword[] = [
  {
    keyword: "okul çantası",
    category: "kirtasiye",
    searchScore: 96,
    weekOverWeek: 0.62,
    competition: "yuksek",
  },
];

describe("buildInsightsPrompt", () => {
  it("ürün ID'si prompt'ta yer alır", () => {
    const p = buildInsightsPrompt(products, trends, keywords);
    expect(p).toContain("P001");
    expect(p).toContain("Okul çantası");
  });

  it("kategori trend ısısı + WoW prompt'a düşer", () => {
    const p = buildInsightsPrompt(products, trends, keywords);
    expect(p).toContain("ısı=92");
    expect(p).toContain("34%");
  });

  it("yükselen kelimeler bölümünde keyword listelenir", () => {
    const p = buildInsightsPrompt(products, trends, keywords);
    expect(p).toContain('"okul çantası"');
    expect(p).toContain("arama skoru=96");
  });

  it("görev bölümünde priorityScore ve CTR aralığı geçer", () => {
    const p = buildInsightsPrompt(products, trends, keywords);
    expect(p).toContain("priorityScore");
    expect(p).toContain("0.05–0.45");
  });
});
