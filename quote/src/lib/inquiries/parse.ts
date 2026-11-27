import type { Inquiry, InquiryChannel, InquiryStatus } from "@/types";

/**
 * 문의 글에서 날짜·지역·인원을 풀어내는 순수 함수들(화면·엑셀·통계 공용).
 * 담당자가 적은 원문은 그대로 저장하고, 여기서는 읽을 때마다 해석만 한다 → 해석 규칙을 고쳐도 데이터는 손대지 않는다.
 */
export const CHANNEL_LABEL: Record<InquiryChannel, string> = { instagram: "인스타", kakao: "채널", direct: "직판", web: "홈페이지", etc: "기타" };
export const CHANNELS: InquiryChannel[] = ["instagram", "kakao", "direct", "web", "etc"];
export const STATUS_LABEL: Record<InquiryStatus, string> = { new: "신규", in_progress: "상담중", confirmed: "출발 확정", closed: "종료" };
export const STATUSES: InquiryStatus[] = ["new", "in_progress", "confirmed", "closed"];

const pad = (n: number | string) => String(n).padStart(2, "0");
const valid = (y: number, m: number, d: number) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCMonth() === m - 1 && t.getUTCDate() === d; };

/** "9월14일" → 접수일. 연도가 없으므로 기준일(today)보다 뒤의 달이면 지난해로 본다 */
export function parseReceived(text: string, today: string): string {
  const m = text.match(/(\d{1,2})\s*월\s*(\d{1,2})/);
  if (!m) return "";
  const mo = Number(m[1]), d = Number(m[2]), y = Number(today.slice(0, 4));
  if (!valid(y, mo, d)) return "";
  const iso = `${y}-${pad(mo)}-${pad(d)}`;
  return iso > today ? `${y - 1}-${pad(mo)}-${pad(d)}` : iso;
}

export interface DepartInfo { date: string; month: string } // date = YYYY-MM-DD(일까지 적힌 경우), month = YYYY-MM(달만 알아도 채움)
/**
 * 출발날짜 원문 → 날짜·달. "12월4일" 은 날짜까지, "10월하순"·"9월 출발" 은 달만, "날짜미정" 은 둘 다 빈칸.
 * 연도는 접수일 기준: 출발 달이 접수 달보다 앞이면 다음 해(11월에 접수한 1월 출발).
 */
export function parseDepart(text: string, receivedDate: string, fallbackYear: number): DepartInfo {
  const m = text.match(/(\d{1,2})\s*월(?:\s*(\d{1,2})(?!\s*(?:월|박|명|째|쨰|주)))?/);
  if (!m) return { date: "", month: "" };
  const mo = Number(m[1]);
  if (mo < 1 || mo > 12) return { date: "", month: "" };
  const baseYear = receivedDate ? Number(receivedDate.slice(0, 4)) : fallbackYear;
  const baseMonth = receivedDate ? Number(receivedDate.slice(5, 7)) : 0;
  const y = baseMonth && mo < baseMonth ? baseYear + 1 : baseYear;
  const d = m[2] ? Number(m[2]) : 0;
  return { date: d && valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : "", month: `${y}-${pad(mo)}` };
}

