import ExcelJS from "exceljs";
import type { GolfCourse, Hotel, Product, ProductGroup, QuoteRow } from "@/types";
import { golfPlanLabel, hotelNightRate, roundsCount, staysOf } from "@/lib/pricing/engine";
import { addDays, eachDate, parseDate, weekdayLabel } from "@/lib/pricing/date";
import { airlineName } from "@/lib/format";

const FONT = { name: "맑은 고딕", size: 11 } as const;
const NUM = '#,##0_ ;[Red]\\-#,##0\\ ';
const YEN = '[$¥-411]#,##0;[Red]\\-[$¥-411]#,##0';
const DATE = 'm"/"d;@';
const YELLOW = "FFFFFF00";
const RED = "FFFF0000";
const thin = { style: "thin" as const, color: { argb: "FFBFBFBF" } };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
const fill = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const yy = (d: string) => d.slice(2).replace(/-/g, ".");
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export interface ExportSheetInput {
  product: Product;
  rows: QuoteRow[];
  hotel: Hotel | null;
  /** 숙박 구성에 쓰인 호텔들(현지착 머리글·호텔 요금표 시트용) */
  hotels?: Hotel[];
  courses: GolfCourse[];
  group?: ProductGroup | null;
}

/** 수식 셀. 계산값을 함께 넣어 재계산하지 않는 뷰어(미리보기 등)에서도 숫자가 보이게 한다 */
const fx = (formula: string, result?: unknown): ExcelJS.CellValue => (typeof result === "number" && Number.isFinite(result) ? { formula, result } : { formula });

/** 열 번호 → 엑셀 열 문자 (1=A, 27=AA) */
const L = (n: number): string => (n > 26 ? L(Math.floor((n - 1) / 26)) : "") + String.fromCharCode(65 + ((n - 1) % 26));
const usedSheetNames = new WeakMap<ExcelJS.Workbook, Set<string>>();
/** 시트 이름: 31자 제한·금지 문자 제거, 같은 이름이 있으면 번호를 붙인다 */
function sheetName(wb: ExcelJS.Workbook, name: string) {
  const used = usedSheetNames.get(wb) ?? new Set<string>();
  usedSheetNames.set(wb, used);
  const clean = name.replace(/[\\/?*[\]:]/g, " ");
  let out = clean.slice(0, 31);
  for (let i = 2; used.has(out.toLowerCase()); i++) out = `${clean.slice(0, 31 - String(i).length - 1)} ${i}`;
  used.add(out.toLowerCase());
  return out;
}
const extrasHeader = (p: Product) => (p.extras ?? []).map((e) => e.label).join("\n+ ") || "기타 원가";

/** 상품 유형에 맞는 원가표 시트를 더한다 */
export function addProductSheet(wb: ExcelJS.Workbook, input: ExportSheetInput) {
  return input.product.saleType === "land" ? addLandSheet(wb, input) : addCostSheet(wb, input);
}

/**
 * 항공 포함 원가표 시트 — 원본 엑셀과 동일한 열 배치·수식(H=SUM(C,E) … U=Q/0.8). 환율은 B4 셀 참조.
 * 기타 원가가 있는 상품만 차량 열 뒤에 "기타 원가" 열이 하나 끼어든다.
 */
