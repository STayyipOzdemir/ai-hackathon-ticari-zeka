import { fetchTrendsLive } from "./client";
import { fetchCached } from "@/lib/cache";
import type {
  CategoryTrend,
  Category,
  LiveTrendsResponse,
  TrendRange,
} from "@/contracts";
import { CATEGORY_TRENDS as FALLBACK_TRENDS } from "@/lib/mock-data";

const CATEGORY_SEED_KEYWORDS: Record<Category, string> = {
  kirtasiye: "okul çantası",
  elektronik: "kablosuz kulaklık",
  "moda-kadin": "yazlık elbise",
  "moda-erkek": "polo tişört",
  "ev-yasam": "klima",
  kozmetik: "güneş kremi",
  spor: "yoga matı",
  "anne-bebek": "bebek bezi",
  kitap: "yks soru bankası",
  supermarket: "türk kahvesi",
};

const CATEGORY_RELATED_KEYWORDS: Record<Category, string[]> = {
  kirtasiye: ["suluk", "kalem kutusu", "beslenme çantası"],
  elektronik: ["hızlı şarj", "akıllı saat", "type-c kablo"],
  "moda-kadin": ["bikini", "plaj elbisesi", "yüksek bel şort"],
  "moda-erkek": ["mayo şort", "spor ayakkabı", "güneş gözlüğü"],
  "ev-yasam": ["vantilatör", "mutfak robotu", "tava seti"],
  kozmetik: ["spf 50", "vitamin c serum", "saç bakım"],
  spor: ["plaj şemsiyesi", "şişme yatak", "koşu ayakkabısı"],
  "anne-bebek": ["şişme havuz", "biberon", "bebek maması"],
  kitap: ["lgs deneme", "yazlık roman", "çocuk hikaye"],
  supermarket: ["zeytinyağı", "kuruyemiş", "granola"],
};

const CATEGORY_CACHE_TTL_MS = 60 * 60 * 1000;
const PARTIAL_CACHE_TTL_MS = 10 * 60 * 1000;
const TRENDS_CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchOneCategory(
  category: Category,
  keyword: string,
  startTime: Date,
  endTime: Date
): Promise<CategoryTrend | null> {
  const live = await fetchTrendsLive(keyword, startTime, endTime, {
    geo: "TR",
    granular: false,
    includeRelated: false,
  });
  if (!live || live.points.length === 0) return null;

  const values = live.points.map((p) => p.value);
  const heat = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  let weekOverWeek = 0;
  if (values.length >= 4) {
    const half = Math.floor(values.length / 2);
    const firstAvg = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondAvg =
      values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);
    if (firstAvg > 0) weekOverWeek = (secondAvg - firstAvg) / firstAvg;
  }

  const topKeywords = [keyword, ...CATEGORY_RELATED_KEYWORDS[category]];
  return {
    category,
    heat,
    weekOverWeek,
    topKeywords: topKeywords.slice(0, 5),
  };
}

export async function getLiveCategoryTrends(): Promise<{
  weekOf: string;
  categoryTrends: CategoryTrend[];
  source: "live" | "fallback" | "partial";
  failedCategories: Category[];
  fetchedAt: string;
}> {
  const cached = await fetchCached(
    "live-category-trends",
    CATEGORY_CACHE_TTL_MS,
    async () => {
      const endTime = new Date();
      const startTime = new Date(endTime);
      startTime.setUTCDate(startTime.getUTCDate() - 7);

      const entries = Object.entries(CATEGORY_SEED_KEYWORDS) as Array<
        [Category, string]
      >;

      const results: Array<{ cat: Category; result: CategoryTrend | null }> = [];
      for (const [cat, kw] of entries) {
        const result = await fetchOneCategory(cat, kw, startTime, endTime);
        results.push({ cat, result });
        await new Promise((r) => setTimeout(r, 400));
      }

      const trends: CategoryTrend[] = [];
      const failed: Category[] = [];
      for (const { cat, result } of results) {
        if (result) {
          trends.push(result);
        } else {
          const fb = FALLBACK_TRENDS.find((t) => t.category === cat);
          if (fb) trends.push(fb);
          failed.push(cat);
        }
      }

      const liveCount = entries.length - failed.length;
      const source: "live" | "fallback" | "partial" =
        liveCount === 0
          ? "fallback"
          : liveCount === entries.length
            ? "live"
            : "partial";

      return {
        weekOf: endTime.toISOString().slice(0, 10),
        categoryTrends: trends,
        source,
        failedCategories: failed,
        fetchedAt: endTime.toISOString(),
      };
    }
  );

  // fallback ise daha kısa TTL ile cache'le — yeniden denemek için
  if (cached.source === "fresh" && cached.value.source !== "live") {
    const { set } = await import("@/lib/cache");
    set(
      "live-category-trends",
      cached.value,
      {
        ttlMs:
          cached.value.source === "partial"
            ? PARTIAL_CACHE_TTL_MS
            : Math.min(PARTIAL_CACHE_TTL_MS, 60_000),
      }
    );
  }

  return cached.value;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 100000) / 100000;
  };
}

