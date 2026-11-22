/**
 * SGL 고객 사이트(/sgl) 공용 상수·타입·순수 함수. 클라이언트에서도 import 하므로 서버 전용 모듈을 넣지 않는다.
 * 고객에게 내려가는 데이터 타입(Public*)에는 원가·마진을 담지 않는다.
 */
import type { SaleType } from "@/types";

/** 관리자 설정이 비어 있을 때 쓰는 SGL 기본 정보(VIP 랜딩 푸터와 같은 값) */
export const SGL_DEFAULTS = {
  brand: "SGL",
  tel: "1544-7567",
  hours: "평일 09:00~18:00",
  company: "에이지엘 주식회사",
  ceo: "방윤식",
  bizNo: "659-86-02339",
  license: "2020-제주광역-2331",
  address: "제주특별자치도 제주시 전농로 119, 909호",
} as const;

/** 구름 레이어(검은 바탕의 흰 구름 → mix-blend-mode: screen 으로 합성) */
export const CLOUD_IMAGE = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261115_005635_6590354a-216c-40a2-9f84-93abe97dc7b1.png&w=2400&q=85";

/** 관리자에서 사진을 지정하지 않았을 때 쓰는 기본 사진(Unsplash). 실제 골프장·호텔 사진이 아니라 분위기 예시다 */
const PHOTO = {
  golfMist: "1592937238247-cd0090e02f65",
  golfLinks: "1592919505780-303950717480",
  golfAerial: "1605144884374-ecbb643615f6",
  golfBunker: "1500932334442-8761ee4810a7",
  golfCourseMap: "1595789927828-b56b8a608bc0",
  golfBall: "1632946269126-0f8edbe8b068",
  golfSwing: "1535131749006-b7f58c99034b",
  golfFriends: "1629673120178-53a664eec9e8",
  golfHole: "1587174486073-ae5e5cff23aa",
  golfPalm: "1587205476864-4a5a195167b4",
  ryokan: "1522623349500-de37a56ea2a5",
  pagodaDusk: "1545569341-9eb8b30979d9",
  kyotoStreet: "1493976040374-85c8e12f0c0e",
  roomClassic: "1590490360182-c33d57733427",
  roomModern: "1618773928121-c32242e63f39",
} as const;
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;
export const CARD_PHOTOS = [PHOTO.golfMist, PHOTO.golfAerial, PHOTO.golfLinks, PHOTO.golfBunker, PHOTO.golfFriends, PHOTO.golfBall, PHOTO.golfCourseMap, PHOTO.golfSwing].map(unsplash);
export const GALLERY_PHOTOS = [PHOTO.roomModern, PHOTO.golfBall, PHOTO.ryokan, PHOTO.golfSwing, PHOTO.roomClassic].map(unsplash);

/** 사진 주소에 너비를 붙인다. Unsplash·higgs 는 주소로 크기를 바꾸고, 그 밖의 주소는 그대로 쓴다 */
export function sized(url: string, w: number): string {
  if (url.startsWith("https://images.unsplash.com/")) return `${url.split("?")[0]}?auto=format&fit=crop&w=${w}&q=80`;
  if (url.startsWith("https://images.higgs.ai/")) return url.replace(/([?&])w=\d+/, `$1w=${w}`);
  return url;
}

export interface HeroSlide { title: string[]; photo: string; position: string; thumb: string; heading: string; desc: string }
/** 히어로 3장. 마지막 장의 설명은 화면에서 판매 중인 지역 이름으로 바뀐다 */
export const HERO_SLIDES: HeroSlide[] = [
  { title: ["TEE OFF IN JAPAN"], photo: unsplash(PHOTO.golfMist), position: "center 58%", thumb: unsplash(PHOTO.golfSwing), heading: "일본 골프여행", desc: "항공·숙박·그린피·차량을 한 번에. 출발일별 요금을 확인하고 바로 예약하세요" },
  { title: ["STAY BY THE ONSEN"], photo: unsplash(PHOTO.ryokan), position: "center 55%", thumb: unsplash(PHOTO.roomModern), heading: "온천과 숙소", desc: "라운드를 마치면 온천으로. 골프장에서 가까운 호텔을 골라 담았습니다" },
  { title: ["EXPLORE", "JAPAN"], photo: unsplash(PHOTO.pagodaDusk), position: "center 40%", thumb: unsplash(PHOTO.kyotoStreet), heading: "여행지 둘러보기", desc: "시코쿠와 규슈, 직항으로 닿는 일본 골프 여행지" },
];

export interface RegionInfo { en: string; area: string; blurb: string }
export const REGION_INFO: Record<string, RegionInfo> = {
  다카마쓰: { en: "TAKAMATSU", area: "가가와현 · 시코쿠", blurb: "세토내해를 바라보는 코스와 사누키 우동의 고장" },
  마쓰야마: { en: "MATSUYAMA", area: "에히메현 · 시코쿠", blurb: "도고 온천과 명문 코스가 가까운 시코쿠 대표 골프 여행지" },
  벳부: { en: "BEPPU", area: "오이타현 · 규슈", blurb: "온천 도시 벳부, 유후다케를 마주한 36홀" },
  "후지(시즈오카)": { en: "FUJI", area: "시즈오카현", blurb: "후지산을 바라보며 도는 라운드" },
  미야자키: { en: "MIYAZAKI", area: "미야자키현 · 규슈", blurb: "겨울에도 따뜻한 남규슈의 리조트 코스" },
  삿포로: { en: "SAPPORO", area: "홋카이도", blurb: "여름에 시원한 홋카이도의 넓은 페어웨이" },
  세부: { en: "CEBU", area: "필리핀", blurb: "리조트와 함께 즐기는 따뜻한 라운드" },
};
export const regionInfo = (region: string): RegionInfo => REGION_INFO[region] ?? { en: "JAPAN", area: "일본", blurb: "" };

