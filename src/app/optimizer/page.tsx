"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  TrendingUp,
  ArrowRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCatalogStore } from "@/stores/catalog-store";
import { useInsightsStore } from "@/stores/insights-store";
import { useHydrated } from "@/lib/use-hydrated";
import { useOptimizeTitle } from "@/features/optimizer/hooks";
import { ApiKeyMissing } from "@/components/api-key-missing";
import { InfoTip } from "@/components/ui/info-tip";
import { CATEGORY_LABELS, type Product } from "@/contracts";
import { fmtNum, fmtPct, fmtTRY } from "@/lib/utils";

export default function OptimizerPage() {
  const catalog = useCatalogStore((s) => s.catalog);
  const loadDemo = useCatalogStore((s) => s.loadDemo);
  const loadAhmetDemo = useCatalogStore((s) => s.loadAhmetDemo);
  const hydrated = useHydrated();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const lastOptimization = useInsightsStore((s) => s.lastOptimization);
  const { mutate: optimizeMutation, isPending: loading, error: mutationError } =
    useOptimizeTitle();
  const error = mutationError ? mutationError.message : null;

  useEffect(() => {
    if (!selectedId && catalog.length > 0) {
      setSelectedId(catalog[0].id);
    }
  }, [catalog, selectedId]);

  const selected = useMemo(
    () => catalog.find((p) => p.id === selectedId) ?? null,
    [catalog, selectedId]
  );

  const filtered = useMemo(() => {
    if (!filter.trim()) return catalog;
    const q = filter.toLowerCase();
    return catalog.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category].toLowerCase().includes(q)
    );
  }, [catalog, filter]);

  const optimize = (p: Product) => optimizeMutation(p);

  const result =
    lastOptimization && selected && lastOptimization.productId === selected.id
      ? lastOptimization.result
      : null;

  const expectedRevenueLift = result && selected
    ? selected.sales30d *
      selected.price *
      result.estimatedCtrLift
    : 0;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 space-y-6">
          <header>
            <div className="text-xs uppercase tracking-wider text-brand">
              Başlık Optimizer
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Eski başlık vs Gemini'nin önerisi.
            </h1>
            <p className="text-sm text-muted max-w-2xl">
              Bir ürün seç. Gemini, ürünün kategorisindeki canlı Google Trends
              kelimelerini kullanarak yeni bir başlık yazar. Eski vs yeni
              başlığı yan yana görürsün, tıklama artışını ve{" "}
              <strong className="text-foreground/80">30g ek ciroyu</strong> bizim
              hesabımızla.
            </p>
          </header>

          {hydrated && catalog.length === 0 && (
            <div className="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Henüz katalog yok. Demoyu yüklemek için bas.
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
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside className="glass rounded-2xl p-4 lg:max-h-[680px] lg:overflow-y-auto">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Ürün ara…"
                    className="w-full rounded-xl border border-card-border bg-white/5 pl-10 pr-3 py-2 text-sm focus:border-brand/50 focus:outline-none"
                  />
                </div>
                <p className="mb-2 text-xs text-muted">
                  {fmtNum(filtered.length)} ürün
                </p>
                <ul className="space-y-1">
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          setSelectedId(p.id);
                        }}
                        className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${
                          selectedId === p.id
                            ? "bg-brand/15 border border-brand/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span className="font-mono">{p.id}</span>
                          <span>{CATEGORY_LABELS[p.category]}</span>
                        </div>
                        <p className="mt-0.5 text-sm leading-snug line-clamp-2">
                          {p.title}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              <section className="space-y-4">
                {selected ? (
                  <>
                    <div className="glass rounded-2xl p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="font-mono">{selected.id}</span>
                            <Badge tone="neutral">
                              {CATEGORY_LABELS[selected.category]}
                            </Badge>
                          </div>
                          <h2 className="mt-2 text-xl font-semibold">
                            {selected.title}
                          </h2>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                            <span>Fiyat: {fmtTRY(selected.price)}</span>
                            <span>
                              30g satış: {fmtNum(selected.sales30d)} adet
                            </span>
                            <span>
                              30g görüntülenme: {fmtNum(selected.views30d)}
                            </span>
                            <span>
                              Puan: {selected.rating} (
                              {fmtNum(selected.reviewCount)})
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => optimize(selected)} loading={loading}>
                          <Wand2 className="size-4" />
                          Gemini ile yeniden yaz
                        </Button>
                      </div>
                    </div>

                    {error && (
                      error.includes("GEMINI_API_KEY") ? (
                        <ApiKeyMissing />
                      ) : (
                        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                          {error}
                        </div>
                      )
                    )}

                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        <div className="glass rounded-2xl p-5">
                          <div className="text-xs uppercase tracking-wider text-muted">
                            Eski başlık
                          </div>
                          <p className="mt-3 text-base leading-snug text-foreground/80 line-through">
                            {result.originalTitle}
                          </p>
                          <div className="mt-4 text-xs text-muted">
                            Tahmini mevcut tıklama oranı baz alındı.
                          </div>
                        </div>

                        <div className="glass rounded-2xl p-5 border-brand/30">
                          <div className="text-xs uppercase tracking-wider text-brand-2 flex items-center gap-1.5">
                            <Sparkles className="size-3.5" />
                            Gemini önerisi
                          </div>
                          <p className="mt-3 text-base font-semibold leading-snug">
                            {result.newTitle}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {result.matchedKeywords.map((k) => (
                              <Badge key={k} tone="brand">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="glass rounded-2xl p-5 md:col-span-2">
                          <div className="text-xs uppercase tracking-wider text-brand">
                            Niçin bu öneri?
                          </div>
                          <p className="mt-2 text-sm text-foreground/90">
                            {result.rationale}
                          </p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-card-border bg-white/[0.03] px-4 py-3">
                              <div className="text-xs text-muted inline-flex items-center gap-1">
                                CTR artışı
                                <InfoTip
                                  align="left"
                                  text="Yeni başlığın eski başlığa göre tahmini tıklama oranı artışı. Pazarlama benchmarkları: %10-%30 makul, %30+ trend kelimesini başa almak."
                                />
                              </div>
                              <div className="mt-1 text-2xl font-semibold text-brand-2 flex items-center gap-1">
                                <TrendingUp className="size-4" />
                                +{fmtPct(result.estimatedCtrLift)}
                              </div>
                            </div>
                            <div className="rounded-xl border border-card-border bg-white/[0.03] px-4 py-3">
                              <div className="text-xs text-muted inline-flex items-center gap-1">
                                Beklenen 30g ek ciro
                                <InfoTip
                                  align="center"
                                  text={`Bu ürünün son 30 gün satışı (${selected.sales30d} adet) × fiyatı (${selected.price}₺) × CTR artışı. Gemini'nin tahmini değil — biz hesaplıyoruz.`}
                                />
                              </div>
                              <div className="mt-1 text-2xl font-semibold text-accent flex items-center gap-1">
                                <ArrowRight className="size-4" />
                                {fmtTRY(expectedRevenueLift)}
                              </div>
                            </div>
                            <div className="rounded-xl border border-card-border bg-white/[0.03] px-4 py-3">
                              <div className="text-xs text-muted inline-flex items-center gap-1">
                                Karakter sayısı
                                <InfoTip
                                  align="right"
                                  text="Trendyol/Hepsiburada başlık limiti yaklaşık 100 karakterdir. Daha uzun başlıklar sonu kesilir, mobilde özellikle."
                                />
                              </div>
                              <div className="mt-1 text-2xl font-semibold text-foreground">
                                {result.newTitle.length}
                                <span className="ml-1 text-sm text-muted">
                                  /100
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs text-muted">
                              <strong className="text-foreground/70">Hesap:</strong>{" "}
                              30g satış × fiyat × CTR artışı — deterministik,
                              aynı ürün için iki kez çalıştırırsan değişmez.
                            </div>
                            <Link
                              href="/budget"
                              className="inline-flex items-center gap-1.5 text-sm text-brand-2 hover:underline"
                            >
                              Bütçe planlamaya geç
                              <ArrowRight className="size-4" />
                            </Link>
                          </div>
                        </div>

                        {result.alternatives && result.alternatives.length > 0 && (
                          <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                              <span>Diğer açılar</span>
                              <span className="text-foreground/60">
                                ({result.alternatives.length} alternatif)
                              </span>
                              <InfoTip
                                align="left"
                                text="Aynı ürün için farklı pazarlama açılarından yazılmış 2 alternatif başlık. A/B test edip hangisi daha iyi sonuç verir bakabilirsin."
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {result.alternatives.map((alt, i) => (
                                <div
                                  key={i}
                                  className="rounded-2xl border border-card-border bg-white/[0.02] p-4"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <Badge tone="neutral">{alt.angle}</Badge>
                                    <span className="text-brand-2 inline-flex items-center gap-1">
                                      <TrendingUp className="size-3" />
                                      +{fmtPct(alt.estimatedCtrLift)}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm font-medium leading-snug">
                                    {alt.title}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {alt.matchedKeywords.map((k) => (
                                      <Badge key={k} tone="brand">
                                        {k}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {!result && !loading && !error && (
                      <div className="glass rounded-2xl p-8 text-center text-muted">
                        "Gemini ile yeniden yaz"a bas, öneri burada görünür.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass rounded-2xl p-8 text-center text-muted">
                    Sol panelden bir ürün seç.
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
