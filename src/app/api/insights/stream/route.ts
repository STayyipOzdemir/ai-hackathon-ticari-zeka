import { parseBody } from "@/lib/api-helpers";
import { InsightsRequestSchema, GeminiInsightsResponseSchema, type ProductInsight } from "@/contracts";
import { insightsSchema } from "@/lib/gemini/schemas";
import { streamGemini } from "@/lib/gemini/stream";
import { getLiveCategoryTrends } from "@/features/trends/server";
import { buildInsightsPrompt } from "@/features/insights/prompt";
import { TOP_KEYWORDS } from "@/lib/mock-data";

export const runtime = "nodejs";
export const maxDuration = 60;

interface SSEEvent {
  type: "start" | "delta" | "complete" | "error";
  // start
  trendSource?: string;
  trendsFetchedAt?: string;
  // delta
  accumulated?: string;
  // complete
  insights?: ProductInsight[];
  weeklyHeadline?: string;
  // error
  message?: string;
}

function sse(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, InsightsRequestSchema);
  if (!parsed.ok) return parsed.response;

  const products = parsed.data.products;
  const productsById = new Map(products.map((p) => [p.id, p]));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: SSEEvent) => controller.enqueue(encoder.encode(sse(e)));

      try {
        const trendData = await getLiveCategoryTrends();
        send({
          type: "start",
          trendSource: trendData.source,
          trendsFetchedAt: trendData.fetchedAt,
        });

        const prompt = buildInsightsPrompt(
          products,
          trendData.categoryTrends,
          TOP_KEYWORDS
        );

        let final = "";
        for await (const chunk of streamGemini({
          prompt,
          responseSchema: insightsSchema,
          temperature: 0.7,
        })) {
          if (chunk.type === "delta") {
            send({ type: "delta", accumulated: chunk.accumulated });
          } else {
            final = chunk.full;
          }
        }

        let raw: unknown;
        try {
          raw = JSON.parse(final);
        } catch {
          send({ type: "error", message: "Gemini geçerli JSON döndürmedi." });
          controller.close();
          return;
        }

        const validated = GeminiInsightsResponseSchema.safeParse(raw);
        if (!validated.success) {
          send({ type: "error", message: "Gemini çıktısı şemaya uymadı." });
          controller.close();
          return;
        }

        const enriched: ProductInsight[] = validated.data.insights
          .map((ins) => {
            const lift = Math.max(0.01, Math.min(0.6, ins.estimatedCtrLift));
            const p = productsById.get(ins.productId);
            const revenueLift = p ? Math.round(p.sales30d * p.price * lift) : 0;
            return {
              ...ins,
              estimatedCtrLift: lift,
              estimatedRevenueLift: revenueLift,
            };
          })
          .sort((a, b) => b.priorityScore - a.priorityScore);

        send({
          type: "complete",
          insights: enriched,
          weeklyHeadline: validated.data.weeklyHeadline,
        });
        controller.close();
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Bilinmeyen hata",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
