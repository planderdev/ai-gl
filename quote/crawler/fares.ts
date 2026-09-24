/**
 * 항공 운임 크롤러 CLI (에어서울 RS / 제주항공 7C) — 견적 서버의 요청 큐를 처리하거나 노선 전체를 바로 밀어 넣는다.
 *
 *   npx tsx crawler/fares.ts --all --provider airseoul        # 오늘 이후 전체 달력 → /api/fares
 *   npx tsx crawler/fares.ts --all --provider jejuair --days 180
 *   npx tsx crawler/fares.ts --once                            # 대기 요청 1건 처리(편명으로 공급자 자동 선택)
 *   npx tsx crawler/fares.ts --loop 300                        # 300초마다 요청 큐 폴링
 *   옵션: --pax 4(기준 인원)  --pace 6(초, 진에어 호출 간격)  --skip-fresh 20(시간, 진에어 증분)  --server URL  --api-key KEY  --dry-run  --headless(차단됨, 실험용)  --route ICN-TAK:RS741:RS742 (추가 노선)
 *   환경변수: AIGL_SERVER, CRAWLER_API_KEY
 */
import { PROVIDERS, providerById, resolveRoutes } from "../src/lib/crawler/providers";
import { todayKst } from "../src/lib/crawler/airseoul";
import { addDays } from "../src/lib/pricing/date";
import type { RouteConfig } from "../src/lib/crawler/airseoul";
import type { FareInput } from "../src/lib/fares/service";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);
const opt = (n: string, d?: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const server = (opt("--server", process.env.AIGL_SERVER) ?? "http://localhost:3000").replace(/\/$/, "");
const apiKey = opt("--api-key", process.env.CRAWLER_API_KEY);
const headed = !flag("--headless");
const dryRun = flag("--dry-run");
const pax = Math.min(9, Math.max(1, Number(opt("--pax", "4")) || 4));
const paceMs = opt("--pace") ? Number(opt("--pace")) * 1000 : undefined;
const skipFreshHours = Number(opt("--skip-fresh", "20")); // 증분 공급자(진에어): 이 시간 안에 받은 값이 있는 날짜는 건너뜀(0 = 끔)
const extraRoutes: RouteConfig[] = args.flatMap((a, i) => (a === "--route" ? [args[i + 1]] : [])).map((s) => { const [pair, out, ret] = s.split(":"); const [departure, arrival] = pair.split("-"); return { departure, arrival, outboundFlightNo: out, returnFlightNo: ret }; });
const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(server + path, { ...init, headers: { "Content-Type": "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}
async function upload(fares: FareInput[], requestId?: string) {
  if (dryRun) { log(`dry-run: ${fares.length}건 (예: ${JSON.stringify(fares[0])})`); return fares.length; }
  let saved = 0;
  for (let i = 0; i < fares.length; i += 1000) {
    const chunk = fares.slice(i, i + 1000);
    const r = await api("/api/fares", { method: "POST", body: JSON.stringify({ fares: chunk, requestId: i + 1000 >= fares.length ? requestId : undefined }) });
    saved += r.saved ?? chunk.length;
  }
  log(`서버 저장 ${saved}건${requestId ? ` (요청 ${requestId} 완료)` : ""}`);
  return saved;
}
const summary = (f: FareInput[]) => `${f.length}건 (운임 ${f.filter((x) => x.status === "ok").length}, 운항없음 ${f.filter((x) => x.status !== "ok").length})`;

/** 서버에 이미 있는 최신 운임(항공사 접두, 운임/마감/운항없음) → 건너뛸 날짜 집합 */
async function freshSet(airline: string, from: string, to: string): Promise<Set<string>> {
  if (!skipFreshHours || dryRun) return new Set();
  try {
    const { items } = await api(`/api/fares?from=${from}&to=${to}`) as { items: { flightNo: string; origin: string; destination: string; date: string; status: string; source: string; capturedAt: string }[] };
    const since = Date.now() - skipFreshHours * 3600_000;
    return new Set(items.filter((f) => f.flightNo.startsWith(airline) && f.source === "crawler" && f.status !== "unknown" && Date.parse(f.capturedAt) >= since).map((f) => `${f.origin}_${f.destination}_${f.date}`));
  } catch (e) { log(`최신 운임 조회 실패(${(e as Error).message}) — 전체 조회`); return new Set(); }
}

async function runAll() {
  const ids = opt("--provider", "all")!.split(",");
  const from = opt("--from") ?? todayKst();
  const to = opt("--to") ?? addDays(todayKst(), Number(opt("--days", "180")));
  for (const p of PROVIDERS.filter((p) => ids.includes("all") || ids.includes(p.id))) {
    const routes = [...p.routes, ...extraRoutes.filter((r) => r.outboundFlightNo.startsWith(p.airline))];
    const state: { rateLimited?: boolean } = {};
    const skip = p.incremental ? await freshSet(p.airline, from, to) : undefined;
    if (skip?.size) log(`${p.label}: 최근 ${skipFreshHours}시간 안에 받은 ${skip.size}개 (노선·날짜)는 건너뜀`);
    const opts = { headed, log, pax, paceMs, skip, state };
    try {
      if (p.crawlMany) {
        const fares = await p.crawlMany(routes, from, to, opts);
        log(`${p.label} ${routes.map((r) => `${r.departure}-${r.arrival}`).join(", ")}: ${summary(fares)}`);
        if (fares.length) await upload(fares);
      } else {
        for (const route of routes) {
          const fares = await p.crawl(route, from, to, opts);
          log(`${p.label} ${route.departure}-${route.arrival}: ${summary(fares)}`);
          await upload(fares);
        }
      }
    } catch (e) {
      if (/1015|빈도 제한/.test((e as Error).message)) state.rateLimited = true; else throw e;
    }
    if (state.rateLimited) { log(`${p.label}: 요청 빈도 제한으로 중단 — 1시간 이상 뒤 같은 명령을 다시 실행하면 남은 날짜만 이어서 수집합니다`); process.exitCode = 3; }
  }
}

async function runOnce(): Promise<boolean> {
  const { request } = await api("/api/fares/requests/next", { method: "POST" });
  if (!request) { log("대기 중인 요청 없음"); return false; }
  const flightNos: string[] = request.flights.map((f: { flightNo: string }) => f.flightNo);
  log(`요청 ${request.id}: ${flightNos.join(",")} ${request.from}~${request.to}`);
  try {
    const matched = resolveRoutes(flightNos, extraRoutes);
    if (!matched.length) throw new Error(`처리할 수 없는 편명: ${flightNos.join(",")} (--route 로 노선 추가)`);
    let all: FareInput[] = [];
    for (const { provider, route } of matched) all = all.concat((await provider.crawl(route, request.from, request.to, { headed, log, pax: request.pax ?? pax })).filter((f) => flightNos.includes(f.flightNo)));
    if (!all.length) throw new Error("달력 범위 밖이거나 결과 없음");
    await upload(all, request.id);
  } catch (e) {
    const msg = (e as Error).message;
    log(`실패: ${msg}`);
    if (!dryRun) await api(`/api/fares/requests/${request.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error: msg.slice(0, 500) }) }).catch(() => {});
  }
  return true;
}

async function main() {
  log(`pax=${pax} server=${server} providers=${PROVIDERS.map((p) => `${p.id}(${p.routes.map((r) => `${r.departure}-${r.arrival}`).join("/")})`).join(", ")} ${headed ? "headed" : "headless"}${dryRun ? " dry-run" : ""}`);
  if (flag("--all")) return runAll();
  if (flag("--loop")) { const sec = Number(opt("--loop", "300")) || 300; for (;;) { try { while (await runOnce()) { /* 큐 비울 때까지 */ } } catch (e) { log(`오류: ${(e as Error).message}`); } await new Promise((r) => setTimeout(r, sec * 1000)); } }
  if (opt("--provider") && !providerById(opt("--provider")!)) throw new Error(`알 수 없는 공급자: ${opt("--provider")} (${PROVIDERS.map((p) => p.id).join("|")})`);
  await runOnce();
}
main().catch((e) => { console.error(e); process.exit(1); });
