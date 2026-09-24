/**
 * 교토MK택시 공항 송영 요금표 크롤러 — https://www.mk-group.co.jp/kr/shuttle/{city}
 * 정적 HTML 이라 브라우저 없이 fetch 로 받는다(배포 서버에서도 동작). 표는 <table class="price__table"> 이고
 * 첫 행이 차종(클래스) 헤더, 첫 열이 노선/지역, rowspan 으로 값이 아래 행에 이어지는 셀이 있다.
 * 표 앞 텍스트의 "■나리타 송영", "＜하네다 픽업＞", "＜2026년 5월 21일～＞" 를 섹션·적용기간으로 삼는다.
 */
import type { VehicleFare } from "@/types";

export const MK_CITIES: { slug: string; label: string }[] = [
  { slug: "tokyo", label: "도쿄" }, { slug: "kyoto", label: "교토" }, { slug: "osaka", label: "오사카" }, { slug: "sapporo", label: "삿포로" },
  { slug: "kobe", label: "고베" }, { slug: "shiga", label: "시가" }, { slug: "nagoya", label: "나고야" }, { slug: "fukuoka", label: "후쿠오카" }, { slug: "okinawa", label: "오키나와" },
];
export const mkUrl = (slug: string) => `https://www.mk-group.co.jp/kr/shuttle/${slug}`;

const strip = (html: string) => html.replace(/<br\s*\/?>/gi, " / ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const priceOf = (s: string): number | null => { const m = s.replace(/[,，]/g, "").match(/(\d{3,})/); return m ? Number(m[1]) : null; };

interface ParsedTable { header: string[]; rows: string[][] }
/** rowspan 을 펼쳐 2차원 문자열 배열로 */
function parseTable(html: string): ParsedTable | null {
  const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const grid: string[][] = [];
  const carry: Record<number, { text: string; left: number }> = {};
  for (const tr of trs) {
    const cells = [...tr.matchAll(/<(t[dh])\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map((m) => ({ attrs: m[2], text: strip(m[3]) }));
    const row: string[] = [];
    let ci = 0, k = 0;
    while (k < cells.length || carry[ci]) {
      if (carry[ci] && carry[ci].left > 0) { row[ci] = carry[ci].text; carry[ci].left--; if (!carry[ci].left) delete carry[ci]; ci++; continue; }
      if (k >= cells.length) break;
      const c = cells[k++];
      const rs = Number(/rowspan="?(\d+)/i.exec(c.attrs)?.[1] ?? 1);
      row[ci] = c.text;
      if (rs > 1) carry[ci] = { text: c.text, left: rs - 1 };
      ci++;
    }
    grid.push(row);
  }
  if (grid.length < 2) return null;
  return { header: grid[0], rows: grid.slice(1) };
}

export interface MkParseResult { fares: VehicleFare[]; sections: string[] }

/** "～2026년 5월 20일" 처럼 종료일이 지난 적용기간이면 true */
function expired(validity: string, today: string): boolean {
  const m = validity.match(/[～~]\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*$/);
  if (!m) return false;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` < today;
}

export function parseMkPage(rawHtml: string, city: { slug: string; label: string }, capturedAt = new Date().toISOString()): MkParseResult {
  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, ""); // 주석 처리된 옛 헤더/제목 제거
  const today = capturedAt.slice(0, 10);
  const fares: VehicleFare[] = [];
  const sections: string[] = [];
  let section = "", validity = "";
  let lastEnd = 0;
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(html))) {
    const before = strip(html.slice(lastEnd, m.index));
    lastEnd = m.index + m[0].length;
    const sec = [...before.matchAll(/■\s*([^■＜＞※]{2,30}?)(?=\s{2,}|\s*＜|\s*高速|\s*고속|$)/g)].map((x) => x[1].trim()).pop();
    const sub = [...before.matchAll(/＜([^＞]{2,40})＞/g)].map((x) => x[1].trim());
    if (sec) section = sec;
    for (const s of sub) { if (/\d{4}년|～|~/.test(s)) validity = s; else section = s; }
    const t = parseTable(m[0]);
    if (!t || t.header.length < 2) continue;
    if (validity && expired(validity, today)) continue; // 지난 요금표는 건너뜀
    const label = `${section}${validity ? ` (${validity})` : ""}`;
    if (!sections.includes(label)) sections.push(label);
    for (const row of t.rows) {
      const route = row[0]; if (!route) continue;
      const isExtra = /초과|30분/.test(route);
      for (let i = 1; i < t.header.length; i++) {
        const price = priceOf(row[i] ?? ""); if (price == null) continue;
        const vehicleClass = t.header[i];
        fares.push({
          id: `mk-${city.slug}|${section}|${validity}|${route}|${vehicleClass}`.replace(/\s+/g, " "),
          provider: `mk-${city.slug}`, providerLabel: `MK택시 ${city.label}`, area: city.label, section, validity: validity || undefined, route, vehicleClass, priceJpy: price,
          unit: isExtra ? "30분당" : "1대", notes: "고속도로 통행료 별도 · 22:00~05:00 심야 25% 할증", sourceUrl: mkUrl(city.slug), capturedAt,
        });
      }
    }
  }
  return { fares, sections };
}

export async function crawlMk(city: { slug: string; label: string }): Promise<MkParseResult> {
  const res = await fetch(mkUrl(city.slug), { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0 Safari/537.36", "Accept-Language": "ko" }, cache: "no-store" });
  if (!res.ok) throw new Error(`MK ${city.label} 페이지 응답 ${res.status}`);
  return parseMkPage(await res.text(), city);
}
