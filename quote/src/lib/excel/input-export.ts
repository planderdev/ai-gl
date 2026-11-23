import ExcelJS from "exceljs";
import type { GolfCourse, Hotel, MoneyOrLabel, Product, ProductGroup, RowOverride, VehicleRule, Weekday } from "@/types";
import { staysOf } from "@/lib/pricing/engine";
import { eachDate, parseDate, weekdayLabel } from "@/lib/pricing/date";
import { DAILY_COLUMNS, FLAG_ON, GOLF_COLUMNS, GROUP_FIELDS, HOTEL_COLUMNS, HOTEL_DATE_HEAD, INPUT_MARK, INPUT_SHEETS, SALE_TYPE_TEXT, SETUP_COLUMNS, SHEET_FIELDS, VEHICLE_COLUMNS, WEEKDAY_HEADERS, type ColumnDef, type SetupField } from "./input-sheet";

/**
 * 원가표 입력표(.xlsx) 만들기.
 * - products 가 비어 있으면 빈 양식, 있으면 그 상품군의 현재 값으로 채운 양식(고쳐서 다시 올리는 용도).
 * - 채운 양식은 다시 가져왔을 때 같은 원가표가 나오도록, 원가표가 쓰는 호텔·골프장·차량 단가와 날짜별 입력값을 빠짐없이 적는다.
 */
export interface InputWorkbookData {
  group?: ProductGroup | null;
  products: Product[];
  /** 지역의 모든 단가(참고 시트용). 채운 양식에서는 원가표가 쓰는 것만 골라 2·4·5 시트에 적는다 */
  hotels: Hotel[];
  courses: GolfCourse[];
  vehicles: VehicleRule[];
}

const FONT = { name: "맑은 고딕", size: 10 } as const;
const thin = { style: "thin" as const, color: { argb: "FFBFBFBF" } };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
const fill = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const REQUIRED = "FFFFF2CC", OPTIONAL = "FFF2F2F2", TITLE = "FFDDEBF7", INPUT = "FFFFFFFF";
const L = (n: number): string => (n > 26 ? L(Math.floor((n - 1) / 26)) : "") + String.fromCharCode(65 + ((n - 1) % 26));
const fmtOf = (kind: string) => (kind === "date" ? "yyyy-mm-dd" : kind === "number" || kind === "money" ? "#,##0.##" : "@");
const dateCell = (s: string | undefined) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? parseDate(s) : s || null);

function titleRow(ws: ExcelJS.Worksheet, text: string, span: number, row = 1) {
  ws.mergeCells(row, 1, row, span);
  const c = ws.getCell(row, 1);
  c.value = text; c.font = { ...FONT, bold: true, size: 11 }; c.fill = fill(TITLE);
  c.alignment = { vertical: "middle", wrapText: true };
  ws.getRow(row).height = 34;
}
function headerRow(ws: ExcelJS.Worksheet, row: number, cols: ColumnDef[]) {
  cols.forEach((col, i) => {
    const c = ws.getCell(row, i + 1);
    c.value = col.required ? `${col.label}*` : col.label;
    c.font = { ...FONT, bold: true }; c.fill = fill(col.required ? REQUIRED : OPTIONAL); c.border = BORDER;
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    if (col.note) c.note = col.note;
    ws.getColumn(i + 1).width = col.width;
  });
  ws.getRow(row).height = 30;
}
/** 표 본문: 값이 있는 줄 + 빈 입력 줄. 줄마다 테두리·서식·드롭다운을 준다 */
function bodyRows(ws: ExcelJS.Worksheet, first: number, cols: ColumnDef[], rows: Record<string, ExcelJS.CellValue>[], blank: number, validation: Record<string, ExcelJS.DataValidation> = {}) {
  const total = rows.length + blank;
  for (let i = 0; i < total; i++) {
    const data = rows[i] ?? {};
    cols.forEach((col, k) => {
      const c = ws.getCell(first + i, k + 1);
      const v = data[col.key];
      if (v != null && v !== "") c.value = v;
      c.font = { ...FONT }; c.border = BORDER; c.fill = fill(INPUT);
      c.numFmt = col.kind === "flag" ? "@" : fmtOf(col.kind);
      c.alignment = { horizontal: col.kind === "text" && col.key !== "sheet" && col.key !== "name" ? "left" : col.kind === "text" ? "left" : "center", vertical: "middle" };
      if (col.kind === "flag") c.dataValidation = { type: "list", allowBlank: true, formulae: [`"${FLAG_ON}"`], showErrorMessage: false };
      if (validation[col.key]) c.dataValidation = validation[col.key];
    });
  }
  return first + total - 1;
}

