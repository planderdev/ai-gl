/**
 * 제주항공 홈페이지 운임 크롤러 (핵심 로직).
 * - 예약 위젯의 **왕복 최저가 달력**이 쓰는 `POST https://sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendar.json`
 *   form body `lowestFareCalendar=<JSON>&pageId=…`, 헤더 Channel-Code: WPC
 *   JSON {tripRoute:[{searchStartDate:"YYYY-MM-01", originAirport, destinationAirport}, {…반대 방향}], passengers:[{type:"ADT",count:N}]}
 *   응답 data.lowfares = {currencyCode, includeTaxesAndFees, source, lowFareDateMarkets[]{origin, destination, cvtDepartureDate:"YYYYMMDD", noFlights, lowestFareAmount:{fareAmount, taxesAndFeesAmount}}}
 *   시작 달부터 두 달치가 두 방향 모두 **첫 구간 출발지(한국) 통화**로 온다. 총액 = fareAmount + taxesAndFeesAmount (성인 1인) — 사이트 달력 표시 금액과 같은 식.
 * - 편도로 조회하면(tripRoute 1개, 예전에 쓰던 …InPeriod.json 포함) 그 구간 출발 공항 통화로 내려와 일본 출발편이 엔화(JPY)다.
 *   그래서 귀국편도 한국 출발 왕복 기준 원화가 되도록 항상 2구간으로 묻고, 통화가 KRW 가 아니거나 세금이 빠진 응답은 금액을 저장하지 않는다(status unknown).
 * - 달력은 그날 **노선 최저가**라 편을 구분하지 못한다. 같은 노선에 편이 여럿이면(ICN–MYJ 오후편·조조편) 어느 편의 값인지 알 수 없고,
 *   실제로 편별 차이가 크다(2026-11-22 사이트 4인 조회: 12/4 MYJ→ICN 7C1722 183,100원 · 7C1704 298,600원, 12/5 는 7C1704 마감).
 *   그래서 편이 여럿인 노선은 금액을 운임으로 저장하지 않고(status unknown) meta.dayLowestKrw 에 참고값으로만 남긴다. 그날 전체가 마감·비운항이면 모든 편에 그대로 적용한다.
 *   편별 운임을 주는 예약 조회(AvailSearch.do, getAvailSchedule.json)는 봇 차단(Akamai) 대상이라 자동 수집하지 않는다.
 * - 헤드리스 Chrome 은 차단(에러 페이지)되므로 Chrome 창(headed) + 새 컨텍스트로 메인 화면을 연 뒤 페이지 안에서 호출한다.
 * - 짧은 시간에 여러 번 조회하면 이 달력 요청에도 봇 확인 페이지(HTTP 200 text/html, CORS 헤더 없음 → 페이지에서는 "Failed to fetch")가 내려온다.
 *   5초 간격으로 부르면 세 번째 호출에서 막혔다(2026-11-22) → 기본 간격 20초. 막히면 한 번만 쉬었다가 다시 시도한 뒤 그만둔다(state.rateLimited).
 *   확인 페이지를 풀거나 피해 가지 않는다 — 30분 이상 뒤에 로그가 알려 주는 달부터(--from) 이어서 실행한다.
 */
import type { FareInput } from "@/lib/fares/service";
import type { FetchOptions, RouteConfig } from "./airseoul";
import { DEFAULT_PAX, todayKst } from "./airseoul";

export interface JejuLowFare {
  origin: string; destination: string; cvtDepartureDate: string; noFlights: boolean; isHoliday?: boolean;
  lowestFareAmount?: { fareAmount: number; taxesAndFeesAmount: number } | null;
  /** 아래는 응답 머리(lowfares)와 조회 조건에서 옮겨 적는 값 */
  pax?: number; currency?: string; includesTax?: boolean; cache?: string;
}
/**
 * ICN–MYJ 하루 2편(2026-11-22 예약 화면에서 확인).
 *  오후편: 7C1703 ICN 13:05→MYJ 14:40 / 7C1704 MYJ 15:40→ICN 17:35 — 예전 설정은 두 편명의 방향이 뒤바뀌어 있었다
 *  조조편: 7C1721 ICN 07:00→MYJ 08:35 / 7C1722 MYJ 09:35→ICN 11:20
 */
