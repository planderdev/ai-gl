import ExcelJS from "exceljs";
import type { Inquiry, InquiryChannel, InquiryStatus } from "@/types";
import { CHANNEL_LABEL, STATUS_LABEL, mdCompact, parseReceived, viewOf } from "./parse";

/**
 * '문의관리현황 목록' 엑셀 읽기·쓰기.
 * 열: 직판문의 · 채널 문의 · 인스타문의(플러그인) · 출발날짜 · 이름 · 상품내용 · 고객이 원하는 지역 · 출발 확정 · 인스타 재방문 확정 · 비고
 * 채널 칸에는 접수일(9월14일)을 적는다 — 어느 칸에 날짜가 있느냐가 접수 채널이다.
 * 읽을 때는 머리글 문구로 열을 찾으므로 열 순서가 바뀌어도 된다. 내려받을 때는 같은 열 뒤에 홈페이지 문의·연락처·상태를 붙인다.
 */
type CellV = ExcelJS.CellValue;
const text = (v: CellV): string => {
  if (v == null) return "";
  if (v instanceof Date) return `${v.getUTCMonth() + 1}월${v.getUTCDate()}일`;
  if (typeof v === "object") { if ("richText" in v) return v.richText.map((t) => t.text).join("").trim(); if ("result" in v) return String(v.result ?? "").trim(); if ("text" in v) return String(v.text ?? "").trim(); return ""; }
  return String(v).trim();
};
const norm = (s: string) => s.replace(/\s+/g, "");
const HEADERS: [key: string, test: (h: string) => boolean][] = [
  ["revisit", (h) => /재방문/.test(h)],
  ["confirm", (h) => /출발확정/.test(h)],
  ["direct", (h) => /직판/.test(h)],
  ["kakao", (h) => /채널/.test(h)],
  ["instagram", (h) => /인스타/.test(h)],
  ["web", (h) => /홈페이지/.test(h)],
  ["depart", (h) => /출발날짜|출발일/.test(h)],
  ["name", (h) => /이름|성함|고객명/.test(h)],
  ["product", (h) => /상품/.test(h)],
  ["route", (h) => /지역/.test(h)],
  ["memo", (h) => /비고|메모/.test(h)],
  ["phone", (h) => /연락처|전화|휴대폰/.test(h)],
  ["status", (h) => h === "상태" || /진행상태/.test(h)],
];
const hash = (s: string) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, "0"); };
const daysApart = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 86400000;

export interface InquirySheetResult { rows: Inquiry[]; log: string[] }

export async function readInquiryWorkbook(buf: ArrayBuffer | Buffer, today: string, now = new Date().toISOString()): Promise<InquirySheetResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const log: string[] = [];
  let ws: ExcelJS.Worksheet | null = null, head = 0;
  const at: Record<string, number> = {};
  for (const sheet of wb.worksheets) {
    for (let r = 1; r <= Math.min(8, sheet.rowCount) && !ws; r++) {
      const found: Record<string, number> = {};
      sheet.getRow(r).eachCell((c, n) => { const h = norm(text(c.value)); if (!h) return; const hit = HEADERS.find(([k, test]) => found[k] == null && test(h)); if (hit) found[hit[0]] = n; });
      if (found.name != null && (found.product != null || found.memo != null)) { ws = sheet; head = r; Object.assign(at, found); }
    }
    if (ws) break;
  }
  if (!ws) throw new Error("문의 목록 시트를 찾지 못했습니다. 머리글에 '이름'과 '상품내용'(또는 '비고')이 있어야 합니다.");

  const get = (r: number, k: string) => (at[k] != null ? text(ws!.getCell(r, at[k]).value) : "");
  const rows: Inquiry[] = [];
  const used = new Map<string, number>();
  let prev = ""; // 바로 앞 줄의 접수일 — 채널 칸이 둘 이상이거나 날짜가 엉뚱할 때 기준
  const odd: string[] = [];
  for (let r = head + 1; r <= ws.rowCount; r++) {
    const name = get(r, "name"), productText = get(r, "product"), memo = get(r, "memo");
    if (!name && !productText && !memo) continue;
    const dates = (["direct", "kakao", "instagram", "web"] as InquiryChannel[]).map((channel) => ({ channel, date: parseReceived(get(r, channel), today) })).filter((x) => x.date);
    // 채널 칸이 여럿이면 앞 줄 접수일에 가까운 것을 대표로(오타로 엉뚱한 날짜가 적힌 칸을 피한다), 앞 줄이 없으면 가장 이른 날
    dates.sort((a, b) => (prev ? daysApart(a.date, prev) - daysApart(b.date, prev) : a.date.localeCompare(b.date)));
    const main = dates[0];
    if (main && prev && daysApart(main.date, prev) > 60) odd.push(`${r}행(${mdCompact(main.date)})`);
    if (main) prev = main.date;
    const confirm = get(r, "confirm"), revisit = get(r, "revisit");
    const statusText = norm(get(r, "status"));
    const byLabel = (Object.entries(STATUS_LABEL) as [InquiryStatus, string][]).find(([, l]) => norm(l) === statusText)?.[0];
    const status: InquiryStatus = confirm || revisit ? "confirmed" : byLabel ?? (memo ? "in_progress" : "new");
    const base = [name, main?.channel ?? "", main?.date ?? "", productText].join("|");
    const n = (used.get(base) ?? 0) + 1; used.set(base, n);
    rows.push({
      id: `inq-x-${hash(base)}${n > 1 ? `-${n}` : ""}`,
      channel: main?.channel ?? "etc", receivedDate: main?.date ?? "", ...(dates.length > 1 ? { extraChannels: dates.slice(1) } : {}),
      name, ...(get(r, "phone") ? { phone: get(r, "phone") } : {}), departText: get(r, "depart"), productText, route: get(r, "route"),
      status, ...(confirm || revisit ? { confirmText: [confirm, revisit].filter(Boolean).join(" / ") } : {}), ...(revisit ? { revisit: true } : {}),
      memo, source: "sheet", sheetRow: r, createdAt: now, updatedAt: now,
    });
  }
  const by = (c: InquiryChannel) => rows.filter((x) => x.channel === c).length;
  log.push(`'${ws.name}' 시트에서 문의 ${rows.length}건을 읽었습니다 (${(["instagram", "kakao", "direct", "web", "etc"] as InquiryChannel[]).filter((c) => by(c)).map((c) => `${CHANNEL_LABEL[c]} ${by(c)}`).join(" · ")}).`);
  log.push(`출발 확정 ${rows.filter((x) => x.status === "confirmed").length}건 · 접수일 없는 줄 ${rows.filter((x) => !x.receivedDate).length}건`);
  if (odd.length) log.push(`접수일이 앞뒤 줄과 두 달 넘게 차이 나는 줄: ${odd.slice(0, 8).join(", ")}${odd.length > 8 ? ` 외 ${odd.length - 8}줄` : ""} — 날짜를 확인해 주세요.`);
  return { rows, log };
}

