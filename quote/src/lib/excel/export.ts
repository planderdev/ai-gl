import ExcelJS from "exceljs";
import type { GolfCourse, Hotel, Product, QuoteRow } from "@/types";
import { golfPlanLabel, roundsCount } from "@/lib/pricing/engine";
import { parseDate } from "@/lib/pricing/date";

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
  courses: GolfCourse[];
}

/** 원가표 시트 1장 — 원본 엑셀과 동일한 열 배치·수식(H=SUM(C,E) … U=Q/0.8). 환율은 B4 셀 참조. */
export function addCostSheet(wb: ExcelJS.Workbook, { product: p, rows, hotel }: ExportSheetInput) {
  const ws = wb.addWorksheet(p.name.slice(0, 31).replace(/[\\/?*[\]:]/g, " "));
  const m = p.margins;
  const mCount = m.length;
  // 열: A날짜 B요일 C출발편 D귀국일 E귀국편 F그룹가 G유택 H항공인디비 I항공그룹 J호텔원 K호텔엔 L골프원 M골프엔 N차량 O항공추가 P인디비원가 Q그룹원가 | 인디비수익×m | 그룹수익×m | 인스타직판 | 메모
  const col = { salesIndiv: 18, salesGroup: 18 + mCount, insta: 18 + mCount * 2, memo: 19 + mCount * 2 };

  const nightly = hotel?.nightlyRates;
  ws.getCell("A1").value = `출발일 : ${yy(p.dateFrom)}-${yy(p.dateTo)}`;
  ws.getCell("D1").value = "1박 일~목(엔)"; ws.getCell("E1").value = nightly?.[1] ?? null;
  ws.getCell("A2").value = `스케줄 :${p.outbound.flightNo} ${p.outbound.dep}-${p.outbound.arr} / ${p.inbound.flightNo} ${p.inbound.dep}-${p.inbound.arr}`;
  ws.getCell("D2").value = "1박 금(엔)"; ws.getCell("E2").value = nightly?.[5] ?? null;
  ws.mergeCells("A3:B3"); ws.getCell("A3").value = `${p.nights}박${p.nights + 1}일`;
  ws.getCell("D3").value = "1박 토(엔)"; ws.getCell("E3").value = nightly?.[6] ?? null;
  ws.mergeCells("F3:H3"); ws.getCell("F3").value = golfPlanLabel(p.golfPlan);
  ws.getCell("Q3").value = p.legend ?? "**노란색날짜 : 스팟특가**";
  ws.getCell("A4").value = "환율"; ws.getCell("B4").value = p.exchangeRate; ws.getCell("B4").fill = fill(YELLOW); ws.getCell("B4").numFmt = "0.00";
  const taxMemo = Object.entries(p.groupTaxByMonth).sort().map(([k, v]) => `${Number(k.slice(5))}월 유택 : ${isNum(v) ? v.toLocaleString("ko-KR") + "원" : v}`).join(" / ");
  ws.getCell("Q4").value = taxMemo;
  for (const r of [1, 2, 3, 4]) ws.getRow(r).font = { ...FONT };

  const headers: (string | null)[] = [
    "날짜", "요일", p.outbound.flightNo, "귀국일", p.inbound.flightNo, "그룹가", "유택",
    `항공\n(인디비)`, `항공\n(그룹가)`, p.hotelLabel || `${hotel?.name ?? "호텔"} ${p.nights}박`, null,
    `골프 ${roundsCount(p.golfPlan)}회\n${golfPlanLabel(p.golfPlan)}`, null, "차량+\n지원비", "항공추가금", "인디비\n원가합", "그룹\n원가합",
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
    c.fill = fill(n === 16 || n === 17 ? "FFD9D9D9" : n >= col.salesIndiv && n < col.salesGroup ? "FFDDEBF7" : n >= col.salesGroup && n < col.insta ? "FFE2EFDA" : "FFF2F2F2");
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
    row.getCell(8).value = soldOut ? "마감" : ov.airIndivKrw != null ? ov.airIndivKrw : airOk ? { formula: `SUM(C${n},E${n})` } : "미정";
    const grpOk = isNum(r.groupFare) && isNum(r.groupTax);
    row.getCell(9).value = grpOk ? { formula: `SUM(F${n}:G${n})` } : "미정";
    row.getCell(10).value = { formula: `K${n}*$B$4` }; row.getCell(11).value = r.hotelJpy;
    row.getCell(12).value = { formula: `M${n}*$B$4` }; row.getCell(13).value = r.golfJpy;
    row.getCell(14).value = r.vehicleKrw;
    row.getCell(15).value = r.airSurchargeKrw || null;
    const indivOk = !soldOut && (ov.airIndivKrw != null || airOk);
    row.getCell(16).value = indivOk ? { formula: `SUM(H${n},J${n},L${n},N${n},O${n})` } : soldOut ? "마감" : "미정";
    row.getCell(17).value = grpOk ? { formula: `SUM(I${n},J${n},L${n},N${n})` } : "미정";
    m.forEach((x, k) => {
      row.getCell(col.salesIndiv + k).value = indivOk ? { formula: `P${n}/${1 - x}` } : soldOut ? "마감" : "미정";
      row.getCell(col.salesGroup + k).value = grpOk ? { formula: `Q${n}/${1 - x}` } : "미정";
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
  });

  const widths = [8.6, 6, 12, 8.6, 12, 11, 11, 12, 12, 12, 11, 12, 11, 10, 10, 13, 13, ...m.map(() => 12), ...m.map(() => 12), 11, 20];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: "frozen", xSplit: 2, ySplit: 5 }];
  const note = ws.getCell(`A${7 + rows.length}`);
  note.value = "※ 연한 주황 셀 = 자동계산 대신 수동 입력된 값 · 회색 운임 = 크롤링 미수집(미정) · J/L열은 B4 환율 참조";
  note.font = { ...FONT, size: 9, color: { argb: "FF7F7F7F" } };
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
      row.getCell(4).value = cse.playStyle;
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
  for (const s of sheets) addCostSheet(wb, s);
  if (courses.length) addGolfSheet(wb, courses);
  return Buffer.from(await wb.xlsx.writeBuffer());
}