export function addCostSheet(wb: ExcelJS.Workbook, { product: p, rows, hotel }: ExportSheetInput) {
  const ws = wb.addWorksheet(sheetName(wb, p.name));
  const m = p.margins;
  const mCount = m.length;
  // 열: A날짜 B요일 C출발편 D귀국일 E귀국편 F그룹가 G유택 H항공인디비 I항공그룹 J호텔원 K호텔엔 L골프원 M골프엔 N차량 [기타원가] O항공추가 P인디비원가 Q그룹원가 | 인디비수익×m | 그룹수익×m | 인스타직판 | 메모
  const x = p.extras?.length ? 1 : 0;
  const col = { extras: 15, sur: 15 + x, costIndiv: 16 + x, costGroup: 17 + x, salesIndiv: 18 + x, salesGroup: 18 + x + mCount, insta: 18 + x + mCount * 2, memo: 19 + x + mCount * 2 };

  const nightly = hotel?.nightlyRates;
  ws.getCell("A1").value = `출발일 : ${yy(p.dateFrom)}-${yy(p.dateTo)}`;
  ws.getCell("D1").value = "1박 일~목(엔)"; ws.getCell("E1").value = nightly?.[1] ?? null;
  ws.getCell("A2").value = `스케줄 :${p.outbound.flightNo} ${p.outbound.dep}-${p.outbound.arr} / ${p.inbound.flightNo} ${p.inbound.dep}-${p.inbound.arr}`;
  ws.getCell("D2").value = "1박 금(엔)"; ws.getCell("E2").value = nightly?.[5] ?? null;
  ws.mergeCells("A3:B3"); ws.getCell("A3").value = `${p.nights}박${p.nights + 1}일`;
  ws.getCell("D3").value = "1박 토(엔)"; ws.getCell("E3").value = nightly?.[6] ?? null;
  ws.mergeCells("F3:H3"); ws.getCell("F3").value = golfPlanLabel(p.golfPlan);
  ws.getCell(3, col.costGroup).value = p.legend ?? "**노란색날짜 : 스팟특가**";
  ws.getCell("A4").value = "환율"; ws.getCell("B4").value = p.exchangeRate; ws.getCell("B4").fill = fill(YELLOW); ws.getCell("B4").numFmt = "0.00";
  const taxMemo = Object.entries(p.groupTaxByMonth).sort().map(([k, v]) => `${Number(k.slice(5))}월 유택 : ${isNum(v) ? v.toLocaleString("ko-KR") + "원" : v}`).join(" / ");
  ws.getCell(4, col.costGroup).value = taxMemo;
  for (const r of [1, 2, 3, 4]) ws.getRow(r).font = { ...FONT };

  const headers: (string | null)[] = [
    "날짜", "요일", p.outbound.flightNo, "귀국일", p.inbound.flightNo, "그룹가", "유택",
    `항공\n(인디비)`, `항공\n(그룹가)`, p.hotelLabel || `${hotel?.name ?? "호텔"} ${p.nights}박`, null,
    p.golfLabel || `골프 ${roundsCount(p.golfPlan)}회\n${golfPlanLabel(p.golfPlan)}`, null, "차량+\n지원비", ...(x ? [extrasHeader(p)] : []), "항공추가금", "인디비\n원가합", "그룹\n원가합",
    ...m.map((x) => `인디비\n수익 ${Math.round(x * 100)}%`), ...m.map((x) => `그룹\n수익 ${Math.round(x * 100)}%`), "인스타직판", "메모",
  ];
  const hr = ws.getRow(5);
  headers.forEach((h, i) => { if (h != null) hr.getCell(i + 1).value = h; });
  ws.mergeCells(5, 10, 5, 11); ws.mergeCells(5, 12, 5, 13);
  hr.height = 48;
  hr.eachCell({ includeEmpty: true }, (c, n) => {
    if (n > col.memo) return;
    c.font = { ...FONT, bold: true };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    c.border = BORDER;
    c.fill = fill(n === col.costIndiv || n === col.costGroup ? "FFD9D9D9" : n >= col.salesIndiv && n < col.salesGroup ? "FFDDEBF7" : n >= col.salesGroup && n < col.insta ? "FFE2EFDA" : "FFF2F2F2");
  });

  const mv = (v: QuoteRow["outboundFare"]) => (v == null ? "미정" : v);
  rows.forEach((r, i) => {
    const n = 6 + i;
    const row = ws.getRow(n);
    const ov = r.override;
    row.getCell(1).value = parseDate(r.date); row.getCell(1).numFmt = DATE;
    row.getCell(2).value = r.weekdayLabel;
    row.getCell(3).value = mv(r.outboundFare);
    row.getCell(4).value = parseDate(r.returnDate); row.getCell(4).numFmt = DATE;
    row.getCell(5).value = mv(r.inboundFare);
    row.getCell(6).value = r.groupFare ?? "미정";
    row.getCell(7).value = r.groupTax ?? "미정";
    // H 항공(인디비)
    const airOk = isNum(r.outboundFare) && isNum(r.inboundFare);
    const soldOut = r.airIndiv === "마감";
    row.getCell(8).value = soldOut ? "마감" : ov.airIndivKrw != null ? ov.airIndivKrw : airOk ? fx(`SUM(C${n},E${n})`, r.airIndiv) : "미정";
    const grpOk = isNum(r.groupFare) && isNum(r.groupTax);
    row.getCell(9).value = grpOk ? fx(`SUM(F${n}:G${n})`, r.airGroup) : "미정";
    row.getCell(10).value = fx(`K${n}*$B$4`, r.hotelKrw); row.getCell(11).value = r.hotelJpy;
    row.getCell(12).value = fx(`M${n}*$B$4`, r.golfKrw); row.getCell(13).value = r.golfJpy;
    row.getCell(14).value = r.vehicleKrw;
    if (x) row.getCell(col.extras).value = r.extrasKrw;
    row.getCell(col.sur).value = r.airSurchargeKrw || null;
    const indivOk = !soldOut && (ov.airIndivKrw != null || airOk);
    const ex = x ? `,${L(col.extras)}${n}` : "";
    row.getCell(col.costIndiv).value = indivOk ? fx(`SUM(H${n},J${n},L${n},N${n},${L(col.sur)}${n}${ex})`, r.costIndiv) : soldOut ? "마감" : "미정";
    row.getCell(col.costGroup).value = grpOk ? fx(`SUM(I${n},J${n},L${n},N${n}${ex})`, r.costGroup) : "미정";
    m.forEach((mg, k) => {
      row.getCell(col.salesIndiv + k).value = indivOk ? fx(`${L(col.costIndiv)}${n}/${1 - mg}`, r.salesIndiv[k]) : soldOut ? "마감" : "미정";
      row.getCell(col.salesGroup + k).value = grpOk ? fx(`${L(col.costGroup)}${n}/${1 - mg}`, r.salesGroup[k]) : "미정";
    });
    row.getCell(col.insta).value = ov.directSalePrice ?? null;
    row.getCell(col.memo).value = ov.memo ?? null;

    for (let c = 1; c <= col.memo; c++) {
      const cell = row.getCell(c);
      cell.font = { ...FONT };
      cell.alignment = { horizontal: c === col.memo ? "left" : "center", vertical: "middle" };
      cell.border = BORDER;
      if (c === 11 || c === 13) cell.numFmt = YEN;
      else if (c !== 1 && c !== 4 && c !== 2 && c < col.insta) cell.numFmt = NUM;
    }
    if (ov.spotSpecial) { row.getCell(1).font = { ...FONT, color: { argb: RED } }; row.getCell(1).fill = fill(YELLOW); row.getCell(2).fill = fill(YELLOW); }
    if (ov.groupSpecial) { row.getCell(6).fill = fill(YELLOW); row.getCell(9).fill = fill(YELLOW); }
    if (r.breakdown.fareMissing && ov.airIndivKrw == null) { row.getCell(3).font = { ...FONT, color: { argb: "FF9C9C9C" } }; row.getCell(5).font = { ...FONT, color: { argb: "FF9C9C9C" } }; }
    if (ov.hotelJpy != null) row.getCell(11).fill = fill("FFFFF2CC");
    if (ov.golfJpy != null) row.getCell(13).fill = fill("FFFFF2CC");
    if (ov.vehicleKrw != null) row.getCell(14).fill = fill("FFFFF2CC");
    if (x && ov.extrasKrw != null) row.getCell(col.extras).fill = fill("FFFFF2CC");
  });

  const widths = [8.6, 6, 12, 8.6, 12, 11, 11, 12, 12, 12, 11, 12, 11, 10, ...(x ? [12] : []), 10, 13, 13, ...m.map(() => 12), ...m.map(() => 12), 11, 20];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 5 }];
  const note = ws.getCell(`A${7 + rows.length}`);
  note.value = "※ 연한 주황 셀 = 자동계산 대신 수동 입력된 값 · 회색 운임 = 크롤링 미수집(미정) · J/L열은 B4 환율 참조";
  note.font = { ...FONT, size: 9, color: { argb: "FF7F7F7F" } };
  return ws;
}