const moneyCell = (v: MoneyOrLabel | null | undefined): ExcelJS.CellValue => (v == null ? null : v);
/** 숙박 구성 → "쥬라쿠 스파&리조트 1박 + 넘버원 2박" */
const stayText = (p: Product, hotelsById: Map<string, Hotel>) => staysOf(p).map((s) => `${hotelsById.get(s.hotelId)?.name ?? s.hotelId} ${s.nights}박`).join(" + ");
/** 골프 구성 → 라운드마다 "골프장명(스타일)" */
function golfText(p: Product, coursesById: Map<string, GolfCourse>) {
  const ids = p.golfCourseIds;
  if (!ids.length) return "";
  const rounds = p.golfPlan.filter(Boolean).length;
  return Array.from({ length: rounds }, (_, i) => { const slot = i % ids.length; const st = p.golfStyles?.[slot]; return `${coursesById.get(ids[slot])?.name ?? ids[slot]}${st ? `(${st})` : ""}`; }).join(" + ");
}
const extrasText = (p: Product) => (p.extras ?? []).flatMap((e) => [e.krw ? `${e.label} ${e.krw}원` : "", e.jpy ? `${e.label} ${e.jpy}엔` : ""].filter(Boolean)).join(" + ");

function setupValues(p: Product, hotelsById: Map<string, Hotel>, coursesById: Map<string, GolfCourse>, vehiclesById: Map<string, VehicleRule>): Record<string, ExcelJS.CellValue> {
  return {
    name: p.name, saleType: SALE_TYPE_TEXT[p.saleType ?? "air"], paxBasis: p.paxBasis ?? null, airline: p.airline,
    outFlight: p.outbound.flightNo, origin: p.outbound.origin, destination: p.outbound.destination, outDep: p.outbound.dep, outArr: p.outbound.arr,
    inFlight: p.inbound.flightNo, inDep: p.inbound.dep, inArr: p.inbound.arr,
    nights: p.nights, golfPlan: p.golfPlan.join(","), dateFrom: dateCell(p.dateFrom), dateTo: dateCell(p.dateTo), exchangeRate: p.exchangeRate,
    margins: p.margins.map((m) => Math.round(m * 1000) / 10).join(", "),
    stays: stayText(p, hotelsById), golf: golfText(p, coursesById), vehicle: vehiclesById.get(p.vehicleRuleId)?.name ?? "", extras: extrasText(p),
    hotelLabel: p.hotelLabel ?? "", golfLabel: p.golfLabel ?? "", legend: p.legend ?? "", note: p.note ?? "",
  };
}

