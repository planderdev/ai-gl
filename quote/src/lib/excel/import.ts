import ExcelJS from "exceljs";
import type { FlightFare, FlightLeg, GolfCourse, GolfRatePeriod, Hotel, MoneyOrLabel, Product, ProductGroup, RowOverride, VehicleRule, Weekday, WeekdayRates } from "@/types";
import { addDays, dayTypeOf, eachDate, weekdayOf } from "@/lib/pricing/date";
import { computeRow, fareKey } from "@/lib/pricing/engine";
import { JP_HOLIDAYS_DEFAULT } from "@/lib/masters/holidays";
import { airlineName } from "@/lib/format";
import { argb, dateOf, fontArgb, isFormula, label, matchByName, mode, normName, num, slug, str } from "./import-util";
import { importLandSheet } from "./import-land";

/**
 * 기존 수작업 원가표(.xlsx) → 시스템 데이터로 변환. 파일 1개 = 상품군, 시트 1장 = 원가표(상품).
 * 시트 양식은 5행 머리글로 가른다.
 * - 항공 포함(인디비·그룹): 그룹가·유택 열이 있는 양식 → 아래 importAirSheets
 *   · E1~E3 = 요일별 1박 단가, N열 요일별 최빈값 = 차량+지원비 규칙
 *   · 골프 그린피는 행 데이터에서 평일/주말 단가를 역산해 '패키지 그린피' 골프장으로 등록
 * - 현지착(항공 제외): 그룹 열이 없는 양식 → import-land.ts
 * 규칙으로 재현되지 않는 셀만 overrides 로 보존 → 재출력 시 원본과 동일.
 * 호텔·골프장·차량은 existing 으로 받은 기존 마스터와 이름을 맞춰 중복 등록하지 않는다.
 */
export interface ImportResult {
  groups: ProductGroup[];
  hotels: Hotel[];
  vehicles: VehicleRule[];
  courses: GolfCourse[];
  products: Product[];
  fares: FlightFare[];
  exchangeRate: number;
  margins: number[];
  log: string[];
}
export interface ImportOptions {
  region?: string;
  holidays?: string[];
  fileName?: string;
  existing?: { hotels?: Hotel[]; courses?: GolfCourse[]; vehicles?: VehicleRule[] };
}

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

const hasGroupColumn = (ws: ExcelJS.Worksheet) => { let hit = false; ws.getRow(5).eachCell((c) => { if (/그룹/.test(str(c.value))) hit = true; }); return hit; };
const commonPrefix = (names: string[]) => { let p = names[0] ?? ""; for (const n of names) while (p && !n.startsWith(p)) p = p.slice(0, -1); return p.replace(/\s*\d*박?\s*$/, "").trim(); };

