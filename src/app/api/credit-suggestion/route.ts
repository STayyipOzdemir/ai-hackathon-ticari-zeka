import { parseBody, ok, fail } from "@/lib/api-helpers";
import { CreditSuggestionRequestSchema } from "@/contracts";
import { computeCreditOptions } from "@/features/credit/math";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: Request) {
  const limit = rateLimit(`credit:${clientKey(req)}`, {
    capacity: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail("Çok hızlı istek attınız, biraz bekleyin.", 429);
  }

  const parsed = await parseBody(req, CreditSuggestionRequestSchema);
  if (!parsed.ok) return parsed.response;

  return ok(computeCreditOptions(parsed.data));
}