function addGuideSheet(wb: ExcelJS.Workbook, filled: boolean) {
  const ws = wb.addWorksheet(INPUT_SHEETS.guide);
  ws.getColumn(1).width = 4; ws.getColumn(2).width = 24; ws.getColumn(3).width = 110;
  const lines: [string, string, boolean?][] = [
    ["", "원가표 입력표 작성 안내", true],
    ["", filled ? "이 파일은 지금 등록된 상품군의 값으로 채워져 있습니다. 고칠 곳만 고쳐서 다시 올리면 됩니다." : "이 파일을 채워서 올리면 상품군·원가표와 호텔·골프장·차량 단가가 한 번에 만들어집니다."],
    ["", ""],
    ["순서", "", true],
    ["1", "'1 원가표' 시트에 상품군과 원가표를 적습니다. 열 하나가 원가표(시트) 하나입니다. 비슷한 원가표는 왼쪽 열을 복사해 다른 곳만 고치세요."],
    ["2", "새 호텔·골프장·차량이거나 요금이 바뀌었으면 '2 호텔' ~ '5 차량' 시트에 요금을 적습니다. 이미 등록된 것을 그대로 쓸 거면 비워 둡니다."],
    ["3", "날짜마다 다른 값(판매가, 그룹가, 직접 넣을 금액, 출발 없는 날)이 있으면 '6 날짜별 입력' 시트에 적습니다. 없으면 비워 둡니다."],
    ["4", "AIGL 대시보드 › 상품관리 › 원가표 엑셀 가져오기 에서 이 파일을 올립니다. 결과에 원가표별 구성과 첫 출발일 원가가 나오니 맞는지 확인하세요."],
    ["", ""],
    ["규칙", "", true],
    ["필수", "노란색 머리글(* 표시)은 꼭 채워야 합니다. 빠지면 가져오기가 멈추고 어디가 빠졌는지 알려 줍니다(아무것도 저장되지 않습니다)."],
    ["이름", "숙박 구성·골프 구성·차량 규칙에 적는 이름은 '2 호텔'·'4 골프장 요금'·'5 차량' 시트의 이름이나 '참고 등록된 단가' 시트의 이름과 같아야 합니다."],
    ["같은 이름", "원가표 이름·상품군 이름이 이미 있는 것과 같으면 새로 만들지 않고 그것을 고칩니다. 이름을 바꾸면 새 원가표가 생기고 예전 것은 그대로 남습니다."],
    ["단가", "'2 호텔'·'5 차량'에 적은 요금은 그 호텔·차량 규칙의 요금을 바꿉니다. '4 골프장 요금'에 적은 골프장은 요금 구간 전체가 이 표 내용으로 바뀝니다. 같은 단가를 쓰는 다른 원가표도 함께 바뀝니다."],
    ["골프 기간", "한 골프장에 기간이 겹치는 줄이 있으면 위에 있는 줄이 먼저 적용됩니다. 연말연시 같은 특별요금은 위쪽에 적으세요."],
    ["날짜별 입력", "어떤 원가표의 줄이 '6 날짜별 입력'에 하나라도 있으면, 그 원가표의 날짜별 값은 이 표 내용으로 통째로 바뀝니다. 한 줄도 없으면 기존 값을 그대로 둡니다."],
    ["금액", "호텔·골프는 1인 엔, 차량·기타 원가·항공은 1인 원입니다. 판매가는 만원 단위(84,9) 또는 원 단위(849000)로 적습니다."],
    ["", ""],
    ["시트 설명", "", true],
    [INPUT_SHEETS.setup, "상품군(파일 전체)과 원가표별 일정·항공편·숙박 구성·골프 구성·차량·기타 원가·환율·마진."],
    [INPUT_SHEETS.hotels, "호텔의 요일별 1인 1박 요금(엔)."],
    [INPUT_SHEETS.hotelDates, "날짜마다 요금이 다른 호텔의 숙박일별 요금(엔). 머리글에 호텔명을 적고 날짜별로 채웁니다. 적힌 날은 요일 요금 대신 이 금액을 씁니다."],
    [INPUT_SHEETS.golf, "골프장의 기간·스타일별 주중/주말/연휴 그린피(엔)."],
    [INPUT_SHEETS.vehicles, "출발 요일별 1인 차량+지원비(원)."],
    [INPUT_SHEETS.daily, "출발일별 판매가·그룹가·유택, 자동 계산 대신 쓸 금액, 강조·마감·숨김 표시."],
    [INPUT_SHEETS.ref, "지금 시스템에 등록된 호텔·골프장·차량 이름과 요금입니다(참고용, 고쳐도 반영되지 않습니다)."],
  ];
  lines.forEach(([a, b, head], i) => {
    const r = ws.getRow(i + 1);
    r.getCell(2).value = a; r.getCell(3).value = b;
    r.getCell(2).font = { ...FONT, bold: true }; r.getCell(3).font = { ...FONT, bold: !!head && !b };
    if (head) { r.getCell(2).value = a || b; r.getCell(3).value = a ? b : ""; r.getCell(2).font = { ...FONT, bold: true, size: i === 0 ? 14 : 11 }; r.getCell(2).fill = fill(TITLE); r.getCell(3).fill = fill(TITLE); }
    r.getCell(3).alignment = { wrapText: true, vertical: "top" }; r.getCell(2).alignment = { vertical: "top" };
  });
  return ws;
}

