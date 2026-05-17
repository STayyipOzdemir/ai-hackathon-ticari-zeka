import { ok } from "@/lib/api-helpers";
import { getLiveCategoryTrends } from "@/features/trends/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const data = await getLiveCategoryTrends();
  return ok(data);
}
