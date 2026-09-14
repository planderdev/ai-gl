import ExcelJS from "exceljs";
import type { FlightFare, FlightLeg, GolfCourse, Hotel, MoneyOrLabel, Product, RowOverride, VehicleRule, Weekday, WeekdayRates } from "@/types";
import { addDays, dayTypeOf, eachDate, formatDate, weekdayOf } from "@/lib/pricing/date";
import { computeRow, fareKey } from "@/lib/pricing/engine";
import { JP_HOLIDAYS_DEFAULT } from "@/lib/masters/holidays";

/**
 * 기존 수작업 원가표(.xlsx) → 시스템 데이터로 변환.
 * - 시트당 상품 1개, 날짜 행 → 항공 운임(인디비)·그룹가·유택·수동 조정값
 * - E1~E3 = 요일별 1박 단가, N열 요일별 최빈값 = 차량+지원비 규칙
 * - 골프 그린피는 행 데이터에서 평일/주말 단가를 최소제곱으로 역산해 '패키지 그린피' 골프장으로 등록
 * - 규칙으로 재현되지 않는 셀만 overrides 로 보존 → 재출력 시 원본과 동일
 */
export interface ImportResult {
  hotel: Hotel;
  vehicle: VehicleRule;
  courses: GolfCourse[];
  products: Product[];
  fares: FlightFare[];
  exchangeRate: number;
  margins: number[];
  log: string[];
}

type CellV = ExcelJS.CellValue;
const num = (v: CellV): number | null => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "object" && v && "result" in v && typeof v.result === "number" ? v.result : null);
const str = (v: CellV): string => (v == null ? "" : typeof v === "object" && "richText" in v ? v.richText.map((t) => t.text).join("") : typeof v === "object" && "result" in v ? String(v.result ?? "") : String(v));
const isFormula = (v: CellV) => typeof v === "object" && v != null && "formula" in v;
const dateOf = (v: CellV): string | null => {
  if (v instanceof Date) return formatDate(new Date(Math.round(v.getTime() / 86400000) * 86400000));
  return null;
};
const label = (v: CellV): MoneyOrLabel | null => {
  const n = num(v);
  if (n != null) return n;
  const s = str(v).trim();
  if (s === "운항없음") return "운항없음";
  if (s === "미정") return "미정";
  if (s === "마감") return "마감";
  return null;
};
const argb = (c: ExcelJS.Cell) => {
  const f = c.fill as ExcelJS.FillPattern | undefined;
  return f?.type === "pattern" && f.fgColor?.argb ? f.fgColor.argb : null;
};
const fontArgb = (c: ExcelJS.Cell) => (c.font?.color as { argb?: string } | undefined)?.argb ?? null;
const mode = (xs: number[]) => { const m = new Map<number, number>(); xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0; };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");

function parseSchedule(s: string): { out: FlightLeg; in: FlightLeg } | null {
  const legs = [...s.matchAll(/([A-Z]{2}\d{2,4})\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g)].map((m) => ({ flightNo: m[1], dep: m[2], arr: m[3] }));
  if (legs.length < 2) return null;
  return { out: { ...legs[0], origin: "ICN", destination: "TAK" }, in: { ...legs[1], origin: "TAK", destination: "ICN" } };
}
const parsePlan = (s: string): number[] | null => { const m = s.match(/((?:\d+H\+?)+)=\d+홀/); return m ? m[1].split("+").map((x) => parseInt(x)) : null; };

/**
 * 평일 라운드 수 a, 주말·연휴 라운드 수 b, 합계 y 표본에서 1라운드 단가(평일 w, 주말 e)를 역산.
 * 최빈값 기반: 전부 평일인 행 → w, 전부 주말인 행 → e, 없으면 혼합 행에서 (y - a·w)/b 의 최빈값.
 */
function fitGolfRates(samples: { a: number; b: number; y: number }[]): { weekday: number; weekend: number } {
  const wk = samples.filter((s) => s.a > 0 && s.b === 0).map((s) => s.y / s.a);
  const we = samples.filter((s) => s.b > 0 && s.a === 0).map((s) => s.y / s.b);
  const w = wk.length ? mode(wk) : 0;
  let e = we.length ? mode(we) : 0;
  if (!e) { const mixed = samples.filter((s) => s.a > 0 && s.b > 0).map((s) => (s.y - s.a * w) / s.b); e = mixed.length ? mode(mixed) : w; }
  return { weekday: Math.round(w), weekend: Math.round(e) };
}

