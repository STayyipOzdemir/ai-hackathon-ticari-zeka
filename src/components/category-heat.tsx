"use client";
import { ArrowUpRight, Flame, RefreshCw, AlertTriangle } from "lucide-react";
import type { CategoryTrend } from "@/contracts";
import { CATEGORY_LABELS } from "@/contracts";
import { CATEGORY_TRENDS as MOCK_TRENDS } from "@/lib/mock-data";
import { fmtPct } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import { VercelDeployTip } from "@/components/vercel-deploy-tip";
import { useCategoryTrends } from "@/features/trends/hooks";
import { CategoryHeatSkeleton } from "@/components/ui/skeleton";

function heatTone(h: number) {
  if (h >= 85) return { bg: "from-danger/30 to-accent/20", text: "text-accent" };
  if (h >= 75) return { bg: "from-accent/25 to-brand/15", text: "text-accent" };
  if (h >= 65) return { bg: "from-brand/25 to-brand-2/15", text: "text-brand" };
  return { bg: "from-card-border/40 to-card-border/20", text: "text-muted" };
}

export function CategoryHeat() {
  const { data, isFetching, isLoading, refetch, error } = useCategoryTrends();

  const trends: CategoryTrend[] = data?.categoryTrends ?? MOCK_TRENDS;
  const source = data?.source;
  const failed = data?.failedCategories ?? [];

  const sorted = [...trends].sort((a, b) => b.heat - a.heat);

  if (isLoading) {
    return <CategoryHeatSkeleton />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {source && (
            <Badge
              tone={
                source === "live"
                  ? "success"
                  : source === "partial"
                    ? "warning"
                    : "neutral"
              }
            >
              {source === "live"
                ? "canlı Google Trends"
                : source === "partial"
                  ? `kısmen canlı (${failed.length} kategori fallback)`
                  : "fallback verisi"}
            </Badge>
          )}
          {data?.fetchedAt && (
            <span className="text-muted">
              {new Date(data.fetchedAt).toLocaleString("tr-TR")}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted">
            Skor nedir?
            <InfoTip
              align="left"
              text="0-100 arası. Kategorinin son 7 günlük Google arama yoğunluğu kendi haftalık tepesine göre normalize edilir. 85+ → sezon zirvesinde. WoW: bu hafta ortalaması vs önceki hafta. + ise yükseliyor."
            />
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white/5 px-2.5 py-1 text-xs text-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
          <span>{error.message}</span>
        </div>
      )}
      {source === "fallback" && <VercelDeployTip />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {sorted.map((t) => {
          const tone = heatTone(t.heat);
          const up = t.weekOverWeek >= 0;
          return (
            <div
              key={t.category}
              className={`relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br ${tone.bg} p-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/80 truncate">
                  {CATEGORY_LABELS[t.category]}
                </span>
                <Flame className={`size-3.5 ${tone.text}`} />
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold">{t.heat}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs ${
                    up ? "text-brand-2" : "text-danger"
                  }`}
                >
                  <ArrowUpRight
                    className={`size-3 ${up ? "" : "rotate-90"}`}
                  />
                  {fmtPct(Math.abs(t.weekOverWeek))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