function addSetupSheet(wb: ExcelJS.Workbook, d: InputWorkbookData, maps: { hotels: Map<string, Hotel>; courses: Map<string, GolfCourse>; vehicles: Map<string, VehicleRule> }) {
  const ws = wb.addWorksheet(INPUT_SHEETS.setup);
  const cols = Math.max(SETUP_COLUMNS, d.products.length + 1);
  const last = 2 + cols;
  titleRow(ws, `${INPUT_MARK} — 1. 원가표 설정   (노란색 * 은 필수 · 열 하나가 원가표 하나 · 설명은 B열)`, last);
  ws.getColumn(1).width = 22; ws.getColumn(2).width = 46;
  for (let c = 3; c <= last; c++) ws.getColumn(c).width = 36;
  const labelCell = (r: number, f: SetupField) => {
    const a = ws.getCell(r, 1), b = ws.getCell(r, 2);
    a.value = f.required ? `${f.label}*` : f.label; a.font = { ...FONT, bold: true }; a.fill = fill(f.required ? REQUIRED : OPTIONAL); a.border = BORDER; a.alignment = { vertical: "middle" };
    b.value = f.hint; b.font = { ...FONT, color: { argb: "FF7F7F7F" } }; b.border = BORDER; b.alignment = { vertical: "middle", wrapText: true };
  };
  const inputCell = (r: number, c: number, f: SetupField, v: ExcelJS.CellValue) => {
    const x = ws.getCell(r, c);
    if (v != null && v !== "") x.value = v;
    x.font = { ...FONT }; x.border = BORDER; x.fill = fill(INPUT); x.numFmt = f.kind === "date" ? "yyyy-mm-dd" : f.kind === "number" ? "General" : "@";
    x.alignment = { vertical: "middle", wrapText: true, horizontal: "left" };
    if (f.choices) x.dataValidation = { type: "list", allowBlank: true, formulae: [`"${f.choices.join(",")}"`], showErrorMessage: true, errorTitle: f.label, error: `${f.choices.join(" / ")} 중에서 고르세요` };
  };
  const section = (r: number, text: string) => { ws.mergeCells(r, 1, r, 2); const c = ws.getCell(r, 1); c.value = text; c.font = { ...FONT, bold: true, color: { argb: "FFFFFFFF" } }; c.fill = fill("FF305496"); };

  let r = 3;
  section(r++, "상품군 (파일 전체에 한 번)");
  const g = d.group;
  const groupValues: Record<string, ExcelJS.CellValue> = { groupName: g?.name ?? "", country: g?.country ?? "", region: g?.region ?? d.products[0]?.region ?? "" };
  for (const f of GROUP_FIELDS) { labelCell(r, f); ws.mergeCells(r, 3, r, 4); inputCell(r, 3, f, groupValues[f.key]); r++; }
  r++;
  section(r, "원가표 (열 하나가 원가표 하나)");
  for (let c = 3; c <= last; c++) { const x = ws.getCell(r, c); x.value = `원가표 ${c - 2}`; x.font = { ...FONT, bold: true, color: { argb: "FFFFFFFF" } }; x.fill = fill("FF305496"); x.alignment = { horizontal: "center" }; }
  r++;
  const values = d.products.map((p) => setupValues(p, maps.hotels, maps.courses, maps.vehicles));
  let nameRow = r;
  for (const f of SHEET_FIELDS) {
    if (f.key === "name") nameRow = r;
    labelCell(r, f);
    for (let c = 3; c <= last; c++) inputCell(r, c, f, values[c - 3]?.[f.key] ?? null);
    ws.getRow(r).height = ["stays", "golf", "extras", "hotelLabel", "golfLabel"].includes(f.key) ? 44 : 20;
    r++;
  }
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 1 }];
  return { nameRange: `'${INPUT_SHEETS.setup}'!$C$${nameRow}:$${L(last)}$${nameRow}` };
}

