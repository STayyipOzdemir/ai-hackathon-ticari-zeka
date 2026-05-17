/**
 * Sunucu tarafı Google Trends client'ı.
 *
 * - Browser-like User-Agent + Türkçe Accept-Language + Referer ile istek
 * - Cookie warming: trends.google.com ana sayfasına bir GET ile NID alır
 * - 429 başına exponential backoff retry (1s, 2s)
 * - Circuit breaker: ardışık 3 fail olursa 5 dk live çağrı durdurulur
 */

const BASE_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
  Referer: "https://trends.google.com/",
};

let CACHED_COOKIE: string | null = null;
let COOKIE_FETCHED_AT = 0;
const COOKIE_TTL_MS = 30 * 60 * 1000;

let CIRCUIT_FAILS = 0;
let CIRCUIT_OPEN_UNTIL = 0;
const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000;

async function warmCookies(): Promise<string | null> {
  if (CACHED_COOKIE && Date.now() - COOKIE_FETCHED_AT < COOKIE_TTL_MS) {
    return CACHED_COOKIE;
  }
  try {
    const res = await fetch("https://trends.google.com/?geo=TR", {
      headers: BASE_HEADERS,
      cache: "no-store",
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const pairs = setCookie
        .split(/,(?=[^;]+?=)/)
        .map((c) => c.split(";")[0].trim())
        .filter((c) => c.includes("="));
      CACHED_COOKIE = pairs.join("; ");
      COOKIE_FETCHED_AT = Date.now();
      return CACHED_COOKIE;
    }
  } catch {
    // ignore
  }
  return null;
}

function stripXssi(text: string): string {
  if (text.startsWith(")]}'")) {
    const idx = text.indexOf("\n");
    if (idx >= 0) return text.slice(idx + 1);
  }
  return text;
}

interface ExploreWidget {
  id: string;
  token: string;
  request: unknown;
}
interface ExploreResponse {
  widgets?: ExploreWidget[];
}
interface TimelinePoint {
  time?: string;
  formattedTime?: string;
  formattedAxisTime?: string;
  value?: number[];
}
interface TimelineResponse {
  default?: { timelineData?: TimelinePoint[] };
}
interface RankedKeyword {
  query?: string;
  value?: number;
  link?: string;
}
interface RelatedResponse {
  default?: { rankedList?: Array<{ rankedKeyword?: RankedKeyword[] }> };
}

export interface TrendPoint {
  time: string;
  value: number;
  isoTime: string;
}

export interface RelatedQuery {
  query: string;
  value: number;
  link?: string;
}

export interface TrendsResult {
  points: TrendPoint[];
  rising: RelatedQuery[];
  top: RelatedQuery[];
}

async function fetchWithCookies(url: string): Promise<Response> {
  const cookie = await warmCookies();
  return fetch(url, {
    headers: {
      ...BASE_HEADERS,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    cache: "no-store",
  });
}

async function fetchWithBackoff(
  url: string,
  maxRetries: number
): Promise<Response | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithCookies(url);
      if (res.status === 429) {
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
          continue;
        }
        return null;
      }
      return res;
    } catch {
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      return null;
    }
  }
  return null;
}

