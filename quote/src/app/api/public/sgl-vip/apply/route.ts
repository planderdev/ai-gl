import { cookies } from "next/headers";
import { fail, json } from "@/lib/api";
import { vipApplySchema } from "@/lib/schemas";
import { hasVipAccess, VIP_ACCESS_COOKIE } from "@/lib/sgl-vip/access";
import { createRateLimiter } from "@/lib/sgl-vip/rate-limit";
import { submitVipApplication } from "@/lib/sgl-vip/service";

const isLimited = createRateLimiter(30);

/** 공개 API(로그인 불필요, proxy matcher 에서 제외)이지만 입장 코드를 통과한 쿠키가 있어야 한다. 내부 오류 내용은 응답에 싣지 않는다 */
export async function POST(req: Request) {
  if (isLimited(req)) return fail("too_many_requests", 429);
  if (!hasVipAccess((await cookies()).get(VIP_ACCESS_COOKIE)?.value)) return fail("access_required", 403);
  const text = await req.text();
  if (text.length > 4000) return fail("too_large", 413);
  let body: unknown;
  try { body = JSON.parse(text); } catch { return fail("invalid_json", 400); }
  const parsed = vipApplySchema.safeParse(body);
  if (!parsed.success) return fail("validation_error", 422, { fields: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) });
  if (parsed.data.website) return json({ ok: true }); // 허니팟이 채워지면 봇 → 저장하지 않고 성공처럼 응답
  try {
    await submitVipApplication(parsed.data);
    return json({ ok: true });
  } catch (e) {
    console.error("[sgl-vip/apply] 저장 실패", e);
    return fail("temporarily_unavailable", 503);
  }
}