/**
 * 현지착(항공 제외) 원가표 시트 — 1108 마쓰야마 원가표와 같은 배치.
 * A날짜 B요일 C출발편 D귀국편 E항공(인디비, 빈칸) F호텔₩ G호텔¥ H골프₩ I골프¥ J차량 K…기타 원가 | 원가합 | 수익 N% | 판매가 | 메모
 * 원가합 = SUM(항공,호텔,골프,차량,기타) 이라 E열에 항공료를 넣으면 항공 포함 원가가 된다. 환율은 4행 셀 참조.
 * 오른쪽에는 라운드별 골프 요금(기준표 + 출발일별 금액)을 덧붙인다.
 */
export function addLandSheet(wb: ExcelJS.Workbook, { product: p, rows, hotel, hotels, courses, group }: ExportSheetInput) {
  const ws = wb.addWorksheet(sheetName(wb, p.name));
  const m = p.margins;
  const extras = p.extras ?? [];
  const col = { out: 3, inn: 4, air: 5, hotelKrw: 6, hotelJpy: 7, golfKrw: 8, golfJpy: 9, vehicle: 10, extras: 11, cost: 11 + extras.length, sales: 12 + extras.length, sale: 12 + extras.length + m.length, memo: 13 + extras.length + m.length };
  const rateCell = `$${L(col.sale)}$4`;
  const byId = new Map((hotels ?? (hotel ? [hotel] : [])).map((h) => [h.id, h]));
  const stays = staysOf(p);
  const stayText = stays.map((s) => `${byId.get(s.hotelId)?.name ?? "호텔"} ${s.nights}박`).join(" + ");
  const roomBasis = stays.map((s) => byId.get(s.hotelId)?.roomBasis).find(Boolean);
  const roundCount = roundsCount(p.golfPlan);
  const roundCourse = (k: number) => (courses.length ? courses[k % courses.length] : null);
  const roundStyle = (k: number) => (courses.length ? p.golfStyles?.[k % courses.length] : undefined) || undefined;
  const golfText = Array.from({ length: roundCount }, (_, k) => `${roundCourse(k)?.name ?? "-"}${roundStyle(k) ? `(${roundStyle(k)})` : ""}`).join("+");

  const head = (addr: string, value: ExcelJS.CellValue, o: { bold?: boolean; fill?: string; merge?: string; align?: "left" | "center" } = {}) => {
    if (o.merge) ws.mergeCells(o.merge);
    const c = ws.getCell(addr);
    c.value = value; c.font = { ...FONT, bold: o.bold };
    c.alignment = { horizontal: o.align ?? "center", vertical: "middle", wrapText: true };
    if (o.fill) c.fill = fill(o.fill);
  };
  head("A1", `기간 : ${yy(p.dateFrom)}~${yy(p.dateTo)}`, { bold: true, align: "left" });
  head("A2", `${group?.name.replace(/\s*\(.*\)\s*$/, "") ?? p.region} ${p.nights}박${p.nights + 1}일 패턴`, { bold: true, merge: "A2:E2" });
  head("G2", golfText, { fill: YELLOW, merge: `G2:${L(col.cost - 1)}2` });
  if (p.note) head(`${L(col.cost)}2`, p.note, { bold: true, fill: "FFDDEBF7", merge: `${L(col.cost)}2:${L(col.memo)}2` });
  head("G3", `${stayText}${roomBasis ? `   ${roomBasis}` : ""}`, { fill: YELLOW, merge: `G3:${L(col.cost - 1)}3` });
  head("A4", `패턴 : ${p.nights}N${p.nights + 1}D${p.paxBasis ? ` · ${p.paxBasis}인 기준` : ""}`, { bold: true, align: "left" });
  head("E4", group?.name.match(/\(([^)]+)\)\s*$/)?.[1] ?? airlineName(p.airline), { bold: true, merge: "E4:F4" });
  head("G4", `${p.outbound.flightNo} ${p.outbound.origin} ${p.outbound.dep}-${p.outbound.destination} ${p.outbound.arr}  ${p.inbound.flightNo} ${p.inbound.origin} ${p.inbound.dep}-${p.inbound.destination} ${p.inbound.arr}`, { merge: `G4:${L(col.cost)}4` });
  head(`${L(col.sale - 1)}4`, "환율", { bold: true });
  head(`${L(col.sale)}4`, p.exchangeRate, { bold: true, fill: YELLOW });
  ws.getCell(4, col.sale).numFmt = "0.00";

  const mmdd = new Date().toISOString().slice(5, 10).replace("-", "");
  const headers: [number, string][] = [
    [1, "날짜"], [2, "요일"], [col.out, p.outbound.flightNo], [col.inn, p.inbound.flightNo], [col.air, `${airlineName(p.airline)}\n인디비\n${mmdd}`],
    [col.hotelKrw, p.hotelLabel || `${stayText}${roomBasis ? `\n${roomBasis}` : ""}`], [col.golfKrw, p.golfLabel || `골프 ${roundCount}회\n${golfPlanLabel(p.golfPlan)}`], [col.vehicle, "차량"],
    ...extras.map((e, i): [number, string] => [col.extras + i, e.label.replace(/\s+/, "\n")]),
    [col.cost, "인디비원가\n합"], ...m.map((mg, k): [number, string] => [col.sales + k, `수익 1인당\n${Math.round(mg * 100)}%`]), [col.sale, "판매가"], [col.memo, "메모"],
  ];
  const hr = ws.getRow(5);
  hr.height = 64;
  for (const [c, text] of headers) hr.getCell(c).value = text;
  ws.mergeCells(5, col.hotelKrw, 5, col.hotelJpy); ws.mergeCells(5, col.golfKrw, 5, col.golfJpy);
  for (let c = 1; c <= col.memo; c++) {
    const cell = hr.getCell(c);
    cell.font = { ...FONT, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = BORDER;
    cell.fill = fill(c === col.out || c === col.inn || (c >= col.sales && c < col.sale) ? YELLOW : c === col.cost ? "FFD9D9D9" : "FFF2F2F2");
  }

  // 오른쪽 보조 영역: 라운드별 기준 요금과 출발일별 라운드 금액
  const side = Math.max(25, col.memo + 3);
  const firstPlay = rows[0]?.breakdown.golfRounds ?? [];
  ws.getCell(1, side + 1).value = "주중"; ws.getCell(1, side + 2).value = "주말";
  firstPlay.forEach((g, k) => {
    const cse = roundCourse(k), st = roundStyle(k);
    const pool = cse ? (st && cse.periods.some((q) => q.style === st) ? cse.periods.filter((q) => q.style === st) : cse.periods.filter((q) => !q.style)) : [];
    const per = pool.find((q) => q.from <= p.dateFrom && p.dateFrom <= q.to && q.weekday !== q.weekend) ?? pool.find((q) => q.from <= p.dateFrom && p.dateFrom <= q.to) ?? pool[0];
    ws.getCell(2 + k, side).value = g.courseName; ws.getCell(2 + k, side + 1).value = per?.weekday ?? null; ws.getCell(2 + k, side + 2).value = per?.weekend ?? null;
  });
  if (roundCount) {
    for (let k = 0; k < roundCount; k++) ws.getCell(5, side + 1 + k).value = `${k + 1}R`;
    ws.getCell(5, side + 1 + roundCount).value = "골프 합(엔)";
  }

  const mv = (v: QuoteRow["outboundFare"]) => (v == null ? null : v);
  rows.forEach((r, i) => {
    const n = 6 + i;
    const row = ws.getRow(n);
    const ov = r.override;
    row.getCell(1).value = parseDate(r.date); row.getCell(1).numFmt = DATE;
    row.getCell(2).value = r.weekdayLabel;
    row.getCell(col.out).value = mv(r.outboundFare);
    row.getCell(col.inn).value = mv(r.inboundFare);
    row.getCell(col.hotelKrw).value = fx(`${L(col.hotelJpy)}${n}*${rateCell}`, r.hotelKrw); row.getCell(col.hotelJpy).value = r.hotelJpy;
    row.getCell(col.golfKrw).value = fx(`${L(col.golfJpy)}${n}*${rateCell}`, r.golfKrw); row.getCell(col.golfJpy).value = r.golfJpy;
    row.getCell(col.vehicle).value = r.vehicleKrw;
    if (extras.length) {
      // 기타 원가 합계를 수동 지정한 행은 첫 열에 합계를 적는다
      r.breakdown.extras.forEach((e, k) => { row.getCell(col.extras + k).value = ov.extrasKrw != null ? (k === 0 ? ov.extrasKrw : null) : e.krw; });
    }
    const parts = [col.air, col.hotelKrw, col.golfKrw, col.vehicle, ...extras.map((_, k) => col.extras + k)].map((c) => `${L(c)}${n}`).join(",");
    row.getCell(col.cost).value = fx(`SUM(${parts})`, r.costIndiv);
    m.forEach((mg, k) => { row.getCell(col.sales + k).value = fx(`SUM(${L(col.cost)}${n})/${1 - mg}`, r.salesIndiv[k]); });
    row.getCell(col.sale).value = ov.directSalePrice ?? null;
    row.getCell(col.memo).value = ov.memo ?? null;
    for (let c = 1; c <= col.memo; c++) {
      const cell = row.getCell(c);
      cell.font = { ...FONT };
      cell.alignment = { horizontal: c === col.memo ? "left" : "center", vertical: "middle" };
      cell.border = BORDER;
      if (c === col.hotelJpy || c === col.golfJpy) cell.numFmt = "#,##0";
      else if (c > 2 && c < col.sale) cell.numFmt = NUM;
    }
    row.getCell(col.cost).fill = fill("FFE7E6E6");
    if (ov.spotSpecial) { row.getCell(1).fill = fill(YELLOW); row.getCell(2).fill = fill(YELLOW); }
    if (ov.hotelJpy != null) row.getCell(col.hotelJpy).fill = fill("FFFFF2CC");
    if (ov.golfJpy != null) row.getCell(col.golfJpy).fill = fill("FFFFF2CC");
    if (ov.vehicleKrw != null) row.getCell(col.vehicle).fill = fill("FFFFF2CC");
    if (ov.extrasKrw != null && extras.length) row.getCell(col.extras).fill = fill("FFFFF2CC");
    if (roundCount && ov.golfJpy == null) {
      r.breakdown.golfRounds.forEach((g, k) => { row.getCell(side + 1 + k).value = g.jpy; });
      row.getCell(side + 1 + roundCount).value = fx(`SUM(${L(side + 1)}${n}:${L(side + roundCount)}${n})`, r.golfJpy);
    }
  });

  const widths = [9.7, 8.6, 12.7, 12.7, 12.7, 10.4, 11.6, 12.8, 12.8, 11.6, ...extras.map(() => 11.6), 12.3, ...m.map(() => 12.4), 13.6, 20];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.getColumn(side).width = 22;
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 5 }];
  const note = ws.getCell(`A${7 + rows.length}`);
  note.value = `※ 현지착(항공 제외) 원가 · E열에 항공료를 넣으면 원가합에 더해집니다 · 연한 주황 셀 = 수동 입력값 · 호텔/골프 원화는 ${L(col.sale)}4 환율 참조`;
  note.font = { ...FONT, size: 9, color: { argb: "FF7F7F7F" } };
  return ws;
}