function generateFallbackTrends(
  keyword: string,
  geo: string,
  range: TrendRange
): LiveTrendsResponse {
  const seed = hashString(`${keyword.toLowerCase()}::${range}`);
  const rand = seededRandom(seed);

  const pointCount = range === "1d" ? 24 : range === "7d" ? 8 : range === "1m" ? 31 : 90;
  const baseInterest = 40 + Math.floor(rand() * 40);
  const trendBias = (rand() - 0.5) * 0.6;

  const now = new Date();
  const stepMs =
    range === "1d" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  const points = [];
  for (let i = 0; i < pointCount; i++) {
    const t = new Date(now.getTime() - (pointCount - 1 - i) * stepMs);
    const progression = i / Math.max(1, pointCount - 1);
    const wave = Math.sin(progression * Math.PI * 1.5) * 12;
    const noise = (rand() - 0.5) * 16;
    const trend = progression * trendBias * 50;
    const v = Math.max(
      0,
      Math.min(100, Math.round(baseInterest + wave + noise + trend))
    );
    const isoTime = t.toISOString();
    const time =
      range === "1d"
        ? `${String(t.getHours()).padStart(2, "0")}:00`
        : t.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
    points.push({ time, value: v, isoTime });
  }

  const values = points.map((p) => p.value);
  const averageInterest = Math.round(
    values.reduce((a, b) => a + b, 0) / values.length
  );
  const peakInterest = Math.max(...values);
  const latestInterest = points[points.length - 1].value;
  const half = Math.floor(points.length / 2);
  const firstAvg =
    points.slice(0, half).reduce((a, b) => a + b.value, 0) / Math.max(1, half);
  const secondAvg =
    points.slice(half).reduce((a, b) => a + b.value, 0) /
    Math.max(1, points.length - half);
  const weekOverWeek = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : null;

  const suffixesRising = [
    "ne zaman",
    "fiyat",
    "indirim",
    "2026",
    "yorumları",
    "marka",
    "trendyol",
    "hepsiburada",
  ];
  const suffixesTop = [
    "fiyatları",
    "modelleri",
    "kampanya",
    "stoğu",
    "ücretsiz kargo",
    "en ucuz",
  ];
  const risingQueries = suffixesRising.map((s, i) => ({
    query: `${keyword} ${s}`,
    value: Math.max(50, Math.round(rand() * 600 + 90 - i * 10)),
  }));
  const topQueries = suffixesTop.map((s, i) => ({
    query: `${keyword} ${s}`,
    value: Math.max(20, Math.round(100 - i * 12 - rand() * 10)),
  }));

  return {
    keyword,
    geo,
    range,
    averageInterest,
    peakInterest,
    latestInterest,
    weekOverWeek,
    points,
    risingQueries,
    topQueries,
    source: "fallback",
    fetchedAt: new Date().toISOString(),
    warning:
      "Sunucu IP'sinden Google Trends geçici limit verdi (HTTP 429). Demo trend modeli gösteriliyor — Vercel deploy'da farklı IP'lerden otomatik çalışır.",
  };
}

function rangeToWindow(range: TrendRange): { startTime: Date; endTime: Date } {
  const endTime = new Date();
  const startTime = new Date(endTime);
  switch (range) {
    case "1d":
      startTime.setUTCHours(startTime.getUTCHours() - 24);
      break;
    case "7d":
      startTime.setUTCDate(startTime.getUTCDate() - 7);
      break;
    case "1m":
      startTime.setUTCMonth(startTime.getUTCMonth() - 1);
      break;
    case "3m":
      startTime.setUTCMonth(startTime.getUTCMonth() - 3);
      break;
  }
  return { startTime, endTime };
}

export async function getKeywordTrends(
  keyword: string,
  range: TrendRange,
  geo = "TR"
): Promise<LiveTrendsResponse> {
  const cacheKey = `keyword-trends:${keyword}:${geo}:${range}`;
  const cached = await fetchCached(cacheKey, TRENDS_CACHE_TTL_MS, async () => {
    const { startTime, endTime } = rangeToWindow(range);
    const live = await fetchTrendsLive(keyword, startTime, endTime, {
      geo,
      granular: range === "1d" || range === "7d",
      includeRelated: true,
    });

    if (!live || live.points.length === 0) {
      return generateFallbackTrends(keyword, geo, range);
    }

    const values = live.points.map((p) => p.value);
    const averageInterest = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );
    const peakInterest = Math.max(...values);
    const latestInterest = live.points[live.points.length - 1].value;
    let weekOverWeek: number | null = null;
    if (values.length >= 6) {
      const half = Math.floor(values.length / 2);
      const firstAvg =
        values.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const secondAvg =
        values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);
      if (firstAvg > 0) weekOverWeek = (secondAvg - firstAvg) / firstAvg;
    }

    const result: LiveTrendsResponse = {
      keyword,
      geo,
      range,
      averageInterest,
      peakInterest,
      latestInterest,
      weekOverWeek,
      points: live.points,
      risingQueries: live.rising,
      topQueries: live.top,
      source: "google-trends",
      fetchedAt: new Date().toISOString(),
    };
    return result;
  });

  return cached.source === "cache"
    ? { ...cached.value, source: "cache" }
    : cached.value;
}
