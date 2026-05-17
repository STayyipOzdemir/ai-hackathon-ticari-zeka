import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";

export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Geçersiz JSON gövdesi." },
        { status: 400 }
      ),
    };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "İstek gövdesi şemaya uymuyor.",
          details: z.flattenError(result.error),
        },
        { status: 422 }
      ),
    };
  }
  return { ok: true, data: result.data };
}

export function ok<T>(data: T): NextResponse {
  return NextResponse.json(data);
}

export function fail(error: string, status = 500, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}
