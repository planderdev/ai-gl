/**
 * 원가표 입력표(.xlsx) 양식 정의 — 쓰기(input-export.ts)와 읽기(input-import.ts)가 같이 쓴다.
 *
 * 파일 1개 = 상품군 1개. 시트는
 *   작성 안내 · 1 원가표(세로 양식, 열 하나가 원가표 하나) · 2 호텔 · 3 호텔 일자별 요금 · 4 골프장 요금 · 5 차량 · 6 날짜별 입력 · 참고 등록된 단가
 * 읽을 때는 시트 이름이 아니라 머리글 문구로 찾으므로, 시트 이름이나 열 순서를 바꿔도 된다. 머리글 문구(아래 label)는 바꾸면 안 된다.
 */
export const INPUT_MARK = "원가표 입력표";
export const INPUT_SHEETS = { guide: "작성 안내", setup: "1 원가표", hotels: "2 호텔", hotelDates: "3 호텔 일자별 요금", golf: "4 골프장 요금", vehicles: "5 차량", daily: "6 날짜별 입력", ref: "참고 등록된 단가" } as const;
export const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const SALE_TYPE_TEXT = { air: "항공 포함", land: "현지착" } as const;
export const FLAG_ON = "O";
/** 한 파일에 기본으로 그려 두는 원가표 열 수(더 필요하면 오른쪽에 열을 이어 쓰면 된다) */
export const SETUP_COLUMNS = 6;

export type FieldKind = "text" | "number" | "date" | "time" | "choice";
export interface SetupField { key: string; label: string; required?: boolean; kind: FieldKind; hint: string; choices?: string[] }

/** '1 원가표' 시트의 상품군 칸(값 하나) */
export const GROUP_FIELDS: SetupField[] = [
  { key: "groupName", label: "상품군 이름", required: true, kind: "text", hint: "이 파일의 원가표를 묶는 이름. 예: 마쓰야마 3대 명문골프 (제주항공 조조)" },
  { key: "country", label: "국가", kind: "text", hint: "비우면 일본" },
  { key: "region", label: "지역", required: true, kind: "text", hint: "호텔·골프장·차량 단가가 속하는 지역. 예: 마쓰야마" },
];

