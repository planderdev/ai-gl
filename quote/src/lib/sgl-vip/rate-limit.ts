/**
 * 인스턴스별 간이 요청 제한(IP 기준, 10분 창). 대량 공격 방어는 Vercel Firewall 몫이고, 여기서는 단순 반복 호출만 막는다.
 * 통신사 NAT 뒤의 고객이 같은 IP 를 공유하므로 한도는 넉넉하게 둔다.
 */
export function createRateLimiter(maxHits: number, windowMs = 10 * 60_000) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    if (hits.size > 5000) hits.clear();
    const h = hits.get(ip);
    if (!h || h.resetAt < now) { hits.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
    return ++h.count > maxHits;
  };
}
