/**
 * 진에어 홈페이지 운임 크롤러.
 * - Cloudflare 매니지드 챌린지가 있어 Chrome 창(headed) + 자동화 흔적 제거 옵션으로 연다(헤드리스 불가).
 * - 예약 화면에서 편도·성인 N명으로 "항공권 조회"를 한 번 실행해 세션(CSRF, NetFunnel)을 만든 뒤,
 *   결과 페이지 안에서 `POST /booking/getAirAvailabilityJson` 을 날짜·노선별로 호출한다(헤더 X-CSRF-TOKEN 필수).
 *   응답 tripInfo[].segmentInfo[] 에 편명·시각, pricingInfo[] 에 성인 1인 운임(appliedFare)+세금(tax)이 온다 → 최저 총액 저장.
 * - 편이 조회되지 않으면 `GET /booking/bestfares`(1인 최저가 캐시, 기준일 ±10일)에 값이 있는지 보고
 *   있으면 "해당 인원 좌석 없음(마감)", 없으면 운항없음으로 기록한다.
 */
import type { FareInput } from "@/lib/fares/service";
import { DEFAULT_PAX, type FetchOptions, type RouteConfig } from "./airseoul";
import { addDays, eachDate } from "@/lib/pricing/date";

export const JINAIR_ROUTES: RouteConfig[] = [
  { departure: "ICN", arrival: "KKJ", outboundFlightNo: "LJ349", returnFlightNo: "LJ350" },
  { departure: "ICN", arrival: "TAK", outboundFlightNo: "LJ359", returnFlightNo: "LJ360" },
];
const HOME = "https://www.jinair.com/booking/index";

interface Seg { flightNm: string; departureTime: string; arrivalTime: string; departureAirportCode: string; arrivalAirportCode: string; aircraft?: string; segmentAvailability?: { seatAvailablity: number; inventoryStatus: string; fareTypeNm: string; appliedFareAmount: number; taxAmount: number }[] }
interface AvailJson { errorCode?: string | null; errorMsg?: string | null; result?: { originDestinationInfo?: { tripInfo?: { segmentInfo: Seg[] }[]; pricingInfo?: { paxPricingInfo: { fareType: string; appliedFare: { amount: number }; tax: { amount: number } }[] }[]; bestFareInfo?: { flightDate: string; bestFare: number }[] }[] } }

const waitCf = async (page: import("playwright").Page, log: (m: string) => void) => {
  for (let i = 0; i < 90; i++) { const t = await page.title().catch(() => ""); if (t && !/moment|잠시|Attention/i.test(t)) return; await page.waitForTimeout(1000); }
  log(`Cloudflare 통과 실패: ${await page.title().catch(() => "")}`);
  throw new Error("진에어 Cloudflare 챌린지를 통과하지 못했습니다(Chrome 창 모드로 다시 시도)");
};