/** '1 원가표' 시트의 원가표 칸(열 하나가 원가표 하나) */
export const SHEET_FIELDS: SetupField[] = [
  { key: "name", label: "원가표 이름", required: true, kind: "text", hint: "엑셀 시트 이름이 됩니다. 같은 이름이 이미 있으면 그 원가표를 고칩니다. 예: 3박 54홀 현지착 (4인)" },
  { key: "saleType", label: "판매 유형", required: true, kind: "choice", choices: [SALE_TYPE_TEXT.air, SALE_TYPE_TEXT.land], hint: "항공 포함 = 항공료까지 원가에 넣음 / 현지착 = 항공 제외" },
  { key: "paxBasis", label: "기준 인원", kind: "number", hint: "예: 4" },
  { key: "airline", label: "항공사 코드", required: true, kind: "text", hint: "예: 7C, RS, LJ" },
  { key: "outFlight", label: "출발편", required: true, kind: "text", hint: "예: 7C1721" },
  { key: "origin", label: "출발 공항", required: true, kind: "text", hint: "예: ICN" },
  { key: "destination", label: "도착 공항", required: true, kind: "text", hint: "예: MYJ" },
  { key: "outDep", label: "출발편 출발 시각", kind: "time", hint: "예: 07:00" },
  { key: "outArr", label: "출발편 도착 시각", kind: "time", hint: "예: 08:35" },
  { key: "inFlight", label: "귀국편", required: true, kind: "text", hint: "예: 7C1722" },
  { key: "inDep", label: "귀국편 출발 시각", kind: "time", hint: "예: 09:35" },
  { key: "inArr", label: "귀국편 도착 시각", kind: "time", hint: "예: 11:20" },
  { key: "nights", label: "박수", required: true, kind: "number", hint: "예: 3 (3박 4일)" },
  { key: "golfPlan", label: "일자별 홀수", required: true, kind: "text", hint: "첫날부터 마지막 날까지 콤마로. 골프 없는 날은 0. 예: 0,18,18,0 / 도착일에 치면 18,18,18,0" },
  { key: "dateFrom", label: "출발일 시작", required: true, kind: "date", hint: "예: 2026-12-01" },
  { key: "dateTo", label: "출발일 끝", required: true, kind: "date", hint: "예: 2027-02-28" },
  { key: "exchangeRate", label: "환율", required: true, kind: "number", hint: "1엔당 원. 예: 9.1" },
  { key: "margins", label: "마진(%)", kind: "text", hint: "콤마로 여러 개. 비우면 15, 20" },
  { key: "stays", label: "숙박 구성", required: true, kind: "text", hint: "호텔명 N박 을 + 로 잇습니다(묵는 순서). 예: 쥬라쿠 스파&리조트 1박 + 넘버원 2박" },
  { key: "golf", label: "골프 구성", kind: "text", hint: "골프가 있으면 필수. 라운드 순서대로 골프장명(스타일) 을 + 로 잇습니다. 스타일은 생략 가능. 예: 썬셋힐즈컨트리클럽(셀프플레이) + 오쿠도고골프클럽(셀프플레이)" },
  { key: "vehicle", label: "차량 규칙", kind: "text", hint: "'5 차량' 시트나 등록된 차량 규칙 이름. 비우면 차량비 0원" },
  { key: "extras", label: "기타 원가", kind: "text", hint: "1인 고정 비용. 항목 금액원 또는 금액엔 을 + 로 잇습니다. 예: 철판구이 석식 40000원 + 가이드비 3000엔" },
  { key: "hotelLabel", label: "엑셀 머리글 호텔 문구", kind: "text", hint: "비우면 호텔명 + N박" },
  { key: "golfLabel", label: "엑셀 머리글 골프 문구", kind: "text", hint: "비우면 골프 N회 + 홀수" },
  { key: "legend", label: "범례 문구", kind: "text", hint: "예: **노란색날짜 : 스팟특가**" },
  { key: "note", label: "비고", kind: "text", hint: "추천 조합 등 메모" },
];

export interface ColumnDef { key: string; label: string; required?: boolean; width: number; kind: "text" | "number" | "date" | "flag" | "money"; note?: string }

