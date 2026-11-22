/** 0=일 … 6=토 (JS Date.getDay 기준) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DayType = "weekday" | "weekend" | "holiday";
export type WeekdayRates = Record<Weekday, number>;

/** 요일별 1인 1박 단가(엔). 우선순위: 일자별 요금(dateRates) → 시즌 구간 → 요일 단가. */
export interface Hotel {
  id: string;
  name: string;
  region: string;
  nightlyRates: WeekdayRates;
  seasons?: { label: string; from: string; to: string; rates: Partial<WeekdayRates> }[];
  /** 일자별 요금 캘린더(숙박일 YYYY-MM-DD → 1인 1박 엔). 호텔이 날짜마다 요금을 주는 경우 */
  dateRates?: Record<string, number>;
  roomBasis?: string; // 예: 트윈룸 1인 기준
  memo?: string;
  updatedAt: string;
}

/** 골프장 요금표 한 행(기간별 평일/주말/연휴 1인 그린피, 엔) */
export interface GolfRatePeriod {
  label?: string;
  from: string;
  to: string;
  weekday: number | null;
  weekend: number | null;
  holiday: number | null;
  /** 플레이 스타일(셀프플레이·캐디포함 등). 값이 있는 행은 상품 라운드가 그 스타일을 지정했을 때만 쓴다 */
  style?: string;
}
export interface GolfCourse {
  id: string;
  name: string;
  region: string;
  tel?: string;
  holes: number;
  playStyle: string;
  periods: GolfRatePeriod[];
  notes?: string;
  updatedAt: string;
}

/** 출발 요일별 차량+지원비(원, 1인) */
export interface VehicleRule {
  id: string;
  name: string;
  region: string;
  feesByWeekday: WeekdayRates;
  memo?: string;
  updatedAt: string;
}

export interface Settings {
  exchangeRate: number; // 1엔당 원
  margins: number[]; // 예: [0.15, 0.2]
  holidays: string[]; // 일본 공휴일(YYYY-MM-DD) — 골프 연휴요금 판정
  updatedAt: string;
}

/** 항공 운임 상태: 운임 확인 / 운항없음 / 미정 */
export type FareStatus = "ok" | "no_flight" | "sold_out" | "unknown";
export interface FlightFare {
  id: string; // `${flightNo}_${date}`
  airline: string; // RS
  flightNo: string; // RS741
  origin: string; // ICN
  destination: string; // TAK
  date: string; // 출발일 YYYY-MM-DD
  fareKrw: number | null; // 총액(세금 포함) 1인 원화
  status: FareStatus;
  source: "crawler" | "manual" | "import";
  capturedAt: string;
  meta?: Record<string, unknown>;
}

export type FareRequestStatus = "pending" | "in_progress" | "done" | "failed";
export interface FareRequest {
  id: string;
  flights: { flightNo: string; origin: string; destination: string }[];
  from: string;
  to: string;
  pax?: number; // 조회 기준 인원(기본 4)
  status: FareRequestStatus;
  productId?: string;
  note?: string;
  createdAt: string;
  claimedAt?: string;
  completedAt?: string;
  resultCount?: number;
  error?: string;
}

/** 그룹 운임 / 유택은 날짜·월별로 사람이 입력(항공사 그룹 견적) */
export type MoneyOrLabel = number | "미정" | "운항없음" | "마감";

export interface RowOverride {
  outboundFare?: MoneyOrLabel;
  inboundFare?: MoneyOrLabel;
  airIndivKrw?: number; // 인디비 항공 합계 직접 지정(운임 합과 다를 때)
  soldOut?: boolean; // 인디비 항공 마감
  hotelJpy?: number;
  golfJpy?: number;
  vehicleKrw?: number;
  extrasKrw?: number; // 기타 원가 합계 직접 지정
  airSurchargeKrw?: number;
  spotSpecial?: boolean; // 날짜 강조(스팟특가)
  groupSpecial?: boolean; // 그룹가 강조
  directSalePrice?: string; // 실제 판매가 표기(만원 단위, 예: "82,9" = 829,000원). 항공 포함 상품은 인스타직판 열
  memo?: string;
  hidden?: boolean; // 표에서 제외(출발 없는 날 등)
}

export interface FlightLeg {
  flightNo: string;
  origin: string;
  destination: string;
  dep: string; // HH:MM
  arr: string; // HH:MM
}

/**
 * 상위 상품(상품군) — 원가표 엑셀 파일 1개에 해당.
 * 국가 › 지역 › 상품군 › 원가표(Product, 시트) › 출발일별 행 순으로 내려간다.
 */
