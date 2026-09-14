import type { GolfCourse, Hotel, MoneyOrLabel, Product, QuoteContext, QuoteRow, RowOverride, Weekday } from "@/types";
import { addDays, dayTypeOf, eachDate, inRange, monthKey, weekdayLabel, weekdayOf } from "./date";

export const fareKey = (flightNo: string, date: string) => `${flightNo}_${date}`;

/** 요일별 1박 단가(시즌 구간 우선) */
export function hotelNightRate(hotel: Hotel, date: string): number {
  const w = weekdayOf(date);
  for (const s of hotel.seasons ?? []) {
    if (inRange(date, s.from, s.to) && s.rates[w] != null) return s.rates[w] as number;
  }
  return hotel.nightlyRates[w] ?? 0;
}

/** 골프장 기간표에서 해당 일자·요일타입 그린피 */
export function golfRate(course: GolfCourse, date: string, holidays: Set<string>): number {
  const type = dayTypeOf(date, holidays);
  const period = course.periods.find((p) => inRange(date, p.from, p.to)) ?? course.periods[0];
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

export function computeRow(product: Product, ctx: QuoteContext, date: string): QuoteRow {
  const ov: RowOverride = product.overrides[date] ?? {};
  const nights = product.nights;
  const returnDate = addDays(date, nights);

  // 숙박: 체크인일부터 nights박, 요일별 단가 합
  const hotelNights = Array.from({ length: nights }, (_, i) => {
    const d = addDays(date, i);
    return { date: d, weekday: weekdayOf(d), jpy: ctx.hotel ? hotelNightRate(ctx.hotel, d) : 0 };
  });
  const hotelJpy = ov.hotelJpy ?? hotelNights.reduce((a, n) => a + n.jpy, 0);

  // 골프: 일자별 홀수 > 0 인 날 라운드, 골프장 순환 배정, 홀수 비례
  const golfRounds: QuoteRow["breakdown"]["golfRounds"] = [];
  let roundIdx = 0;
  product.golfPlan.forEach((holes, dayOffset) => {
    if (!holes) return;
    const d = addDays(date, dayOffset);
    const course = ctx.courses.length ? ctx.courses[roundIdx % ctx.courses.length] : null;
    const base = course ? golfRate(course, d, ctx.holidays) : 0;
    const jpy = ceil((base * holes) / (course?.holes || 18));
    golfRounds.push({ date: d, weekday: weekdayOf(d), dayType: dayTypeOf(d, ctx.holidays), courseId: course?.id ?? "", courseName: course?.name ?? "-", holes, jpy });
    roundIdx++;
  });
  const golfJpy = ov.golfJpy ?? golfRounds.reduce((a, r) => a + r.jpy, 0);

  const vehicleKrw = ov.vehicleKrw ?? ctx.vehicle?.feesByWeekday[weekdayOf(date)] ?? 0;
  const airSurchargeKrw = ov.airSurchargeKrw ?? 0;

  // 항공(인디비): 크롤링 운임 → 없으면 미정
  const outFare = ctx.fares.get(fareKey(product.outbound.flightNo, date));
  const inFare = ctx.fares.get(fareKey(product.inbound.flightNo, returnDate));
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

  const costIndiv: number | "미정" | "마감" = isNum(airIndiv) ? airIndiv + hotelKrw + golfKrw + vehicleKrw + airSurchargeKrw : airIndiv;
  const costGroup = isNum(airGroup) ? airGroup + hotelKrw + golfKrw + vehicleKrw : "미정";
  const sales = (cost: number | "미정" | "마감") => product.margins.map((m) => (isNum(cost) ? cost / (1 - m) : cost));

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
    airSurchargeKrw,
    costIndiv,
    costGroup,
    salesIndiv: sales(costIndiv),
    salesGroup: sales(costGroup),
    override: ov,
    breakdown: { hotelNights, golfRounds, fareMissing },
  };
}

export function computeQuote(product: Product, ctx: QuoteContext): QuoteRow[] {
  return [...eachDate(product.dateFrom, product.dateTo)].filter((d) => !product.overrides[d]?.hidden).map((d) => computeRow(product, ctx, d));
}

/** 크롤링이 필요한 (편명, 날짜) 목록 — 운임이 없거나 미정인 것 */
export function missingFares(product: Product, ctx: QuoteContext): { flightNo: string; origin: string; destination: string; date: string }[] {
  const out: { flightNo: string; origin: string; destination: string; date: string }[] = [];
  for (const d of eachDate(product.dateFrom, product.dateTo)) {
    const ov = product.overrides[d] ?? {};
    if (ov.hidden) continue;
    const r = addDays(d, product.nights);
    const o = ctx.fares.get(fareKey(product.outbound.flightNo, d));
    const i = ctx.fares.get(fareKey(product.inbound.flightNo, r));
    if (ov.outboundFare == null && (!o || o.status === "unknown")) out.push({ ...pick(product.outbound), date: d });
    if (ov.inboundFare == null && (!i || i.status === "unknown")) out.push({ ...pick(product.inbound), date: r });
  }
  return out;
}
const pick = (l: { flightNo: string; origin: string; destination: string }) => ({ flightNo: l.flightNo, origin: l.origin, destination: l.destination });

export const golfPlanLabel = (plan: number[]) => `${plan.map((h) => `${h}H`).join("+")}=${plan.reduce((a, b) => a + b, 0)}홀`;
export const roundsCount = (plan: number[]) => plan.filter(Boolean).length;
export type { Weekday };
