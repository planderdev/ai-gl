import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (message: string, status = 400, extra?: Record<string, unknown>) => NextResponse.json({ error: message, ...extra }, { status });

/** 크롤러 인증: CRAWLER_API_KEY 설정 시 `x-api-key` 또는 `Authorization: Bearer` 필수. 미설정(로컬)이면 통과. */
export function checkApiKey(req: Request): NextResponse | null {
  const key = process.env.CRAWLER_API_KEY;
  if (!key) return process.env.NODE_ENV === "production" ? fail("CRAWLER_API_KEY 가 서버에 설정되지 않았습니다", 503) : null;
  const given = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return given === key ? null : fail("unauthorized", 401);
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json();
    return { data: schema.parse(body) };
  } catch (e) {
    if (e instanceof ZodError) return { error: fail("validation_error", 422, { issues: e.issues }) };
    return { error: fail("invalid_json", 400) };
  }
}

export const handle = <A extends unknown[]>(fn: (...a: A) => Promise<Response>) => async (...a: A) => {
  try { return await fn(...a); }
  catch (e) { console.error(e); return fail(e instanceof Error ? e.message : "internal_error", 500); }
};

/** 동적 세그먼트가 퍼센트 인코딩된 채 전달되는 경우(한글 id) 복원 */
export const decodeId = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
