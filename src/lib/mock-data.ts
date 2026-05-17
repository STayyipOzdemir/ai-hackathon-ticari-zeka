import productsRaw from "@/data/products.json";
import trendsRaw from "@/data/trends.json";
import type { Product, CategoryTrend, TrendKeyword } from "./types";

export const PRODUCTS = productsRaw as Product[];

export const CATEGORY_TRENDS = (trendsRaw.categoryTrends as CategoryTrend[]).slice();

export const TOP_KEYWORDS = (trendsRaw.topKeywordsAcrossMarket as TrendKeyword[]).slice();

export const TRENDS_WEEK_OF = trendsRaw.weekOf;

export function productsToCSV(products: Product[]): string {
  const header = "id,title,category,price,cost,stock,views30d,sales30d,rating,reviewCount";
  const rows = products.map(
    (p) =>
      `${p.id},"${p.title.replaceAll('"', '""')}",${p.category},${p.price},${p.cost},${p.stock},${p.views30d},${p.sales30d},${p.rating},${p.reviewCount}`
  );
  return [header, ...rows].join("\n");
}
