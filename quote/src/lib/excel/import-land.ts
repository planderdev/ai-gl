import type ExcelJS from "exceljs";
import type { ExtraCost, FlightFare, FlightLeg, GolfCourse, GolfRatePeriod, Hotel, MoneyOrLabel, Product, ProductGroup, RowOverride, StaySpec, VehicleRule, Weekday, WeekdayRates } from "@/types";
import { addDays, dayTypeOf, eachDate, weekdayOf } from "@/lib/pricing/date";
import { computeRow, fareKey } from "@/lib/pricing/engine";
import { airlineName } from "@/lib/format";
import { argb, dateOf, fontArgb, label, matchByName, mode, num, slug, str } from "./import-util";

/**
 * 현지착(항공 제외) 원가표 시트 → 상품.
 * 양식: 날짜·요일·출발편·귀국편·항공(빈칸)·호텔(₩/¥)·골프(₩/¥)·차량·기타 원가…·원가합·수익 N%·판매가
 * - 호텔: 요금표 시트의 "출발일별 1~N박 단가" 블록을 호텔별 일자 요금(dateRates)으로 바꾼다
 * - 골프: 오른쪽 위 기준표(골프장·주중·주말)와 행별 라운드 금액으로 라운드 순서·특별요금일을 읽는다
 * - 규칙으로 재현되지 않는 셀만 overrides 로 남긴다
 */
export interface LandImportContext {
  wb: ExcelJS.Workbook;
  region?: string;
  holidays: Set<string>;
  now: string;
  hotels: Hotel[]; // 기존 + 이번에 만든 것(갱신 대상은 교체)
  courses: GolfCourse[];
  vehicles: VehicleRule[];
  touched: { hotels: Map<string, Hotel>; courses: Map<string, GolfCourse>; vehicles: Map<string, VehicleRule> };
  fares: Map<string, FlightFare>;
  log: string[];
}

const yy = (d: string) => d.slice(2).replace(/-/g, ".");
const headerText = (ws: ExcelJS.Worksheet, c: number) => str(ws.getCell(5, c).value).replace(/\s*\n\s*/g, " ").trim();
const isPair = (ws: ExcelJS.Worksheet, c: number) => { const a = ws.getCell(5, c), b = ws.getCell(5, c + 1); return b.isMerged && b.master.address === a.address; };
const plainNum = (v: ExcelJS.CellValue) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function parseLegs(text: string): { out: FlightLeg; in: FlightLeg } | null {
  const legs = [...text.matchAll(/([A-Z0-9]{2}\d{3,4})\s+([A-Z]{3})\s+(\d{1,2}:\d{2})\s*-\s*([A-Z]{3})\s+(\d{1,2}:\d{2})/g)].map((m) => ({ flightNo: m[1], origin: m[2], dep: m[3], destination: m[4], arr: m[5] }));
  return legs.length >= 2 ? { out: legs[0], in: legs[1] } : null;
}
const parsePlan = (s: string): number[] | null => { const m = s.match(/((?:\d+H\+?)+)=\d+(?:홀|H)/); return m ? m[1].split("+").map((x) => parseInt(x)) : null; };

/** 요금표 시트에서 "날짜 · 요일 · 1박째 … N박째 · 합계(수식)" 블록을 찾아 출발일별 박별 단가를 돌려준다 */
function readNightlyBlock(wb: ExcelJS.Workbook, skip: Set<ExcelJS.Worksheet>, nights: number): { sheet: string; rows: { date: string; rates: number[] }[] } | null {
  for (const ws of wb.worksheets) {
    if (skip.has(ws)) continue;
    let first = 0;
    for (let r = 1; r <= Math.min(6, ws.rowCount) && !first; r++) for (let c = 1; c <= ws.columnCount; c++) if (dateOf(ws.getCell(r, c).value)) { first = r; break; }
    if (!first) continue;
    const blocks: { dateCol: number; cols: number[] }[] = [];
    for (let c = 1; c <= ws.columnCount; c++) {
      if (!dateOf(ws.getCell(first, c).value)) continue;
      const cols: number[] = [];
      for (let k = c + 2; k <= ws.columnCount && plainNum(ws.getCell(first, k).value) != null; k++) cols.push(k);
      blocks.push({ dateCol: c, cols });
    }
    const hit = blocks.reverse().find((b) => b.cols.length === nights);
    if (!hit) continue;
    const rows: { date: string; rates: number[] }[] = [];
    for (let r = first; r <= ws.rowCount; r++) {
      const date = dateOf(ws.getCell(r, hit.dateCol).value);
      const rates = hit.cols.map((k) => num(ws.getCell(r, k).value));
      if (date && rates.every((x) => x != null)) rows.push({ date, rates: rates as number[] });
    }
    if (rows.length) return { sheet: ws.name, rows };
  }
  return null;
}