/** 원가표의 날짜별 입력값(수동조정·그룹가·유택·숨김)을 '6 날짜별 입력' 줄로 */
function dailyRows(p: Product): Record<string, ExcelJS.CellValue>[] {
  const out: Record<string, ExcelJS.CellValue>[] = [];
  const taxDone = new Set<string>();
  for (const date of eachDate(p.dateFrom, p.dateTo)) {
    const ov: RowOverride = p.overrides[date] ?? {};
    const month = date.slice(0, 7);
    const grp = p.groupFares[date];
    // 유택은 그 달에서 줄이 생기는 첫 날짜에 한 번 적는다
    const tax = !taxDone.has(month) && p.groupTaxByMonth[month] != null ? p.groupTaxByMonth[month] : null;
    const row: Record<string, ExcelJS.CellValue> = {
      sale: ov.directSalePrice ?? null, groupFare: moneyCell(grp), groupTax: null, outFare: moneyCell(ov.outboundFare), inFare: moneyCell(ov.inboundFare), airIndiv: ov.airIndivKrw ?? null,
      hotelJpy: ov.hotelJpy ?? null, golfJpy: ov.golfJpy ?? null, vehicleKrw: ov.vehicleKrw ?? null, extrasKrw: ov.extrasKrw ?? null, airSurchargeKrw: ov.airSurchargeKrw ?? null,
      spot: ov.spotSpecial ? FLAG_ON : null, groupSpecial: ov.groupSpecial ? FLAG_ON : null, soldOut: ov.soldOut ? FLAG_ON : null, hidden: ov.hidden ? FLAG_ON : null, memo: ov.memo ?? null,
    };
    const has = Object.values(row).some((v) => v != null);
    if (!has && tax == null) continue;
    if (tax != null) { row.groupTax = moneyCell(tax); taxDone.add(month); }
    out.push({ sheet: p.name, date: parseDate(date), ...row });
  }
  // 출발일 범위에 줄이 하나도 없는 달의 유택은 그 달 첫 출발일에 적는다
  for (const [month, tax] of Object.entries(p.groupTaxByMonth)) {
    if (taxDone.has(month)) continue;
    const first = [...eachDate(p.dateFrom, p.dateTo)].find((x) => x.startsWith(month));
    if (first) out.push({ sheet: p.name, date: parseDate(first), groupTax: moneyCell(tax) });
  }
  return out.sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
}