export const HOTEL_COLUMNS: ColumnDef[] = [
  { key: "name", label: "호텔명", required: true, width: 28, kind: "text", note: "'1 원가표'의 숙박 구성에 적은 이름과 같아야 합니다" },
  ...WEEKDAY_HEADERS.map((w, i): ColumnDef => ({ key: `w${i}`, label: w, width: 9, kind: "number", note: `${w}요일 숙박 1인 1박 요금(엔)` })),
  { key: "roomBasis", label: "객실 기준", width: 16, kind: "text", note: "예: 트윈룸 기준" },
  { key: "memo", label: "메모", width: 40, kind: "text" },
];
/** '3 호텔 일자별 요금' 은 가로 양식: 숙박일 · 요일 · 호텔명… (호텔명 열은 필요한 만큼) */
export const HOTEL_DATE_HEAD = { date: "숙박일", weekday: "요일" } as const;
export const GOLF_COLUMNS: ColumnDef[] = [
  { key: "name", label: "골프장명", required: true, width: 28, kind: "text", note: "'1 원가표'의 골프 구성에 적은 이름과 같아야 합니다" },
  { key: "style", label: "스타일", width: 13, kind: "text", note: "셀프플레이 / 캐디포함. 스타일을 적은 줄은 골프 구성에서 그 스타일을 고른 라운드에만 적용됩니다" },
  { key: "from", label: "기간 시작", required: true, width: 13, kind: "date" },
  { key: "to", label: "기간 끝", required: true, width: 13, kind: "date" },
  { key: "weekday", label: "주중", required: true, width: 10, kind: "number", note: "1인 그린피(엔)" },
  { key: "weekend", label: "주말·휴일", required: true, width: 10, kind: "number" },
  { key: "holiday", label: "연휴", width: 10, kind: "number", note: "일본 공휴일 요금. 비우면 주말·휴일 요금" },
  { key: "label", label: "기간 이름", width: 24, kind: "text", note: "예: 연말연시 특별요금" },
  { key: "holes", label: "홀", width: 6, kind: "number", note: "비우면 18" },
  { key: "tel", label: "TEL", width: 16, kind: "text" },
  { key: "notes", label: "비고", width: 40, kind: "text" },
];
export const VEHICLE_COLUMNS: ColumnDef[] = [
  { key: "name", label: "차량 규칙", required: true, width: 34, kind: "text", note: "'1 원가표'의 차량 규칙에 적은 이름과 같아야 합니다" },
  ...WEEKDAY_HEADERS.map((w, i): ColumnDef => ({ key: `w${i}`, label: w, width: 10, kind: "number", note: `${w}요일 출발 1인 금액(원)` })),
  { key: "memo", label: "메모", width: 40, kind: "text" },
];
export const DAILY_COLUMNS: ColumnDef[] = [
  { key: "sheet", label: "원가표 이름", required: true, width: 46, kind: "text" },
  { key: "date", label: "출발일", required: true, width: 12, kind: "date" },
  { key: "sale", label: "판매가", width: 11, kind: "text", note: "실제 판매가. 만원 단위 84,9 또는 원 단위 849000" },
  { key: "groupFare", label: "그룹가", width: 11, kind: "money", note: "항공 포함만. 숫자 또는 미정·운항없음·마감" },
  { key: "groupTax", label: "유택", width: 11, kind: "money", note: "유류할증 + 택스. 달마다 같으므로 그 달의 아무 날짜에 한 번만 적어도 됩니다" },
  { key: "outFare", label: "출발편 운임(직접)", width: 13, kind: "money", note: "수집된 운임 대신 이 원가표에만 쓸 값. 숫자 또는 미정·운항없음·마감" },
  { key: "inFare", label: "귀국편 운임(직접)", width: 13, kind: "money", note: "귀국일(출발일 + 박수) 운임" },
  { key: "airIndiv", label: "항공 인디비(직접)", width: 13, kind: "number", note: "출발편 + 귀국편 합 대신 쓸 금액" },
  { key: "hotelJpy", label: "호텔 ¥(직접)", width: 12, kind: "number", note: "자동 계산 대신 쓸 숙박 합계(엔)" },
  { key: "golfJpy", label: "골프 ¥(직접)", width: 12, kind: "number", note: "자동 계산 대신 쓸 골프 합계(엔)" },
  { key: "vehicleKrw", label: "차량(직접)", width: 11, kind: "number" },
  { key: "extrasKrw", label: "기타 원가(직접)", width: 12, kind: "number" },
  { key: "airSurchargeKrw", label: "항공추가금", width: 11, kind: "number" },
  { key: "spot", label: "강조", width: 6, kind: "flag", note: "노란색 날짜(스팟특가·연휴)" },
  { key: "groupSpecial", label: "그룹 강조", width: 8, kind: "flag" },
  { key: "soldOut", label: "마감", width: 6, kind: "flag", note: "인디비 항공 마감" },
  { key: "hidden", label: "숨김", width: 6, kind: "flag", note: "출발이 없는 날. 표와 엑셀에서 빠집니다" },
  { key: "memo", label: "메모", width: 30, kind: "text" },
];

/** 머리글 비교용: 공백·별표 제거 */
export const normLabel = (s: string) => s.replace(/[\s*]/g, "");