export async function importCostWorkbook(buf: ArrayBuffer | Buffer, opts: ImportOptions = {}): Promise<ImportResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const holidays = new Set(opts.holidays ?? JP_HOLIDAYS_DEFAULT);
  const now = new Date().toISOString();
  const log: string[] = [];

  const costSheets = wb.worksheets.filter((ws) => str(ws.getCell("A5").value).trim() === "날짜");
  const golfSheet = wb.worksheets.find((ws) => /골프장.*요금표/.test(str(ws.getCell("A1").value)));
  if (!costSheets.length) throw new Error("원가표 시트를 찾지 못했습니다(A5='날짜' 인 시트 필요).");
  const airSheets = costSheets.filter(hasGroupColumn);
  const landSheets = costSheets.filter((ws) => !hasGroupColumn(ws));

  const res: ImportResult = { groups: [], hotels: [], vehicles: [], courses: [], products: [], fares: [], exchangeRate: 9.2, margins: [0.15, 0.2], log };
  const fares = new Map<string, FlightFare>();
  const knownHotels = [...(opts.existing?.hotels ?? [])], knownCourses = [...(opts.existing?.courses ?? [])], knownVehicles = [...(opts.existing?.vehicles ?? [])];
  const touched = { hotels: new Map<string, Hotel>(), courses: new Map<string, GolfCourse>(), vehicles: new Map<string, VehicleRule>() };

  if (airSheets.length) {
    // 지역을 비우면 시트 이름 첫머리에서 찾는다(기존 지역과 맞는 것 우선)
    const first = airSheets[0].name.trim();
    const regionsKnown = [...new Set([...knownHotels, ...knownCourses].map((x) => x.region))];
    const air = importAirSheets(airSheets, { region: opts.region ?? regionsKnown.find((r) => first.startsWith(r)) ?? first.split(/\s+/)[0] ?? "다카마쓰", holidays, now, fares, log });
    touched.hotels.set(air.hotel.id, air.hotel); touched.vehicles.set(air.vehicle.id, air.vehicle);
    for (const c of air.courses) touched.courses.set(c.id, c);
    res.products.push(...air.products); res.groups.push(air.group);
    res.exchangeRate = air.exchangeRate; res.margins = air.margins;
  }
  if (landSheets.length) {
    const skip = new Set<ExcelJS.Worksheet>([...costSheets, ...(golfSheet ? [golfSheet] : [])]);
    const ctx = { wb, region: opts.region, holidays, now, hotels: knownHotels, courses: knownCourses, vehicles: knownVehicles, touched, fares, log };
    for (const ws of landSheets) {
      const r = importLandSheet(ws, ctx, skip);
      if (!r) continue;
      res.products.push(r.product);
      if (!res.groups.some((g) => g.id === r.group.id)) res.groups.push(r.group);
      res.exchangeRate = r.product.exchangeRate; res.margins = r.product.margins;
    }
  }
  for (const g of res.groups) g.fileName = opts.fileName ?? g.fileName;

  if (golfSheet) {
    const region = opts.region ?? res.products[0]?.region ?? "다카마쓰";
    const n = importGolfRateSheet(golfSheet, { region, now, known: knownCourses, touched: touched.courses });
    log.push(`골프장 요금표 '${golfSheet.name}' ${n.total}곳(기존 ${n.matched}곳 갱신 · 신규 ${n.total - n.matched}곳)`);
  }

  res.hotels = [...touched.hotels.values()]; res.vehicles = [...touched.vehicles.values()]; res.courses = [...touched.courses.values()]; res.fares = [...fares.values()];
  return res;
}

/**
 * 골프장 요금표 시트(골프장·홀·기간·플레이스타일·주중·주말·연휴·기타사항).
 * 기존 골프장과 이름이 맞으면 그 골프장에 스타일별 요금 구간을 더하고, 없으면 새로 만든다.
 */
