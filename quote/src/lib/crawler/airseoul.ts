/**
 * 에어서울 홈페이지 운임 크롤러 (핵심 로직).
 * - 예약 1단계 화면의 달력이 쓰는 `POST /I/KO/searchRouteMinFare.do` 는 노선의 날짜별
 *   편도 총액(성인 1인, 세금 포함) 최저가를 약 2년치 한 번에 돌려준다.
 *   outboundAmount = 출발지→도착지, returnAmount = 도착지→출발지 (같은 날짜 기준).
 * - 직접 HTTP 호출은 Cloudflare 챌린지(403)에 막히므로 실제 Chrome 을 띄워 페이지 컨텍스트에서 fetch 한다.
 * - 금액 0 = 해당 일 운항 없음(또는 판매 없음) → status "no_flight".
 */
import type { FareInput } from "@/lib/fares/service";

export interface MinFareEntry { departureDate: string; outboundAmount: number; returnAmount: number; outboundTax: number; returnTax: number; currency: string; paxCnt?: number }
export interface RouteConfig { departure: string; arrival: string; outboundFlightNo: string; returnFlightNo: string }
export const DEFAULT_ROUTES: RouteConfig[] = [{ departure: "ICN", arrival: "TAK", outboundFlightNo: "RS741", returnFlightNo: "RS742" }];

export const BASE = "https://flyairseoul.com";
const yyyymmdd = (d: string) => d.replace(/-/g, "");
const iso = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

export const DEFAULT_PAX = 4;
/** pax = 조회 기준 인원(성인). 항공사 달력은 해당 인원이 함께 탈 수 있는 좌석의 최저가를 돌려준다(기본 4인) */
export interface FetchOptions {
  headed?: boolean; timeoutMs?: number; log?: (m: string) => void; pax?: number;
  /** 호출 간격(ms) — 빈도 제한이 있는 공급자(진에어)용 */
  paceMs?: number;
  /** 이미 최신 값이 있어 건너뛸 `${origin}_${destination}_${date}` 목록 */
  skip?: Set<string>;
  /** 크롤러가 빈도 제한으로 중단했는지 호출자에게 알려주는 공유 상태 */
  state?: { rateLimited?: boolean };
}

/** 한국 시간 기준 오늘(YYYY-MM-DD) */
export const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

/** Chrome 으로 예약 페이지를 열어 Cloudflare 를 통과한 뒤 달력 API 를 페이지 안에서 호출 */
export async function fetchMinFareCalendar(route: RouteConfig, opts: FetchOptions = {}): Promise<MinFareEntry[]> {
  const log = opts.log ?? (() => {});
  const { chromium } = await import("playwright");
  const timeout = opts.timeoutMs ?? 60_000;
  // 헤드리스 Chrome 은 Cloudflare 챌린지를 통과하지 못하므로 기본은 창을 띄우는 headed 모드.
  // 쿠키/프로필을 재사용하면 오히려 챌린지에 걸리므로 매번 새 컨텍스트로 연다(테스트 결과 새 컨텍스트는 1~2초 내 자동 통과).
  const headless = opts.headed === false;
  const launch = async () => {
    try { return await chromium.launch({ channel: "chrome", headless }); }
    catch (e) { log(`설치된 Chrome 실행 실패(${(e as Error).message.split("\n")[0]}) → 번들 Chromium 시도`); return chromium.launch({ headless }); }
  };
  const browser = await launch();
  try {
    const ctx = await browser.newContext({ locale: "ko-KR", viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const url = `${BASE}/I/ko/viewBooking.do?DepApo=${route.departure}&ArrApo=${route.arrival}`;
    log(`open ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    // Cloudflare 챌린지("Just a moment...")가 끝나 예약 화면이 뜰 때까지 대기
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const title = await page.title().catch(() => "");
      if (title && !/just a moment|잠시만/i.test(title)) break;
      await page.waitForTimeout(1000);
    }
    log(`page title: ${await page.title()}`);
    const pax = Math.min(9, Math.max(1, Math.round(opts.pax ?? DEFAULT_PAX)));
    const body = `language=KO&departure=${route.departure}&arrival=${route.arrival}&paxCnt=${pax}`;
    log(`기준 인원 ${pax}명 (에어서울 달력 API 는 인원과 무관하게 1인 최저가를 돌려줌 — 2026-09-24 확인)`);
    const res = await page.evaluate(async (body) => {
      const r = await fetch("/I/KO/searchRouteMinFare.do", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest" }, body });
      const text = await r.text();
      try { return { status: r.status, json: JSON.parse(text) }; } catch { return { status: r.status, json: null, text: text.slice(0, 300) }; }
    }, body);
    if (!res.json || res.json.code !== "0000" || !Array.isArray(res.json.minFare)) {
      throw new Error(`minFare 응답 이상 (HTTP ${res.status}): ${JSON.stringify(res.json ?? res.text).slice(0, 120)} — Cloudflare 차단(헤드리스 불가, Chrome 창 모드로 실행 필요)`);
    }
    const list = (res.json.minFare as MinFareEntry[]).filter((x) => /^\d{8}$/.test(x.departureDate));
    log(`minFare ${list.length}일 (${list[0]?.departureDate} ~ ${list.at(-1)?.departureDate})`);
    return list.map((x) => ({ ...x, paxCnt: pax }));
  } finally {
    await browser.close();
  }
}

/** 달력 → 편명별 운임 입력값. from/to(YYYY-MM-DD)로 범위 제한, flightNos 로 편명 제한 */
export function calendarToFares(cal: MinFareEntry[], route: RouteConfig, opt: { from?: string; to?: string; flightNos?: string[]; today?: string } = {}): FareInput[] {
  const today = opt.today ?? todayKst();
  // 과거 날짜는 달력이 0 을 돌려주므로(운항없음으로 오인) 오늘 이후만 처리
  const from = yyyymmdd(opt.from && opt.from > today ? opt.from : today);
  const to = opt.to ? yyyymmdd(opt.to) : "99991231";
  const want = opt.flightNos ? new Set(opt.flightNos) : null;
  const out: FareInput[] = [];
  for (const e of cal) {
    if (e.departureDate < from || e.departureDate > to) continue;
    const date = iso(e.departureDate);
    const mk = (flightNo: string, origin: string, destination: string, amount: number, tax: number): FareInput => ({
      flightNo, origin, destination, date,
      fareKrw: amount > 0 ? amount : null,
      status: amount > 0 ? "ok" : "no_flight",
      source: "crawler",
      meta: { provider: "airseoul-minfare", pax: 1, paxRequested: e.paxCnt || undefined, tax, currency: e.currency, note: amount > 0 ? "달력 API 인원 미반영(1인 최저가 기준)" : "달력 금액 0 (운항없음 또는 판매종료)" },
    });
    if (!want || want.has(route.outboundFlightNo)) out.push(mk(route.outboundFlightNo, route.departure, route.arrival, e.outboundAmount, e.outboundTax));
    if (!want || want.has(route.returnFlightNo)) out.push(mk(route.returnFlightNo, route.arrival, route.departure, e.returnAmount, e.returnTax));
  }
  return out;
}

/** 요청(flights/from/to)에 맞는 노선 설정 찾기: 요청 편명이 노선의 출발/귀국편에 포함되면 매칭 */
export function routesForFlights(flightNos: string[], routes = DEFAULT_ROUTES): RouteConfig[] {
  return routes.filter((r) => flightNos.includes(r.outboundFlightNo) || flightNos.includes(r.returnFlightNo));
}
