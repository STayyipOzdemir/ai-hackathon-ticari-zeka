import { z } from "zod";
import { ok, fail } from "@/lib/api-helpers";
import { TrendRangeSchema } from "@/contracts";
import { getKeywordTrends } from "@/features/trends/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const QuerySchema = z.object({
  q: z.string().min(1, "Anahtar kelime (q) zorunlu."),
  geo: z.string().default("TR").transform((s) => s.toUpperCase()),
  range: TrendRangeSchema.default("7d"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    geo: searchParams.get("geo") ?? undefined,
    range: searchParams.get("range") ?? undefined,
  });
  if (!parsed.success) {
    return fail("Geçersiz sorgu.", 400, z.flattenError(parsed.error));
  }

  const data = await getKeywordTrends(parsed.data.q, parsed.data.range, parsed.data.geo);
  return ok(data);
}
