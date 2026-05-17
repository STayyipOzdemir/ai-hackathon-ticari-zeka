import { z } from "zod";
import { ProductSchema } from "./product";

export const TitleOptimizeRequestSchema = z.object({
  product: ProductSchema,
});
export type TitleOptimizeRequest = z.infer<typeof TitleOptimizeRequestSchema>;

export const TitleAlternativeSchema = z.object({
  title: z.string(),
  angle: z.string(),
  estimatedCtrLift: z.number().min(0).max(1),
  matchedKeywords: z.array(z.string()),
});
export type TitleAlternative = z.infer<typeof TitleAlternativeSchema>;

export const TitleOptimizeResponseSchema = z.object({
  originalTitle: z.string(),
  newTitle: z.string(),
  rationale: z.string(),
  matchedKeywords: z.array(z.string()),
  estimatedCtrLift: z.number().min(0).max(1),
  alternatives: z.array(TitleAlternativeSchema).default([]),
});
export type TitleOptimizeResponse = z.infer<typeof TitleOptimizeResponseSchema>;