function importGolfRateSheet(ws: ExcelJS.Worksheet, o: { region: string; now: string; known: GolfCourse[]; touched: Map<string, GolfCourse> }) {
  type Block = { name: string; tel?: string; holes: number; notes?: string; periods: GolfRatePeriod[] };
  const blocks: Block[] = [];
  let cur: Block | null = null;
  let year = new Date().getFullYear();
  for (let r = 3; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const a = ws.getCell(r, 1);
    const nameCell = str(a.value).trim();
    if (nameCell && (!a.isMerged || a.master.address === a.address)) {
      const [nm, ...rest] = nameCell.split("\n");
      cur = { name: nm.trim(), tel: rest.join(" ").replace(/^(TEL|電話番号)\s*[:：]?\s*/i, "").trim() || undefined, holes: num(row.getCell(2).value) ?? 18, notes: str(row.getCell(8).value) || undefined, periods: [] };
      blocks.push(cur);
    }
    if (!cur) continue;
    const period = str(row.getCell(3).value).trim();
    const wk = num(row.getCell(5).value), we = num(row.getCell(6).value), ho = num(row.getCell(7).value);
    if (!period && wk == null && we == null && ho == null) continue;
    const m = period.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[~～]\s*(?:(\d{4})\.)?(\d{1,2})\.(\d{1,2})/);
    let from = "", to = "";
    if (m) { year = parseInt(m[1]); from = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`; to = `${m[4] ?? m[1]}-${m[5].padStart(2, "0")}-${m[6].padStart(2, "0")}`; }
    else { const s = period.match(/(\d{1,2})\/(\d{1,2})\s*[~～]\s*(\d{1,2})\/(\d{1,2})/); if (s) { from = `${year}-${s[1].padStart(2, "0")}-${s[2].padStart(2, "0")}`; to = `${year}-${s[3].padStart(2, "0")}-${s[4].padStart(2, "0")}`; } }
    let fixed = "";
    if (from && to && from > to) { fixed = ` (원문 ${period} 표기 보정)`; from = `${from.slice(0, 4)}-01-01`; } // "2026.03.01~02.28" 같은 표기 오류는 연초부터로 본다
    cur.periods.push({ label: fixed ? `${from.replace(/-/g, ".")}~${to.slice(5).replace(/-/g, ".")}${fixed}` : period || undefined, from, to, weekday: wk, weekend: we, holiday: ho ?? we, style: str(row.getCell(4).value).trim() || undefined });
  }
  // 이름이 정확히 같은 것부터 맞춘 뒤 나머지를 유사 이름으로 맞춘다(도고 ↔ 오쿠도고 같은 오매칭 방지)
  const claimed = new Set<string>();
  const hit = new Map<Block, GolfCourse>();
  for (const b of blocks) { const f = o.known.find((c) => c.region === o.region && !claimed.has(c.id) && normName(c.name) === normName(b.name)); if (f) { hit.set(b, f); claimed.add(f.id); } }
  for (const b of blocks) { if (hit.has(b)) continue; const f = matchByName(b.name, o.known, o.region, claimed); if (f) { hit.set(b, f); claimed.add(f.id); } }
  for (const b of blocks) {
    const found = hit.get(b);
    const base: GolfCourse = found ? (o.touched.get(found.id) ?? found) : { id: `golf-${slug(b.name)}`, name: b.name, region: o.region, tel: b.tel, holes: b.holes, playStyle: b.periods[0]?.style ?? "셀프플레이", periods: [], notes: b.notes, updatedAt: o.now };
    const same = (p: GolfRatePeriod, q: GolfRatePeriod) => p.from === q.from && p.to === q.to && p.weekday === q.weekday && p.weekend === q.weekend && p.holiday === q.holiday;
    const key = (p: GolfRatePeriod) => `${p.style ?? ""}|${p.from}|${p.to}`;
    const fresh = b.periods.filter((p) => !base.periods.some((q) => !q.style && same(p, q))); // 같은 값이 스타일 없이 이미 있으면 그대로 둔다
    const keys = new Set(fresh.map(key));
    const course: GolfCourse = { ...base, tel: base.tel ?? b.tel, notes: base.notes ?? b.notes, periods: [...base.periods.filter((p) => !keys.has(key(p))), ...fresh], updatedAt: o.now };
    const i = o.known.findIndex((c) => c.id === course.id);
    if (i >= 0) o.known.splice(i, 1, course); else o.known.push(course);
    o.touched.set(course.id, course);
  }
  return { total: blocks.length, matched: hit.size };
}

interface AirContext { region: string; holidays: Set<string>; now: string; fares: Map<string, FlightFare>; log: string[] }
function importAirSheets(costSheets: ExcelJS.Worksheet[], { region, holidays, now, fares, log }: AirContext) {
  // 호텔·차량: 첫 시트 기준(모든 시트 동일 가정, 다르면 시트별 로그)
  const first = costSheets[0];
  // E1 평일(일~목) / E3 금·토 1박 단가 — 원가표 관행 (E2 는 E1 과 동일 값)
  const wkRate = num(first.getCell("E1").value) ?? 0, weRate = num(first.getCell("E3").value) ?? num(first.getCell("E2").value) ?? wkRate;
  const nightly: WeekdayRates = { 0: wkRate, 1: wkRate, 2: wkRate, 3: wkRate, 4: wkRate, 5: weRate, 6: weRate };
  const hotelName = (str(first.getCell("J5").value).split("\n")[0] || "호텔").replace(/\s*\d+박\s*$/, "").trim();
  const hotel: Hotel = { id: `hotel-${slug(hotelName)}`, name: hotelName, region, nightlyRates: nightly, memo: "원가표 E1~E3(1박 단가)에서 가져옴", updatedAt: now };

  const vehicleSamples: Record<Weekday, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
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

  const names = products.map((p) => p.name);
  const base = commonPrefix(names) || names[0] || region;
  const airline = products[0]?.airline ?? "";
  const flights = products[0] ? `${products[0].outbound.flightNo}/${products[0].inbound.flightNo.startsWith(airline) ? products[0].inbound.flightNo.slice(airline.length) : products[0].inbound.flightNo}` : "";
  const group: ProductGroup = { id: `grp-${slug(`${base} ${airline}`)}`, name: `${base} (${airlineName(airline)}${flights ? ` ${flights}` : ""})`, country: "일본", region, airline, createdAt: now, updatedAt: now };
  for (const p of products) p.groupId = group.id;
  return { hotel, vehicle, courses, products, group, exchangeRate: exchangeRates.at(-1) ?? 9.2, margins: margins.length ? margins : [0.15, 0.2] };
}
