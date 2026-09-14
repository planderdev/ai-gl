/** 0=일 … 6=토 (JS Date.getDay 기준) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DayType = "weekday" | "weekend" | "holiday";
export type WeekdayRates = Record<Weekday, number>;

/** 요일별 1인 1박 단가(엔). 시즌 구간이 있으면 해당 구간 단가가 우선. */
export interface Hotel {
  id: string;
  name: string;
  region: string;
  nightlyRates: WeekdayRates;
  seasons?: { label: string; from: string; to: string; rates: Partial<WeekdayRates> }[];
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
  airSurchargeKrw?: number;
  spotSpecial?: boolean; // 날짜 강조(스팟특가)
  groupSpecial?: boolean; // 그룹가 강조
  directSalePrice?: string; // 인스타직판 표기 (예: "82,9")
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

export interface Product {
  id: string;
  name: string; // 시트명 (예: 다카마쓰 사카이데 그랜드호텔 3박 36홀)
  region: string;
  airline: string;
  outbound: FlightLeg;
  inbound: FlightLeg;
  nights: number;
  golfPlan: number[]; // 일자별 홀수 (예: [0,18,18,0])
  hotelId: string;
  hotelLabel?: string; // 헤더에 표시할 호텔 문구(대체 호텔 포함)
  golfCourseIds: string[]; // 라운드 순서대로 배정(부족하면 순환)
  vehicleRuleId: string;
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
  airSurchargeKrw: number;
  costIndiv: number | "미정" | "마감";
  costGroup: number | "미정";
  salesIndiv: (number | "미정" | "마감")[];
  salesGroup: (number | "미정" | "마감")[];
  override: RowOverride;
  breakdown: {
    hotelNights: { date: string; weekday: Weekday; jpy: number }[];
    golfRounds: { date: string; weekday: Weekday; dayType: DayType; courseId: string; courseName: string; holes: number; jpy: number }[];
    fareMissing: boolean;
  };
}

export interface QuoteContext {
  hotel: Hotel | null;
  courses: GolfCourse[];
  vehicle: VehicleRule | null;
  holidays: Set<string>;
  fares: Map<string, FlightFare>; // `${flightNo}_${date}`
}
