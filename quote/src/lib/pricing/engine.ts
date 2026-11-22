import type { FlightFare, GolfCourse, Hotel, MoneyOrLabel, Product, QuoteContext, QuoteRow, RowOverride, StaySpec, Weekday } from "@/types";
import { addDays, dayTypeOf, eachDate, inRange, monthKey, weekdayLabel, weekdayOf } from "./date";

export const fareKey = (flightNo: string, date: string) => `${flightNo}_${date}`;
export const routeKey = (origin: string, destination: string, date: string) => `${origin}_${destination}_${date}`;
const airlineOf = (flightNo: string) => flightNo.replace(/\d+$/, "").toUpperCase();
/** 설정 편명의 운임이 없으면 같은 항공사·노선·날짜의 운임(계절 편명 변경 등) 중 최저를 쓴다. exactOnly 면 설정 편명만 */
export function lookupFare(ctx: QuoteContext, leg: { flightNo: string; origin: string; destination: string }, date: string, exactOnly = false): FlightFare | undefined {
  const exact = ctx.fares.get(fareKey(leg.flightNo, date));
  if (exact || exactOnly) return exact;
  const alts = (ctx.routeFares?.get(routeKey(leg.origin, leg.destination, date)) ?? []).filter((f) => airlineOf(f.flightNo) === airlineOf(leg.flightNo));
  if (!alts.length) return undefined;
  const ok = alts.filter((f) => f.status === "ok" && f.fareKrw != null).sort((a, b) => (a.fareKrw ?? 0) - (b.fareKrw ?? 0));
  return ok[0] ?? alts[0];
}
export function buildRouteIndex(fares: Iterable<FlightFare>): Map<string, FlightFare[]> {
  const m = new Map<string, FlightFare[]>();
  for (const f of fares) { const k = routeKey(f.origin, f.destination, f.date); m.set(k, [...(m.get(k) ?? []), f]); }
  return m;
}

/** 1박 단가: 일자별 요금 → 시즌 구간 → 요일 단가 순 */
export function hotelNightRate(hotel: Hotel, date: string): number {
  const byDate = hotel.dateRates?.[date];
  if (byDate != null) return byDate;
  const w = weekdayOf(date);
  for (const s of hotel.seasons ?? []) {
    if (inRange(date, s.from, s.to) && s.rates[w] != null) return s.rates[w] as number;
  }
  return hotel.nightlyRates[w] ?? 0;
}

/**
 * 골프장 기간표에서 해당 일자·요일타입 그린피.
 * 스타일을 지정하면 그 스타일 행만, 지정하지 않으면 스타일 없는 행만 본다(없으면 전체).
 */
