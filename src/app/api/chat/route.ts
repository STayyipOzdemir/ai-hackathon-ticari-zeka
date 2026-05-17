import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { parseBody } from "@/lib/api-helpers";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(500),
  context: z.string().max(8000).optional(),
});

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenerativeAI(apiKey ?? "missing-key");

export async function POST(req: Request) {
  const limit = rateLimit(`chat:${clientKey(req)}`, {
    capacity: 20,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return new Response("Çok hızlı istek attınız, biraz bekleyin.", {
      status: 429,
    });
  }

  const parsed = await parseBody(req, ChatRequestSchema);
  if (!parsed.ok) return parsed.response;

  if (!apiKey) {
    return new Response("GEMINI_API_KEY tanımlı değil.", { status: 503 });
  }

  const { question, context } = parsed.data;
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.6 },
  });

  const prompt = `Sen TicariZeka uygulamasının yerleşik yapay zeka asistanısın. Türkçe, kısa ve net cevap ver (en fazla 4 cümle). Pazarlama jargonunu açıkla, sayıları yorumla.

${context ? `# Bağlam (kullanıcının ekranındaki veri)\n${context}\n` : ""}

# Kullanıcının sorusu
${question}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        controller.enqueue(encoder.encode(`\n\n[hata: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
