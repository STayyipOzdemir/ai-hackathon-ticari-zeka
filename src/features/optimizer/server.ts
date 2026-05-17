import { generate } from "@/lib/gemini";
import { titleOptimizeSchema } from "@/lib/gemini/schemas";
import {
  TitleOptimizeResponseSchema,
  type Product,
  type TitleOptimizeResponse,
} from "@/contracts";
import { TOP_KEYWORDS } from "@/lib/mock-data";
import { getLiveCategoryTrends } from "@/features/trends/server";
import { buildTitleOptimizePrompt } from "./prompt";

export async function optimizeTitle(
  product: Product
): Promise<TitleOptimizeResponse> {
  const trendData = await getLiveCategoryTrends();
  const categoryTrend = trendData.categoryTrends.find(
    (t) => t.category === product.category
  );
  const relevantKeywords = TOP_KEYWORDS.filter(
    (k) => k.category === product.category
  );

  return generate({
    operation: "title-optimize",
    prompt: buildTitleOptimizePrompt(product, categoryTrend, relevantKeywords),
    responseSchema: titleOptimizeSchema,
    validate: TitleOptimizeResponseSchema,
    temperature: 0.7,
  });
}