function timeStringFor(date: Date, granular: boolean): string {
  if (granular) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    const h = String(date.getUTCHours()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}`;
  }
  return date.toISOString().slice(0, 10);
}

function isCircuitOpen(): boolean {
  return CIRCUIT_OPEN_UNTIL > Date.now();
}

function recordFailure(): void {
  CIRCUIT_FAILS++;
  if (CIRCUIT_FAILS >= CIRCUIT_THRESHOLD) {
    CIRCUIT_OPEN_UNTIL = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
}

function recordSuccess(): void {
  CIRCUIT_FAILS = 0;
  CIRCUIT_OPEN_UNTIL = 0;
}

export async function fetchTrendsLive(
  keyword: string,
  startTime: Date,
  endTime: Date,
  options?: { geo?: string; granular?: boolean; includeRelated?: boolean }
): Promise<TrendsResult | null> {
  if (isCircuitOpen()) return null;

  const geo = options?.geo ?? "TR";
  const granular = options?.granular ?? false;
  const includeRelated = options?.includeRelated ?? true;

  const time = `${timeStringFor(startTime, granular)} ${timeStringFor(endTime, granular)}`;
  const exploreReq = {
    comparisonItem: [{ keyword, geo, time }],
    category: 0,
    property: "",
  };

  const exploreUrl =
    "https://trends.google.com/trends/api/explore" +
    `?hl=tr&tz=-180&req=${encodeURIComponent(JSON.stringify(exploreReq))}&geo=${geo}`;

  const exploreRes = await fetchWithBackoff(exploreUrl, 2);
  if (!exploreRes || exploreRes.status !== 200) {
    recordFailure();
    return null;
  }

  let exploreData: ExploreResponse;
  try {
    const txt = await exploreRes.text();
    exploreData = JSON.parse(stripXssi(txt));
  } catch {
    recordFailure();
    return null;
  }

  const widgets = exploreData.widgets ?? [];
  const timelineWidget = widgets.find((w) => w.id === "TIMESERIES");
  const relatedWidget = widgets.find((w) =>
    /RELATED_QUERIES|RELATED_TOPICS_0/.test(w.id)
  );

  let points: TrendPoint[] = [];
  if (timelineWidget) {
    const url =
      "https://trends.google.com/trends/api/widgetdata/multiline" +
      `?hl=tr&tz=-180&req=${encodeURIComponent(JSON.stringify(timelineWidget.request))}&token=${encodeURIComponent(timelineWidget.token)}`;
    const res = await fetchWithBackoff(url, 1);
    if (res && res.status === 200) {
      try {
        const txt = await res.text();
        const data = JSON.parse(stripXssi(txt)) as TimelineResponse;
        const timeline = data?.default?.timelineData ?? [];
        for (const t of timeline) {
          const v = Array.isArray(t.value) ? (t.value[0] ?? 0) : 0;
          const isoTime = t.time
            ? new Date(Number(t.time) * 1000).toISOString()
            : new Date().toISOString();
          points.push({
            time: t.formattedTime || t.formattedAxisTime || isoTime,
            value: v,
            isoTime,
          });
        }
      } catch {
        points = [];
      }
    }
  }

  if (points.length === 0) {
    recordFailure();
    return null;
  }

  let rising: RelatedQuery[] = [];
  let top: RelatedQuery[] = [];
  if (includeRelated && relatedWidget) {
    const url =
      "https://trends.google.com/trends/api/widgetdata/relatedsearches" +
      `?hl=tr&tz=-180&req=${encodeURIComponent(JSON.stringify(relatedWidget.request))}&token=${encodeURIComponent(relatedWidget.token)}`;
    const res = await fetchWithBackoff(url, 1);
    if (res && res.status === 200) {
      try {
        const txt = await res.text();
        const data = JSON.parse(stripXssi(txt)) as RelatedResponse;
        const list = data?.default?.rankedList ?? [];
        const topList = list[0]?.rankedKeyword ?? [];
        const risingList = list[1]?.rankedKeyword ?? [];
        top = topList.slice(0, 8).map((k) => ({
          query: k.query ?? "",
          value: typeof k.value === "number" ? k.value : 0,
          link: k.link,
        }));
        rising = risingList.slice(0, 8).map((k) => ({
          query: k.query ?? "",
          value: typeof k.value === "number" ? k.value : 0,
          link: k.link,
        }));
      } catch {
        // ignore
      }
    }
  }

  recordSuccess();
  return { points, rising, top };
}

export function getCircuitState(): {
  open: boolean;
  fails: number;
  openUntil: number;
} {
  return {
    open: isCircuitOpen(),
    fails: CIRCUIT_FAILS,
    openUntil: CIRCUIT_OPEN_UNTIL,
  };
}
