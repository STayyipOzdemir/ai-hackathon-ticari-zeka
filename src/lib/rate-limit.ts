/**
 * Basit in-memory token bucket rate limiter.
 * Anahtar: IP (varsa). Pencere ve limit per route ayarlanır.
 * Production'da Redis tabanlı (@upstash/ratelimit) ile değiştirilmeli.
 */

interface Bucket {
  tokens: number;
  refilledAt: number;
}

const BUCKETS = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Pencere içinde kaç istek? */
  capacity: number;
  /** Pencere uzunluğu ms */
  windowMs: number;
}

export function rateLimit(
  key: string,
  opts: RateLimitOptions
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const existing = BUCKETS.get(key);
  if (!existing || now - existing.refilledAt > opts.windowMs) {
    BUCKETS.set(key, { tokens: opts.capacity - 1, refilledAt: now });
    return { allowed: true, remaining: opts.capacity - 1, retryAfterMs: 0 };
  }
  if (existing.tokens > 0) {
    existing.tokens--;
    return { allowed: true, remaining: existing.tokens, retryAfterMs: 0 };
  }
  return {
    allowed: false,
    remaining: 0,
    retryAfterMs: opts.windowMs - (now - existing.refilledAt),
  };
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