/* ---------- 고객에게 내려가는 데이터 ---------- */
/** s: o=예약 가능, a=가격 미정·임박(상담), c=마감 */
export interface PublicDeparture { d: string; p: number | null; s: "o" | "a" | "c"; sp?: 1 }
export interface PublicLeg { flightNo: string; origin: string; destination: string; dep: string; arr: string }
export interface PublicRound { day: number; holes: number; course: string; style?: string }
export interface PublicSheet {
  id: string;
  label: string; // 3박 4일 · 54홀
  nights: number;
  holes: number;
  saleType: SaleType;
  paxBasis: number | null;
  outbound: PublicLeg;
  inbound: PublicLeg;
  stay: string;
  stays: { hotel: string; nights: number }[];
  rounds: PublicRound[];
  includes: string[];
  excludes: string[];
  note: string;
  minPrice: number | null;
  departures: PublicDeparture[];
}
export interface PublicPackage {
  id: string;
  title: string;
  region: string;
  regionEn: string;
  area: string;
  country: string;
  airline: string;
  summary: string;
  description: string;
  highlights: string[];
  image: string;
  gallery: string[];
  saleTypes: SaleType[];
  minPrice: number | null;
  nextDate: string | null;
  sheets: PublicSheet[];
}

export type PayMethod = "card" | "bank" | "onsite";
export interface DepositPolicy { type: "fixed" | "percent" | "none"; amount: number; percent: number; unit: "per_person" | "per_booking" }
/** 관리자 설정 중 고객 화면에 필요한 값만 추린 것(비밀값 없음) */
export interface SglConfig {
  status: "open" | "maintenance" | "private";
  brand: string; tel: string; hours: string; kakaoUrl: string; instagramUrl: string;
  company: string; ceo: string; bizNo: string; license: string; address: string;
  minPax: number; maxPax: number; leadDays: number;
  methods: PayMethod[];
  partial: boolean;
  deposit: DepositPolicy;
  balanceDueDays: number;
  bankDeadlineHours: number;
  bank: { name: string; holder: string; account: string };
  notice: { booking: string; payment: string; refund: string; noshow: string; weather: string; extra: string };
  cancel: { freeDays: number; feePercent: number };
  tossClientKey: string | null;
}

/** 예약금: 정책이 없거나 부분결제를 꺼 두었거나 총액 이상이면 null(전액 결제만) */
export function depositOf(total: number, people: number, cfg: Pick<SglConfig, "deposit" | "partial">): number | null {
  if (!cfg.partial || cfg.deposit.type === "none") return null;
  const raw = cfg.deposit.type === "fixed" ? cfg.deposit.amount * (cfg.deposit.unit === "per_person" ? people : 1) : Math.ceil((total * cfg.deposit.percent) / 100 / 1000) * 1000;
  return raw > 0 && raw < total ? raw : null;
}

export const BOOKING_STATUS_LABEL: Record<string, string> = { pending: "결제 대기", paid: "결제 완료", confirmed: "예약 확정", cancelled: "취소" };
export const PAY_METHOD_LABEL: Record<PayMethod, string> = { card: "카드 결제", bank: "무통장 입금", onsite: "현장 결제" };

/* ---------- 표기 ---------- */
export const won = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}원`;
/** 849000 → "84.9만" */
export const manwon = (v: number) => `${(Math.round(v / 1000) / 10).toLocaleString("ko-KR")}만`;
const WD = ["일", "월", "화", "수", "목", "금", "토"];
const utc = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const weekdayKo = (s: string) => WD[utc(s).getUTCDay()];
/** "2026-12-18" → "12월 18일 (금)" */
export const dateKo = (s: string) => { const [, m, d] = s.split("-").map(Number); return `${m}월 ${d}일 (${weekdayKo(s)})`; };
export const dateShort = (s: string) => { const [, m, d] = s.split("-").map(Number); return `${m}.${d} ${weekdayKo(s)}`; };
export const addDaysIso = (s: string, n: number) => { const t = utc(s); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export const diffDays = (a: string, b: string) => Math.round((utc(b).getTime() - utc(a).getTime()) / 86_400_000);
export const todayKstIso = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export const normalizePhone = (v: string) => v.replace(/\D/g, "");
export const isValidPhone = (digits: string) => /^01[016789]\d{7,8}$/.test(digits);
export function formatPhone(v: string) {
  const d = normalizePhone(v).slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  const mid = d.length === 11 ? 7 : 6;
  return `${d.slice(0, 3)}-${d.slice(3, mid)}-${d.slice(mid)}`;
}
/** 동의 문구를 바꾸면 함께 올린다 */
export const SGL_CONSENT_VERSION = "2026-11-22.1";

const AIRPORTS: Record<string, string> = { ICN: "인천", GMP: "김포", PUS: "부산", TAK: "다카마쓰", MYJ: "마쓰야마", KKJ: "기타큐슈", OIT: "오이타", FUK: "후쿠오카", KMI: "미야자키", CTS: "삿포로", NRT: "도쿄 나리타", HND: "도쿄 하네다", KIX: "오사카 간사이", TPE: "타이베이", CEB: "세부" };
export const airportName = (code: string) => (AIRPORTS[code] ? `${AIRPORTS[code]}(${code})` : code);
