"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Sparkles,
  TrendingUp,
  Coins,
  LineChart as LineIcon,
  Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/download";
import { CreditBridge } from "@/components/credit-bridge";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { useCatalogStore } from "@/stores/catalog-store";
import { useInsightsStore } from "@/stores/insights-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useGenerateBudgetPlan } from "@/features/budget/hooks";
import { ApiKeyMissing } from "@/components/api-key-missing";
import { InfoTip } from "@/components/ui/info-tip";
import { CATEGORY_LABELS, type Category } from "@/contracts";
import { fmtTRY } from "@/lib/utils";

const PRESETS = [1000, 2500, 5000, 10000, 25000];

export default function BudgetPage() {
  const catalog = useCatalogStore((s) => s.catalog);
  const loadDemo = useCatalogStore((s) => s.loadDemo);
  const loadAhmetDemo = useCatalogStore((s) => s.loadAhmetDemo);
  const currentCampaigns = useCatalogStore((s) => s.currentCampaigns);
  const hydrated = useHydrated();

  const [budget, setBudget] = useState<number>(2500);

  const plan = useInsightsStore((s) => s.budgetPlan);
  const insights = useInsightsStore((s) => s.insights);
  const suggestedKeywords = Array.from(
    new Set(insights.flatMap((i) => i.matchedKeywords))
  );

  const { mutate, isPending: loading, error: mutationError } = useGenerateBudgetPlan();
  const error = mutationError ? mutationError.message : null;

  const run = () => {
    if (catalog.length === 0 || !budget || budget < 100) return;
    mutate({
      products: catalog,
      totalBudget: budget,
      suggestedKeywords: suggestedKeywords.length > 0 ? suggestedKeywords : undefined,
      currentCampaigns: currentCampaigns?.map((c) => ({
        keyword: c.keyword,
        spent: c.spent,
        clicks: c.clicks,
        revenue: c.revenue,
      })),
    });
  };

  const chartData =
    plan?.allocations.map((a) => ({
      keyword:
        a.keyword.length > 14 ? a.keyword.slice(0, 13) + "…" : a.keyword,
      Bütçe: Math.round(a.recommendedBudget),
      Ciro: Math.round(a.expectedRevenue),
      Kâr: Math.round(a.expectedProfit),
      roi: a.roi,
    })) ?? [];

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-6">
          <header>
            <div className="text-xs uppercase tracking-wider text-brand">
              Bütçe Pilotu
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Reklam bütçeni Gemini'ye dağıttır.
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Haftalık reklam bütçeni gir. Gemini bunu kataloğuna uygun
              kelimelere paylaştırır; biz CPC, dönüşüm ve marjla{" "}
              <strong className="text-foreground/80">net kâra dönüştürürüz</strong>.
              Hangi kelimeden para kazanacağını, hangisinde zarar edeceğini
              bütçeyi vermeden görürsün.
            </p>
          </header>

          {hydrated && catalog.length === 0 && (
            <div className="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Bütçe planlamak için önce kataloğunu yüklemelisin.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadAhmetDemo}>
                  <Sparkles className="size-4" />
                  Ahmet Abi
                </Button>
                <Button onClick={loadDemo}>
                  <Sparkles className="size-4" />
                  Örnek Katalog
                </Button>
              </div>
            </div>
          )}

          {catalog.length > 0 && (
            <>
              <div className="glass rounded-2xl p-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[220px]">
                    <label className="text-xs uppercase tracking-wider text-muted">
                      Haftalık reklam bütçesi
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                        <input
                          type="number"
                          min={100}
                          step={100}
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="w-full rounded-xl border border-card-border bg-white/5 pl-10 pr-12 py-2.5 text-lg font-semibold focus:border-brand/50 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                          ₺
                        </span>
                      </div>
                      <Button onClick={run} loading={loading}>
                        <Wallet className="size-4" />
                        Plan üret
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setBudget(p)}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            budget === p
                              ? "border-brand/50 bg-brand/15 text-brand"
                              : "border-card-border text-muted hover:text-foreground"
                          }`}
                        >
                          {fmtTRY(p)}
                        </button>
                      ))}
                    </div>
                    {suggestedKeywords.length > 0 && (
                      <div className="mt-4 rounded-xl border border-brand-2/30 bg-brand-2/5 p-3">
                        <div className="flex items-center gap-2 text-xs text-brand-2">
                          <Sparkles className="size-3.5" />
                          <span>Insights'tan gelen öncelikli kelimeler — Gemini bunlara ağırlık verecek</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {suggestedKeywords.slice(0, 12).map((k) => (
                            <span
                              key={k}
                              className="rounded-full border border-brand-2/40 bg-brand-2/10 px-2.5 py-0.5 text-xs text-brand-2"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {error && (
                  error.includes("GEMINI_API_KEY") ? (
                    <div className="mt-3">
                      <ApiKeyMissing />
                    </div>
                  ) : (
                    <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                      {error}
                    </div>
                  )
                )}
              </div>

              {plan && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {plan.opportunityCost && (
                    <div className="relative overflow-hidden rounded-3xl border border-accent/50 bg-gradient-to-br from-accent/15 via-background/40 to-danger/10 p-6 md:p-8">
                      <div className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-accent/20 blur-3xl" />
                      <div className="relative space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-wider text-accent">
                          <span>⚠</span>
                          Para Masada
                        </div>
                        <h3 className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight">
                          Şu an haftada{" "}
                          <span className="gradient-text">
                            {fmtTRY(Math.abs(plan.opportunityCost.moneyLeftOnTable))}
                          </span>{" "}
                          {plan.opportunityCost.moneyLeftOnTable >= 0
                            ? "masada bırakıyorsun."
                            : "daha verimli kullanıyorsun."}
                        </h3>
                        <div className="grid gap-3 md:grid-cols-3 text-sm">
                          <div className="rounded-xl border border-card-border bg-background/40 px-4 py-3">
                            <div className="text-xs text-muted">
                              Mevcut reklam
                            </div>
                            <div className="mt-1 font-mono text-lg">
                              {fmtTRY(plan.opportunityCost.currentTotalSpend)} →{" "}
                              {fmtTRY(plan.opportunityCost.currentTotalRevenue)}
                            </div>
                            <div className="mt-0.5 text-xs text-muted">
                              ROI {plan.opportunityCost.currentRoi.toFixed(2)}×
                            </div>
                          </div>
                          <div className="rounded-xl border border-brand-2/40 bg-brand-2/5 px-4 py-3">
                            <div className="text-xs text-brand-2">
                              TicariZeka önerisi
                            </div>
                            <div className="mt-1 font-mono text-lg">
                              {fmtTRY(plan.totalBudget)} →{" "}
                              {fmtTRY(plan.expectedTotalRevenue)}
                            </div>
                            <div className="mt-0.5 text-xs text-brand-2">
                              ROI {plan.expectedRoi.toFixed(2)}×
                            </div>
                          </div>
                          <div className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3">
                            <div className="text-xs text-accent">
                              Yıllık kayıp projeksiyonu
                            </div>
                            <div className="mt-1 font-mono text-lg text-accent">
                              {fmtTRY(
                                Math.abs(
                                  plan.opportunityCost.annualMoneyLeftOnTable
                                )
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-muted">
                              haftalık × 52
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 max-w-2xl">
                          Aynı reklam bütçesini Gemini'nin önerdiği kelimelere
                          dağıtsaydın, mevcut ciroyu{" "}
                          <strong className="text-accent">
                            {fmtTRY(
                              Math.abs(plan.opportunityCost.moneyLeftOnTable)
                            )}
                            /hafta
                          </strong>{" "}
                          aşardın. Bu, yılda{" "}
                          <strong>
                            {fmtTRY(
                              Math.abs(
                                plan.opportunityCost.annualMoneyLeftOnTable
                              )
                            )}
                          </strong>{" "}
                          eder.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-4">
                    <Stat
                      label="Bütçe"
                      value={fmtTRY(plan.totalBudget)}
                      hint="haftalık toplam"
                    />
                    <Stat
                      label="Beklenen ciro"
                      value={fmtTRY(plan.expectedTotalRevenue)}
                      hint="tüm kelimelerden toplam satış"
                      tone="success"
                      icon={<TrendingUp className="size-4" />}
                    />
                    <Stat
                      label="Net kâr"
                      value={fmtTRY(plan.expectedTotalProfit)}
                      hint="reklam bütçesi düşülmüş"
                      tone={
                        plan.expectedTotalProfit >= 0 ? "warning" : "danger"
                      }
                    />
                    <Stat
                      label="ROI"
                      value={`${plan.expectedRoi.toFixed(2)}×`}
                      hint={
                        plan.expectedRoi >= 1
                          ? "1₺ → " + plan.expectedRoi.toFixed(2) + "₺ kâr"
                          : "zararla çalışıyor"
                      }
                      tone={plan.expectedRoi >= 1 ? "success" : "danger"}
                    />
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-background">
                        <Sparkles className="size-4" />
                      </span>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-brand">
                          Gemini'nin özeti
                        </div>
                        <p className="mt-1 text-base text-foreground/90">
                          {plan.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <LineIcon className="size-4 text-brand-2" />
                        Bütçe vs Ciro vs Kâr (kelime başına)
                      </h3>
                    </div>
                    <div className="mt-4 h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis
                            dataKey="keyword"
                            tick={{ fill: "#7d839a", fontSize: 11 }}
                            stroke="transparent"
                          />
                          <YAxis
                            tick={{ fill: "#7d839a", fontSize: 11 }}
                            stroke="transparent"
                            width={60}
                            tickFormatter={(v: number) =>
                              v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#11132f",
                              border: "1px solid #1f2238",
                              borderRadius: 12,
                              color: "#f5f6fb",
                              fontSize: 12,
                            }}
                            formatter={(v, name) => [
                              fmtTRY(Number(v) || 0),
                              String(name),
                            ]}
                            labelStyle={{ color: "#9aa0b4" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="Bütçe" fill="#7c5cff" radius={6} />
                          <Bar dataKey="Ciro" fill="#00d4a8" radius={6} />
                          <Bar dataKey="Kâr" fill="#ffb86b" radius={6}>
                            {chartData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={
                                  chartData[i].Kâr >= 0 ? "#ffb86b" : "#ff5a73"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="border-b border-card-border px-5 py-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Kelime başına dağıtım
                      </h3>
                      <button
                        onClick={() =>
                          downloadCSV(
                            `ticarizeka-butce-${new Date().toISOString().slice(0,10)}.csv`,
                            plan.allocations.map((a) => ({
                              kelime: a.keyword,
                              kategori: a.category,
                              rekabet: a.competition,
                              cpc_TL: a.cpc,
                              donusum_orani: a.conversionRate,
                              butce_TL: a.recommendedBudget,
                              beklenen_tiklama: a.expectedClicks,
                              beklenen_donusum: a.expectedConversions,
                              beklenen_ciro_TL: a.expectedRevenue,
                              net_kar_TL: a.expectedProfit,
                              ROI_x: a.roi.toFixed(2),
                              gerekce: a.rationale,
                            }))
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white/5 px-2.5 py-1 text-xs text-muted hover:text-foreground"
                      >
                        <Download className="size-3.5" />
                        CSV indir
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white/[0.02] text-left">
                          <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted [&>th]:font-normal">
                            <th>Kelime</th>
                            <th>Kategori</th>
                            <th className="text-right">Bütçe</th>
                            <th className="text-right">
                              <span className="inline-flex items-center gap-1">
                                Tıklama
                                <InfoTip
                                  align="right"
                                  text="Bu kelimeye verilen bütçenin CPC'ye (tıklama başı maliyet) bölünmesiyle bulunur. Örn: 1000₺ ÷ 5₺ = 200 tıklama."
                                />
                              </span>
                            </th>
                            <th className="text-right">
                              <span className="inline-flex items-center gap-1">
                                Dönüşüm
                                <InfoTip
                                  align="right"
                                  text="Reklama tıklayanlardan kaç tanesinin alışveriş yapması beklenir. Tıklama × Gemini'nin dönüşüm tahmini (0.5%-12%)."
                                />
                              </span>
                            </th>
                            <th className="text-right">Ciro</th>
                            <th className="text-right">
                              <span className="inline-flex items-center gap-1">
                                Net kâr
                                <InfoTip
                                  align="right"
                                  text="Dönüşüm × birim marj − reklam bütçesi. Marj = ürün fiyatı − ürün maliyeti. Negatifse o kelimede para kaybediyorsun."
                                />
                              </span>
                            </th>
                            <th className="text-right">
                              <span className="inline-flex items-center gap-1">
                                ROI
                                <InfoTip
                                  align="right"
                                  text="Net kâr ÷ reklam bütçesi. 1× → para başa baş. 2× → her 1₺ reklam için 2₺ ek kâr. 0× altı → zarar."
                                />
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.allocations.map((a) => (
                            <tr
                              key={a.keyword}
                              className="border-t border-card-border/60 hover:bg-white/[0.02]"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">
                                    {a.keyword}
                                  </div>
                                  <div className="text-xs text-muted line-clamp-1">
                                    {a.rationale}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge tone="neutral">
                                  {CATEGORY_LABELS[a.category as Category] ??
                                    a.category}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {fmtTRY(a.recommendedBudget)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {Math.round(a.expectedClicks)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                {Math.round(a.expectedConversions)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums text-brand-2">
                                {fmtTRY(a.expectedRevenue)}
                              </td>
                              <td
                                className={`px-4 py-3 text-right tabular-nums ${
                                  a.expectedProfit >= 0
                                    ? "text-accent"
                                    : "text-danger"
                                }`}
                              >
                                {fmtTRY(a.expectedProfit)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Badge
                                  tone={
                                    a.roi >= 2
                                      ? "success"
                                      : a.roi >= 1
                                        ? "warning"
                                        : "danger"
                                  }
                                >
                                  {a.roi.toFixed(2)}×
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-card-border px-5 py-3 text-xs text-muted space-y-1">
                      <div>
                        <strong className="text-foreground/80">Hesap:</strong>{" "}
                        tıklama = bütçe / CPC · dönüşüm = tıklama × oran ·
                        ciro = dönüşüm × ürün fiyatı · kâr = dönüşüm × marj −
                        bütçe · ROI = kâr / bütçe
                      </div>
                      <div>
                        <strong className="text-foreground/80">CPC:</strong>{" "}
                        düşük rekabet = 2.25₺ · orta = 5₺ · yüksek = 11₺.
                        Sayılar Gemini'nin sallaması değil — biz hesaplıyoruz.
                      </div>
                    </div>
                  </div>

                  {plan.expectedTotalProfit > 0 && (
                    <CreditBridge
                      targetBudget={plan.totalBudget}
                      expectedWeeklyProfit={plan.expectedTotalProfit}
                      defaultAvailable={
                        plan.opportunityCost?.currentTotalSpend ??
                        Math.round(plan.totalBudget * 0.4)
                      }
                    />
                  )}
                </motion.div>
              )}

              {!plan && !loading && (
                <div className="glass rounded-2xl p-8 text-center text-muted">
                  Bütçeni gir, "Plan üret"e bas. Gemini kelime başına dağıtımı
                  ve beklenen kârı burada gösterir.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
