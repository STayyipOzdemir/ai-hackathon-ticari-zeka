import { SchemaType, type Schema } from "@google/generative-ai";

/**
 * Gemini'nin yapılandırılmış çıktı (responseSchema) için kullandığı şema
 * formatları. Zod ile birebir aynı tipler tutulur — Gemini doğru yapı
 * üretir, biz Zod ile validate ederiz.
 */

export const insightsSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    insights: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          productId: { type: SchemaType.STRING },
          newTitle: { type: SchemaType.STRING },
          rationale: { type: SchemaType.STRING },
          matchedKeywords: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          estimatedCtrLift: { type: SchemaType.NUMBER },
          priorityScore: { type: SchemaType.NUMBER },
        },
        required: [
          "productId",
          "newTitle",
          "rationale",
          "matchedKeywords",
          "estimatedCtrLift",
          "priorityScore",
        ],
      },
    },
    weeklyHeadline: { type: SchemaType.STRING },
  },
  required: ["insights", "weeklyHeadline"],
};

export const titleOptimizeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    originalTitle: { type: SchemaType.STRING },
    newTitle: { type: SchemaType.STRING },
    rationale: { type: SchemaType.STRING },
    matchedKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    estimatedCtrLift: { type: SchemaType.NUMBER },
    alternatives: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          angle: { type: SchemaType.STRING },
          estimatedCtrLift: { type: SchemaType.NUMBER },
          matchedKeywords: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["title", "angle", "estimatedCtrLift", "matchedKeywords"],
      },
    },
  },
  required: [
    "originalTitle",
    "newTitle",
    "rationale",
    "matchedKeywords",
    "estimatedCtrLift",
    "alternatives",
  ],
};

export const budgetPlanSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    allocations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          keyword: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          recommendedBudget: { type: SchemaType.NUMBER },
          competition: { type: SchemaType.STRING },
          conversionRate: { type: SchemaType.NUMBER },
          matchedProductIds: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          rationale: { type: SchemaType.STRING },
        },
        required: [
          "keyword",
          "category",
          "recommendedBudget",
          "competition",
          "conversionRate",
          "matchedProductIds",
          "rationale",
        ],
      },
    },
    summary: { type: SchemaType.STRING },
  },
  required: ["allocations", "summary"],
};