export const JEJUAIR_ROUTES: RouteConfig[] = [
  { departure: "ICN", arrival: "MYJ", outboundFlightNo: "7C1703", returnFlightNo: "7C1704" },
  { departure: "ICN", arrival: "MYJ", outboundFlightNo: "7C1721", returnFlightNo: "7C1722" },
];
export const JEJUAIR_PACE_MS = Number(process.env.JEJUAIR_PACE_MS || 20_000);
const RETRY_WAIT_MS = [60_000];
export class JejuBlockedError extends Error { constructor(m = "제주항공이 달력 조회를 막았습니다(봇 확인 페이지 응답 — 요청 빈도 제한). 30분 이상 지난 뒤 다시 실행하세요. 바로 다시 시도하면 더 오래 막힐 수 있습니다") { super(m); this.name = "JejuBlockedError"; } }
const MAIN = "https://www.jejuair.net/ko/main/base/index.do";
const API = "https://sec.jejuair.net/ko/ibe/booking/searchlowestFareCalendar.json";

const iso = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
const monthStart = (d: string) => `${d.slice(0, 7)}-01`;
const addMonths = (ym01: string, n: number) => { const t = Number(ym01.slice(0, 4)) * 12 + Number(ym01.slice(5, 7)) - 1 + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}-01`; };

type Page = import("playwright").Page;
interface CalendarResponse { status: number; error?: string; json?: { code?: string; message?: string; data?: { lowfares?: { currencyCode?: string; includeTaxesAndFees?: boolean; source?: string; lowFareDateMarkets?: JejuLowFare[] } } } | null; text?: string }

/** 왕복(origin→destination, destination→origin) 달력을 from~to 가 들어가는 달만큼 두 달 단위로 조회 */
export async function fetchJejuCalendar(page: Page, origin: string, destination: string, from: string, to: string, opts: FetchOptions = {}): Promise<JejuLowFare[]> {
  const log = opts.log ?? (() => {});
  const pace = opts.paceMs ?? JEJUAIR_PACE_MS;
  const pax = Math.min(9, Math.max(1, Math.round(opts.pax ?? DEFAULT_PAX)));
  const byKey = new Map<string, JejuLowFare>();
  // 사이트 스크립트의 화면 id(전역 let 이라 window 에는 없다). 달력 요청에 그대로 실어 보낸다
  const pageId = await page.evaluate("typeof pageId !== 'undefined' ? String(pageId) : ''").catch(() => "") as string;
  for (let s = monthStart(from); s <= to; ) {
    const body = { tripRoute: [{ searchStartDate: s, originAirport: origin, destinationAirport: destination }, { searchStartDate: s, originAirport: destination, destinationAirport: origin }], passengers: [{ type: "ADT", count: pax }] };
    let res: CalendarResponse = { status: 0 };
    for (let attempt = 0; ; attempt++) {
      res = await page.evaluate(async ({ api, body, pageId }) => {
        try {
          const r = await fetch(api, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "Channel-Code": "WPC" }, body: new URLSearchParams({ lowestFareCalendar: JSON.stringify(body), pageId }).toString() });
          const text = await r.text();
          try { return { status: r.status, json: JSON.parse(text) }; } catch { return { status: r.status, json: null, text: text.slice(0, 200) }; }
        } catch (e) { return { status: 0, error: String((e as Error).message) }; }
      }, { api: API, body, pageId }) as CalendarResponse;
      if (res.json?.code === "0000") break;
      const why = res.status ? `HTTP ${res.status} ${JSON.stringify(res.json ?? res.text).slice(0, 160)}` : `요청 실패(${res.error ?? "응답 없음"})`;
      if (attempt >= RETRY_WAIT_MS.length) {
        // 응답을 못 읽거나(status 0) JSON 이 아니면 봇 확인 페이지로 막힌 것 → 빈도 제한으로 알린다
        const blocked = !res.status || !res.json;
        if (blocked && opts.state) opts.state.rateLimited = true;
        // 처음부터 막히면 오류로 알리고, 일부라도 받았으면 받은 달까지만 돌려준다(못 받은 날짜는 저장하지 않아 기존 값이 남는다)
        if (!byKey.size) throw blocked ? new JejuBlockedError() : new Error(`제주항공 달력 응답 오류 ${origin}⇄${destination} ${s.slice(0, 7)}: ${why}`);
        log(`${origin}⇄${destination} ${s.slice(0, 7)}: ${why} — 여기서 중단, ${byKey.size}건까지만 반환 (나머지는 30분 이상 뒤 --from ${s} 로 이어서)`);
        return [...byKey.values()];
      }
      log(`${origin}⇄${destination} ${s.slice(0, 7)}: ${why} — ${RETRY_WAIT_MS[attempt] / 1000}초 쉬고 다시 시도`);
      await page.waitForTimeout(RETRY_WAIT_MS[attempt]);
    }
    const lf = res.json?.data?.lowfares;
    const list = (lf?.lowFareDateMarkets ?? []).filter((x) => /^\d{8}$/.test(x.cvtDepartureDate ?? ""));
    for (const x of list) byKey.set(`${x.origin}_${x.destination}_${x.cvtDepartureDate}`, { ...x, pax, currency: lf?.currencyCode, includesTax: lf?.includeTaxesAndFees, cache: lf?.source });
    const last = list.reduce((m, x) => (x.cvtDepartureDate > m ? x.cvtDepartureDate : m), "");
    log(`${origin}⇄${destination} ${s.slice(0, 7)}~: ${list.length}건${last ? ` (~${iso(last)})` : " (결과 없음)"} · 통화 ${lf?.currencyCode ?? "-"} · 세금 ${lf?.includeTaxesAndFees ? "포함" : "미포함"}`);
    // 응답은 보통 시작 달 + 다음 달. 받은 마지막 달의 다음 달부터 이어서 조회한다
    const covered = last ? monthStart(iso(last)) : s;
    s = addMonths(covered > s ? covered : s, 1);
    if (s <= to) await page.waitForTimeout(pace);
  }
  return [...byKey.values()];
}

/**
 * 달력 → 한 방향(origin→destination)의 편명별 운임 입력값.
 * flightNos 가 하나면 달력 최저가 = 그 편의 운임(총액)으로 저장한다.
 * 둘 이상이면 어느 편의 값인지 알 수 없으므로 금액은 저장하지 않고(status unknown) meta.dayLowestKrw·meta.basis = "day-lowest" 로만 남긴다.
 */
export function jejuToFares(list: JejuLowFare[], flightNos: string | string[], origin: string, destination: string, opt: { from?: string; to?: string; today?: string } = {}): FareInput[] {
  const flights = [...new Set(Array.isArray(flightNos) ? flightNos : [flightNos])];
  const today = opt.today ?? todayKst();
  const from = (opt.from && opt.from > today ? opt.from : today).replace(/-/g, "");
  const to = (opt.to ?? "9999-12-31").replace(/-/g, "");
  const shared = flights.length > 1;
  const seen = new Set<string>();
  const out: FareInput[] = [];
  for (const x of list) {
    const d = x.cvtDepartureDate;
    if ((x.origin && x.origin !== origin) || (x.destination && x.destination !== destination)) continue;
    if (!/^\d{8}$/.test(d) || d < from || d > to || seen.has(d)) continue;
    seen.add(d);
    const fare = x.lowestFareAmount?.fareAmount ?? 0;
    const tax = x.lowestFareAmount?.taxesAndFeesAmount ?? 0;
    const pax = x.pax ?? 1;
    // 사이트 달력과 같은 판정: noFlights = 비운항, 금액 없음 = 해당 인원이 함께 탈 좌석 없음(마감)
    let status: FareInput["status"] = x.noFlights ? "no_flight" : fare > 0 ? "ok" : "sold_out";
    let note: string | undefined = status === "no_flight" ? "최저가 달력 운항없음" : status === "sold_out" ? `${pax}인 동시 예약 가능 좌석 없음(마감)` : undefined;
    if (status === "ok" && x.currency !== "KRW") { status = "unknown"; note = `원화가 아닌 응답(${x.currency ?? "통화 미상"} ${fare}+${tax}) — 원화 총액을 알 수 없어 저장하지 않음`; }
    else if (status === "ok" && (x.includesTax === false || tax <= 0)) { status = "unknown"; note = `세금·유류할증이 빠진 응답(기본운임 ${fare}) — 총액을 알 수 없어 저장하지 않음`; }
    const total = status === "ok" ? Math.round(fare + tax) : null;
    // 편이 여럿이면 최저가가 어느 편 것인지 모른다 → 운임으로 쓰지 않고 참고값으로만 남긴다
    const dayLowestKrw = shared && total != null ? total : undefined;
    if (dayLowestKrw != null) { status = "unknown"; note = `그날 노선 최저가 ${dayLowestKrw.toLocaleString("ko-KR")}원(${flights.join("·")} 중 어느 편인지 구분 불가) — 이 편은 더 비싸거나 마감일 수 있어 운임으로 저장하지 않음`; }
    for (const flightNo of flights) {
      out.push({
        flightNo, origin, destination, date: iso(d),
        fareKrw: status === "ok" ? total : null, status, source: "crawler",
        meta: { provider: "jejuair-lowfare-rt", pax, currency: x.currency, fare: x.lowestFareAmount?.fareAmount, tax: x.lowestFareAmount?.taxesAndFeesAmount, basis: shared ? "day-lowest" : undefined, dayLowestKrw, sharedFlights: shared ? flights : undefined, isHoliday: x.isHoliday, cache: x.cache, note },
      });
    }
  }
  return out;
}

/** 여러 노선을 Chrome 창 하나로 수집. 같은 공항 쌍의 노선(오후편·조조편)은 달력을 한 번만 조회한다 */
export async function crawlJejuRoutes(routes: RouteConfig[], from: string, to: string, opts: FetchOptions = {}): Promise<FareInput[]> {
  const log = opts.log ?? (() => {});
  const pairs = new Map<string, RouteConfig[]>();
  for (const r of routes) pairs.set(`${r.departure}-${r.arrival}`, [...(pairs.get(`${r.departure}-${r.arrival}`) ?? []), r]);
  if (!pairs.size) return [];
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
    log(`기준 인원 ${Math.min(9, Math.max(1, Math.round(opts.pax ?? DEFAULT_PAX)))}명 · 왕복 달력(양방향 원화)`);
    const out: FareInput[] = [];
    let first = true;
    for (const rs of pairs.values()) {
      if (!first) await page.waitForTimeout(opts.paceMs ?? JEJUAIR_PACE_MS);
      first = false;
      const { departure, arrival } = rs[0];
      const cal = await fetchJejuCalendar(page, departure, arrival, from, to, opts);
      out.push(...jejuToFares(cal, rs.map((r) => r.outboundFlightNo), departure, arrival, { from, to }), ...jejuToFares(cal, rs.map((r) => r.returnFlightNo), arrival, departure, { from, to }));
    }
    return out;
  } finally {
    await browser.close();
  }
}

/** 노선 하나 수집. 같은 공항 쌍에 등록된 다른 편(JEJUAIR_ROUTES)도 함께 돌려준다 — 편이 여럿인 노선인지 알아야 달력 값을 운임으로 써도 되는지 판단할 수 있다 */
export function crawlJejuRoute(route: RouteConfig, from: string, to: string, opts: FetchOptions = {}): Promise<FareInput[]> {
  const siblings = JEJUAIR_ROUTES.filter((r) => r.departure === route.departure && r.arrival === route.arrival && (r.outboundFlightNo !== route.outboundFlightNo || r.returnFlightNo !== route.returnFlightNo));
  return crawlJejuRoutes([route, ...siblings], from, to, opts);
}