export async function crawlJinRoute(route: RouteConfig, from: string, to: string, opts: FetchOptions = {}): Promise<FareInput[]> {
  const log = opts.log ?? (() => {});
  const pax = Math.min(9, Math.max(1, Math.round(opts.pax ?? DEFAULT_PAX)));
  const { chromium } = await import("playwright");
  const headless = opts.headed === false;
  const browser = await chromium.launch({ channel: "chrome", headless, ignoreDefaultArgs: ["--enable-automation"], args: ["--disable-blink-features=AutomationControlled"] }).catch(async (e) => { log(`설치된 Chrome 실행 실패(${(e as Error).message.split("\n")[0]}) → 번들 Chromium 시도`); return chromium.launch({ headless, ignoreDefaultArgs: ["--enable-automation"], args: ["--disable-blink-features=AutomationControlled"] }); });
  const out: FareInput[] = [];
  try {
    const ctx = await browser.newContext({ locale: "ko-KR", viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript("Object.defineProperty(navigator, 'webdriver', { get: () => undefined });");
    const page = await ctx.newPage();
    log(`open ${HOME} (기준 인원 ${pax}명)`);
    await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: opts.timeoutMs ?? 60_000 });
    await waitCf(page, log);
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // 1) 편도·성인 pax 로 조회 1회 → 세션 확보 (챌린지 직후 리다이렉트로 goto 가 끊기면 재시도)
    const first = from.replace(/-/g, "");
    const itin = `https://www.jinair.com/booking/itinerary/index?origin1=${route.departure}&destination1=${route.arrival}&travelDate1=${first}&tripType=OW`;
    for (let attempt = 1; ; attempt++) {
      try { await page.goto(itin, { waitUntil: "domcontentloaded", timeout: 60_000 }); break; }
      catch (e) { if (attempt >= 4) throw e; log(`예약 화면 이동 재시도 ${attempt}: ${(e as Error).message.split("\n")[0]}`); await page.waitForTimeout(2500); }
    }
    await waitCf(page, log);
    await page.waitForTimeout(3500);
    await page.locator("#tabReservation button").filter({ hasText: "편도" }).first().click();
    await page.waitForTimeout(800);
    await page.locator(".personButton:visible").first().click();
    await page.waitForTimeout(600);
    for (let i = 1; i < pax; i++) { await page.evaluate("(() => { const b=[...document.querySelectorAll('button')].find(e => e.offsetParent && /plus/.test(e.getAttribute('onclick')||'') && /adultInput/.test(e.getAttribute('onclick')||'')); if (b) b.click(); })()"); await page.waitForTimeout(200); }
    await page.evaluate("(() => { const b=[...document.querySelectorAll('button')].find(e => e.offsetParent && /^확인$/.test((e.textContent||'').trim())); if (b) b.click(); })()");
    await page.waitForTimeout(500);
    await page.locator("button.preSearchBtn:visible").first().click();
    await page.waitForURL(/getAvailabilityList/, { timeout: 90_000 });
    await page.waitForTimeout(3000);
    log(`조회 세션 확보: ${page.url()}`);

    // 2) bestfares(1인 캐시) 창 단위 수집 — 좌석부족/운항없음 구분용
    const best = new Map<string, Map<string, number>>(); // routeKey → date(YYYYMMDD) → 1인 총액
    const loadBest = async (o: string, d: string) => {
      const key = o + d; const m = new Map<string, number>(); best.set(key, m);
      for (let base = addDays(from, 10); addDays(base, -10) <= to; base = addDays(base, 21)) {
        const txt = await page.evaluate(`fetch('/booking/bestfares?route=${key}&tripType=OW&journeyStart=KOR&currency=KRW&baseDate=${base.replace(/-/g, "")}').then(r => r.text())`) as string;
        try { for (const [k, v] of Object.entries(JSON.parse(txt) as Record<string, string>)) { const n = Number(String(v).replace(/[^\d]/g, "")); if (n) m.set(k, n); } } catch { /* ignore */ }
        await page.waitForTimeout(150);
      }
    };
    const csrf = await page.evaluate("document.querySelector('meta[name=_csrf]') && document.querySelector('meta[name=_csrf]').getAttribute('content')") as string | null;
    if (!csrf) throw new Error("CSRF 토큰을 찾지 못했습니다");
    const avail = (o: string, d: string, date: string) => page.evaluate(`fetch('/booking/getAirAvailabilityJson',{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Requested-With':'XMLHttpRequest','X-CSRF-TOKEN':'${csrf}','Accept':'application/json, text/javascript, */*; q=0.01'},body:JSON.stringify({searchType:'',origin1:'${o}',destination1:'${d}',travelDate1:'${date}',origin2:'',destination2:'',travelDate2:'',origin3:'',destination3:'',travelDate3:'',origin4:'',destination4:'',travelDate4:'',pointOfPurchase:'KR',adultPaxCount:'${pax}',childPaxCount:'0',infantPaxCount:'0',tripType:'OW',cpnNo:'',promoCode:'',refVal:'JINAIR',refPop:'',refChannel:'',refLang:''})}).then(r => r.text())`) as Promise<string>;

    for (const [o, d, defaultFlight] of [[route.departure, route.arrival, route.outboundFlightNo], [route.arrival, route.departure, route.returnFlightNo]] as const) {
      await loadBest(o, d);
      let ok = 0, closed = 0, none = 0, fail = 0;
      const flightsSeen = new Set<string>();
      for (const date of eachDate(from, to)) {
        const ymd = date.replace(/-/g, "");
        let j: AvailJson | null = null;
        try { j = JSON.parse(await avail(o, d, ymd)) as AvailJson; } catch { fail++; await page.waitForTimeout(800); continue; }
        const od = j.result?.originDestinationInfo?.[0];
        const trips = od?.tripInfo ?? [];
        if (!od || !trips.length) {
          const ref = best.get(o + d)?.get(ymd);
          out.push({ flightNo: defaultFlight, origin: o, destination: d, date, fareKrw: null, status: ref ? "sold_out" : "no_flight", source: "crawler", meta: { provider: "jinair-availability", pax, bestFare1pax: ref, note: ref ? `${pax}인 동시 예약 가능 좌석 없음(마감) · 1인 최저 ${ref.toLocaleString("ko-KR")}원` : "조회 결과 없음(운항없음)" } });
          ref ? closed++ : none++;
        } else {
          const priced = (od.pricingInfo ?? []).map((p) => p.paxPricingInfo[0]).filter(Boolean);
          const lowest = priced.length ? priced.reduce((a, b) => (a.appliedFare.amount + a.tax.amount <= b.appliedFare.amount + b.tax.amount ? a : b)) : null;
          for (const t of trips) {
            const seg = t.segmentInfo[0]; if (!seg) continue;
            flightsSeen.add(seg.flightNm);
            // 편이 여러 개면 세그먼트별 좌석 정보로 인원 이상 남은 최저 운임 계산, 없으면 pricingInfo 최저
            const classes = (seg.segmentAvailability ?? []).filter((c) => c.inventoryStatus !== "CC" && c.seatAvailablity >= pax);
            const segLow = classes.length ? classes.reduce((a, b) => (a.appliedFareAmount + a.taxAmount <= b.appliedFareAmount + b.taxAmount ? a : b)) : null;
            const total = segLow ? segLow.appliedFareAmount + segLow.taxAmount : lowest ? lowest.appliedFare.amount + lowest.tax.amount : 0;
            out.push({ flightNo: seg.flightNm, origin: o, destination: d, date, fareKrw: total > 0 ? Math.round(total) : null, status: total > 0 ? "ok" : "sold_out", source: "crawler",
              meta: { provider: "jinair-availability", pax, dep: seg.departureTime, arr: seg.arrivalTime, aircraft: seg.aircraft, fareType: segLow?.fareTypeNm ?? lowest?.fareType, fare: segLow?.appliedFareAmount ?? lowest?.appliedFare.amount, tax: segLow?.taxAmount ?? lowest?.tax.amount, seats: segLow?.seatAvailablity, bestFare1pax: best.get(o + d)?.get(ymd), note: total > 0 ? undefined : `${pax}인 좌석 없음(마감)` } });
            total > 0 ? ok++ : closed++;
          }
        }
        await page.waitForTimeout(250);
      }
      log(`${o}→${d}: 운임 ${ok} · 마감 ${closed} · 운항없음 ${none}${fail ? ` · 실패 ${fail}` : ""} · 편명 ${[...flightsSeen].join(",") || "-"}`);
    }
    return out;
  } finally {
    await browser.close();
  }
}
