import { describe, expect, it } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("capacity'ye kadar geçirir", () => {
    const key = `t-${Date.now()}-a`;
    for (let i = 0; i < 3; i++) {
      const r = rateLimit(key, { capacity: 3, windowMs: 60_000 });
      expect(r.allowed).toBe(true);
    }
  });

  it("capacity aşımında bloklar", () => {
    const key = `t-${Date.now()}-b`;
    for (let i = 0; i < 2; i++) {
      rateLimit(key, { capacity: 2, windowMs: 60_000 });
    }
    const r = rateLimit(key, { capacity: 2, windowMs: 60_000 });
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it("pencere geçince yeniden açılır", async () => {
    const key = `t-${Date.now()}-c`;
    rateLimit(key, { capacity: 1, windowMs: 10 });
    const blocked = rateLimit(key, { capacity: 1, windowMs: 10 });
    expect(blocked.allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 20));
    const reopened = rateLimit(key, { capacity: 1, windowMs: 10 });
    expect(reopened.allowed).toBe(true);
  });
});
