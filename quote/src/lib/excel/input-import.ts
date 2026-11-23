import type ExcelJS from "exceljs";
import type { ExtraCost, GolfCourse, GolfRatePeriod, Hotel, MoneyOrLabel, Product, ProductGroup, RowOverride, StaySpec, VehicleRule, Weekday, WeekdayRates } from "@/types";
import { addDays, formatDate } from "@/lib/pricing/date";
import { computeRow } from "@/lib/pricing/engine";
import { DAILY_COLUMNS, GOLF_COLUMNS, GROUP_FIELDS, HOTEL_COLUMNS, HOTEL_DATE_HEAD, INPUT_MARK, SALE_TYPE_TEXT, SHEET_FIELDS, VEHICLE_COLUMNS, normLabel, type ColumnDef } from "./input-sheet";
import { normName, slug, str } from "./import-util";

/**
 * 원가표 입력표(.xlsx) → 상품군·원가표·단가.
 * - 시트는 이름이 아니라 머리글 문구로 찾는다(시트 이름·열 순서를 바꿔도 읽힌다).
 * - 고칠 곳이 하나라도 있으면 InputIssues 를 던지고 아무것도 돌려주지 않는다 → 반쯤 저장되는 일이 없다.
 * - 이름이 같은 상품군·원가표·호텔·골프장·차량은 새로 만들지 않고 그것을 고친다.
 */
export class InputIssues extends Error {
  constructor(public issues: string[]) { super("입력표에 고칠 곳이 있습니다"); this.name = "InputIssues"; }
}
export interface InputImportContext {
  holidays: Set<string>;
  now: string;
  fileName?: string;
  existing: { groups: ProductGroup[]; products: Product[]; hotels: Hotel[]; courses: GolfCourse[]; vehicles: VehicleRule[] };
}
export interface InputImportResult { group: ProductGroup; products: Product[]; hotels: Hotel[]; courses: GolfCourse[]; vehicles: VehicleRule[]; log: string[] }

type CellV = ExcelJS.CellValue;
const raw = (v: CellV): CellV => (v && typeof v === "object" && !(v instanceof Date) && "result" in v ? (v.result as CellV) : v);
const text = (v: CellV) => str(raw(v)).trim();
const numOf = (v: CellV): number | null => {
  const x = raw(v);
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  const t = text(x).replace(/[,\s원엔¥₩]/g, "");
  return t && /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};
