"use client";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ArrowRight, Wand2, BookOpen, Layers, Download } from "lucide-react";
import { downloadJSON } from "@/lib/download";
import type { Product, ProductInsight } from "@/contracts";
import { CATEGORY_LABELS } from "@/contracts";
import { fmtPct, fmtTRY } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { useBulkOptimize } from "@/features/optimizer/bulk-hook";
import { useInsightsStore } from "@/stores/insights-store";

interface Props {
  insights: ProductInsight[];
  weeklyHeadline?: string;
  products: Product[];
  trendSource?: "live" | "cache" | "partial" | "fallback";
  trendsFetchedAt?: string;
}

const SOURCE_LABEL: Record<NonNullable<Props["trendSource"]>, string> = {
  live: "canlı Google Trends",
  cache: "Google Trends (cache)",
  partial: "kısmen canlı Google Trends",
  fallback: "fallback verisi",
};

const SOURCE_TONE: Record<
  NonNullable<Props["trendSource"]>,
  "success" | "brand" | "warning" | "neutral"
> = {
  live: "success",
  cache: "brand",
  partial: "warning",
  fallback: "neutral",
};

export function InsightList({
  insights,
  weeklyHeadline,
  products,
  trendSource,
  trendsFetchedAt,
}: Props) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const bulk = useBulkOptimize();
  const bulkResults = useInsightsStore((s) => s.bulkOptimizations);

  const runBulk = () => {
    const targets = insights
      .map((ins) => byId.get(ins.productId))
      .filter((p): p is Product => Boolean(p));
    bulk.start(targets);
  };
  return (
    <div className="space-y-4">
      {weeklyHeadline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 border-brand/30"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-background">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-brand">
                <span>Gemini'nin haftalık özeti</span>
                {trendSource && (
                  <Badge tone={SOURCE_TONE[trendSource]}>
                    {SOURCE_LABEL[trendSource]}
                  </Badge>
                )}
                {trendsFetchedAt && (
                  <span className="text-muted normal-case tracking-normal">
                    {new Date(trendsFetchedAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p className="mt-1 text-lg leading-snug text-foreground">
                {weeklyHeadline}
              </p>
            </div>
          </div>
          {insights.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
              <div className="text-xs text-muted">
                {bulk.running
                  ? `Gemini her ürün için başlık yazıyor — ${bulk.done}/${bulk.total}`
                  : `Tüm ${insights.length} ürün için yeni başlık üretmek tek tıkla mümkün.`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadJSON(
                      `ticarizeka-insights-${new Date().toISOString().slice(0, 10)}.json`,
                      { headline: weeklyHeadline, insights }
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white/5 px-2.5 py-1 text-xs text-muted hover:text-foreground"
                >
                  <Download className="size-3.5" />
                  JSON
                </button>
                {bulk.running ? (
                  <Button size="sm" variant="ghost" onClick={bulk.cancel}>
                    İptal
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={runBulk}>
                    <Layers className="size-4" />
                    Tüm başlıkları üret
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {insights.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-muted">
          Henüz öneri yok. "Gemini önerilerini üret"e bas.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((ins, i) => {
            const p = byId.get(ins.productId);
            const bulkResult = bulkResults[ins.productId];
            return (
              <motion.div
                key={ins.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{ins.productId}</span>
                      {p && <span>·</span>}
                      {p && (
                        <Badge tone="neutral">
                          {CATEGORY_LABELS[p.category]}
                        </Badge>
                      )}
                    </div>
                    {p && (
                      <p className="mt-1.5 text-sm text-muted line-through truncate">
                        {p.title}
                      </p>
                    )}
                    <p className="mt-1 text-base font-semibold leading-snug">
                      <Wand2 className="mr-1 inline size-4 text-brand-2" />
                      {ins.newTitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted inline-flex items-center gap-1">
                      Öncelik
                      <InfoTip
                        align="right"
                        text="100'e en yakın olan ürünü ilk önce uygula. Skor stok + marj + trend kesişimine göre hesaplanır."
                      />
                    </div>
                    <div className="text-xl font-semibold text-brand">
                      {Math.round(ins.priorityScore)}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-foreground/85">
                  {ins.rationale}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ins.matchedKeywords.map((k) => (
                    <Badge key={k} tone="brand">
                      {k}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-card-border bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-muted inline-flex items-center gap-1">
                      CTR artışı
                      <InfoTip
                        align="left"
                        text="Yeni başlık eski başlığa kıyasla tahmini tıklama oranı artışı. +%15 = aynı görüntülenmeden 1.15 kat tıklama."
                      />
                    </div>
                    <div className="text-lg font-semibold text-brand-2 flex items-center gap-1">
                      <TrendingUp className="size-4" />
                      +{fmtPct(ins.estimatedCtrLift)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-card-border bg-white/[0.03] px-3 py-2">
                    <div className="text-[11px] text-muted inline-flex items-center gap-1">
                      30g ek ciro
                      <InfoTip
                        align="right"
                        text="30 günlük satış × birim fiyat × CTR artışı. Gemini'nin tahmini değil — biz hesaplıyoruz."
                      />
                    </div>
                    <div className="text-lg font-semibold text-accent flex items-center gap-1">
                      <ArrowRight className="size-4" />
                      {fmtTRY(ins.estimatedRevenueLift)}
                    </div>
                  </div>
                </div>

                {bulkResult && (
                  <div className="mt-3 rounded-xl border border-brand-2/30 bg-brand-2/5 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-brand-2 inline-flex items-center gap-1.5">
                      <Wand2 className="size-3" />
                      Bulk üretim sonucu
                    </div>
                    <p className="mt-1.5 text-sm font-medium leading-snug">
                      {bulkResult.newTitle}
                    </p>
                    {bulkResult.alternatives.length > 0 && (
                      <div className="mt-2 text-xs text-muted">
                        +{bulkResult.alternatives.length} alternatif
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {insights.length > 0 && (
        <details className="glass rounded-2xl overflow-hidden group">
          <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 list-none">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-brand-2" />
              <span className="text-sm font-semibold">
                Bu sonuçları nasıl okumalıyım?
              </span>
            </div>
            <span className="text-xs text-muted transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-card-border px-5 py-4 text-sm space-y-3 text-foreground/85">
            <p>
              Gemini, kataloğundaki ürünleri bu haftanın canlı Google Trends
              verisiyle eşleştirip 5'e kadar ürün için yeniden başlık önerdi.
              Sıralama "öncelik skoruna" göre, en yüksek olan en önce
              uygulanmalı.
            </p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>
                <strong className="text-foreground">Öncelik (1–100):</strong>{" "}
                Stok bolluğu + marj genişliği + kategori trendi kesişimi.
                90+ → bu hafta mutlaka el at. 70–90 → uygulamaya değer.
                70 altı → bekleyebilir.
              </li>
              <li>
                <strong className="text-foreground">CTR artışı:</strong>{" "}
                Yeni başlığın eski başlığa göre tahmini tıklama oranı artışı.
                Pazarlama benchmark'larında SEO başlık değişikliği için
                %10–%30 makul. %30+ = trend kelimesini başa almak.
              </li>
              <li>
                <strong className="text-foreground">30g ek ciro:</strong>{" "}
                Senin son 30g satışın × ürün fiyatı × CTR artışı. Bu
                <em> Gemini'nin tahmini değil</em>, deterministik
                hesaplama — aynı ürün için iki kez çalıştırırsan değişmez.
              </li>
              <li>
                <strong className="text-foreground">Yeni başlık:</strong>{" "}
                Türkiye pazaryeri formatına uygun (100 karakter altı), yükselen
                kelimeyi başa yakın yerleştirir. Markaplace SEO'su için tasarlandı.
              </li>
            </ul>
            <p className="text-muted">
              <strong className="text-foreground/80">Sonraki adım:</strong>{" "}
              Öncelik 90+ olan ürünlerin başlıklarını uygula, sonra "Bütçe
              Pilotu"na geçip aynı kelimelere reklam bütçesi dağıt.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
