import { parseBody, ok, fail } from "@/lib/api-helpers";
import { InsightsRequestSchema } from "@/contracts";
import { generateInsights } from "@/features/insights/server";
import { GeminiError } from "@/lib/gemini";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const limit = rateLimit(`insights:${clientKey(req)}`, {
    capacity: 8,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail("Çok hızlı istek attınız, biraz bekleyin.", 429, {
      retryAfterMs: limit.retryAfterMs,
    });
  }

  const parsed = await parseBody(req, InsightsRequestSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const result = await generateInsights(parsed.data.products);
    return ok(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      const status =
        err.code === "missing-key"
          ? 503
          : err.code === "rate-limit"
            ? 429
            : 502;
      return fail(err.message, status, { code: err.code });
    }
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return fail(message);
  }
}