const FONT = { name: "맑은 고딕", size: 11 } as const;
const thin = { style: "thin" as const, color: { argb: "FFBFBFBF" } };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
const fill = (argb: string): ExcelJS.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

/** 원본과 같은 열 배치(직판문의 … 비고) + 홈페이지 문의·연락처·상태. 접수일 순(모르는 것이 맨 위 — 원본과 같다) */
export async function buildInquiryWorkbook(items: Inquiry[], today: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ai-gl 견적 시스템";
  const ws = wb.addWorksheet("문의관리현황");
  const cols: [string, number][] = [["직판문의", 16], ["채널 문의", 17], ["인스타문의(플러그인)", 18], ["출발날짜", 17], ["이름", 17], ["상품내용", 29], ["고객이 원하는 지역", 25], ["출발 확정", 29], ["인스타 재방문 확정", 25], ["비고", 73], ["홈페이지 문의", 14], ["연락처", 16], ["상태", 11]];
  cols.forEach(([h, w], i) => { const c = ws.getCell(1, i + 1); c.value = h; c.font = { ...FONT, bold: true }; c.fill = fill("FFF2F2F2"); c.border = BORDER; c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; ws.getColumn(i + 1).width = w; });
  const sorted = [...items].sort((a, b) => (a.receivedDate || "").localeCompare(b.receivedDate || "") || (a.sheetRow ?? 1e9) - (b.sheetRow ?? 1e9) || a.createdAt.localeCompare(b.createdAt));
  const colOf: Partial<Record<InquiryChannel, number>> = { direct: 1, kakao: 2, instagram: 3, web: 11 };
  sorted.forEach((q, i) => {
    const r = i + 2, v = viewOf(q, today);
    const row = ws.getRow(r);
    for (const { channel, date } of [{ channel: q.channel, date: q.receivedDate }, ...(q.extraChannels ?? [])]) if (colOf[channel] && date) row.getCell(colOf[channel]!).value = mdCompact(date);
    row.getCell(4).value = q.departText || (q.departDate ? mdCompact(q.departDate) : null);
    row.getCell(5).value = q.name; row.getCell(6).value = q.productText || null; row.getCell(7).value = q.route || null;
    if (q.confirmText) row.getCell(q.revisit ? 9 : 8).value = q.confirmText;
    row.getCell(10).value = [q.memo, q.message ? `[고객 문의] ${q.message}` : ""].filter(Boolean).join(" / ") || null;
    row.getCell(12).value = q.phone || null; row.getCell(13).value = STATUS_LABEL[q.status];
    for (let c = 1; c <= cols.length; c++) { const cell = row.getCell(c); cell.font = { ...FONT }; cell.border = BORDER; cell.alignment = { vertical: "middle", wrapText: c === 10, horizontal: c === 10 || c === 6 ? "left" : "center" }; }
    if (v.status === "confirmed") { row.getCell(8).fill = fill("FFFFFF00"); row.getCell(9).fill = fill("FFFFFF00"); }
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
