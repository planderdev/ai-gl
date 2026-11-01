import { fail, json } from "@/lib/api";
import { createAccessToken, isValidAccessCode, VIP_ACCESS_COOKIE, VIP_ACCESS_MAX_AGE } from "@/lib/sgl-vip/access";
import { createRateLimiter } from "@/lib/sgl-vip/rate-limit";

const isLimited = createRateLimiter(30);

/** 입장 코드 확인. 맞으면 입력 페이지·신청 API 에 쓰는 서명 쿠키를 준다 */
export async function POST(req: Request) {
  if (isLimited(req)) return fail("too_many_requests", 429);
  const text = await req.text();
  if (text.length > 500) return fail("too_large", 413);
  let code: unknown;
  try { code = (JSON.parse(text) as { code?: unknown }).code; } catch { return fail("invalid_json", 400); }
  try {
    if (typeof code !== "string" || !(await isValidAccessCode(code))) return fail("invalid_code", 401);
  } catch (e) {
    console.error("[sgl-vip/access] 코드 확인 실패", e);
    return fail("temporarily_unavailable", 503);
  }
  const res = json({ ok: true });
  res.cookies.set(VIP_ACCESS_COOKIE, createAccessToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: VIP_ACCESS_MAX_AGE });
  return res;
}
