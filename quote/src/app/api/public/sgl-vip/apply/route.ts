import { fail, json } from "@/lib/api";
import { vipApplySchema } from "@/lib/schemas";
import { submitVipApplication } from "@/lib/sgl-vip/service";

const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 30; // 통신사 NAT 뒤의 고객이 같은 IP 를 공유하므로 넉넉하게 둔다
const hits = new Map<string, { count: number; resetAt: number }>();

/** 인스턴스별 간이 제한. 대량 공격 방어는 Vercel Firewall 몫이고, 여기서는 단순 반복 호출만 막는다 */
function isLimited(ip: string, now: number) {
  if (hits.size > 5000) hits.clear();
  const h = hits.get(ip);
  if (!h || h.resetAt < now) { hits.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  return ++h.count > MAX_HITS;
}

/** 공개 API(로그인 불필요, proxy matcher 에서 제외). 내부 오류 내용은 응답에 싣지 않는다 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isLimited(ip, Date.now())) return fail("too_many_requests", 429);
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