/** 호텔 요금표 시트 — 왼쪽: 숙박일별 호텔 단가, 오른쪽: 출발일별 1~N박 단가와 합계(원가표의 호텔 ¥) */
export function addHotelSheet(wb: ExcelJS.Workbook, p: Product, hotels: Hotel[], title = "호텔 요금표") {
  const stays = staysOf(p);
  const byId = new Map(hotels.map((h) => [h.id, h]));
  const used = [...new Set(stays.map((s) => s.hotelId))].map((id) => byId.get(id)).filter((h): h is Hotel => !!h);
  if (!used.length) return null;
  const ws = wb.addWorksheet(sheetName(wb, title));
  const nightHotels = stays.flatMap((s) => Array.from({ length: s.nights }, () => byId.get(s.hotelId) ?? null));
  const cell = (r: number, c: number, v: ExcelJS.CellValue, o: { bold?: boolean; fmt?: string; gray?: boolean } = {}) => {
    const x = ws.getCell(r, c);
    x.value = v; x.font = { ...FONT, bold: o.bold }; x.border = BORDER; x.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    if (o.fmt) x.numFmt = o.fmt;
    if (o.gray) x.fill = fill("FFF2F2F2");
  };
  const right = used.length + 4;
  ["숙박일", "요일", ...used.map((h) => `${h.name}\n(1인 1박 엔)`)].forEach((t, i) => cell(1, i + 1, t, { bold: true, gray: true }));
  ["출발일", "요일", ...nightHotels.map((h, k) => `${k + 1}박째\n${h?.name ?? "-"}`), "합계(엔)"].forEach((t, i) => cell(1, right + i, t, { bold: true, gray: true }));
  ws.getRow(1).height = 36;
  let r = 2;
  for (const d of eachDate(p.dateFrom, addDays(p.dateTo, p.nights - 1))) {
    cell(r, 1, parseDate(d), { fmt: "yyyy-mm-dd" }); cell(r, 2, weekdayLabel(d));
    used.forEach((h, i) => cell(r, 3 + i, hotelNightRate(h, d), { fmt: "#,##0" }));
    if (d <= p.dateTo) {
      cell(r, right, parseDate(d), { fmt: "yyyy-mm-dd" }); cell(r, right + 1, weekdayLabel(d));
      nightHotels.forEach((h, k) => cell(r, right + 2 + k, h ? hotelNightRate(h, addDays(d, k)) : 0, { fmt: "#,##0" }));
      cell(r, right + 2 + nightHotels.length, fx(`SUM(${L(right + 2)}${r}:${L(right + 1 + nightHotels.length)}${r})`, nightHotels.reduce((a, h, k) => a + (h ? hotelNightRate(h, addDays(d, k)) : 0), 0)), { fmt: "#,##0", bold: true });
    }
    r++;
  }
  for (let c = 1; c <= right + 2 + nightHotels.length; c++) ws.getColumn(c).width = c === 2 || c === right + 1 ? 6 : 14;
  ws.getColumn(used.length + 3).width = 3;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  return ws;
}

