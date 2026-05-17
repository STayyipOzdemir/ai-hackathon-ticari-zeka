import type {
  CreditOption,
  CreditSuggestionRequest,
  CreditSuggestionResponse,
} from "@/contracts";
import { CREDIT_PRODUCTS, type CreditProduct } from "./products";

/**
 * Eşit taksitli (annuity) aylık ödeme.
 *  M = P × r × (1+r)^n / ((1+r)^n - 1)
 *  r = aylık faiz, n = vade ay
 */
function annuityPayment(P: number, r: number, n: number): number {
  if (r === 0) return P / n;
  const factor = Math.pow(1 + r, n);
  return (P * r * factor) / (factor - 1);
}

function pickTerm(
  product: CreditProduct,
  expectedMonthlyProfit: number,
  principal: number
): number {
  // Vade seçimi: en kısa vadede aylık taksit aylık kârın %70'inden büyükse
  // bir uzun vade dene. Maksimuma takılırsa ona düş.
  // En kısa 3 ay, en uzun ürün max'i.
  for (let n = 3; n <= product.maxTermMonths; n++) {
    const m = annuityPayment(principal, product.monthlyRate, n);
    if (m <= expectedMonthlyProfit * 0.7) return n;
  }
  return product.maxTermMonths;
}

export function computeCreditOptions(
  req: CreditSuggestionRequest
): CreditSuggestionResponse {
  const shortfall = Math.max(0, req.targetBudget - req.availableBudget);

  if (shortfall <= 0) {
    return { shortfall: 0, options: [], bestOptionId: null };
  }

  const options: CreditOption[] = CREDIT_PRODUCTS.filter(
    (p) => shortfall >= p.minAmount && shortfall <= p.maxAmount
  ).map((p) => {
    const principal = Math.round(shortfall);
    const termMonths = pickTerm(p, req.expectedMonthlyProfit, principal);
    const monthlyPayment = annuityPayment(principal, p.monthlyRate, termMonths);
    const totalRepayment = monthlyPayment * termMonths;
    const totalInterest = totalRepayment - principal;
    const expectedExtraProfit = req.expectedMonthlyProfit * termMonths;
    const netBenefit = Math.round(expectedExtraProfit - totalInterest);

    const verdict: CreditOption["verdict"] =
      netBenefit > totalInterest * 1.5
        ? "öneririz"
        : netBenefit > 0
          ? "marjinal"
          : "önermeyiz";

    return {
      productId: p.id,
      bank: p.bank,
      name: p.name,
      principal,
      termMonths,
      monthlyRate: p.monthlyRate,
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      totalInterest: Math.round(totalInterest),
      expectedExtraProfit: Math.round(expectedExtraProfit),
      netBenefit,
      verdict,
      note: p.note,
    };
  });

  // En iyi: net fayda en yüksek + verdict öneririz
  const sorted = [...options].sort((a, b) => b.netBenefit - a.netBenefit);
  const bestOptionId =
    sorted.find((o) => o.verdict === "öneririz")?.productId ??
    sorted[0]?.productId ??
    null;

  return { shortfall: Math.round(shortfall), options: sorted, bestOptionId };
}