export async function buildInputWorkbook(d: InputWorkbookData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ai-gl 견적 시스템";
  wb.created = new Date();
  const filled = d.products.length > 0;
  const maps = { hotels: new Map(d.hotels.map((h) => [h.id, h])), courses: new Map(d.courses.map((c) => [c.id, c])), vehicles: new Map(d.vehicles.map((v) => [v.id, v])) };
  // 채운 양식: 원가표가 실제로 쓰는 단가만 2·4·5 시트에 적는다
  const usedHotels = [...new Set(d.products.flatMap((p) => staysOf(p).map((s) => s.hotelId)))].map((id) => maps.hotels.get(id)).filter((h): h is Hotel => !!h);
  const usedCourses = [...new Set(d.products.flatMap((p) => p.golfCourseIds))].map((id) => maps.courses.get(id)).filter((c): c is GolfCourse => !!c);
  const usedVehicles = [...new Set(d.products.map((p) => p.vehicleRuleId))].map((id) => maps.vehicles.get(id)).filter((v): v is VehicleRule => !!v);

  addGuideSheet(wb, filled);
  const { nameRange } = addSetupSheet(wb, d, maps);

  // 2 호텔
  let ws = wb.addWorksheet(INPUT_SHEETS.hotels);
  titleRow(ws, "2. 호텔 — 요일별 1인 1박 요금(엔). 새 호텔이거나 요금을 바꿀 호텔만 적습니다. 이미 등록된 요금을 그대로 쓸 거면 비워 두세요.", HOTEL_COLUMNS.length);
  headerRow(ws, 2, HOTEL_COLUMNS);
  bodyRows(ws, 3, HOTEL_COLUMNS, usedHotels.map((h) => ({ name: h.name, ...Object.fromEntries(WEEKDAY_HEADERS.map((_, i) => [`w${i}`, h.nightlyRates[i as Weekday]])), roomBasis: h.roomBasis ?? "", memo: h.memo ?? "" })), 12);
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];

  // 3 호텔 일자별 요금 (가로: 숙박일 · 요일 · 호텔명…)
  ws = wb.addWorksheet(INPUT_SHEETS.hotelDates);
  const calHotels = usedHotels.filter((h) => h.dateRates && Object.keys(h.dateRates).length);
  const calCols = Math.max(4, calHotels.length + 2);
  titleRow(ws, "3. 호텔 일자별 요금 — 날짜마다 요금이 다른 호텔만. 2행 C열부터 호텔명을 적고 숙박일별 1인 1박 요금(엔)을 채웁니다. 적힌 날은 요일 요금 대신 이 금액을 씁니다.", 2 + calCols);
  [HOTEL_DATE_HEAD.date, HOTEL_DATE_HEAD.weekday].forEach((t, i) => { const c = ws.getCell(2, i + 1); c.value = t; c.font = { ...FONT, bold: true }; c.fill = fill(OPTIONAL); c.border = BORDER; c.alignment = { horizontal: "center" }; });
  ws.getColumn(1).width = 13; ws.getColumn(2).width = 6;
  for (let k = 0; k < calCols; k++) {
    const c = ws.getCell(2, 3 + k);
    c.value = calHotels[k]?.name ?? null; c.font = { ...FONT, bold: true }; c.fill = fill(REQUIRED); c.border = BORDER; c.alignment = { horizontal: "center", wrapText: true };
    if (k === 0) c.note = "호텔명('2 호텔' 시트나 등록된 이름과 같게)";
    ws.getColumn(3 + k).width = 22;
  }
  const calDates = [...new Set(calHotels.flatMap((h) => Object.keys(h.dateRates ?? {})))].sort();
  const calRows = Math.max(calDates.length + 30, 120);
  for (let i = 0; i < calRows; i++) {
    const r = 3 + i, date = calDates[i];
    const a = ws.getCell(r, 1), b = ws.getCell(r, 2);
    if (date) { a.value = parseDate(date); b.value = weekdayLabel(date); } else b.value = { formula: `IF(A${r}="","",TEXT(A${r},"aaa"))` };
    a.numFmt = "yyyy-mm-dd"; a.border = BORDER; b.border = BORDER; a.font = { ...FONT }; b.font = { ...FONT, color: { argb: "FF7F7F7F" } }; a.alignment = { horizontal: "center" }; b.alignment = { horizontal: "center" };
    for (let k = 0; k < calCols; k++) { const c = ws.getCell(r, 3 + k); const v = date ? calHotels[k]?.dateRates?.[date] : undefined; if (v != null) c.value = v; c.numFmt = "#,##0"; c.border = BORDER; c.font = { ...FONT }; c.alignment = { horizontal: "center" }; }
  }
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 2 }];

  // 4 골프장 요금
  ws = wb.addWorksheet(INPUT_SHEETS.golf);
  titleRow(ws, "4. 골프장 요금 — 기간·스타일별 1인 그린피(엔). 여기 적은 골프장은 요금 구간 전체가 이 표 내용으로 바뀝니다. 기간이 겹치면 위에 있는 줄이 먼저 적용됩니다.", GOLF_COLUMNS.length);
  headerRow(ws, 2, GOLF_COLUMNS);
  const golfRows = usedCourses.flatMap((c) => (c.periods.length ? c.periods : [{ from: "", to: "", weekday: null, weekend: null, holiday: null } as GolfCourse["periods"][number]]).map((p, i) => ({
    name: c.name, style: p.style ?? "", from: dateCell(p.from), to: dateCell(p.to), weekday: p.weekday, weekend: p.weekend, holiday: p.holiday, label: p.label ?? "",
    holes: i === 0 ? c.holes : null, tel: i === 0 ? c.tel ?? "" : "", notes: i === 0 ? c.notes ?? "" : "",
  })));
  bodyRows(ws, 3, GOLF_COLUMNS, golfRows, 30, { style: { type: "list", allowBlank: true, formulae: ['"셀프플레이,캐디포함"'], showErrorMessage: false } });
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];

  // 5 차량
  ws = wb.addWorksheet(INPUT_SHEETS.vehicles);
  titleRow(ws, "5. 차량 — 출발 요일별 1인 차량+지원비(원). 새 규칙이거나 금액을 바꿀 규칙만 적습니다.", VEHICLE_COLUMNS.length);
  headerRow(ws, 2, VEHICLE_COLUMNS);
  bodyRows(ws, 3, VEHICLE_COLUMNS, usedVehicles.map((v) => ({ name: v.name, ...Object.fromEntries(WEEKDAY_HEADERS.map((_, i) => [`w${i}`, v.feesByWeekday[i as Weekday]])), memo: v.memo ?? "" })), 8);
  ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];

  // 6 날짜별 입력
  ws = wb.addWorksheet(INPUT_SHEETS.daily);
  titleRow(ws, "6. 날짜별 입력 — 출발일마다 다른 값만 적습니다(없으면 비워 둠). 원가표 이름은 '1 원가표'의 이름과 같게. 어떤 원가표의 줄이 하나라도 있으면 그 원가표의 날짜별 값은 이 표로 통째로 바뀝니다.", DAILY_COLUMNS.length);
  headerRow(ws, 2, DAILY_COLUMNS);
  const daily = d.products.flatMap(dailyRows);
  bodyRows(ws, 3, DAILY_COLUMNS, daily, filled ? 60 : 300, { sheet: { type: "list", allowBlank: true, formulae: [nameRange], showErrorMessage: false } });
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 2 }];

  // 참고: 등록된 단가
  ws = wb.addWorksheet(INPUT_SHEETS.ref);
  const refCols: ColumnDef[] = [{ key: "region", label: "지역", width: 14, kind: "text" }, { key: "kind", label: "종류", width: 9, kind: "text" }, { key: "name", label: "이름", width: 36, kind: "text" }, { key: "summary", label: "요금 요약", width: 90, kind: "text" }];
  titleRow(ws, "참고 — 지금 시스템에 등록된 단가. 숙박 구성·골프 구성·차량 규칙에 이 이름을 그대로 쓰면 됩니다. 이 시트는 고쳐도 반영되지 않습니다.", refCols.length);
  headerRow(ws, 2, refCols);
  const wk = (r: Record<number, number>) => { const u = [...new Set(Object.values(r))]; return u.length === 1 ? `전 요일 ${u[0].toLocaleString("ko-KR")}` : WEEKDAY_HEADERS.map((w, i) => `${w} ${r[i].toLocaleString("ko-KR")}`).join(" · "); };
  const ref = [
    ...d.hotels.map((h) => ({ region: h.region, kind: "호텔", name: h.name, summary: `${wk(h.nightlyRates)}엔${h.dateRates && Object.keys(h.dateRates).length ? ` · 일자별 요금 ${Object.keys(h.dateRates).length}일` : ""}` })),
    ...d.courses.map((c) => ({ region: c.region, kind: "골프장", name: c.name, summary: c.periods.slice(0, 4).map((p) => `${p.style ? `[${p.style}] ` : ""}${p.from || "?"}~${p.to || "?"} ${p.weekday ?? "-"}/${p.weekend ?? "-"}`).join("  ·  ") + (c.periods.length > 4 ? `  외 ${c.periods.length - 4}줄` : "") })),
    ...d.vehicles.map((v) => ({ region: v.region, kind: "차량", name: v.name, summary: `${wk(v.feesByWeekday)}원` })),
  ].sort((a, b) => a.region.localeCompare(b.region, "ko") || a.kind.localeCompare(b.kind, "ko") || a.name.localeCompare(b.name, "ko"));
  bodyRows(ws, 3, refCols, ref, 0);
  ws.views = [{ state: "frozen", ySplit: 2 }];

  wb.views = [{ x: 0, y: 0, width: 24000, height: 14000, firstSheet: 0, activeTab: 1, visibility: "visible" }];
  return Buffer.from(await wb.xlsx.writeBuffer());
}
