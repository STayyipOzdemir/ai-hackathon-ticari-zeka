"use client";
import { useEffect, useState } from "react";
import { Landmark, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import { useCreditSuggestion } from "@/features/credit/hooks";
import { fmtPct, fmtTRY } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  /** Gemini'nin önerdiği plan bütçesi (target) */
  targetBudget: number;
  /** Plan'ın haftalık beklenen kârı — aylık projeksiyon için × ~4.33 */
  expectedWeeklyProfit: number;
  /** Satıcının elinde olan bütçe (input — örn. mevcut harcama) */
  defaultAvailable?: number;
}

export function CreditBridge({
  targetBudget,
  expectedWeeklyProfit,
  defaultAvailable,
}: Props) {
  const [available, setAvailable] = useState<number>(
    defaultAvailable ?? Math.round(targetBudget * 0.4)
  );
  const { mutate, data, isPending, reset } = useCreditSuggestion();

  // Available değişince eski sonucu temizle
  useEffect(() => {
    reset();
  }, [available, reset]);

  const expectedMonthlyProfit = Math.max(0, Math.round(expectedWeeklyProfit * 4.33));
  const shortfall = Math.max(0, targetBudget - available);

  const run = () => {
    mutate({
      availableBudget: available,
      targetBudget,
      expectedMonthlyProfit,
    });
  };

  return (
    <div className="glass rounded-2xl p-6 border-brand/30 space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-background">
          <Landmark className="size-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand">
            <span>Finans köprüsü</span>
            <InfoTip
              align="left"
              text="Önerdiğimiz bütçe elindekinden büyükse, KOBİ kredisi alıp almamak finansal olarak mantıklı mı? Aylık taksit, toplam faiz, net fayda hesabını gösteriyoruz."
            />
          </div>
          <h3 className="mt-1 text-lg font-semibold">
            Bütçen yetmiyor mu? Kredi mantıklı mı, hesaplayalım.
          </h3>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Elindeki bütçe
          </label>
          <div className="relative mt-1">
            <input
              type="number"
              min={0}
              step={500}
              value={available}
              onChange={(e) => setAvailable(Number(e.target.value))}
              className="w-full rounded-xl border border-card-border bg-white/5 px-3 py-2.5 pr-10 text-lg font-semibold focus:border-brand/50 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              ₺
            </span>
          </div>
        </div>
        <div className="text-center text-xs text-muted">
          <div>Önerilen</div>
          <div className="text-lg font-mono text-foreground">
            {fmtTRY(targetBudget)}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted">
            Eksik
          </label>
          <div className="mt-1 rounded-xl border border-accent/40 bg-accent/5 px-3 py-2.5 text-lg font-semibold text-accent">
            {shortfall > 0 ? fmtTRY(shortfall) : "Yok — bütçe yeterli ✓"}
          </div>
        </div>
      </div>

      {shortfall > 0 && (
        <Button onClick={run} loading={isPending} className="w-full md:w-auto">
          <Sparkles className="size-4" />
          {fmtTRY(shortfall)} için kredi seçeneklerini gör
        </Button>
      )}

      {data && data.options.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-muted">
            Aylık beklenen ek kâr:{" "}
            <strong className="text-foreground">
              {fmtTRY(expectedMonthlyProfit)}
            </strong>{" "}
            (haftalık × 4.33). Bu rakam taksiti karşılamaya yetiyorsa "öneririz".
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.options.map((opt) => {
              const isBest = opt.productId === data.bestOptionId;
              const verdictTone =
                opt.verdict === "öneririz"
                  ? "success"
                  : opt.verdict === "marjinal"
                    ? "warning"
                    : "danger";
              return (
                <div
                  key={opt.productId}
                  className={cn(
                    "rounded-2xl border p-4 space-y-2",
                    isBest
                      ? "border-brand-2/50 bg-brand-2/5"
                      : "border-card-border bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{opt.bank}</div>
                      <div className="text-xs text-muted">{opt.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isBest && (
                        <Badge tone="success">EN İYİ</Badge>
                      )}
                      <Badge tone={verdictTone}>{opt.verdict}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted">Tutar / Vade</div>
                      <div className="font-mono text-foreground">
                        {fmtTRY(opt.principal)} · {opt.termMonths} ay
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">Aylık taksit</div>
                      <div className="font-mono text-foreground">
                        {fmtTRY(opt.monthlyPayment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">Toplam faiz</div>
                      <div className="font-mono text-danger">
                        {fmtTRY(opt.totalInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">Beklenen ek kâr</div>
                      <div className="font-mono text-brand-2">
                        {fmtTRY(opt.expectedExtraProfit)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-semibold flex items-center gap-2",
                      opt.netBenefit >= 0
                        ? "border-brand-2/40 bg-brand-2/10 text-brand-2"
                        : "border-danger/40 bg-danger/10 text-danger"
                    )}
                  >
                    {opt.netBenefit >= 0 ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <AlertCircle className="size-4" />
                    )}
                    Net fayda: {opt.netBenefit >= 0 ? "+" : ""}
                    {fmtTRY(opt.netBenefit)}
                    <span className="text-xs text-muted font-normal ml-auto">
                      (faiz {fmtPct(opt.monthlyRate)}/ay)
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">{opt.note}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted">
            Faiz oranları demo amaçlıdır. Gerçek başvuru öncesi bankanın güncel
            koşullarını doğrulayın. Net fayda = (aylık kâr × vade) − toplam faiz.
          </p>
        </div>
      )}

      {data && data.options.length === 0 && (
        <p className="text-sm text-muted">
          Bu eksik tutara uygun kredi ürünü bulunamadı (çok küçük veya çok büyük).
        </p>
      )}
    </div>
  );
}
