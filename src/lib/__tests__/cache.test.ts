import { afterEach, describe, expect, it } from "vitest";
import { clear, fetchCached, get, set } from "../cache";

afterEach(() => clear());

describe("cache", () => {
  it("set + get çalışır", () => {
    set("k", { v: 1 }, { ttlMs: 1000 });
    expect(get("k")).toEqual({ v: 1 });
  });

  it("TTL dolduğunda null döner", async () => {
    set("k", "val", { ttlMs: 5 });
    await new Promise((r) => setTimeout(r, 20));
    expect(get("k")).toBeNull();
  });

  it("fetchCached: cache yoksa fetcher çağrılır, sonuç döner", async () => {
    let count = 0;
    const r1 = await fetchCached("k", 1000, async () => {
      count++;
      return { n: 42 };
    });
    expect(r1.source).toBe("fresh");
    expect(r1.value).toEqual({ n: 42 });
    expect(count).toBe(1);
  });

  it("fetchCached: cache varsa fetcher tekrar çağrılmaz", async () => {
    let count = 0;
    await fetchCached("k", 1000, async () => {
      count++;
      return { n: 1 };
    });
    const r2 = await fetchCached("k", 1000, async () => {
      count++;
      return { n: 2 };
    });
    expect(count).toBe(1);
    expect(r2.source).toBe("cache");
    expect(r2.value).toEqual({ n: 1 });
  });
});