export function golfRate(course: GolfCourse, date: string, holidays: Set<string>, style?: string): number {
  const type = dayTypeOf(date, holidays);
  const styled = style ? course.periods.filter((p) => p.style === style) : [];
  const plain = course.periods.filter((p) => !p.style);
  const pool = styled.length ? styled : plain.length ? plain : course.periods;
  const period = pool.find((p) => inRange(date, p.from, p.to)) ?? pool[0];
  if (!period) return 0;
  const v = period[type] ?? (type === "holiday" ? period.weekend : null) ?? period.weekday ?? 0;
  return v ?? 0;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ceil = (n: number) => Math.round(n);

function sumOrLabel(parts: (MoneyOrLabel | null | undefined)[]): number | "미정" {
  let total = 0;
  for (const p of parts) {
    if (p == null) continue; // 빈칸은 0 취급(엑셀 SUM과 동일)
    if (!isNum(p)) return "미정";
    total += p;
  }
  return total;
}

/** 숙박 구성: stays 가 없으면 대표 호텔에서 전체 박수 */
export const staysOf = (p: Pick<Product, "stays" | "hotelId" | "nights">): StaySpec[] => (p.stays?.length ? p.stays : [{ hotelId: p.hotelId, nights: p.nights }]);

/** 판매가 표기 → 원. "84,9"·"84.9" = 84.9만원, "849,000"·"849000" = 원 그대로 */
export function parseSalePrice(text: string | undefined | null): number | null {
  const t = (text ?? "").replace(/\s|원|만/g, "");
  if (!t) return null;
  if (/^\d{1,4}[,.]\d$/.test(t)) return Math.round(Number(t.replace(",", ".")) * 10000);
  if (/^\d{1,3}(,\d{3})+$/.test(t) || /^\d{5,}$/.test(t)) return Number(t.replace(/,/g, ""));
  if (/^\d{1,4}$/.test(t)) return Number(t) * 10000;
  return null;
}

export function computeRow(product: Product, ctx: QuoteContext, date: string): QuoteRow {
  const ov: RowOverride = product.overrides[date] ?? {};
  const nights = product.nights;
  const returnDate = addDays(date, nights);
  const land = product.saleType === "land";

  // 숙박: 체크인일부터 숙박 구성 순서대로 1박씩, 호텔별 그날 단가 합
  const hotelNights: QuoteRow["breakdown"]["hotelNights"] = [];
  for (const st of staysOf(product)) {
    const h = ctx.hotelsById?.get(st.hotelId) ?? (ctx.hotel && (ctx.hotel.id === st.hotelId || !product.stays?.length) ? ctx.hotel : null);
    for (let k = 0; k < st.nights; k++) {
      const d = addDays(date, hotelNights.length);
      hotelNights.push({ date: d, weekday: weekdayOf(d), jpy: h ? hotelNightRate(h, d) : 0, hotelId: st.hotelId, hotelName: h?.name ?? "-" });
    }
  }
  const hotelJpy = ov.hotelJpy ?? hotelNights.reduce((a, n) => a + n.jpy, 0);

  // 골프: 일자별 홀수 > 0 인 날 라운드, 골프장 순환 배정, 홀수 비례
  const golfRounds: QuoteRow["breakdown"]["golfRounds"] = [];
  let roundIdx = 0;
  product.golfPlan.forEach((holes, dayOffset) => {
    if (!holes) return;
    const d = addDays(date, dayOffset);
    const slot = ctx.courses.length ? roundIdx % ctx.courses.length : 0;
    const course = ctx.courses.length ? ctx.courses[slot] : null;
    const style = product.golfStyles?.[slot] || undefined;
    const base = course ? golfRate(course, d, ctx.holidays, style) : 0;
    const jpy = ceil((base * holes) / (course?.holes || 18));
    golfRounds.push({ date: d, weekday: weekdayOf(d), dayType: dayTypeOf(d, ctx.holidays), courseId: course?.id ?? "", courseName: course?.name ?? "-", holes, jpy, style });
    roundIdx++;
  });
  const golfJpy = ov.golfJpy ?? golfRounds.reduce((a, r) => a + r.jpy, 0);

  const vehicleKrw = ov.vehicleKrw ?? ctx.vehicle?.feesByWeekday[weekdayOf(date)] ?? 0;
  const airSurchargeKrw = ov.airSurchargeKrw ?? 0;

  // 항공(인디비): 크롤링 운임 → 없으면 미정. 현지착은 참고용이라 설정 편명의 운임만 보여 준다
  const outFare = lookupFare(ctx, product.outbound, date, land);
  const inFare = lookupFare(ctx, product.inbound, returnDate, land);
  const toLabel = (f: typeof outFare): MoneyOrLabel | null =>
    !f ? null : f.status === "no_flight" ? "운항없음" : f.status === "sold_out" ? "마감" : f.status === "unknown" || f.fareKrw == null ? "미정" : f.fareKrw;
  const outboundFare = ov.outboundFare ?? toLabel(outFare);
  const inboundFare = ov.inboundFare ?? toLabel(inFare);
  const fareMissing = outboundFare == null || inboundFare == null;
  const airIndiv: number | "미정" | "마감" = ov.soldOut ? "마감" : ov.airIndivKrw ?? (fareMissing || outboundFare === "마감" || inboundFare === "마감" ? (outboundFare === "마감" || inboundFare === "마감" ? "마감" : "미정") : sumOrLabel([outboundFare, inboundFare]));

  // 항공(그룹): 그룹가(날짜별 입력) + 유택(월별)
  const groupFare = product.groupFares[date] ?? null;
  const groupTax = product.groupTaxByMonth[monthKey(date)] ?? null;
  const airGroup = groupFare == null ? "미정" : sumOrLabel([groupFare, groupTax]);

  const rate = product.exchangeRate;
  const hotelKrw = hotelJpy * rate;
  const golfKrw = golfJpy * rate;
  const extras = (product.extras ?? []).map((e) => ({ label: e.label, krw: (e.krw ?? 0) + (e.jpy ?? 0) * rate }));
  const extrasKrw = ov.extrasKrw ?? extras.reduce((a, e) => a + e.krw, 0);

  // 현지착은 항공을 원가에서 뺀다(지상비만). 항공 포함은 인디비·그룹 두 가지 원가
  const landCost = hotelKrw + golfKrw + vehicleKrw + extrasKrw;
  const costIndiv: number | "미정" | "마감" = land ? landCost : isNum(airIndiv) ? airIndiv + landCost + airSurchargeKrw : airIndiv;
  const costGroup = land ? landCost : isNum(airGroup) ? airGroup + landCost : "미정";
  const sales = (cost: number | "미정" | "마감") => product.margins.map((m) => (isNum(cost) ? cost / (1 - m) : cost));
  const salePriceKrw = parseSalePrice(ov.directSalePrice);
  const saleMargin = salePriceKrw && isNum(costIndiv) ? 1 - costIndiv / salePriceKrw : null;

  return {
    date,
    weekday: weekdayOf(date),
    weekdayLabel: weekdayLabel(date),
    returnDate,
    outboundFare,
    inboundFare,
    groupFare,
    groupTax,
    airIndiv,
    airGroup,
    hotelJpy,
    hotelKrw,
    golfJpy,
    golfKrw,
    vehicleKrw,
    extrasKrw,
    airSurchargeKrw,
    costIndiv,
    costGroup,
    salesIndiv: sales(costIndiv),
    salesGroup: sales(costGroup),
    salePriceKrw,
    saleMargin,
    override: ov,
    breakdown: { hotelNights, golfRounds, extras, fareMissing },
  };
}

export function computeQuote(product: Product, ctx: QuoteContext): QuoteRow[] {
  return [...eachDate(product.dateFrom, product.dateTo)].filter((d) => !product.overrides[d]?.hidden).map((d) => computeRow(product, ctx, d));
}

/** 크롤링이 필요한 (편명, 날짜) 목록 — 운임이 없거나 미정인 것. 현지착은 항공이 원가에 없으므로 비어 있다 */
export function missingFares(product: Product, ctx: QuoteContext): { flightNo: string; origin: string; destination: string; date: string }[] {
  const out: { flightNo: string; origin: string; destination: string; date: string }[] = [];
  if (product.saleType === "land") return out;
  for (const d of eachDate(product.dateFrom, product.dateTo)) {
    const ov = product.overrides[d] ?? {};
    if (ov.hidden) continue;
    const r = addDays(d, product.nights);
    const o = lookupFare(ctx, product.outbound, d);
    const i = lookupFare(ctx, product.inbound, r);
    if (ov.outboundFare == null && (!o || o.status === "unknown")) out.push({ ...pick(product.outbound), date: d });
    if (ov.inboundFare == null && (!i || i.status === "unknown")) out.push({ ...pick(product.inbound), date: r });
  }
  return out;
}
const pick = (l: { flightNo: string; origin: string; destination: string }) => ({ flightNo: l.flightNo, origin: l.origin, destination: l.destination });

export const golfPlanLabel = (plan: number[]) => `${plan.map((h) => `${h}H`).join("+")}=${plan.reduce((a, b) => a + b, 0)}홀`;
export const roundsCount = (plan: number[]) => plan.filter(Boolean).length;
export type { Weekday };