/** 연속한 날짜를 구간으로 묶는다 */
function mergeDates(dates: string[]): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = [];
  for (const d of [...dates].sort()) { const last = out.at(-1); if (last && addDays(last.to, 1) === d) last.to = d; else out.push({ from: d, to: d }); }
  return out;
}
const weekdayModes = (byDate: Record<string, number>): WeekdayRates => {
  const b: Record<Weekday, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const [d, v] of Object.entries(byDate)) b[weekdayOf(d)].push(v);
  return { 0: mode(b[0]), 1: mode(b[1]), 2: mode(b[2]), 3: mode(b[3]), 4: mode(b[4]), 5: mode(b[5]), 6: mode(b[6]) };
};

export function importLandSheet(ws: ExcelJS.Worksheet, ctx: LandImportContext, skipSheets: Set<ExcelJS.Worksheet>): { product: Product; group: ProductGroup } | null {
  const { log, now, holidays } = ctx;
  const title = ws.name.trim().replace(/\s+/g, " ");
  const top = (addr: string) => str(ws.getCell(addr).value).trim();

  // ── 머리글(1~4행) ──
  let legsText = "", rateText = "", airLabel = "";
  for (let r = 1; r <= 4; r++) ws.getRow(r).eachCell((c) => {
    const t = str(c.value);
    if (!legsText && parseLegs(t)) legsText = t;
    if (!rateText && /환율\s*[\d.]+/.test(t)) rateText = t;
  });
  const legs = parseLegs(legsText);
  if (!legs) { log.push(`[${title}] 항공편(예: 7C1721 ICN 07:00-MYJ 08:35 …) 문구를 찾지 못해 건너뜀`); return null; }
  airLabel = top("E4") && !parseLegs(top("E4")) ? top("E4") : airlineName(legs.out.flightNo.slice(0, 2));
  const nights = parseInt(top("A4").match(/(\d+)\s*N/i)?.[1] ?? top("A2").match(/(\d+)박/)?.[1] ?? title.match(/(\d+)박/)?.[1] ?? "") || 3;
  const rate = parseFloat(rateText.match(/환율\s*([\d.]+)/)?.[1] ?? "") || 9.2;

  // ── 열 찾기(5행 머리글) ──
  const flightCols: number[] = [], marginCols: { col: number; m: number }[] = [];
  let costCol = 0;
  for (let c = 3; c <= ws.columnCount; c++) {
    const t = headerText(ws, c);
    if (/^[A-Z0-9]{2}\d{3,4}$/.test(t) && flightCols.length < 2) flightCols.push(c);
    if (!costCol && /원가/.test(t)) costCol = c;
    const m = t.match(/수익.*?(\d+)\s*%/);
    if (m) marginCols.push({ col: c, m: parseInt(m[1]) / 100 });
  }
  if (flightCols.length < 2 || !costCol) { log.push(`[${title}] 항공편 열 또는 원가합 열을 찾지 못해 건너뜀`); return null; }
  let hotelJpyCol = 0, golfJpyCol = 0, vehicleCol = 0, airCol = 0, hotelLabel = "", golfLabel = "";
  const extraCols: { col: number; label: string }[] = [];
  for (let c = flightCols[1] + 1; c < costCol; c++) {
    const t = headerText(ws, c);
    if (!t) continue;
    if (isPair(ws, c)) {
      if (!hotelJpyCol && /박/.test(t) && !/홀/.test(t)) { hotelJpyCol = c + 1; hotelLabel = str(ws.getCell(5, c).value); }
      else if (!golfJpyCol) { golfJpyCol = c + 1; golfLabel = str(ws.getCell(5, c).value); }
      c++;
    } else if (/차량/.test(t) && !vehicleCol) vehicleCol = c;
    else if (!airCol && /항공|인디비/.test(t)) airCol = c;
    else extraCols.push({ col: c, label: t });
  }
  const saleCol = (marginCols.at(-1)?.col ?? costCol) + 1;
  const golfPlan = parsePlan(golfLabel) ?? Array.from({ length: nights + 1 }, (_, i) => (i < nights ? 18 : 0));
  const roundOffsets = golfPlan.map((h, i) => (h ? i : -1)).filter((i) => i >= 0);

  // ── 골프 기준표(골프장·주중·주말)와 행별 라운드 금액 열 ──
  let wkCol = 0, basisRow = 0;
  for (let r = 1; r <= 4 && !wkCol; r++) for (let c = costCol; c <= ws.columnCount; c++) if (str(ws.getCell(r, c).value).trim() === "주중" && str(ws.getCell(r, c + 1).value).trim() === "주말") { wkCol = c; basisRow = r; break; }
  const basis: { name: string; weekday: number; weekend: number }[] = [];
  if (wkCol) for (let r = basisRow + 1; r <= 4; r++) { const name = str(ws.getCell(r, wkCol - 1).value).trim(), a = num(ws.getCell(r, wkCol).value), b = num(ws.getCell(r, wkCol + 1).value); if (name && a != null && b != null) basis.push({ name, weekday: a, weekend: b }); }
  const roundCols: number[] = [];
  if (wkCol) for (let c = wkCol; c <= ws.columnCount && plainNum(ws.getCell(6, c).value) != null; c++) roundCols.push(c);
  const hasRounds = basis.length > 0 && roundCols.length === roundOffsets.length;

  // ── 데이터 행 ──
  type Raw = { date: string; out: MoneyOrLabel | null; inn: MoneyOrLabel | null; air: number | null; hotelJpy: number | null; golfJpy: number | null; veh: number | null; extras: (number | null)[]; rounds: number[]; cost: number | null; sale?: string; spot: boolean };
  const raws: Raw[] = [];
  for (let r = 6; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const date = dateOf(row.getCell(1).value);
    if (!date) continue;
    const sv = row.getCell(saleCol).value;
    raws.push({
      date, out: label(row.getCell(flightCols[0]).value), inn: label(row.getCell(flightCols[1]).value),
      air: airCol ? num(row.getCell(airCol).value) : null,
      hotelJpy: hotelJpyCol ? num(row.getCell(hotelJpyCol).value) : null, golfJpy: golfJpyCol ? num(row.getCell(golfJpyCol).value) : null,
      veh: vehicleCol ? num(row.getCell(vehicleCol).value) : null, extras: extraCols.map((e) => num(row.getCell(e.col).value)),
      rounds: hasRounds ? roundCols.map((c) => num(row.getCell(c).value) ?? 0) : [],
      cost: num(row.getCell(costCol).value), sale: sv == null ? undefined : typeof sv === "number" ? String(sv) : str(sv).trim() || undefined,
      spot: fontArgb(row.getCell(1)) === "FFFF0000" || [argb(row.getCell(1)), argb(row.getCell(2))].includes("FFFFFF00"),
    });
  }
  if (!raws.length) { log.push(`[${title}] 데이터 행 없음`); return null; }
  const dateFrom = raws[0].date, dateTo = raws.at(-1)!.date;

  // ── 지역·상품군 ──
  const groupBase = (top("A2") || title).replace(/\s*\d+박\s*\d+일.*$/, "").replace(/\s*패턴\s*$/, "").trim() || title;
  const knownRegions = [...new Set([...ctx.hotels, ...ctx.courses].map((x) => x.region))];
  const region = ctx.region ?? knownRegions.find((g) => groupBase.startsWith(g) || title.startsWith(g)) ?? groupBase.split(/\s+/)[0];
  const group: ProductGroup = { id: `grp-${slug(`${groupBase} ${airLabel}`)}`, name: `${groupBase} (${airLabel})`, country: "일본", region, airline: legs.out.flightNo.slice(0, 2), summary: [top("G3"), top("G2")].filter(Boolean).join(" · ").replace(/\s+/g, " ") || undefined, fileName: undefined, createdAt: now, updatedAt: now };

  // ── 호텔: "쥬락쿠1박+넘버원 2박" → 숙박 구성, 요금표 시트 → 일자별 요금 ──
  const stayText = top("G3") || hotelLabel;
  const stayNames = [...stayText.replace(/\n/g, " ").matchAll(/([^\s+\d][^+\d]*?)\s*(\d+)\s*박/g)].map((m) => ({ name: m[1].trim(), nights: parseInt(m[2]) }));
  if (!stayNames.length || stayNames.reduce((a, s) => a + s.nights, 0) !== nights) stayNames.splice(0, stayNames.length, { name: (hotelLabel.split("\n")[0] || "호텔").replace(/\s*\d+박.*$/, "").trim(), nights });
  const roomBasis = stayText.match(/(트윈|싱글|더블|트리플)\S*\s*기준/)?.[0];
  const block = readNightlyBlock(ctx.wb, skipSheets, nights);
  const stays: StaySpec[] = [];
  const nightHotel: Hotel[] = []; // 박 인덱스 → 호텔
  for (const s of stayNames) {
    const found = matchByName(s.name, ctx.hotels, region);
    const hotel: Hotel = found ? { ...found } : { id: `hotel-${slug(`${s.name} ${region}`)}`, name: s.name, region, nightlyRates: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, updatedAt: now };
    if (!found) ctx.hotels.push(hotel); else ctx.hotels.splice(ctx.hotels.indexOf(found), 1, hotel);
    stays.push({ hotelId: hotel.id, nights: s.nights });
    for (let k = 0; k < s.nights; k++) nightHotel.push(hotel);
    log.push(found ? `[${title}] 호텔 '${s.name}' → 기존 '${found.name}'` : `[${title}] 호텔 '${s.name}' 신규 등록`);
  }
  if (block) {
    const byHotel = new Map<string, Record<string, number>>();
    for (const row of block.rows) row.rates.forEach((v, k) => { const h = nightHotel[k]; byHotel.set(h.id, { ...(byHotel.get(h.id) ?? {}), [addDays(row.date, k)]: v }); });
    for (const [id, rates] of byHotel) {
      const h = ctx.hotels.find((x) => x.id === id)!;
      h.dateRates = { ...(h.dateRates ?? {}), ...rates };
      h.nightlyRates = weekdayModes(h.dateRates);
      h.roomBasis = roomBasis ?? h.roomBasis;
      h.memo = [h.memo?.replace(/(^|\s*·\s*)일자별 요금:.*$/, ""), `일자별 요금: 원가표 '${block.sheet}' 시트 ${Object.keys(rates).sort()[0]}~${Object.keys(rates).sort().at(-1)} (${Object.keys(rates).length}일)`].filter(Boolean).join(" · ");
      h.updatedAt = now;
      ctx.touched.hotels.set(id, h);
    }
    log.push(`[${title}] 호텔 요금표 '${block.sheet}' ${block.rows.length}일 → ${[...byHotel.keys()].length}개 호텔 일자별 요금`);
  } else {
    for (const h of new Set(nightHotel)) ctx.touched.hotels.set(h.id, h);
    log.push(`[${title}] 호텔 요금표 시트 없음 — 호텔 합계는 행별 수동값으로 보존`);
  }

  // ── 골프: 기준표 → 골프장 요금 구간(스타일 지정), 특별요금일 추정 ──
  const styleOf = new Map([...top("G2").matchAll(/([^+()]+)\(([^)]+)\)/g)].map((m) => [m[1].trim(), m[2].trim()] as const));
  const golfCourseIds: string[] = [], golfStyles: string[] = [];
  if (hasRounds) {
    // 달력상 평일인데 모든 라운드가 주말 요금으로 잡힌 날 = 특별요금일(연말연시 등)
    const seen = new Map<string, boolean[]>();
    for (const x of raws) x.rounds.forEach((v, k) => { const d = addDays(x.date, roundOffsets[k]); if (dayTypeOf(d, holidays) !== "weekday" || basis[k].weekday === basis[k].weekend) return; seen.set(d, [...(seen.get(d) ?? []), v === basis[k].weekend]); });
    const special = mergeDates([...seen].filter(([, v]) => v.length >= 2 && v.every(Boolean)).map(([d]) => d));
    basis.forEach((b, k) => {
      const style = styleOf.get(b.name) ?? [...styleOf].find(([n]) => n.includes(b.name) || b.name.includes(n))?.[1] ?? "셀프플레이";
      const found = matchByName(b.name, ctx.courses, region);
      const course: GolfCourse = found ? { ...found, periods: [...found.periods] } : { id: `golf-${slug(`${b.name} ${region}`)}`, name: b.name, region, holes: 18, playStyle: style, periods: [], updatedAt: now };
      if (!found) ctx.courses.push(course); else ctx.courses.splice(ctx.courses.indexOf(found), 1, course);
      const mine: GolfRatePeriod[] = [
        ...special.map((s) => ({ label: `특별요금일 ${yy(s.from)}~${yy(s.to)}`, from: s.from, to: s.to, weekday: b.weekend, weekend: b.weekend, holiday: b.weekend, style })),
        { label: `원가표 기준 ${yy(dateFrom)}~${yy(dateTo)}`, from: dateFrom, to: addDays(dateTo, nights), weekday: b.weekday, weekend: b.weekend, holiday: b.weekend, style },
      ];
      const key = (p: GolfRatePeriod) => `${p.style ?? ""}|${p.from}|${p.to}`;
      const keys = new Set(mine.map(key));
      course.periods = [...mine, ...course.periods.filter((p) => !keys.has(key(p)))];
      course.updatedAt = now;
      ctx.touched.courses.set(course.id, course);
      golfCourseIds.push(course.id); golfStyles.push(style);
      log.push(`[${title}] ${k + 1}라운드 ${b.name}(${style}) 주중 ${b.weekday.toLocaleString()} / 주말 ${b.weekend.toLocaleString()}엔 → ${found ? `기존 '${found.name}'` : "신규 골프장"}`);
    });
    if (special.length) log.push(`[${title}] 특별요금일(평일이지만 주말 요금): ${special.map((s) => (s.from === s.to ? s.from : `${s.from}~${s.to}`)).join(", ")}`);
  } else {
    log.push(`[${title}] 골프 기준표(주중·주말)를 찾지 못해 골프 합계는 행별 수동값으로 보존`);
  }

  // ── 차량: 출발 요일별 최빈값. 같은 지역에 같은 금액 규칙이 있으면 재사용 ──
  const vb: Record<Weekday, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const x of raws) if (x.veh != null) vb[weekdayOf(x.date)].push(x.veh);
  const fees: WeekdayRates = { 0: mode(vb[0]), 1: mode(vb[1]), 2: mode(vb[2]), 3: mode(vb[3]), 4: mode(vb[4]), 5: mode(vb[5]), 6: mode(vb[6]) };
  const sameFees = (v: VehicleRule) => v.region === region && ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).every((w) => v.feesByWeekday[w] === fees[w]);
  let vehicle = ctx.vehicles.find(sameFees);
  const pax = parseInt(title.match(/\((\d+)\s*인\)/)?.[1] ?? "") || undefined;
  if (!vehicle) {
    vehicle = { id: `veh-${slug(title)}`, name: `${region} 차량${pax ? ` (${pax}인 기준)` : ""} — ${groupBase.replace(region, "").trim() || title}`, region, feesByWeekday: fees, memo: `원가표 '${title}' 차량 열(출발 요일별 최빈값)`, updatedAt: now };
    ctx.vehicles.push(vehicle); ctx.touched.vehicles.set(vehicle.id, vehicle);
  }

  // ── 기타 원가(석식 등): 열마다 최빈값 ──
  const extras: ExtraCost[] = extraCols.map((e, i) => ({ label: e.label, krw: mode(raws.map((x) => x.extras[i]).filter((v): v is number => v != null)) })).filter((e) => e.krw);
  const extrasBase = extras.reduce((a, e) => a + (e.krw ?? 0), 0);

  // ── 참고 운임 ──
  for (const x of raws) {
    const put = (leg: FlightLeg, date: string, v: MoneyOrLabel | null) => {
      if (v == null || v === "미정") return;
      ctx.fares.set(fareKey(leg.flightNo, date), { id: fareKey(leg.flightNo, date), airline: leg.flightNo.replace(/\d+$/, ""), flightNo: leg.flightNo, origin: leg.origin, destination: leg.destination, date, fareKrw: typeof v === "number" ? v : null, status: typeof v === "number" ? "ok" : v === "마감" ? "sold_out" : "no_flight", source: "import", capturedAt: now, meta: { sheet: title } });
    };
    put(legs.out, x.date, x.out);
    put(legs.in, addDays(x.date, nights), x.inn);
  }

  const land = /현지착/.test(title) || raws.every((x) => x.air == null);
  const product: Product = {
    id: `prd-${slug(title)}`, name: title, groupId: group.id, saleType: land ? "land" : "air", paxBasis: pax, region, airline: legs.out.flightNo.replace(/\d+$/, ""),
    outbound: legs.out, inbound: legs.in, nights, golfPlan,
    hotelId: stays[0].hotelId, stays: stays.length > 1 ? stays : undefined, hotelLabel: hotelLabel || undefined,
    golfCourseIds, golfStyles: golfStyles.length ? golfStyles : undefined, golfLabel: golfLabel || undefined, vehicleRuleId: vehicle.id,
    extras: extras.length ? extras : undefined, note: top("L2") || undefined,
    exchangeRate: rate, margins: marginCols.length ? marginCols.map((x) => x.m) : [0.15, 0.2],
    dateFrom, dateTo, groupFares: {}, groupTaxByMonth: {}, overrides: {}, createdAt: now, updatedAt: now,
  };

  // ── 규칙 계산과 다른 셀만 override ──
  const hotelsById = new Map(ctx.hotels.map((h) => [h.id, h]));
  const byId = new Map(ctx.courses.map((c) => [c.id, c]));
  const qctx = { hotel: hotelsById.get(product.hotelId) ?? null, hotelsById, courses: golfCourseIds.map((id) => byId.get(id)!).filter(Boolean), vehicle, holidays, fares: ctx.fares };
  let adjusted = 0, costDiff = 0;
  for (const x of raws) {
    const ov: RowOverride = {};
    const calc = computeRow(product, qctx, x.date);
    if (x.hotelJpy != null && x.hotelJpy !== calc.hotelJpy) ov.hotelJpy = x.hotelJpy;
    if (x.golfJpy != null && x.golfJpy !== calc.golfJpy) ov.golfJpy = x.golfJpy;
    if (x.veh != null && x.veh !== calc.vehicleKrw) ov.vehicleKrw = x.veh;
    const ex = x.extras.reduce<number>((a, v) => a + (v ?? 0), 0);
    if (extraCols.length && ex !== extrasBase) ov.extrasKrw = ex;
    if (!land && x.air != null && x.air !== calc.airIndiv) ov.airIndivKrw = x.air;
    if (Object.keys(ov).length) adjusted++;
    if (x.sale) ov.directSalePrice = x.sale;
    if (x.spot) ov.spotSpecial = true;
    if (Object.keys(ov).length) product.overrides[x.date] = ov;
    const after = computeRow(product, qctx, x.date);
    if (x.cost != null && (typeof after.costIndiv !== "number" || Math.abs(after.costIndiv - x.cost) > 0.5)) costDiff++;
  }
  const present = new Set(raws.map((x) => x.date));
  for (const d of eachDate(dateFrom, dateTo)) if (!present.has(d)) product.overrides[d] = { ...(product.overrides[d] ?? {}), hidden: true };
  log.push(`[${title}] ${land ? "현지착" : "항공 포함"} ${raws.length}행 · 환율 ${rate} · 숙박 ${stayNames.map((s) => `${s.name} ${s.nights}박`).join(" + ")} · 기타 원가 ${extras.map((e) => `${e.label} ${e.krw?.toLocaleString()}원`).join(", ") || "없음"} · 차량 ${[...new Set(Object.values(fees))].map((v) => v.toLocaleString()).join("/")}원`);
  log.push(`[${title}] 규칙과 달라 수동값으로 남긴 행 ${adjusted} · 원가합이 원본과 다른 행 ${costDiff}`);
  return { product, group };
}
