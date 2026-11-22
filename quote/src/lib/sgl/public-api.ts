import type { ZodType } from "zod";
import { fail } from "@/lib/api";
import { siteAccess } from "./access";
import { rateLimited } from "./bookings";

/** 공개 폼 공용: 호출 제한 → 공개 여부 → 크기 제한 → JSON → zod. 오류면 응답을, 통과면 값을 돌려준다 */
export async function readPublicBody<T>(req: Request, schema: ZodType<T>, scope: string, max: number): Promise<{ data: T } | { error: Response }> {
  if (rateLimited(req, scope, max)) return { error: fail("too_many_requests", 429) };
  if (!(await siteAccess()).allowed) return { error: fail("not_found", 404) }; // 공개 전에는 관리자 미리보기만 접수
  const text = await req.text();
  if (text.length > 8000) return { error: fail("too_large", 413) };
  let body: unknown;
  try { body = JSON.parse(text); } catch { return { error: fail("invalid_json", 400) }; }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: fail("validation_error", 422, { fields: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) }) };
  return { data: parsed.data };
}
