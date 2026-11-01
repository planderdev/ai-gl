/**
 * SGL VIP 사전신청 랜딩(/sgl-vip) 공용 상수·순수 함수. 클라이언트에서도 import 하므로 서버 전용 모듈을 넣지 않는다.
 * 일시는 모두 한국시간(KST, UTC+9) 기준이며 내부 값은 epoch ms.
 */
const KST_MS = 9 * 3600_000;
const DAY_MS = 86_400_000;
const REVEAL_HOUR = 19;

/** 광고 기준 "12월 26일 오픈". 오픈 시각은 정해지지 않아 D-Day 표시에만 쓴다 */
export const VIP_OPEN_AT = Date.UTC(2026, 11, 26) - KST_MS;
/** 첫 혜택은 11/1 광고로 공개됐으므로 페이지의 다음 공개는 11/8(일) 19시부터 센다 */
const FIRST_NEXT_REVEAL_AT = Date.UTC(2026, 10, 8, REVEAL_HOUR) - KST_MS;

export const VIP_ANNUAL_FEE = "10만원";
export const VIP_SUPPORT_TEL = "1544-7567";
export const VIP_REGIONS = ["벳부", "다카마쓰", "마쓰야마", "후지"] as const;
/** 동의 문구를 바꾸면 함께 올린다(신청 건에 어떤 문구로 동의했는지 남는다) */
export const VIP_CONSENT_VERSION = "2026-11-01";

/** CMS(vip-benefits)에 시드되는 첫 혜택. 스토어에 없어도 랜딩에는 항상 노출한다 */
export const VIP_FIRST_BENEFIT = {
  id: "benefit-1",
  sort_order: 1,
  status: "publish",
  reveal_at: "2026-11-01T00:00",
  title: "벳부골프클럽 2인 단독 라운딩",
  highlight: "1년 내내 추가요금 면제",
  before_text: "2인 라운딩 시 18홀당 1인 2만원 추가요금",
  after_text: "추가요금 0원",
  note: "1인 기준 18홀 5회면, 면제받는 추가요금이 연회비 10만원과 같아요.",
  image: "/sgl-vip/two-round.jpg",
  image_alt: "두 사람이 탄 카트가 페어웨이를 달리는 모습",
};

export const normalizePhone = (v: string) => v.replace(/\D/g, "");
export const isValidPhone = (digits: string) => /^01[016789]\d{7,8}$/.test(digits);
export function formatPhone(v: string) {
  const d = normalizePhone(v).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  const mid = d.length === 11 ? 7 : 6;
  return `${d.slice(0, 3)}-${d.slice(3, mid)}-${d.slice(mid)}`;
}
/** "@id", "instagram.com/id/" 처럼 입력해도 아이디만 남긴다 */
export const normalizeInstagram = (v: string) => v.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").replace(/^@/, "");
export const isValidInstagram = (id: string) => /^[A-Za-z0-9._]{0,30}$/.test(id);

/** 다음 공개 시각(매주 일요일 19시). 오픈 이후로 넘어가면 null */
export function nextRevealAt(now: number): number | null {
  const shifted = now + KST_MS;
  const midnight = Math.floor(shifted / DAY_MS) * DAY_MS;
  let t = midnight + ((7 - new Date(midnight).getUTCDay()) % 7) * DAY_MS + REVEAL_HOUR * 3600_000;
  if (t <= shifted) t += 7 * DAY_MS;
  const at = Math.max(t - KST_MS, FIRST_NEXT_REVEAL_AT);
  return at < VIP_OPEN_AT ? at : null;
}

export const dDayOf = (now: number) => Math.round((VIP_OPEN_AT + KST_MS) / DAY_MS) - Math.floor((now + KST_MS) / DAY_MS);
export const dDayLabel = (d: number) => (d > 0 ? `D-${d}` : d === 0 ? "D-DAY" : "OPEN");

/** CMS 의 "2026-11-08T19:00" 값을 KST 로 해석. 값이 없거나 잘못되면 NaN */
export const parseKst = (s: unknown) => (typeof s === "string" && s ? new Date(`${s.trim().replace(" ", "T").slice(0, 16)}:00+09:00`).getTime() : NaN);

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export function formatKst(ms: number) {
  const d = new Date(ms + KST_MS);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WEEKDAYS[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const ORDINALS = ["첫", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
export const ordinalLabel = (n: number) => `${ORDINALS[n - 1] ?? n} 번째`;
