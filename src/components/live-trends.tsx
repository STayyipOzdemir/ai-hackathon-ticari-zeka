"use client";
import { useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import { VercelDeployTip } from "@/components/vercel-deploy-tip";
import { useKeywordTrends } from "@/features/trends/hooks";
import type { TrendRange } from "@/contracts";
import { fmtPct } from "@/lib/utils";

const RANGES: { value: TrendRange; label: string }[] = [
  { value: "1d", label: "Son 24 saat" },
  { value: "7d", label: "Son 7 gün" },
  { value: "1m", label: "Son 1 ay" },
  { value: "3m", label: "Son 3 ay" },
];

const PRESETS = [
  "kurban bayramı",
  "okul çantası",
  "yazlık elbise",
  "klima",
  "şişme havuz",
  "güneş kremi",
];

interface Props {
  initialKeyword?: string;
}

export function LiveTrends({ initialKeyword = "kurban bayramı" }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [pendingKeyword, setPendingKeyword] = useState(initialKeyword);
  const [range, setRange] = useState<TrendRange>("7d");

  const { data, isFetching: loading, refetch } = useKeywordTrends(keyword, range);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = pendingKeyword.trim();
    if (!v) return;
    setKeyword(v);
  };

  const wowUp = (data?.weekOverWeek ?? 0) >= 0;
  const Icon = wowUp ? TrendingUp : TrendingDown;
  const wowText =
    data?.weekOverWeek != null
      ? `${wowUp ? "+" : ""}${fmtPct(data.weekOverWeek)}`
      : "—";

  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand">
            <span className="size-1.5 rounded-full bg-brand-2 animate-pulse" />
            Canlı Google Trends · TR
          </div>
          <h3 className="mt-1 text-lg font-semibold">
            "{data?.keyword ?? keyword}" araması
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                range === r.value
                  ? "border-brand/50 bg-brand/15 text-brand"
                  : "border-card-border text-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            loading={loading}
          >
            <RefreshCw className="size-3.5" />
            Yenile
          </Button>
        </div>
      </div>

      <form onSubmit={onSearch} className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            placeholder="Bir arama terimi yaz: kurban bayramı, okul çantası…"
            className="w-full rounded-xl border border-card-border bg-white/5 pl-10 pr-3 py-2.5 text-sm focus:border-brand/50 focus:outline-none"
          />
        </div>
        <Button type="submit" loading={loading}>
          Ara
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted">Hızlı:</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPendingKeyword(p);
              setKeyword(p);
            }}
            className="rounded-full border border-card-border bg-white/5 px-2.5 py-0.5 text-xs text-foreground/80 hover:bg-white/10"
          >
            {p}
          </button>
        ))}
      </div>

      {data?.source === "fallback" && (
        <div className="mt-3">
          <VercelDeployTip />
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-card-border bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <div>
              <div className="text-xs text-muted inline-flex items-center gap-1">
                Anlık ilgi
                <InfoTip
                  align="left"
                  text="Google Trends'in 0-100 skalası. 100 = dönemin zirvesi (mutlak arama sayısı değil, bağıl yoğunluk). 70+ → güçlü ilgi, 40 altı → düşük."
                />
              </div>
              <div className="text-3xl font-semibold">
                {data?.latestInterest ?? "—"}
                <span className="ml-1 text-sm text-muted">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Ortalama</div>
              <div className="text-xl font-semibold text-foreground/90">
                {data?.averageInterest ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Tepe</div>
              <div className="text-xl font-semibold text-foreground/90">
                {data?.peakInterest ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted inline-flex items-center gap-1">
                Dönem trendi
                <InfoTip
                  align="right"
                  text="Seçili aralığın ikinci yarısının ortalaması, ilk yarısına göre değişim. + ise arama büyüyor, − ise düşüyor."
                />
              </div>
              <div
                className={`flex items-center gap-1 text-xl font-semibold ${
                  wowUp ? "text-brand-2" : "text-danger"
                }`}
              >
                <Icon className="size-4" />
                {wowText}
              </div>
            </div>
          </div>

          <div className="mt-4 h-48 w-full">
            {data?.points && data.points.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.points}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#7d839a", fontSize: 11 }}
                    stroke="transparent"
                    minTickGap={28}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#7d839a", fontSize: 11 }}
                    stroke="transparent"
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#11132f",
                      border: "1px solid #1f2238",
                      borderRadius: 12,
                      color: "#f5f6fb",
                      fontSize: 12,
                    }}
                    formatter={(v) => [String(v), "ilgi"]}
                    labelStyle={{ color: "#9aa0b4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7c5cff"
                    strokeWidth={2}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                {loading ? "Yükleniyor…" : "Veri yok"}
              </div>
            )}
          </div>

          <div className="mt-2 text-[11px] text-muted">
            Kaynak:{" "}
            <Badge
              tone={
                data?.source === "google-trends"
                  ? "success"
                  : data?.source === "cache"
                    ? "brand"
                    : "warning"
              }
              className="ml-1"
            >
              {data?.source ?? "—"}
            </Badge>
            {data?.fetchedAt && (
              <span className="ml-2">
                {new Date(data.fetchedAt).toLocaleString("tr-TR")}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-brand-2">
                Yükselen sorgular
              </span>
              <a
                href={`https://trends.google.com/explore?q=${encodeURIComponent(keyword)}&geo=TR&hl=tr`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                Trends'te aç
              </a>
            </div>
            {data?.risingQueries && data.risingQueries.length > 0 ? (
              <ul className="space-y-1.5">
                {data.risingQueries.slice(0, 6).map((q) => (
                  <li
                    key={q.query}
                    className="flex items-center justify-between rounded-lg border border-card-border bg-white/[0.03] px-3 py-1.5 text-sm"
                  >
                    <span className="truncate">{q.query}</span>
                    <span className="text-xs text-brand-2">
                      +{q.value > 5000 ? "5000+" : q.value}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">Veri yok.</p>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-brand">
              En çok arananlar
            </div>
            {data?.topQueries && data.topQueries.length > 0 ? (
              <ul className="space-y-1.5">
                {data.topQueries.slice(0, 6).map((q) => (
                  <li
                    key={q.query}
                    className="flex items-center justify-between rounded-lg border border-card-border bg-white/[0.03] px-3 py-1.5 text-sm"
                  >
                    <span className="truncate">{q.query}</span>
                    <span className="text-xs text-brand">{q.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">Veri yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
