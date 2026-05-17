import { GoogleGenerativeAI, type Schema } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenerativeAI(apiKey ?? "missing-key");

export interface StreamOptions {
  prompt: string;
  responseSchema: Schema;
  model?: string;
  temperature?: number;
}

/**
 * Gemini'den JSON çıktıyı parça parça akıtır. Her parçada birikmiş
 * metnin yeni eklenen kısmını yield eder. Akışın sonunda tüm JSON'u
 * caller parse edebilir.
 */
export async function* streamGemini(opts: StreamOptions): AsyncGenerator<
  { type: "delta"; text: string; accumulated: string } | { type: "done"; full: string }
> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil.");
  }
  const model = client.getGenerativeModel({
    model: opts.model ?? "gemini-2.5-flash",
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      responseMimeType: "application/json",
      responseSchema: opts.responseSchema,
    },
  });

  const result = await model.generateContentStream(opts.prompt);
  let accumulated = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (!text) continue;
    accumulated += text;
    yield { type: "delta", text, accumulated };
  }
  yield { type: "done", full: accumulated };
}
