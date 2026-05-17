import { z } from "zod";

export const CreditSuggestionRequestSchema = z.object({
  /** Şu an satıcının elinde olan bütçe */
  availableBudget: z.number().nonnegative(),
  /** Önerilen optimum bütçe (Gemini'den) */
  targetBudget: z.number().positive(),
  /** Optimum bütçedeki beklenen aylık ek kâr (haftalık × 4) */
  expectedMonthlyProfit: z.number(),
});
export type CreditSuggestionRequest = z.infer<
  typeof CreditSuggestionRequestSchema
>;

export const CreditOptionSchema = z.object({
  productId: z.string(),
  bank: z.string(),
  name: z.string(),
  principal: z.number(),
  termMonths: z.number().int().positive(),
  monthlyRate: z.number(),
  monthlyPayment: z.number(),
  totalRepayment: z.number(),
  totalInterest: z.number(),
  /** Krediyle yapılacak ek harcamanın beklenen kümülatif kârı (term boyunca) */
  expectedExtraProfit: z.number(),
  netBenefit: z.number(),
  verdict: z.enum(["öneririz", "marjinal", "önermeyiz"]),
  note: z.string(),
});
export type CreditOption = z.infer<typeof CreditOptionSchema>;

export const CreditSuggestionResponseSchema = z.object({
  shortfall: z.number(),
  options: z.array(CreditOptionSchema),
  bestOptionId: z.string().nullable(),
});
export type CreditSuggestionResponse = z.infer<
  typeof CreditSuggestionResponseSchema
>;
