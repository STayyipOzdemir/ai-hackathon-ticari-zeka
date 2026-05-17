import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import { z, type ZodType } from "zod";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn(
    "[ticari-zeka] GEMINI_API_KEY tanımlı değil. .env.local dosyasına ekleyin."
  );
}

const client = new GoogleGenerativeAI(apiKey ?? "missing-key");

export const MODEL_FLASH = "gemini-2.5-flash";
export const MODEL_PRO = "gemini-2.5-pro";

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "missing-key"
      | "rate-limit"
      | "invalid-response"
      | "network"
      | "unknown",
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

interface GenerateOptions<T> {
  /** Free-form Türkçe prompt */
  prompt: string;
  /** Gemini-native responseSchema (yapılandırılmış çıktı için) */
  responseSchema: Schema;
  /** Çıktıyı doğrulamak için Zod şeması */
  validate: ZodType<T>;
  /** Model adı (default: flash) */
  model?: string;
  /** 0–1 arası yaratıcılık (default 0.6) */
  temperature?: number;
  /** Bir kez retry et (Gemini bazen geçersiz JSON döndürür) */
  retryOnce?: boolean;
  /** Telemetri için adlandırma */
  operation?: string;
}

/**
 * Gemini'den yapılandırılmış JSON çıktı üretir, sonra Zod ile doğrular.
 * Tip-güvenli T döndürür veya GeminiError fırlatır.
 */
export async function generate<T>(options: GenerateOptions<T>): Promise<T> {
  if (!apiKey) {
    throw new GeminiError(
      "GEMINI_API_KEY tanımlı değil — .env.local dosyasına ekleyin.",
      "missing-key"
    );
  }

  const {
    prompt,
    responseSchema,
    validate,
    model = MODEL_FLASH,
    temperature = 0.6,
    retryOnce = true,
    operation = "generate",
  } = options;

  const run = async (): Promise<T> => {
    const m = client.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        responseSchema,
      },
    });
    let text: string;
    try {
      const result = await m.generateContent(prompt);
      text = result.response.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
        throw new GeminiError(
          "Gemini hız sınırına takıldı, birkaç saniye sonra tekrar dene.",
          "rate-limit",
          err
        );
      }
      throw new GeminiError(`Gemini'ye erişilemedi: ${msg}`, "network", err);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new GeminiError(
        `Gemini geçerli JSON döndürmedi (${operation}).`,
        "invalid-response",
        { text, err }
      );
    }
    const v = validate.safeParse(parsed);
    if (!v.success) {
      throw new GeminiError(
        `Gemini çıktısı şemaya uymadı (${operation}).`,
        "invalid-response",
        { parsed, issues: z.flattenError(v.error) }
      );
    }
    return v.data;
  };

  try {
    return await run();
  } catch (err) {
    if (
      retryOnce &&
      err instanceof GeminiError &&
      err.code === "invalid-response"
    ) {
      return await run();
    }
    throw err;
  }
}

export { SchemaType };
export type { Schema };
