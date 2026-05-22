"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Pencil,
  Wallet,
  ArrowRight,
  Zap,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CatalogInput } from "@/components/catalog-input";
import { CategoryHeat } from "@/components/category-heat";
import { LiveTrends } from "@/components/live-trends";
import { InsightList } from "@/components/insight-list";
import { ApiKeyMissing } from "@/components/api-key-missing";
import { Stat } from "@/components/ui/stat";
import { InsightCardSkeleton } from "@/components/ui/skeleton";
import { useCatalogStore } from "@/stores/catalog-store";
import { useInsightsStore } from "@/stores/insights-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useStreamInsights } from "@/features/insights/stream-hook";
import { fmtNum, fmtTRY } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const catalog = useCatalogStore((s) => s.catalog);
  const setCatalog = useCatalogStore((s) => s.setCatalog);
  const loadDemo = useCatalogStore((s) => s.loadDemo);
  const loadAhmetDemo = useCatalogStore((s) => s.loadAhmetDemo);
  const reset = useCatalogStore((s) => s.reset);
  const persona = useCatalogStore((s) => s.persona);
  const currentCampaigns = useCatalogStore((s) => s.currentCampaigns);
  const hydrated = useHydrated();

  const insights = useInsightsStore((s) => s.insights);
  const headline = useInsightsStore((s) => s.weeklyHeadline);
  const trendSource = useInsightsStore((s) => s.trendSource);
  const trendsFetchedAt = useInsightsStore((s) => s.trendsFetchedAt);

  const {
    start: streamInsights,
    cancel: cancelStream,
    streaming: loading,
    charCount,
    error,
  } = useStreamInsights();

  const runInsights = () => {
    if (catalog.length === 0) return;
    streamInsights(catalog);
  };

  const totalStockValue = catalog.reduce(
    (a, p) => a + p.price * p.stock,
    0
  );
  const totalSales30d = catalog.reduce((a, p) => a + p.sales30d, 0);
  const avgMarginPct =
    catalog.length === 0
      ? 0
      : catalog.reduce(
          (a, p) => a + ((p.price - p.cost) / p.price) * 100,
          0
        ) / catalog.length;

  const hasCatalog = catalog.length > 0;
  const hasInsights = insights.length > 0;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand">
                Dashboard
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Bu hafta neye odaklanmalı?
              </h1>
              <p className="text-sm text-muted">
                Trend verisi haftalık ·{" "}
                {new Date().toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/optimizer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                <Pencil className="size-4" />
                Başlık Optimizer
              </Link>
              <Link
                href="/budget"
                className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                <Wallet className="size-4" />
                Bütçe Pilotu
              </Link>
            </div>
          </header>

          <CatalogInput
            catalog={catalog}
            onChange={setCatalog}
            onLoadDemo={loadDemo}
            onLoadAhmetDemo={loadAhmetDemo}
            onClear={reset}
            persona={persona}
          />

          {persona &&
            currentCampaigns &&
            typeof persona.currentRoas === "number" &&
            typeof persona.currentMarginRate === "number" && (
            <div className={`glass rounded-2xl p-5 ${persona.monthlyAdNetProfit < 0 ? "border-danger/40" : "border-accent/30"}`}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent">
                <span>{persona.monthlyAdNetProfit < 0 ? "⚠ " : ""}Ahmet abinin geçen ay reklamı — ÖZET</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <Stat
                  label="Reklam harcaması"
                  value={fmtTRY(persona.monthlyAdSpend)}
                  hint="bu ay toplam"
                />
                <Stat
                  label="Reklamdan ciro"
                  value={fmtTRY(persona.monthlyAdRevenue)}
                  hint={`ROAS ${persona.currentRoas.toFixed(2)}×`}
                />
                <Stat
                  label="Brüt kâr"
                  value={fmtTRY(persona.monthlyAdGrossProfit)}
                  hint={`marj %${Math.round(persona.currentMarginRate * 100)}`}
                />
                <Stat
                  label="Net kâr (reklam sonrası)"
                  value={fmtTRY(persona.monthlyAdNetProfit)}
                  hint={
                    persona.monthlyAdNetProfit < 0
                      ? "reklam kendini kurtarmıyor"
                      : "kâra geçmiş"
                  }
                  tone={persona.monthlyAdNetProfit < 0 ? "danger" : "success"}
                />
              </div>
              {persona.monthlyAdNetProfit < 0 && (
                <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm">
                  <strong className="text-danger">Yanıltıcı görünüm:</strong>{" "}
                  ROAS {persona.currentRoas.toFixed(2)}× ilk bakışta iyi
                  duruyor — ama ürünün marjı reklam maliyetini karşılamıyor.
                  Ahmet abi reklamdan haftada{" "}
                  <strong>{fmtTRY(Math.abs(persona.monthlyAdNetProfit / 4.33))}</strong>{" "}
                  zarar ediyor, farkında değil. Asıl pazarlama metriği <em>ROAS</em>{" "}
                  değil, <em>marj sonrası net kâr</em>.
                </div>
              )}
              <div className="mt-4 overflow-x-auto rounded-xl border border-card-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/[0.02]">
                    <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted [&>th]:font-normal">
                      <th>Kelime</th>
                      <th className="text-right">Harcama</th>
                      <th className="text-right">Ciro</th>
                      <th className="text-right">ROAS</th>
                      <th className="text-right">Net kâr</th>
                      <th>Değerlendirme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCampaigns.map((c) => (
                      <tr
                        key={c.keyword}
                        className="border-t border-card-border/60"
                      >
                        <td className="px-3 py-2.5 font-medium">{c.keyword}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmtTRY(c.spent)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {fmtTRY(c.revenue)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted">
                          {typeof c.roas === "number" ? c.roas.toFixed(2) : "—"}×
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-semibold tabular-nums ${
                            c.netProfit > 0
                              ? "text-brand-2"
                              : "text-danger"
                          }`}
                        >
                          {c.netProfit > 0 ? "+" : ""}
                          {fmtTRY(c.netProfit)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-xs text-muted">
                            <strong
                              className={
                                c.verdict === "iyi"
                                  ? "text-brand-2"
                                  : "text-danger"
                              }
                            >
                              {c.verdict}
                            </strong>
                            {" — "}
                            {c.issue}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted">
                Net kâr = (ciro × {Math.round(persona.currentMarginRate * 100)}% marj) − reklam.
                3 kelimede zarar, sadece "boya kalemi" kâra geçiyor. Mor butona bas, Gemini'nin
                bu durumu nasıl tersine çevireceğini görelim.
              </p>
            </div>
          )}

          {/* GEMINI HERO — en önemli aksiyon, katalog hemen altında */}
          <section className="relative">
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl border p-6 md:p-8 transition-all",
                hasCatalog
                  ? "border-brand/40 bg-gradient-to-br from-brand/10 via-background/40 to-brand-2/10"
                  : "border-card-border bg-card opacity-80"
              )}
            >
              {/* Glow effects */}
              {hasCatalog && (
                <>
                  <div className="pointer-events-none absolute -top-32 -right-20 size-96 rounded-full bg-brand/30 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-32 -left-10 size-80 rounded-full bg-brand-2/20 blur-3xl" />
                </>
              )}

              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        hasCatalog
                          ? "bg-brand-2 animate-pulse"
                          : "bg-muted"
                      )}
                    />
                    Ana aksiyon · Gemini
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold leading-tight tracking-tight">
                    {hasInsights ? (
                      <>
                        Bu hafta için{" "}
                        <span className="gradient-text">
                          {insights.length} öneri
                        </span>{" "}
                        hazır.
                      </>
                    ) : hasCatalog ? (
                      <>
                        Hadi <span className="gradient-text">Gemini'ye sor</span>:
                        "Bu hafta hangi ürünü öne çıkarayım?"
                      </>
                    ) : (
                      <>
                        Önce kataloğunu hazırla,{" "}
                        <span className="gradient-text">Gemini</span> bu hafta
                        ne yapacağını söylesin.
                      </>
                    )}
                  </h2>
                  <p className="text-sm md:text-base text-foreground/70 max-w-2xl">
                    Stok + marj + kategori trendi kesişiminden top 5 ürünü seçer,
                    her biri için yeni başlık, öncelik skoru ve beklenen ek ciro
                    döner.
                  </p>
                  {error && (
                    error.includes("GEMINI_API_KEY") ? (
                      <ApiKeyMissing />
                    ) : (
                      <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        {error}
                      </div>
                    )
                  )}
                </div>

                <div className="flex flex-col items-stretch gap-3 lg:items-end">
                  <button
                    onClick={runInsights}
                    disabled={!hasCatalog || loading}
                    className={cn(
                      "btn-primary group relative inline-flex items-center justify-center gap-3 rounded-2xl px-7 py-5 text-lg font-semibold",
                      "shadow-[0_20px_60px_-12px_rgba(124,92,255,0.6)]",
                      "transition-all hover:scale-[1.03] active:scale-[0.98]"
                    )}
                  >
                    {loading ? (
                      <>
                        <span
                          aria-hidden
                          className="size-5 rounded-full border-2 border-current border-t-transparent animate-spin"
                        />
                        Gemini düşünüyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        {hasInsights
                          ? "Tekrar üret"
                          : "Gemini önerilerini üret"}
                        <Zap className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                  {hasCatalog && !hasInsights && !loading && (
                    <p className="text-xs text-muted text-center lg:text-right">
                      ~10-15 saniye sürer · {fmtNum(catalog.length)} ürün
                      analiz edilecek
                    </p>
                  )}
                  {hasInsights && (
                    <Link
                      href="/budget"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-2/40 bg-brand-2/10 px-4 py-2 text-sm text-brand-2 hover:bg-brand-2/15"
                    >
                      Bütçeye geç
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(loading || hasInsights) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 space-y-4"
                >
                  {loading && (
                    <>
                      <div className="glass rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Bot className="size-5 text-brand-2 animate-pulse" />
                            <span className="text-sm text-foreground/90">
                              Gemini yazıyor...
                            </span>
                            {charCount > 0 && (
                              <span className="text-xs text-muted font-mono">
                                {charCount} karakter
                              </span>
                            )}
                          </div>
                          <button
                            onClick={cancelStream}
                            className="text-xs text-muted hover:text-danger"
                          >
                            İptal
                          </button>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-brand to-brand-2 transition-all"
                            style={{
                              width: `${Math.min(95, (charCount / 1500) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <InsightCardSkeleton key={i} />
                        ))}
                      </div>
                    </>
                  )}
                  {hasInsights && (
                    <InsightList
                      insights={insights}
                      weeklyHeadline={headline}
                      products={catalog}
                      trendSource={trendSource}
                      trendsFetchedAt={trendsFetchedAt}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {hydrated && hasCatalog && (
            <div className="grid gap-4 md:grid-cols-4">
              <Stat
                label="Ürün adedi"
                value={fmtNum(catalog.length)}
                hint="Yüklü katalog"
              />
              <Stat
                label="30g toplam satış"
                value={fmtNum(totalSales30d)}
                hint="adet"
                tone="success"
              />
              <Stat
                label="Stok değeri"
                value={fmtTRY(totalStockValue)}
                hint="satış fiyatı × stok"
              />
              <Stat
                label="Ort. marj"
                value={`%${Math.round(avgMarginPct)}`}
                hint="(fiyat - maliyet) / fiyat"
                tone="warning"
              />
            </div>
          )}

          <details className="glass rounded-2xl overflow-hidden group" open={!hasCatalog}>
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 list-none">
              <div>
                <h2 className="text-lg font-semibold">Destekleyici veriler</h2>
                <p className="text-sm text-muted">
                  Kategori ısı haritası + Canlı Google Trends — Gemini'nin
                  kararını besleyen pazar bağlamı.
                </p>
              </div>
              <RefreshCw className="size-4 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-card-border px-5 py-5 space-y-6">
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Kategori ısı haritası</h3>
                  <p className="text-xs text-muted">
                    Cache'lenmiş haftalık skorlar (örnek pazar paneli).
                  </p>
                </div>
                <CategoryHeat />
              </section>

              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Canlı Google Trends · TR
                  </h3>
                  <p className="text-xs text-muted">
                    Sunucu tarafından Google Trends'e gerçek zamanlı sorgu — 15
                    dk cache.
                  </p>
                </div>
                <LiveTrends initialKeyword="kurban bayramı" />
              </section>
            </div>
          </details>
        </div>
      </main>
      <Footer />
    </>
  );
}
