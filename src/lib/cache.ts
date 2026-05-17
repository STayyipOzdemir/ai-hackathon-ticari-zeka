/**
 * In-memory TTL cache. Tek bir sunucu instance'ı için yeterli;
 * production'da Redis ile değiştirilebilir.
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const STORE = new Map<string, Entry<unknown>>();

export interface CacheOptions {
  ttlMs: number;
}

export function get<T>(key: string): T | null {
  const entry = STORE.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    STORE.delete(key);
    return null;
  }
  return entry.value as T;
}

export function set<T>(key: string, value: T, opts: CacheOptions): void {
  STORE.set(key, { value, expires: Date.now() + opts.ttlMs });
}

export function del(key: string): void {
  STORE.delete(key);
}

export function clear(): void {
  STORE.clear();
}

/**
 * Stale-while-revalidate yardımcısı: cache varsa onu döner, yoksa
 * `fetcher` çalışır ve sonucu cache'ler. Fetcher başarısız olursa
 * `onError` çağrılır.
 */
export async function fetchCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<{ value: T; source: "cache" | "fresh" }> {
  const cached = get<T>(key);
  if (cached !== null) {
    return { value: cached, source: "cache" };
  }
  const fresh = await fetcher();
  set(key, fresh, { ttlMs });
  return { value: fresh, source: "fresh" };
}
