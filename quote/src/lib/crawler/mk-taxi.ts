/**
 * 교토MK택시 공항 송영 요금표 크롤러 — https://www.mk-group.co.jp/kr/shuttle/{city}
 * 정적 HTML 이라 브라우저 없이 fetch 로 받는다(배포 서버에서도 동작). 표는 <table class="price__table"> 이고
 * 첫 행이 차종(클래스) 헤더, 첫 열이 노선/지역, rowspan 으로 값이 아래 행에 이어지는 셀이 있다.
 * 표 앞 텍스트의 "■나리타 송영", "＜하네다 픽업＞", "＜2026년 5월 21일～＞" 를 섹션·적용기간으로 삼는다.
 */
import type { VehicleFare } from "@/types";

export const MK_CITIES: { slug: string; label: string; path?: string }[] = [
  { slug: "tokyo", label: "도쿄" }, { slug: "kyoto", label: "교토" }, { slug: "osaka", label: "오사카" }, { slug: "sapporo", label: "삿포로", path: "sapporo_hire.php" },
  { slug: "kobe", label: "고베" }, { slug: "shiga", label: "시가" }, { slug: "nagoya", label: "나고야" }, { slug: "fukuoka", label: "후쿠오카" }, { slug: "okinawa", label: "오키나와" },
];
/** 도시별 실제 경로(사이트 내비 기준 `{city}.php`, 삿포로만 `sapporo_hire.php`) */
export const mkUrl = (slug: string) => `https://www.mk-group.co.jp/kr/shuttle/${MK_CITIES.find((c) => c.slug === slug)?.path ?? `${slug}.php`}`;

const strip = (html: string) => html.replace(/<br\s*\/?>/gi, " / ").replace(/<\/?t[dh]\b[^>]*>/gi, " ").replace(/\/th>|\/td>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").replace(/\s*\/\s*$/, "").trim();
const priceOf = (s: string): number | null => { const m = s.replace(/[,，]/g, "").match(/(\d{3,})/); return m ? Number(m[1]) : null; };
/** 차종(클래스) 셀 판정 — 차 이름·정원 표기 */
const VEHICLE_RE = /HV\b|Hybrid|Alphard|ALPHARD|Vellfire|Hi-?Ace|HiAce|Grandcabin|Benz|Mercedes|MAYBACH|Maybach|BMW|LEXUS|Lexus|Toyota|Nissan|Camry|NOAH|Voxy|Serena|Sienta|Crown|CENTURY|Century|센츄리|MIRAI|Gran ?Ace|Rolls|Standard|표준형|미니밴|타입|승차정원|하이에스|알파드|세레나/i;
const isVehicle = (t: string) => VEHICLE_RE.test(t);

interface ParsedTable { header: string[]; rows: string[][] }
/** 셀 닫는 태그가 빠진 행도 읽고, rowspan 을 펼쳐 2차원 문자열 배열로 */
function parseTable(html: string): ParsedTable | null {
  const trs = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const grid: string[][] = [];
  const carry: Record<number, { text: string; left: number }> = {};
  for (const tr of trs) {
    const cells = [...tr.matchAll(/<(t[dh])\b([^>]*)>([\s\S]*?)(?=<t[dh]\b|$)/gi)].map((m) => ({ attrs: m[2], text: strip(m[3]) }));
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
    if (row.some((x) => x)) grid.push(row);
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

/**
 * 표 배치 두 가지를 모두 처리한다.
 *  - 가로형(도쿄·후쿠오카·오키나와): 헤더 = [라벨…, 차종…], 행 = 노선/지역 → 차종별 요금
 *  - 세로형(교토·오사카·나고야·고베·시가·삿포로 1번 표): 헤더 = [편도 기준, 목적지…], 행 = 차종 → 목적지별 요금
 */
export function parseMkPage(rawHtml: string, city: { slug: string; label: string }, capturedAt = new Date().toISOString()): MkParseResult {
  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, "");
  const today = capturedAt.slice(0, 10);
  const fares: VehicleFare[] = [];
  const sections: string[] = [];
  let section = "", validity = "";
  let lastEnd = 0;
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(html))) {
    const before = strip(html.slice(lastEnd, m.index).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ""));
    lastEnd = m.index + m[0].length;
    // 문서 순서대로 마커를 읽어 마지막 것이 이긴다: ■섹션, ＜섹션/기간＞, 【도시·구역】
    for (const x of before.matchAll(/■\s*([^■＜＞※【】/]{2,30}?)(?=\s{2,}|\s*[＜【]|\s*高速|\s*고속|\s*\/|$)|[＜【]([^＞】]{2,40})[＞】]/g)) {
      const v = (x[1] ?? x[2]).trim();
      if (x[1] && /드라이버|서비스비|시간당/.test(v)) continue;
      if (/\d{4}년|～|~/.test(v)) validity = v; else section = v;
    }
    const t = parseTable(m[0]);
    if (!t || t.header.length < 2) continue;
    if (validity && expired(validity, today)) continue;
    const transposed = !t.header.slice(1).some(isVehicle) && t.rows.filter((r) => r[0]).some((r) => isVehicle(r[0]));
    const secLabel = section || `${city.label} 공항 송영`;
    const label = `${secLabel}${validity ? ` (${validity})` : ""}`;
    if (!sections.includes(label)) sections.push(label);
    const push = (route: string, vehicleClass: string, raw: string, detail?: string) => {
      const price = priceOf(raw); if (price == null || !route || !vehicleClass) return;
      const isExtra = /초과|30분|1시간당/.test(route) || /초과|30분/.test(vehicleClass);
      fares.push({
        id: `mk-${city.slug}|${secLabel}|${validity}|${route}|${vehicleClass}`.replace(/\s+/g, " "),
        provider: `mk-${city.slug}`, providerLabel: `MK택시 ${city.label}`, area: city.label, section: secLabel, validity: validity || undefined, route, vehicleClass, priceJpy: price,
        unit: isExtra ? "30분당" : "1대", notes: [detail, /～|~/.test(raw) ? "표시 요금부터(～)" : "", "고속도로 통행료 별도"].filter(Boolean).join(" · "), sourceUrl: mkUrl(city.slug), capturedAt,
      });
    };
    if (transposed) {
      for (const row of t.rows) for (let j = 1; j < t.header.length; j++) push(t.header[j], row[0], row[j] ?? "");
    } else {
      let labelCols = 1;
      while (labelCols < t.header.length - 1 && !isVehicle(t.header[labelCols])) labelCols++;
      for (const row of t.rows) {
        const route = row[0]; const detail = labelCols > 1 ? row.slice(1, labelCols).filter(Boolean).join(" · ") : undefined;
        for (let j = labelCols; j < t.header.length; j++) push(route, t.header[j], row[j] ?? "", detail);
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