export async function importCostWorkbook(buf: ArrayBuffer | Buffer, opts: { region?: string; holidays?: string[] } = {}): Promise<ImportResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const region = opts.region ?? "다카마쓰";
  const holidays = new Set(opts.holidays ?? JP_HOLIDAYS_DEFAULT);
  const now = new Date().toISOString();
  const log: string[] = [];

  const costSheets = wb.worksheets.filter((ws) => str(ws.getCell("A5").value).trim() === "날짜");
  const golfSheet = wb.worksheets.find((ws) => /골프장.*요금표/.test(str(ws.getCell("A1").value)));
  if (!costSheets.length) throw new Error("원가표 시트를 찾지 못했습니다(A5='날짜' 인 시트 필요).");

  // 호텔·차량: 첫 시트 기준(모든 시트 동일 가정, 다르면 시트별 로그)
  const first = costSheets[0];
  // E1 평일(일~목) / E3 금·토 1박 단가 — 원가표 관행 (E2 는 E1 과 동일 값)
  const wkRate = num(first.getCell("E1").value) ?? 0, weRate = num(first.getCell("E3").value) ?? num(first.getCell("E2").value) ?? wkRate;
  const nightly: WeekdayRates = { 0: wkRate, 1: wkRate, 2: wkRate, 3: wkRate, 4: wkRate, 5: weRate, 6: weRate };
  const hotelName = (str(first.getCell("J5").value).split("\n")[0] || "호텔").replace(/\s*\d+박\s*$/, "").trim();
  const hotel: Hotel = { id: `hotel-${slug(hotelName)}`, name: hotelName, region, nightlyRates: nightly, memo: "원가표 E1~E3(1박 단가)에서 가져옴", updatedAt: now };

  const vehicleSamples: Record<Weekday, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const fares = new Map<string, FlightFare>();
  const exchangeRates: number[] = [];
  let margins: number[] = [];
  const courses: GolfCourse[] = [];
  const products: Product[] = [];

  for (const ws of costSheets) {
    const title = ws.name.trim().replace(/\s+/g, " ");
    const sched = parseSchedule(str(ws.getCell("A2").value));
    if (!sched) { log.push(`[${title}] 스케줄(A2) 파싱 실패 — 건너뜀`); continue; }
    const nights = parseInt(str(ws.getCell("A3").value)) || 2;
    const planText = [str(ws.getCell("L5").value), str(ws.getCell("F3").value), str(ws.getCell("H3").value)].find((t) => parsePlan(t)) ?? "";
    const golfPlan = parsePlan(planText) ?? Array.from({ length: nights + 1 }, (_, i) => (i < nights ? 18 : 0));
    const rate = parseFloat(str(ws.getCell("A4").value).replace(/[^\d.]/g, "")) || 9.2;
    exchangeRates.push(rate);
    const hdrMargins = [] as number[];
    ws.getRow(5).eachCell((c) => { const m = str(c.value).match(/인디비\s*수익\s*(\d+)\s*%/); if (m) hdrMargins.push(parseInt(m[1]) / 100); });
    if (hdrMargins.length) margins = hdrMargins;
    const legend = str(ws.getCell("Q3").value) || undefined;
    const hotelLabel = str(ws.getCell("J5").value) || undefined;

    type Raw = { date: string; ret: string; out: MoneyOrLabel | null; inn: MoneyOrLabel | null; grp: MoneyOrLabel | null; tax: MoneyOrLabel | null; hAir: number | null; soldOut: boolean; hotelJpy: number | null; golfJpy: number | null; veh: number | null; sur: number | null; spot: boolean; grpSpecial: boolean; insta?: string; memo?: string };
    const raws: Raw[] = [];
    for (let r = 6; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const date = dateOf(row.getCell(1).value);
      if (!date) continue;
      const ret = dateOf(row.getCell(4).value) ?? addDays(date, nights);
      const aCell = row.getCell(1), bCell = row.getCell(2);
      const spot = fontArgb(aCell) === "FFFF0000" || [argb(aCell), argb(bCell)].includes("FFFFFF00");
      const grpSpecial = [argb(row.getCell(6)), argb(row.getCell(9))].includes("FFFFFF00");
      const hv = row.getCell(8).value;
      const insta = [row.getCell(23).value].map(str).find(Boolean);
      const extra = [row.getCell(22).value, row.getCell(25).value].map(str).filter(Boolean).join(" / ");
      raws.push({
        date, ret,
        out: label(row.getCell(3).value), inn: label(row.getCell(5).value),
        grp: label(row.getCell(6).value), tax: label(row.getCell(7).value),
        hAir: !isFormula(hv) ? num(hv) : null, soldOut: str(hv).trim() === "마감",
        hotelJpy: num(row.getCell(11).value), golfJpy: num(row.getCell(13).value), veh: num(row.getCell(14).value), sur: num(row.getCell(15).value),
        spot, grpSpecial, insta: insta || undefined, memo: extra || undefined,
      });
    }
    if (!raws.length) { log.push(`[${title}] 데이터 행 없음`); continue; }

    // 항공 운임 수집(뒤 시트가 최신 → 덮어씀)
    for (const x of raws) {
      const put = (leg: FlightLeg, date: string, v: MoneyOrLabel | null) => {
        if (v == null || v === "미정") return;
        fares.set(fareKey(leg.flightNo, date), { id: fareKey(leg.flightNo, date), airline: leg.flightNo.replace(/\d+$/, ""), flightNo: leg.flightNo, origin: leg.origin, destination: leg.destination, date, fareKrw: typeof v === "number" ? v : null, status: typeof v === "number" ? "ok" : v === "마감" ? "sold_out" : "no_flight", source: "import", capturedAt: now, meta: { sheet: title } });
      };
      put(sched.out, x.date, x.out);
      put(sched.in, x.ret, x.inn);
    }
    for (const x of raws) if (x.veh != null) vehicleSamples[weekdayOf(x.date)].push(x.veh);

    // 골프 단가 역산 → 패키지 그린피 골프장
    const samples = raws.filter((x) => x.golfJpy != null).map((x) => {
      let a = 0, b = 0;
      golfPlan.forEach((h, i) => { if (!h) return; const t = dayTypeOf(addDays(x.date, i), holidays); if (t === "weekday") a += h / 18; else b += h / 18; });
      return { a, b, y: x.golfJpy as number };
    });
    const fit = fitGolfRates(samples);
    const course: GolfCourse = {
      id: `golf-pkg-${slug(title)}`, name: `패키지 그린피(${title.replace(/^.*?(\d+박)/, "$1")})`, region, holes: 18, playStyle: "셀프플레이",
      periods: [{ from: raws[0].date, to: raws[raws.length - 1].date, weekday: fit.weekday, weekend: fit.weekend, holiday: fit.weekend }],
      notes: "원가표 골프 열에서 평일/주말 1라운드 단가를 역산한 값. 실제 골프장으로 교체 권장.", updatedAt: now,
    };
    courses.push(course);

    const groupFares: Record<string, MoneyOrLabel> = {};
    const groupTaxByMonth: Record<string, MoneyOrLabel> = {};
    for (const x of raws) {
      if (x.grp != null) groupFares[x.date] = x.grp;
      if (x.tax != null) { const k = x.date.slice(0, 7); if (typeof x.tax === "number" || groupTaxByMonth[k] == null) groupTaxByMonth[k] = x.tax; }
    }

    const product: Product = {
      id: `prd-${slug(title)}`, name: title, region, airline: sched.out.flightNo.replace(/\d+$/, ""),
      outbound: sched.out, inbound: sched.in, nights, golfPlan,
      hotelId: hotel.id, hotelLabel, golfCourseIds: [course.id], vehicleRuleId: `veh-${slug(region)}`,
      exchangeRate: rate, margins: margins.length ? margins : [0.15, 0.2],
      dateFrom: raws[0].date, dateTo: raws[raws.length - 1].date,
      groupFares, groupTaxByMonth, overrides: {}, legend, createdAt: now, updatedAt: now,
    };
    products.push(product);
    // 2차: 규칙 계산과 다른 셀만 override 로 보존
    (product as unknown as { __raws: Raw[] }).__raws = raws;
  }

  const vehicle: VehicleRule = {
    id: `veh-${slug(region)}`, name: `${region} 차량+지원비`, region,
    feesByWeekday: { 0: mode(vehicleSamples[0]), 1: mode(vehicleSamples[1]), 2: mode(vehicleSamples[2]), 3: mode(vehicleSamples[3]), 4: mode(vehicleSamples[4]), 5: mode(vehicleSamples[5]), 6: mode(vehicleSamples[6]) },
    memo: "원가표 N열 요일별 최빈값", updatedAt: now,
  };

  for (const p of products) {
    const raws = (p as unknown as { __raws: { date: string; out: MoneyOrLabel | null; inn: MoneyOrLabel | null; hAir: number | null; soldOut: boolean; hotelJpy: number | null; golfJpy: number | null; veh: number | null; sur: number | null; spot: boolean; grpSpecial: boolean; insta?: string; memo?: string }[] }).__raws;
    delete (p as unknown as { __raws?: unknown }).__raws;
    const ctx = { hotel, courses: courses.filter((c) => p.golfCourseIds.includes(c.id)), vehicle, holidays, fares };
    let n = 0;
    for (const x of raws) {
      const calc = computeRow(p, ctx, x.date);
      const ov: RowOverride = {};
      if (x.hotelJpy != null && x.hotelJpy !== calc.hotelJpy) ov.hotelJpy = x.hotelJpy;
      if (x.golfJpy != null && x.golfJpy !== calc.golfJpy) ov.golfJpy = x.golfJpy;
      if (x.veh != null && x.veh !== calc.vehicleKrw) ov.vehicleKrw = x.veh;
      if (x.sur) ov.airSurchargeKrw = x.sur;
      if (x.hAir != null && x.hAir !== calc.airIndiv) ov.airIndivKrw = x.hAir;
      if (x.soldOut) ov.soldOut = true;
      if (x.spot) ov.spotSpecial = true;
      if (x.grpSpecial) ov.groupSpecial = true;
      if (x.insta) ov.directSalePrice = x.insta;
      if (x.memo) ov.memo = x.memo;
      if (Object.keys(ov).length) { p.overrides[x.date] = ov; n++; }
    }
    // 원본에 없는 날짜(출발 없음)는 숨김 처리
    const present = new Set(raws.map((x) => x.date));
    for (const d of eachDate(p.dateFrom, p.dateTo)) if (!present.has(d)) p.overrides[d] = { ...(p.overrides[d] ?? {}), hidden: true };
    log.push(`[${p.name}] ${raws.length}행, 수동조정 ${n}행, 그린피 역산 평일 ${courses.find((c) => c.id === p.golfCourseIds[0])?.periods[0].weekday}엔 / 주말 ${courses.find((c) => c.id === p.golfCourseIds[0])?.periods[0].weekend}엔`);
  }

  // 골프장 요금표 시트
  if (golfSheet) {
    let cur: GolfCourse | null = null;
    let year = new Date().getFullYear();
    for (let r = 3; r <= golfSheet.rowCount; r++) {
      const row = golfSheet.getRow(r);
      const nameCell = str(row.getCell(1).value).trim();
      if (nameCell && !golfSheet.getCell(r, 1).isMerged || (nameCell && golfSheet.getCell(r, 1).master.address === golfSheet.getCell(r, 1).address)) {
        const [nm, ...rest] = nameCell.split("\n");
        cur = { id: `golf-${slug(nm)}`, name: nm.trim(), region, tel: rest.join(" ").replace(/^(TEL|電話番号)\s*[:：]?\s*/i, "").trim() || undefined, holes: num(row.getCell(2).value) ?? 18, playStyle: str(row.getCell(4).value) || "셀프플레이", periods: [], notes: str(row.getCell(8).value) || undefined, updatedAt: now };
        courses.push(cur);
      }
      if (!cur) continue;
      const period = str(row.getCell(3).value).trim();
      const wk = num(row.getCell(5).value), we = num(row.getCell(6).value), ho = num(row.getCell(7).value);
      if (!period && wk == null && we == null && ho == null) continue;
      const m = period.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[~～]\s*(?:(\d{4})\.)?(\d{1,2})\.(\d{1,2})/);
      let from = "", to = "";
      if (m) { year = parseInt(m[1]); from = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`; to = `${m[4] ?? m[1]}-${m[5].padStart(2, "0")}-${m[6].padStart(2, "0")}`; }
      else { const s = period.match(/(\d{1,2})\/(\d{1,2})\s*[~～]\s*(\d{1,2})\/(\d{1,2})/); if (s) { from = `${year}-${s[1].padStart(2, "0")}-${s[2].padStart(2, "0")}`; to = `${year}-${s[3].padStart(2, "0")}-${s[4].padStart(2, "0")}`; } }
      cur.periods.push({ label: period || undefined, from, to, weekday: wk, weekend: we, holiday: ho ?? we });
    }
    log.push(`골프장 요금표 ${courses.filter((c) => !c.id.startsWith("golf-pkg-")).length}곳`);
  }

  return { hotel, vehicle, courses, products, fares: [...fares.values()], exchangeRate: exchangeRates.at(-1) ?? 9.2, margins: margins.length ? margins : [0.15, 0.2], log };
}