export interface ProductGroup {
  id: string;
  name: string; // 예: 다카마쓰 사카이데 그랜드호텔 (에어서울 조조)
  country: string; // 일본
  region: string; // 다카마쓰
  airline?: string; // RS
  summary?: string; // 한 줄 설명
  fileName?: string; // 원본·출력 엑셀 파일명
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

/** 판매 유형: air = 항공 포함(인디비·그룹 원가), land = 현지착(항공 제외, 운임은 참고용) */
export type SaleType = "air" | "land";
/** 숙박 구성 한 구간(호텔과 박수). 순서대로 묵는다 */
export interface StaySpec { hotelId: string; nights: number }
/** 기타 원가 항목(석식·가이드비 등, 1인). krw 와 jpy 를 함께 주면 합산 */
export interface ExtraCost { label: string; krw?: number; jpy?: number }

export interface Product {
  id: string;
  name: string; // 시트명 (예: 다카마쓰 사카이데 그랜드호텔 3박 36홀)
  groupId?: string; // 상위 상품(상품군)
  saleType?: SaleType; // 기본 air
  paxBasis?: number; // 기준 인원(예: 4인)
  region: string;
  airline: string;
  outbound: FlightLeg;
  inbound: FlightLeg;
  nights: number;
  golfPlan: number[]; // 일자별 홀수 (예: [0,18,18,0])
  hotelId: string;
  stays?: StaySpec[]; // 호텔을 나눠 묵는 경우(박수 합 = nights). 없으면 hotelId 에서 nights 박
  hotelLabel?: string; // 헤더에 표시할 호텔 문구(대체 호텔 포함)
  golfCourseIds: string[]; // 라운드 순서대로 배정(부족하면 순환)
  golfStyles?: string[]; // 라운드별 플레이 스타일(golfCourseIds 와 같은 순서). 비우면 골프장 기본 요금
  golfLabel?: string; // 헤더에 표시할 골프 문구
  vehicleRuleId: string;
  extras?: ExtraCost[]; // 기타 원가(1인)
  note?: string; // 헤더 비고(추천 조합 등)
  exchangeRate: number;
  margins: number[];
  dateFrom: string;
  dateTo: string;
  groupFares: Record<string, MoneyOrLabel>; // date → 그룹 항공 기본가
  groupTaxByMonth: Record<string, MoneyOrLabel>; // YYYY-MM → 유류할증+택스
  overrides: Record<string, RowOverride>; // date → 수동 조정
  legend?: string; // 예: **노란색날짜 : 스팟특가**
  createdAt: string;
  updatedAt: string;
}

/** 견적 엔진 출력 — 엑셀 한 행 */
export interface QuoteRow {
  date: string;
  weekday: Weekday;
  weekdayLabel: string;
  returnDate: string;
  outboundFare: MoneyOrLabel | null;
  inboundFare: MoneyOrLabel | null;
  groupFare: MoneyOrLabel | null;
  groupTax: MoneyOrLabel | null;
  airIndiv: number | "미정" | "마감";
  airGroup: number | "미정";
  hotelJpy: number;
  hotelKrw: number;
  golfJpy: number;
  golfKrw: number;
  vehicleKrw: number;
  extrasKrw: number; // 기타 원가 합계(원)
  airSurchargeKrw: number;
  /** 현지착(land)은 항공을 뺀 원가. costGroup·salesGroup 은 인디비와 같은 값 */
  costIndiv: number | "미정" | "마감";
  costGroup: number | "미정";
  salesIndiv: (number | "미정" | "마감")[];
  salesGroup: (number | "미정" | "마감")[];
  salePriceKrw: number | null; // directSalePrice 를 원으로 환산
  saleMargin: number | null; // 판매가 기준 실제 수익률 = 1 − 원가 ÷ 판매가
  override: RowOverride;
  breakdown: {
    hotelNights: { date: string; weekday: Weekday; jpy: number; hotelId: string; hotelName: string }[];
    golfRounds: { date: string; weekday: Weekday; dayType: DayType; courseId: string; courseName: string; holes: number; jpy: number; style?: string }[];
    extras: { label: string; krw: number }[];
    fareMissing: boolean;
  };
}

export interface QuoteContext {
  hotel: Hotel | null;
  /** 숙박 구성(stays)에 쓰는 호텔들. 없으면 hotel 하나로 계산 */
  hotelsById?: Map<string, Hotel>;
  courses: GolfCourse[];
  vehicle: VehicleRule | null;
  holidays: Set<string>;
  fares: Map<string, FlightFare>; // `${flightNo}_${date}`
  /** 편명이 계절 등으로 바뀐 경우 대체 조회용: `${origin}_${destination}_${date}` → 같은 노선 운임들 */
  routeFares?: Map<string, FlightFare[]>;
}

/** 차량(택시·셔틀) 요금표 — 크롤링 원본 단위(1대 기준 엔) */
export interface VehicleFare {
  id: string; // `${provider}|${section}|${route}|${vehicleClass}`
  provider: string; // mk-tokyo …
  providerLabel: string; // MK택시 도쿄
  area: string; // 도쿄
  section: string; // 나리타 송영 / 하네다 샌딩 / 하네다 픽업
  validity?: string; // 2026년 5월 21일～
  route: string; // 도쿄도 23구⇒나리타 공항 / 大田(오오타)・品川(시나가와)
  vehicleClass: string; // Rolls-Royce / Mercedes-Maybach GLS 600
  priceJpy: number;
  unit: string; // 1대 / 30분당
  notes?: string;
  sourceUrl: string;
  capturedAt: string;
}

/** SGL VIP 사전신청(CMS 컬렉션 vip-applications). id 는 휴대폰 번호 해시 → 번호당 한 건 */
export interface VipApplication {
  id: string;
  name: string;
  phone: string; // 010-1234-5678
  instagram: string;
  regions: string[];
  used_sgl_before: boolean; // SGL 을 1번 이상 이용해 봤다고 체크
  status: "new" | "contacted" | "joined" | "cancelled";
  marketing_consent: boolean;
  privacy_consent_at: string;
  marketing_consent_at: string;
  consent_version: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  created_at: string;
  updated_at: string;
}
/** 매주 공개되는 VIP 혜택(CMS 컬렉션 vip-benefits) */
export interface VipBenefit {
  id: string;
  sort_order: number;
  status: string;
  reveal_at: string; // KST "2026-11-08T19:00"
  title: string;
  highlight: string;
  items?: string[];
  before_text?: string;
  after_text?: string;
  note?: string;
  image?: string;
  image_alt?: string;
}
