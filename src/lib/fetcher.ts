import type { ZodType } from "zod";

export interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * fetch + response validation. Hata durumunda ApiError fırlatır.
 */
export async function apiFetch<T>(
  url: string,
  schema: ZodType<T>,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Ağ hatası",
      0
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Geçersiz JSON yanıtı", res.status);
  }

  if (!res.ok) {
    const body = json as ApiErrorBody;
    throw new ApiError(body.error ?? `HTTP ${res.status}`, res.status, body.details);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("Sunucu yanıtı şemaya uymuyor", 500, parsed.error.issues);
  }
  return parsed.data;
}
