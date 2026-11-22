import type ExcelJS from "exceljs";
import type { MoneyOrLabel } from "@/types";
import { formatDate } from "@/lib/pricing/date";

/** 원가표 가져오기 공용 셀 읽기·이름 매칭 */
type CellV = ExcelJS.CellValue;
export const num = (v: CellV): number | null => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "object" && v && "result" in v && typeof v.result === "number" ? v.result : null);
export const str = (v: CellV): string => (v == null ? "" : typeof v === "object" && "richText" in v ? v.richText.map((t) => t.text).join("") : typeof v === "object" && "result" in v ? String(v.result ?? "") : v instanceof Date ? formatDate(v) : String(v));
export const isFormula = (v: CellV) => typeof v === "object" && v != null && ("formula" in v || "sharedFormula" in v);
export const dateOf = (v: CellV): string | null => (v instanceof Date ? formatDate(new Date(Math.round(v.getTime() / 86400000) * 86400000)) : null);
export const label = (v: CellV): MoneyOrLabel | null => {
  const n = num(v);
  if (n != null) return n;
  const s = str(v).trim();
  return s === "운항없음" || s === "미정" || s === "마감" ? s : null;
};
export const argb = (c: ExcelJS.Cell) => {
  const f = c.fill as ExcelJS.FillPattern | undefined;
  return f?.type === "pattern" && f.fgColor?.argb ? f.fgColor.argb : null;
};
export const fontArgb = (c: ExcelJS.Cell) => (c.font?.color as { argb?: string } | undefined)?.argb ?? null;
export const mode = (xs: number[]) => { const m = new Map<number, number>(); xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0; };
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");

/** 이름 비교용: 괄호·업종어(컨트리클럽·호텔 등)·공백 제거 */
export const normName = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/컨트리클럽|골프클럽|골프장|컨트리|country\s*club|golf\s*club|c\.?c\.?|g\.?c\.?|그랜드호텔|호텔|hotel|리조트|스파|[&\s·.\-]/g, "");

/** 한글 음절을 자모로 풀어 편집 거리를 잰다(쥬락쿠 ↔ 쥬라쿠 = 1) */
const jamo = (s: string) => [...s].flatMap((ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  if (c < 0 || c > 11171) return [ch];
  const jong = c % 28;
  return [`c${Math.floor(c / 588)}`, `v${Math.floor((c % 588) / 28)}`, ...(jong ? [`t${jong}`] : [])];
});
function editDistance(a: string[], b: string[]) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/**
 * 원가표에 줄여 쓴 이름(국제cc, 쥬락쿠 …)을 기존 마스터와 맞춘다. 같은 지역 안에서만 본다.
 * ① 정규화 이름이 같음 ② 한쪽이 다른 쪽을 포함하고 남는 글자가 지역명이거나 1글자 이하 ③ 자모 편집 거리 1(3음절 이상)
 * 다른 골프장에 잘못 붙지 않도록 ②·③은 후보가 하나일 때만 인정한다.
 */
export function matchByName<T extends { id: string; name: string; region: string }>(name: string, list: T[], region: string, claimed: Set<string> = new Set()): T | null {
  const key = normName(name);
  if (!key) return null;
  const pool = list.filter((x) => x.region === region && !claimed.has(x.id));
  const exact = pool.filter((x) => normName(x.name) === key);
  if (exact.length) return exact[0];
  const reg = normName(region);
  const rest = (long: string, short: string) => long.replace(short, "").replace(reg, "");
  const contains = pool.filter((x) => { const n = normName(x.name); return (n.includes(key) && rest(n, key).length <= 1) || (key.includes(n) && n.length >= 2 && rest(key, n).length <= 1); });
  if (contains.length === 1) return contains[0];
  if ([...key].length < 3) return null;
  const near = pool.filter((x) => editDistance(jamo(normName(x.name)), jamo(key)) <= 1);
  return near.length === 1 ? near[0] : null;
}