/** 목적지 표준 이름과, 엑셀에 실제로 나온 오타 */
const DESTINATIONS: [string, string[]][] = [
  ["가고시마", []], ["마쓰야마", ["마스야마", "마쓰야먀", "마스야먀", "마쓰야마마", "마츠야마"]], ["벳부", ["뱃부", "벳푸"]], ["다카마쓰", ["다마마쓰", "다카마쓰마", "다카마츠", "타카마쓰"]],
  ["시즈오카", []], ["미야자키", ["미야카지", "미야자끼"]], ["후쿠오카", []], ["구마모토", ["쿠마모토"]], ["도쿄", ["동경"]], ["삿포로", ["삿뽀로"]], ["치앙마이", []], ["일본", []],
];
const ORIGINS = ["인천", "부산", "청주", "대구", "김포", "제주", "무안", "광주"];
export interface RouteInfo { origins: string[]; destinations: string[] }
/** "인천-가고시마" · "인천,부산-시즈오카" · "인천-마스야먀,다카마쓰마" → 출발지·목적지(오타는 표준 이름으로) */
export function parseRoute(text: string): RouteInfo {
  const t = text.replace(/\s+/g, "");
  const origins = ORIGINS.filter((o) => t.includes(o));
  const destinations: string[] = [];
  let rest = t;
  // 긴 이름부터 찾아 지운다(마쓰야마마 → 마쓰야마 가 두 번 잡히지 않게)
  const names = DESTINATIONS.flatMap(([canon, typos]) => [canon, ...typos].map((n) => [n, canon] as const)).sort((a, b) => b[0].length - a[0].length);
  for (const [n, canon] of names) if (rest.includes(n)) { if (!destinations.includes(canon)) destinations.push(canon); rest = rest.split(n).join("|"); }
  // 표의 순서(자주 나오는 순)가 아니라 글에 나온 순서로
  destinations.sort((a, b) => firstIndex(t, a) - firstIndex(t, b));
  return { origins, destinations: destinations.length > 1 ? destinations.filter((d) => d !== "일본") : destinations };
}
const firstIndex = (t: string, canon: string) => { const all = [canon, ...(DESTINATIONS.find(([c]) => c === canon)?.[1] ?? [])].map((n) => t.indexOf(n)).filter((i) => i >= 0); return all.length ? Math.min(...all) : 999; };

/** "…3박4일 2명" → 2 */
export const parsePeople = (text: string): number | null => { const m = text.match(/(\d{1,2})\s*(?:명|인(?!천))/); return m ? Number(m[1]) : null; };
export const parseNights = (text: string): number | null => { const m = text.match(/(\d{1,2})\s*박/); return m ? Number(m[1]) : null; };

/** 화면·통계에서 쓰는 해석 결과 */
export interface InquiryView extends Inquiry {
  origins: string[];
  destinations: string[];
  departIso: string; // 출발일(알면 YYYY-MM-DD)
  departMonth: string; // 출발 달(알면 YYYY-MM)
  peopleCount: number | null;
  nights: number | null;
  landOnly: boolean; // 현지착 문의
  confirmDate: string; // 확정 문구의 출발일
  confirmPeople: number | null; // 확정 문구의 인원
}
export function viewOf(q: Inquiry, today: string): InquiryView {
  const year = Number((q.receivedDate || q.createdAt || today).slice(0, 4));
  const dep = q.departDate ? { date: q.departDate, month: q.departDate.slice(0, 7) } : parseDepart(q.departText, q.receivedDate, year);
  const route = parseRoute(q.route || q.productText);
  const confirm = q.confirmText ? parseDepart(q.confirmText, q.receivedDate, year) : { date: "", month: "" };
  return {
    ...q, origins: route.origins, destinations: route.destinations, departIso: dep.date, departMonth: dep.month,
    peopleCount: q.people ?? parsePeople(q.productText), nights: parseNights(q.productText), landOnly: /현지착/.test(`${q.productText} ${q.route}`),
    confirmDate: confirm.date, confirmPeople: q.confirmText ? parsePeople(q.confirmText) ?? null : null,
  };
}

/**
 * 같은 문의인지 가리는 열쇠(엑셀을 다시 올릴 때 중복 방지): 이름·채널·접수일. 접수일이 없는 줄은 이름·상품내용.
 * 상담하면서 바뀌는 칸(출발날짜·비고·확정)은 넣지 않는다 → 엑셀에서 그 칸을 고쳐 다시 올려도 같은 문의로 본다.
 */
export const matchKeyOf = (q: Pick<Inquiry, "name" | "channel" | "receivedDate" | "productText">) => (q.receivedDate ? [q.name, q.channel, q.receivedDate] : [q.name, "", q.productText]).map((s) => s.replace(/\s+/g, "")).join("|");

/** YYYY-MM-DD → "11월 27일" */
export const mdLabel = (iso: string) => (iso ? `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일` : "");
/** 엑셀 표기 "11월27일" */
export const mdCompact = (iso: string) => (iso ? `${Number(iso.slice(5, 7))}월${Number(iso.slice(8, 10))}일` : "");