/** 날짜: 엑셀 날짜 · 2026-12-01 · 2026.12.01 · 2026/12/1 · 26.12.01 */
const dateOfCell = (v: CellV): string | null => {
  const x = raw(v);
  if (x instanceof Date) return formatDate(new Date(Math.round(x.getTime() / 86400000) * 86400000));
  if (typeof x === "number" && x > 30000 && x < 80000) return formatDate(new Date(Math.round((x - 25569) * 86400000)));
  const m = text(x).match(/^(\d{2}|\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (!m) return null;
  const iso = `${m[1].length === 2 ? `20${m[1]}` : m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return Number.isNaN(new Date(`${iso}T00:00:00Z`).getTime()) || formatDate(new Date(`${iso}T00:00:00Z`)) !== iso ? null : iso;
};
/** 시각: 07:00 · 7:00 · 엑셀 시간 값 */
const timeOfCell = (v: CellV): string => {
  const x = raw(v);
  const hm = (mins: number) => `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  if (x instanceof Date) return hm(x.getUTCHours() * 60 + x.getUTCMinutes());
  if (typeof x === "number" && x >= 0 && x < 1) return hm(Math.round(x * 1440));
  const m = text(x).match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : text(x);
};
const moneyOf = (v: CellV): MoneyOrLabel | null => {
  const n = numOf(v);
  if (n != null) return n;
  const t = text(v);
  return t === "미정" || t === "운항없음" || t === "마감" ? t : null;
};
const flagOf = (v: CellV) => { const t = text(v).toLowerCase(); return !!t && !["x", "n", "no", "0", "아니오", "-"].includes(t); };
const same = (a: string, b: string) => a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();

/** 머리글 줄을 찾아 {열 key → 열 번호} 를 돌려준다. need 에 적은 key 의 머리글이 모두 있는 줄이 머리글 줄 */
function findTable(wb: ExcelJS.Workbook, cols: ColumnDef[], need: string[]): { ws: ExcelJS.Worksheet; head: number; at: Record<string, number> } | null {
  const want = new Map(cols.map((c) => [normLabel(c.label), c.key]));
  for (const ws of wb.worksheets) for (let r = 1; r <= Math.min(6, ws.rowCount); r++) {
    const at: Record<string, number> = {};
    ws.getRow(r).eachCell((c, n) => { const k = want.get(normLabel(text(c.value))); if (k && at[k] == null) at[k] = n; });
    if (need.every((k) => at[k] != null)) return { ws, head: r, at };
  }
  return null;
}
const rowHasValue = (ws: ExcelJS.Worksheet, r: number, at: Record<string, number>) => Object.values(at).some((c) => text(ws.getCell(r, c).value) !== "");

/** 이름으로 단가 찾기: 이번 파일에서 만든 것 → 같은 지역의 기존 것. 글자 그대로 같거나, 업종어(호텔·CC 등)를 뺀 이름이 같으면 같은 것으로 본다 */
function findByName<T extends { id: string; name: string; region: string }>(name: string, fresh: T[], existing: T[], region: string, exactOnly = false): T | null {
  const pool = [...fresh, ...existing.filter((x) => x.region === region && !fresh.some((f) => f.id === x.id))];
  return pool.find((x) => same(x.name, name)) ?? (exactOnly ? null : pool.find((x) => normName(x.name) !== "" && normName(x.name) === normName(name)) ?? null);
}
const newId = (prefix: string, name: string, region: string, taken: Set<string>) => { const base = `${prefix}-${slug(name)}`; return taken.has(base) ? `${base}-${slug(region)}` : base; };

export function isInputWorkbook(wb: ExcelJS.Workbook): boolean {
  return wb.worksheets.some((ws) => text(ws.getCell("A1").value).startsWith(INPUT_MARK));
}

export function importInputWorkbook(wb: ExcelJS.Workbook, ctx: InputImportContext): InputImportResult {
  const issues: string[] = [], log: string[] = [];
  const { now, existing } = ctx;
  const setup = wb.worksheets.find((ws) => text(ws.getCell("A1").value).startsWith(INPUT_MARK));
  if (!setup) throw new InputIssues(["'1 원가표' 시트를 찾지 못했습니다(A1 이 '원가표 입력표' 로 시작해야 합니다)."]);

  // ── 1 원가표: A열 항목 이름으로 줄을 찾는다 ──
  const rowOf = new Map<string, number>();
  for (let r = 1; r <= setup.rowCount; r++) { const k = normLabel(text(setup.getCell(r, 1).value)); if (k && !rowOf.has(k)) rowOf.set(k, r); }
  const cellAt = (label: string, col: number): CellV => { const r = rowOf.get(normLabel(label)); return r ? setup.getCell(r, col).value : null; };
  for (const f of [...GROUP_FIELDS, ...SHEET_FIELDS]) if (f.required && !rowOf.has(normLabel(f.label))) issues.push(`'1 원가표' 시트에 "${f.label}" 줄이 없습니다. 항목 이름(A열)은 바꾸지 마세요.`);
  if (issues.length) throw new InputIssues(issues);

  const groupName = text(cellAt("상품군 이름", 3)), country = text(cellAt("국가", 3)) || "일본", region = text(cellAt("지역", 3));
  if (!groupName) issues.push("상품군 이름이 비어 있습니다('1 원가표' 시트 C열).");
  if (!region) issues.push("지역이 비어 있습니다('1 원가표' 시트 C열).");
  const nameRow = rowOf.get(normLabel("원가표 이름"))!;
  const sheetCols: number[] = [];
  for (let c = 3; c <= Math.max(setup.columnCount, 3); c++) if (text(setup.getCell(nameRow, c).value)) sheetCols.push(c);
  if (!sheetCols.length) issues.push("원가표가 하나도 없습니다. '1 원가표' 시트의 원가표 이름 줄(C열부터)에 이름을 적으세요.");

  // ── 2 호텔 / 3 일자별 요금 / 4 골프장 / 5 차량 ──
  const hotels: Hotel[] = [], courses: GolfCourse[] = [], vehicles: VehicleRule[] = [];
  const takenIds = new Set([...existing.hotels, ...existing.courses, ...existing.vehicles].map((x) => x.id));
  const weekdayRates = (ws: ExcelJS.Worksheet, r: number, at: Record<string, number>, base: WeekdayRates | undefined, who: string): WeekdayRates | null => {
    const out = {} as WeekdayRates;
    const miss: string[] = [];
    for (let w = 0; w < 7; w++) { const v = at[`w${w}`] != null ? numOf(ws.getCell(r, at[`w${w}`]).value) : null; if (v != null) out[w as Weekday] = v; else if (base) out[w as Weekday] = base[w as Weekday]; else miss.push("일월화수목금토"[w]); }
    if (miss.length) { issues.push(`${who}: ${miss.join("·")}요일 금액이 비어 있습니다(새로 등록하는 것은 7개 요일을 모두 적어야 합니다).`); return null; }
    return out;
  };

  const ht = findTable(wb, HOTEL_COLUMNS, ["name", "w0", "w6"]);
  if (ht) for (let r = ht.head + 1; r <= ht.ws.rowCount; r++) {
    const name = text(ht.ws.getCell(r, ht.at.name).value);
    if (!name) { if (rowHasValue(ht.ws, r, ht.at)) issues.push(`'${ht.ws.name}' ${r}행: 호텔명이 비어 있습니다.`); continue; }
    const cur = findByName(name, hotels, existing.hotels, region);
    const rates = weekdayRates(ht.ws, r, ht.at, cur?.nightlyRates, `'${ht.ws.name}' ${r}행 ${name}`);
    if (!rates) continue;
    const opt = (k: string) => (ht.at[k] != null ? text(ht.ws.getCell(r, ht.at[k]).value) : "");
    const h: Hotel = { ...(cur ?? { id: newId("hotel", name, region, takenIds), name, region }), nightlyRates: rates, roomBasis: opt("roomBasis") || cur?.roomBasis, memo: opt("memo") || cur?.memo, updatedAt: now };
    takenIds.add(h.id);
    const i = hotels.findIndex((x) => x.id === h.id);
    if (i >= 0) hotels[i] = h; else hotels.push(h);
    log.push(cur ? `호텔 '${h.name}' 요일 요금 갱신` : `호텔 '${h.name}' 새로 등록`);
  }

  // 3 일자별 요금: 머리글 줄에서 '숙박일' 을 찾고, 그 오른쪽(요일 열 제외)의 머리글이 호텔명
  for (const ws of wb.worksheets) {
    let head = 0, dateCol = 0;
    for (let r = 1; r <= Math.min(6, ws.rowCount) && !head; r++) ws.getRow(r).eachCell((c, n) => { if (!head && normLabel(text(c.value)) === HOTEL_DATE_HEAD.date) { head = r; dateCol = n; } });
    if (!head) continue;
    const cols: { col: number; hotel: Hotel }[] = [];
    ws.getRow(head).eachCell((c, n) => {
      const name = text(c.value);
      if (n === dateCol || !name || normLabel(name) === HOTEL_DATE_HEAD.weekday) return;
      const cur = findByName(name, hotels, existing.hotels, region);
      if (!cur) { issues.push(`'${ws.name}' 시트의 호텔 '${name}' 을 찾지 못했습니다. '2 호텔' 시트에 먼저 적거나 등록된 이름을 쓰세요.`); return; }
      let h = hotels.find((x) => x.id === cur.id);
      if (!h) { h = { ...cur, updatedAt: now }; hotels.push(h); }
      cols.push({ col: n, hotel: h });
    });
    const count = new Map<string, number>();
    for (let r = head + 1; r <= ws.rowCount; r++) {
      const dv = ws.getCell(r, dateCol).value;
      if (!text(dv)) continue;
      const date = dateOfCell(dv);
      if (!date) { issues.push(`'${ws.name}' ${r}행: 숙박일 "${text(dv)}" 을 날짜로 읽지 못했습니다(예: 2026-12-01).`); continue; }
      for (const { col, hotel } of cols) { const v = numOf(ws.getCell(r, col).value); if (v == null) continue; hotel.dateRates = { ...(hotel.dateRates ?? {}), [date]: v }; count.set(hotel.name, (count.get(hotel.name) ?? 0) + 1); }
    }
    for (const [name, n] of count) log.push(`호텔 '${name}' 일자별 요금 ${n}일 반영`);
    break;
  }

  const gt = findTable(wb, GOLF_COLUMNS, ["name", "weekday", "weekend"]);
  if (gt) {
    const blocks = new Map<string, { rows: number[] }>();
    for (let r = gt.head + 1; r <= gt.ws.rowCount; r++) {
      const name = text(gt.ws.getCell(r, gt.at.name).value);
      if (!name) { if (rowHasValue(gt.ws, r, gt.at)) issues.push(`'${gt.ws.name}' ${r}행: 골프장명이 비어 있습니다.`); continue; }
      const key = [...blocks.keys()].find((k) => same(k, name)) ?? name;
      blocks.set(key, { rows: [...(blocks.get(key)?.rows ?? []), r] });
    }
    for (const [name, { rows }] of blocks) {
      const cur = findByName(name, courses, existing.courses, region);
      const get = (r: number, k: string) => (gt.at[k] != null ? gt.ws.getCell(r, gt.at[k]).value : null);
      const periods: GolfRatePeriod[] = [];
      for (const r of rows) {
        const fromV = get(r, "from"), toV = get(r, "to");
        const from = text(fromV) ? dateOfCell(fromV) : "", to = text(toV) ? dateOfCell(toV) : "";
        const where = `'${gt.ws.name}' ${r}행 ${name}`;
        if (from == null || to == null) { issues.push(`${where}: 기간을 날짜로 읽지 못했습니다(예: 2026-12-01).`); continue; }
        if (!from || !to) issues.push(`${where}: 기간 시작·끝이 비어 있습니다.`);
        else if (from > to) issues.push(`${where}: 기간 시작(${from})이 끝(${to})보다 늦습니다.`);
        const weekday = numOf(get(r, "weekday")), weekend = numOf(get(r, "weekend")), holiday = numOf(get(r, "holiday"));
        if (weekday == null && weekend == null && holiday == null) { issues.push(`${where}: 주중·주말 요금이 비어 있습니다.`); continue; }
        const style = text(get(r, "style")) || undefined, label = text(get(r, "label")) || undefined;
        periods.push({ ...(label ? { label } : {}), from: from || "", to: to || "", weekday, weekend, holiday: holiday ?? weekend, ...(style ? { style } : {}) });
      }
      const first = rows[0];
      const c: GolfCourse = {
        ...(cur ?? { id: newId("golf", name, region, takenIds), name, region, holes: 18, playStyle: periods.find((p) => p.style)?.style ?? "셀프플레이" }),
        holes: numOf(get(first, "holes")) ?? cur?.holes ?? 18, tel: text(get(first, "tel")) || cur?.tel, notes: text(get(first, "notes")) || cur?.notes, periods, updatedAt: now,
      } as GolfCourse;
      takenIds.add(c.id); courses.push(c);
      log.push(`${cur ? `골프장 '${c.name}' 요금 구간 ${periods.length}줄로 교체` : `골프장 '${c.name}' 새로 등록(${periods.length}줄)`}`);
    }
  }

  const vt = findTable(wb, VEHICLE_COLUMNS, ["name", "w0", "w6"]);
  if (vt) for (let r = vt.head + 1; r <= vt.ws.rowCount; r++) {
    const name = text(vt.ws.getCell(r, vt.at.name).value);
    if (!name) { if (rowHasValue(vt.ws, r, vt.at)) issues.push(`'${vt.ws.name}' ${r}행: 차량 규칙 이름이 비어 있습니다.`); continue; }
    const pool = [...vehicles, ...existing.vehicles.filter((x) => x.region === region)];
    const cur = pool.find((x) => same(x.name, name)) ?? null;
    const fees = weekdayRates(vt.ws, r, vt.at, cur?.feesByWeekday, `'${vt.ws.name}' ${r}행 ${name}`);
    if (!fees) continue;
    const memo = vt.at.memo != null ? text(vt.ws.getCell(r, vt.at.memo).value) : "";
    const v: VehicleRule = { ...(cur ?? { id: newId("veh", name, region, takenIds), name, region }), feesByWeekday: fees, memo: memo || cur?.memo, updatedAt: now };
    takenIds.add(v.id); vehicles.push(v);
    log.push(cur ? `차량 규칙 '${v.name}' 금액 갱신` : `차량 규칙 '${v.name}' 새로 등록`);
  }

  // ── 6 날짜별 입력 ──
  type Daily = { r: number; date: string; ov: RowOverride; groupFare: MoneyOrLabel | null; groupTax: MoneyOrLabel | null };
  const dailyBySheet = new Map<string, Daily[]>();
  const dt = findTable(wb, DAILY_COLUMNS, ["sheet", "date"]);
  if (dt) for (let r = dt.head + 1; r <= dt.ws.rowCount; r++) {
    const sheet = text(dt.ws.getCell(r, dt.at.sheet).value), dv = dt.ws.getCell(r, dt.at.date).value;
    if (!sheet && !text(dv)) { continue; }
    const where = `'${dt.ws.name}' ${r}행`;
    if (!sheet) { issues.push(`${where}: 원가표 이름이 비어 있습니다.`); continue; }
    const date = dateOfCell(dv);
    if (!date) { issues.push(`${where}: 출발일 "${text(dv)}" 을 날짜로 읽지 못했습니다(예: 2026-12-01).`); continue; }
    const get = (k: string): CellV => (dt.at[k] != null ? dt.ws.getCell(r, dt.at[k]).value : null);
    const ov: RowOverride = {};
    const saleV = raw(get("sale"));
    const sale = typeof saleV === "number" ? String(saleV) : text(saleV);
    if (sale) ov.directSalePrice = sale;
    const out = moneyOf(get("outFare")), inn = moneyOf(get("inFare"));
    if (out != null) ov.outboundFare = out;
    if (inn != null) ov.inboundFare = inn;
    for (const [k, f] of [["airIndiv", "airIndivKrw"], ["hotelJpy", "hotelJpy"], ["golfJpy", "golfJpy"], ["vehicleKrw", "vehicleKrw"], ["extrasKrw", "extrasKrw"], ["airSurchargeKrw", "airSurchargeKrw"]] as const) {
      const cell = get(k), n = numOf(cell);
      if (n != null) ov[f] = n; else if (text(cell)) issues.push(`${where}: ${DAILY_COLUMNS.find((c) => c.key === k)!.label} "${text(cell)}" 은 숫자가 아닙니다.`);
    }
    if (flagOf(get("spot"))) ov.spotSpecial = true;
    if (flagOf(get("groupSpecial"))) ov.groupSpecial = true;
    if (flagOf(get("soldOut"))) ov.soldOut = true;
    if (flagOf(get("hidden"))) ov.hidden = true;
    const memo = text(get("memo"));
    if (memo) ov.memo = memo;
    const key = [...dailyBySheet.keys()].find((k) => same(k, sheet)) ?? sheet;
    dailyBySheet.set(key, [...(dailyBySheet.get(key) ?? []), { r, date, ov, groupFare: moneyOf(get("groupFare")), groupTax: moneyOf(get("groupTax")) }]);
  }

  // ── 원가표 조립 ──
  const curGroup = existing.groups.find((g) => same(g.name, groupName)) ?? null;
  const groupId = curGroup?.id ?? `grp-${slug(groupName)}`;
  const takenProductIds = new Set(existing.products.map((p) => p.id));
  const products: Product[] = [];
  const names = new Set<string>();
  for (const col of sheetCols) {
    const get = (label: string) => cellAt(label, col);
    const name = text(get("원가표 이름"));
    const at = `원가표 '${name}'`;
    const err = (m: string) => issues.push(`${at}: ${m}`);
    if ([...names].some((n) => same(n, name))) { err("같은 이름의 원가표가 이 파일에 두 번 있습니다."); continue; }
    names.add(name);
    for (const f of SHEET_FIELDS) if (f.required && !text(get(f.label))) err(`"${f.label}" 이 비어 있습니다.`);

    const typeText = text(get("판매 유형")).replace(/\s/g, "");
    const saleType = typeText === SALE_TYPE_TEXT.land ? "land" : "air";
    if (typeText && typeText !== SALE_TYPE_TEXT.land && typeText !== SALE_TYPE_TEXT.air.replace(/\s/g, "")) err(`판매 유형 "${text(get("판매 유형"))}" 은 ${SALE_TYPE_TEXT.air} 또는 ${SALE_TYPE_TEXT.land} 이어야 합니다.`);
    const nights = numOf(get("박수")) ?? 0;
    if (text(get("박수")) && (!Number.isInteger(nights) || nights < 1 || nights > 14)) err(`박수 "${text(get("박수"))}" 는 1~14 사이 정수여야 합니다.`);
    const planText = text(get("일자별 홀수"));
    const golfPlan = planText ? planText.split(/[,\s/+]+/).filter(Boolean).map((x) => Number(x.replace(/[hH홀]/g, ""))) : [];
    if (golfPlan.some((x) => !Number.isInteger(x) || x < 0)) err(`일자별 홀수 "${planText}" 는 숫자를 콤마로 이어 적습니다(예: 0,18,18,0).`);
    else if (planText && nights && golfPlan.length !== nights + 1) err(`일자별 홀수는 ${nights + 1}일치(박수 + 1)여야 하는데 ${golfPlan.length}개입니다: "${planText}".`);
    const dateFrom = dateOfCell(get("출발일 시작")), dateTo = dateOfCell(get("출발일 끝"));
    if (text(get("출발일 시작")) && !dateFrom) err(`출발일 시작 "${text(get("출발일 시작"))}" 을 날짜로 읽지 못했습니다(예: 2026-12-01).`);
    if (text(get("출발일 끝")) && !dateTo) err(`출발일 끝 "${text(get("출발일 끝"))}" 을 날짜로 읽지 못했습니다.`);
    if (dateFrom && dateTo && dateFrom > dateTo) err(`출발일 시작(${dateFrom})이 끝(${dateTo})보다 늦습니다.`);
    const exchangeRate = numOf(get("환율")) ?? 0;
    if (text(get("환율")) && !(exchangeRate > 0)) err(`환율 "${text(get("환율"))}" 은 0보다 큰 숫자여야 합니다.`);
    const marginText = text(get("마진(%)"));
    const margins = marginText ? marginText.split(/[,\s/]+/).filter(Boolean).map((x) => Number(x.replace("%", "")) / 100) : [0.15, 0.2];
    if (margins.some((m) => !(m > 0 && m < 0.9))) err(`마진 "${marginText}" 은 1~89 사이 숫자를 콤마로 적습니다(예: 15, 20).`);

    // 숙박 구성
    const stays: StaySpec[] = [];
    for (const seg of text(get("숙박 구성")).split(/\s*[+\n]\s*/).filter(Boolean)) {
      const m = seg.match(/^(.*?)\s*(\d+)\s*박$/);
      if (!m) { err(`숙박 구성 "${seg}" 은 "호텔명 N박" 으로 적습니다.`); continue; }
      const h = findByName(m[1].trim(), hotels, existing.hotels, region);
      if (!h) { err(`숙박 구성의 호텔 '${m[1].trim()}' 을 찾지 못했습니다. '2 호텔' 시트에 요금을 적거나 '참고 등록된 단가' 시트의 이름을 쓰세요.`); continue; }
      stays.push({ hotelId: h.id, nights: Number(m[2]) });
    }
    const stayNights = stays.reduce((a, s) => a + s.nights, 0);
    if (stays.length && nights && stayNights !== nights) err(`숙박 구성의 박수 합(${stayNights}박)이 박수(${nights}박)와 다릅니다.`);

    // 골프 구성
    const rounds = golfPlan.filter((x) => x > 0).length;
    const golfCourseIds: string[] = [], golfStyles: string[] = [];
    const golfSegs = text(get("골프 구성")).split(/\s*(?:\+|→|\n)\s*/).filter(Boolean);
    for (const seg of golfSegs) {
      // 이름 전체가 그대로 맞는지 먼저 보고, 아니면 끝의 (…) 를 스타일로 떼어 본다. 괄호가 이름의 일부인 골프장(…(가와우치코스))과 구분하기 위해서다
      let c = findByName(seg, courses, existing.courses, region, true), style = "";
      const m = c ? null : seg.match(/^(.*)\(([^()]+)\)$/);
      if (m) { c = findByName(m[1].trim(), courses, existing.courses, region); if (c) style = m[2].trim(); }
      if (!c) c = findByName(seg, courses, existing.courses, region);
      if (!c) { err(`골프 구성의 골프장 '${seg}' 을 찾지 못했습니다. '4 골프장 요금' 시트에 요금을 적거나 '참고 등록된 단가' 시트의 이름을 쓰세요.`); continue; }
      if (style && !c.periods.some((p) => p.style === style)) log.push(`※ ${at}: '${c.name}' 에 ${style} 요금 줄이 없어 기본 요금으로 계산됩니다.`);
      golfCourseIds.push(c.id); golfStyles.push(style);
    }
    if (rounds && !golfSegs.length) err(`골프가 ${rounds}회 있는데 골프 구성이 비어 있습니다.`);
    if (golfCourseIds.length > rounds) err(`골프 구성에 골프장이 ${golfCourseIds.length}곳인데 라운드는 ${rounds}회입니다(일자별 홀수 "${planText}").`);
    else if (golfCourseIds.length && golfCourseIds.length < rounds) log.push(`※ ${at}: 골프장 ${golfCourseIds.length}곳을 ${rounds}회 라운드에 차례로 되풀이해 배정합니다.`);

    // 차량·기타 원가
    const vehicleName = text(get("차량 규칙"));
    const vehicle = vehicleName ? [...vehicles, ...existing.vehicles.filter((x) => x.region === region)].find((x) => same(x.name, vehicleName)) ?? null : null;
    if (vehicleName && !vehicle) err(`차량 규칙 '${vehicleName}' 을 찾지 못했습니다. '5 차량' 시트에 금액을 적거나 '참고 등록된 단가' 시트의 이름을 쓰세요.`);
    const extras: ExtraCost[] = [];
    for (const seg of text(get("기타 원가")).split(/\s*(?:\+|;|\n)\s*/).filter(Boolean)) {
      const m = seg.match(/^(.*?)\s*([\d,]+(?:\.\d+)?)\s*(원|엔|¥|₩)?$/);
      if (!m || !m[1].trim()) { err(`기타 원가 "${seg}" 은 "항목 40000원" 또는 "항목 3000엔" 으로 적습니다.`); continue; }
      const amount = Number(m[2].replace(/,/g, "")), yen = m[3] === "엔" || m[3] === "¥";
      const curExtra = extras.find((e) => e.label === m[1].trim());
      if (curExtra) { if (yen) curExtra.jpy = amount; else curExtra.krw = amount; } else extras.push(yen ? { label: m[1].trim(), jpy: amount } : { label: m[1].trim(), krw: amount });
    }

    // 날짜별 입력: 줄이 있으면 통째로 교체, 없으면 기존 값 유지
    const cur = existing.products.find((p) => same(p.name, name)) ?? null;
    const daily = [...dailyBySheet.entries()].find(([k]) => same(k, name))?.[1];
    let overrides = cur?.overrides ?? {}, groupFares = cur?.groupFares ?? {}, groupTaxByMonth = cur?.groupTaxByMonth ?? {};
    if (daily) {
      overrides = {}; groupFares = {}; groupTaxByMonth = {};
      for (const x of daily) {
        if (dateFrom && dateTo && (x.date < dateFrom || x.date > dateTo)) { log.push(`※ ${at}: 날짜별 입력 ${x.date} 는 출발일 범위 밖이라 건너뜁니다.`); continue; }
        if (Object.keys(x.ov).length) overrides[x.date] = { ...(overrides[x.date] ?? {}), ...x.ov };
        if (x.groupFare != null) groupFares[x.date] = x.groupFare;
        if (x.groupTax != null) groupTaxByMonth[x.date.slice(0, 7)] = x.groupTax;
      }
    }

    const optional = (label: string) => text(get(label)) || undefined;
    const pax = numOf(get("기준 인원"));
    const id = cur?.id ?? (takenProductIds.has(`prd-${slug(name)}`) ? `prd-${slug(`${groupName} ${name}`)}` : `prd-${slug(name)}`);
    takenProductIds.add(id);
    const airline = text(get("항공사 코드")).toUpperCase(), origin = text(get("출발 공항")).toUpperCase(), destination = text(get("도착 공항")).toUpperCase();
    products.push({
      id, name, groupId, ...(saleType === "land" || cur?.saleType ? { saleType } : {}), ...(pax ? { paxBasis: pax } : {}), region, airline,
      outbound: { flightNo: text(get("출발편")).toUpperCase().replace(/\s/g, ""), origin, destination, dep: timeOfCell(get("출발편 출발 시각")), arr: timeOfCell(get("출발편 도착 시각")) },
      inbound: { flightNo: text(get("귀국편")).toUpperCase().replace(/\s/g, ""), origin: destination, destination: origin, dep: timeOfCell(get("귀국편 출발 시각")), arr: timeOfCell(get("귀국편 도착 시각")) },
      nights, golfPlan, hotelId: stays[0]?.hotelId ?? "", ...(stays.length > 1 ? { stays } : {}),
      ...(optional("엑셀 머리글 호텔 문구") ? { hotelLabel: optional("엑셀 머리글 호텔 문구") } : {}),
      golfCourseIds, ...(golfStyles.some(Boolean) ? { golfStyles } : {}), ...(optional("엑셀 머리글 골프 문구") ? { golfLabel: optional("엑셀 머리글 골프 문구") } : {}),
      vehicleRuleId: vehicle?.id ?? "", ...(extras.length ? { extras } : {}), ...(optional("비고") ? { note: optional("비고") } : {}),
      exchangeRate, margins, dateFrom: dateFrom ?? "", dateTo: dateTo ?? "", groupFares, groupTaxByMonth, overrides,
      ...(optional("범례 문구") ? { legend: optional("범례 문구") } : {}),
      createdAt: cur?.createdAt ?? now, updatedAt: now,
    });
  }
  for (const [sheet, rows] of dailyBySheet) if (![...names].some((n) => same(n, sheet))) issues.push(`'6 날짜별 입력' ${rows[0].r}행: 원가표 '${sheet}' 가 '1 원가표' 시트에 없습니다.`);
  if (issues.length) throw new InputIssues([...new Set(issues)]);

  const group: ProductGroup = { ...(curGroup ?? { id: groupId, createdAt: now }), name: groupName, country, region, airline: curGroup?.airline ?? products[0]?.airline, fileName: curGroup?.fileName ?? ctx.fileName, updatedAt: now } as ProductGroup;

  // ── 확인용 요약: 원가표별 구성과 첫 출발일 원가 ──
  const hotelsById = new Map([...existing.hotels, ...hotels].map((h) => [h.id, h]));
  const coursesById = new Map([...existing.courses, ...courses].map((c) => [c.id, c]));
  const vehiclesById = new Map([...existing.vehicles, ...vehicles].map((v) => [v.id, v]));
  const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
  for (const p of products) {
    const first = [p.dateFrom, ...Array.from({ length: 60 }, (_, i) => addDays(p.dateFrom, i + 1))].find((d) => d <= p.dateTo && !p.overrides[d]?.hidden) ?? p.dateFrom;
    const qctx = { hotel: hotelsById.get(p.hotelId) ?? null, hotelsById, courses: p.golfCourseIds.map((id) => coursesById.get(id)!).filter(Boolean), vehicle: vehiclesById.get(p.vehicleRuleId) ?? null, holidays: ctx.holidays, fares: new Map() };
    const row = computeRow(p, qctx, first);
    const cost = p.saleType === "land" && typeof row.costIndiv === "number" ? ` → 원가합 ${won(row.costIndiv)}` : " (항공은 수집된 운임으로 따로 더해집니다)";
    const was = existing.products.some((x) => x.id === p.id);
    log.push(`원가표 '${p.name}' ${was ? "갱신" : "새로 등록"} · ${SALE_TYPE_TEXT[p.saleType ?? "air"]} · ${p.nights}박 · 출발일 ${p.dateFrom}~${p.dateTo} · 날짜별 입력 ${Object.keys(p.overrides).length}일`);
    log.push(`  첫 출발일 ${first}: 호텔 ${row.hotelJpy.toLocaleString("ko-KR")}엔 · 골프 ${row.golfJpy.toLocaleString("ko-KR")}엔 · 차량 ${won(row.vehicleKrw)}${row.extrasKrw ? ` · 기타 ${won(row.extrasKrw)}` : ""}${cost}`);
  }
  log.unshift(`상품군 '${group.name}' (${group.country} › ${group.region}) ${curGroup ? "갱신" : "새로 등록"} · 원가표 ${products.length}개`);
  return { group, products, hotels, courses, vehicles, log };
}
