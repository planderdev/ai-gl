/**
 * 에어서울 운임 크롤러 CLI — 견적 서버의 크롤링 요청 큐를 처리하거나 전체 달력을 바로 밀어 넣는다.
 *
 *   npx tsx crawler/airseoul.ts --all                 # 오늘 이후 전체 달력 → /api/fares 업서트
 *   npx tsx crawler/airseoul.ts --once                # 대기 요청 1건 처리
 *   npx tsx crawler/airseoul.ts --loop 300            # 300초마다 대기 요청 폴링(데몬)
 *   npx tsx crawler/airseoul.ts --all --dry-run       # 서버 전송 없이 결과만 출력
 *   옵션: --server http://localhost:3000  --api-key KEY  --headless(기본은 Chrome 창 표시)  --route ICN-TAK:RS741:RS742 (복수 가능)
 *   환경변수: AIGL_SERVER, CRAWLER_API_KEY
 */
import { calendarToFares, DEFAULT_ROUTES, fetchMinFareCalendar, routesForFlights, type RouteConfig } from "../src/lib/crawler/airseoul";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const opt = (n: string, d?: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const server = (opt("--server", process.env.AIGL_SERVER) ?? "http://localhost:3000").replace(/\/$/, "");
const apiKey = opt("--api-key", process.env.CRAWLER_API_KEY);
const headed = !flag("--headless");
const dryRun = flag("--dry-run");
const routes: RouteConfig[] = args.flatMap((a, i) => (a === "--route" ? [args[i + 1]] : [])).map((s) => { const [pair, out, ret] = s.split(":"); const [departure, arrival] = pair.split("-"); return { departure, arrival, outboundFlightNo: out, returnFlightNo: ret }; });
const ROUTES = routes.length ? routes : DEFAULT_ROUTES;
const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(server + path, { ...init, headers: { "Content-Type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function upload(fares: ReturnType<typeof calendarToFares>, requestId?: string) {
  if (dryRun) { log(`dry-run: ${fares.length}건 (예: ${JSON.stringify(fares[0])})`); return fares.length; }
  let saved = 0;
  for (let i = 0; i < fares.length; i += 1000) {
    const chunk = fares.slice(i, i + 1000);
    const last = i + 1000 >= fares.length;
    const r = await api("/api/fares", { method: "POST", body: JSON.stringify({ fares: chunk, requestId: last ? requestId : undefined }) });
    saved += r.saved ?? chunk.length;
  }
  log(`서버 저장 ${saved}건${requestId ? ` (요청 ${requestId} 완료)` : ""}`);
  return saved;
}

async function runAll() {
  const from = opt("--from"), to = opt("--to");
  for (const route of ROUTES) {
    const cal = await fetchMinFareCalendar(route, { headed, log });
    const fares = calendarToFares(cal, route, { from, to });
    const ok = fares.filter((f) => f.status === "ok").length;
    log(`${route.departure}-${route.arrival}: ${fares.length}건 (운임 ${ok}, 운항없음 ${fares.length - ok})`);
    await upload(fares);
  }
}

async function runOnce(): Promise<boolean> {
  const { request } = await api("/api/fares/requests/next", { method: "POST" });
  if (!request) { log("대기 중인 요청 없음"); return false; }
  log(`요청 ${request.id}: ${request.flights.map((f: { flightNo: string }) => f.flightNo).join(",")} ${request.from}~${request.to}`);
  try {
    const flightNos = request.flights.map((f: { flightNo: string }) => f.flightNo);
    const matched = routesForFlights(flightNos, ROUTES);
    if (!matched.length) throw new Error(`처리할 수 없는 편명: ${flightNos.join(",")} (--route 로 노선 추가)`);
    let all: ReturnType<typeof calendarToFares> = [];
    for (const route of matched) {
      const cal = await fetchMinFareCalendar(route, { headed, log });
      all = all.concat(calendarToFares(cal, route, { from: request.from, to: request.to, flightNos }));
    }
    if (!all.length) throw new Error("달력 범위 밖이거나 결과 없음");
    await upload(all, request.id);
    return true;
  } catch (e) {
    const msg = (e as Error).message;
    log(`실패: ${msg}`);
    if (!dryRun) await api(`/api/fares/requests/${request.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error: msg.slice(0, 500) }) }).catch(() => {});
    return true;
  }
}

async function main() {
  log(`server=${server} routes=${ROUTES.map((r) => `${r.departure}-${r.arrival}`).join(",")} ${headed ? "headed" : "headless"}${dryRun ? " dry-run" : ""}`);
  if (flag("--all")) return runAll();
  if (flag("--loop")) {
    const sec = Number(opt("--loop", "300")) || 300;
    for (;;) {
      try { while (await runOnce()) { /* 큐 비울 때까지 */ } } catch (e) { log(`오류: ${(e as Error).message}`); }
      await new Promise((r) => setTimeout(r, sec * 1000));
    }
  }
  await runOnce();
}
main().catch((e) => { console.error(e); process.exit(1); });