/** 골프장 요금표 시트 */
export function addGolfSheet(wb: ExcelJS.Workbook, courses: GolfCourse[], title = "골프장 요금표") {
  const ws = wb.addWorksheet(title);
  ws.mergeCells("A1:H1");
  ws.getCell("A1").value = `※ 골프장 요금표 (${new Date().toISOString().slice(0, 10)} 기준, 1인 그린피 엔)`;
  ws.getCell("A1").font = { ...FONT, bold: true };
  const hdr = ["골프장", "홀", "기간", "플레이\n스타일", "주중", "주말/휴일", "연휴", "기타사항"];
  hdr.forEach((h, i) => { const c = ws.getRow(2).getCell(i + 1); c.value = h; c.font = { ...FONT, bold: true }; c.fill = fill("FFF2F2F2"); c.border = BORDER; c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; });
  let r = 3;
  for (const cse of courses) {
    const start = r;
    const periods = cse.periods.length ? cse.periods : [{ from: "", to: "", weekday: null, weekend: null, holiday: null }];
    for (const p of periods) {
      const row = ws.getRow(r);
      row.getCell(2).value = cse.holes;
      row.getCell(3).value = p.label ?? (p.from ? `${p.from.replace(/-/g, ".")}~${p.to.slice(5).replace(/-/g, ".")}` : "");
      row.getCell(4).value = p.style ?? cse.playStyle;
      row.getCell(5).value = p.weekday; row.getCell(6).value = p.weekend; row.getCell(7).value = p.holiday;
      for (let c = 1; c <= 8; c++) { const cell = row.getCell(c); cell.font = { ...FONT }; cell.border = BORDER; cell.alignment = { vertical: "middle", horizontal: c >= 5 && c <= 7 ? "right" : "center", wrapText: true }; if (c >= 5 && c <= 7) cell.numFmt = "#,##0"; }
      r++;
    }
    if (r - 1 > start) { ws.mergeCells(start, 1, r - 1, 1); ws.mergeCells(start, 8, r - 1, 8); }
    ws.getCell(start, 1).value = cse.tel ? `${cse.name}\nTEL ${cse.tel}` : cse.name;
    ws.getCell(start, 8).value = cse.notes ?? "";
    ws.getCell(start, 8).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  }
  [26, 6, 22, 12, 12, 12, 12, 48].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  return ws;
}

export async function buildWorkbook(sheets: ExportSheetInput[], courses: GolfCourse[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ai-gl 견적 시스템";
  wb.created = new Date();
  wb.calcProperties.fullCalcOnLoad = true; // 엑셀에서 열 때 수식을 다시 계산
  for (const s of sheets) addProductSheet(wb, s);
  if (courses.length) addGolfSheet(wb, courses);
  // 일자별 요금을 쓰는 호텔이 있는 상품은 호텔 요금표 시트를 붙인다(원본의 '쥬락쿠요금표')
  for (const s of sheets) {
    const hs = s.hotels ?? (s.hotel ? [s.hotel] : []);
    if (hs.some((h) => h.dateRates && Object.keys(h.dateRates).length) || (s.product.stays?.length ?? 0) > 1) addHotelSheet(wb, s.product, hs, sheets.length > 1 ? `호텔 요금표 ${s.product.name}` : "호텔 요금표");
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
