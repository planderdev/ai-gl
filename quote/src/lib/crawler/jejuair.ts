/**
 * 제주항공 홈페이지 운임 크롤러 (핵심 로직).
 * - 메인 화면의 "최저가 그래프"가 쓰는 `POST https://sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendarInPeriod.json`
 *   body {tripRoute:[{searchStartDate:"YYYY-MM-DD", searchEndDate, originAirport, destinationAirport}], passengers:[{type:"ADT",count:"1"}]}
 *   헤더 Channel-Code: WPC. 응답 data.lowfares.lowFareDateMarkets[] = {cvtDepartureDate:"YYYYMMDD", noFlights, lowestFareAmount:{fareAmount, taxesAndFeesAmount}}
 *   → 총액 = fareAmount + taxesAndFeesAmount (성인 1인, 원). 한 번에 최대 90일이라 구간을 나눠 호출.
 * - 헤드리스 Chrome 은 봇 차단(에러 페이지)되므로 에어서울과 같이 Chrome 창(headed) + 새 컨텍스트로 페이지 안에서 호출한다.
 * - 노선에 하루 1편(예: ICN-MYJ 7C1704 / MYJ-ICN 7C1703)이면 달력 최저가 = 해당 편 운임.
 */
import type { FareInput } from "@/lib/fares/service";
import type { FetchOptions, RouteConfig } from "./airseoul";
import { DEFAULT_PAX, todayKst } from "./airseoul";
import { addDays } from "@/lib/pricing/date";

export interface JejuLowFare { cvtDepartureDate: string; noFlights: boolean; isHoliday?: boolean; lowestFareAmount?: { fareAmount: number; taxesAndFeesAmount: number } | null; pax?: number }
export const JEJUAIR_ROUTES: RouteConfig[] = [{ departure: "ICN", arrival: "MYJ", outboundFlightNo: "7C1704", returnFlightNo: "7C1703" }];
const MAIN = "https://www.jejuair.net/ko/main/base/index.do";
const API = "https://sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendarInPeriod.json";
const WINDOW_DAYS = 89;

/** 한 방향(origin→destination)의 날짜별 최저 총액. from~to(YYYY-MM-DD)를 89일 단위로 나눠 조회 */
export async function fetchJejuLowFares(origin: string, destination: string, from: string, to: string, opts: FetchOptions = {}): Promise<JejuLowFare[]> {
  const log = opts.log ?? (() => {});
  const { chromium } = await import("playwright");
  const headless = opts.headed === false;
  const browser = await chromium.launch({ channel: "chrome", headless }).catch(async (e) => { log(`설치된 Chrome 실행 실패(${(e as Error).message.split("\n")[0]}) → 번들 Chromium 시도`); return chromium.launch({ headless }); });
  try {
    const ctx = await browser.newContext({ locale: "ko-KR", viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    log(`open ${MAIN}`);
    await page.goto(MAIN, { waitUntil: "domcontentloaded", timeout: opts.timeoutMs ?? 60_000 });
    await page.waitForTimeout(2500);
    const title = await page.title();
    log(`page title: ${title}`);
    if (/error/i.test(title)) throw new Error("제주항공 접속 차단(에러 페이지) — Chrome 창 모드로 다시 시도하세요");
    const pax = Math.min(9, Math.max(1, Math.round(opts.pax ?? DEFAULT_PAX)));
    log(`기준 인원 ${pax}명`);
    const out: JejuLowFare[] = [];
    for (let s = from; s <= to; s = addDays(s, WINDOW_DAYS + 1)) {
      const e = addDays(s, WINDOW_DAYS) < to ? addDays(s, WINDOW_DAYS) : to;
      const res = await page.evaluate(async ({ api, o, d, s, e, pax }) => {
        const r = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json", "Channel-Code": "WPC" }, body: JSON.stringify({ tripRoute: [{ searchStartDate: s, searchEndDate: e, originAirport: o, destinationAirport: d }], passengers: [{ type: "ADT", count: String(pax) }] }) });
        const text = await r.text();
        try { return { status: r.status, json: JSON.parse(text) }; } catch { return { status: r.status, json: null, text: text.slice(0, 200) }; }
      }, { api: API, o: origin, d: destination, s, e, pax });
      const list: JejuLowFare[] = res.json?.data?.lowfares?.lowFareDateMarkets ?? [];
      if (res.json?.code !== "0000") throw new Error(`제주항공 응답 오류 (HTTP ${res.status}): ${JSON.stringify(res.json ?? res.text).slice(0, 200)}`);
      log(`${origin}→${destination} ${s}~${e}: ${list.length}일`);
      out.push(...list.map((x) => ({ ...x, pax })));
      await page.waitForTimeout(400);
    }
    return out;
  } finally {
    await browser.close();
  }
}

export function jejuToFares(list: JejuLowFare[], flightNo: string, origin: string, destination: string, opt: { from?: string; to?: string; today?: string } = {}): FareInput[] {
  const today = opt.today ?? todayKst();
  const from = (opt.from && opt.from > today ? opt.from : today).replace(/-/g, "");
  const to = (opt.to ?? "9999-12-31").replace(/-/g, "");
  const seen = new Set<string>();
  const out: FareInput[] = [];
  for (const x of list) {
    const d = x.cvtDepartureDate;
    if (!/^\d{8}$/.test(d) || d < from || d > to || seen.has(d)) continue;
    seen.add(d);
    const amount = !x.noFlights && x.lowestFareAmount ? Math.round((x.lowestFareAmount.fareAmount ?? 0) + (x.lowestFareAmount.taxesAndFeesAmount ?? 0)) : 0;
    // noFlights = 운항 없음. 운항은 있는데 금액 0 이면 해당 인원이 함께 탈 좌석이 없는 것(마감)
    const status = amount > 0 ? "ok" : x.noFlights ? "no_flight" : "sold_out";
    out.push({
      flightNo, origin, destination, date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
      fareKrw: amount > 0 ? amount : null, status, source: "crawler",
      meta: { provider: "jejuair-lowfare", pax: x.pax, fare: x.lowestFareAmount?.fareAmount, tax: x.lowestFareAmount?.taxesAndFeesAmount, isHoliday: x.isHoliday, note: status === "ok" ? undefined : status === "no_flight" ? "최저가 달력 운항없음" : `${x.pax ?? 1}인 동시 예약 가능 좌석 없음(마감)` },
    });
  }
  return out;
}

/** 노선 설정 하나(왕복 편명)를 from~to 기간에 대해 수집 */
export async function crawlJejuRoute(route: RouteConfig, from: string, to: string, opts: FetchOptions = {}): Promise<FareInput[]> {
  const out = await fetchJejuLowFares(route.departure, route.arrival, from, to, opts);
  const back = await fetchJejuLowFares(route.arrival, route.departure, from, to, opts);
  return [...jejuToFares(out, route.outboundFlightNo, route.departure, route.arrival, { from, to }), ...jejuToFares(back, route.returnFlightNo, route.arrival, route.departure, { from, to })];
}
