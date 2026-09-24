/**
 * SGL 이 실제로 운영하는 지역의 호텔·골프장·차량 규칙을 견적 마스터에 넣고,
 * 벳부(타이베이 TI750/751) 원가표(0309 xlsx)가 있으면 상품·운임까지 가져온다.
 *
 *   npx tsx scripts/seed-sgl-masters.ts ["/path/0309 벳부 카메노이호텔 ... .xlsx"]
 *
 * 출처: 벳부GC 2025/2026 계약요금 확인서(★SGL予約・見積書_別府), 0309 벳부 원가표, 마쓰야마+벳부 15박 일정표,
 *       타이베이출발 오이타-벳부 일정표, 도쿠모 동경 렌터카 후지산뷰 원가표(골프장 요금 시트), 마쓰야마 견적서(호텔 예상가).
 * 확인이 필요한 값(역산·예상)은 memo/notes 에 "확인 필요" 로 표시한다.
 */
import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import type { FlightFare, GolfCourse, Hotel, MoneyOrLabel, Product, RowOverride, VehicleRule, WeekdayRates } from "../src/types";
import { golfCourses, hotels, vehicleRules, getSettings } from "../src/lib/masters/service";
import { products } from "../src/lib/products/service";
import { fares } from "../src/lib/fares/service";
import { computeRow, fareKey } from "../src/lib/pricing/engine";
import { addDays, eachDate, formatDate, weekdayOf } from "../src/lib/pricing/date";

const now = new Date().toISOString();
const wk = (weekday: number, sat: number, sun = weekday, fri = weekday): WeekdayRates => ({ 0: sun, 1: weekday, 2: weekday, 3: weekday, 4: weekday, 5: fri, 6: sat });
const flat = (v: number) => wk(v, v);

const HOTELS: Hotel[] = [
  { id: "hotel-사카이데그랜드호텔", name: "사카이데그랜드호텔", region: "다카마쓰", nightlyRates: wk(7500, 8500, 7500, 8500), memo: "원가표 E1~E3(1박 단가). 일~목 7,500 / 금·토 8,500 (조식 포함 기준)", updatedAt: now },
  { id: "hotel-우다츠-그랜드호텔", name: "우다츠 그랜드호텔", region: "다카마쓰", nightlyRates: wk(7500, 8500, 7500, 8500), memo: "원가표 헤더의 대체 호텔 — 사카이데와 동일 단가로 등록(확인 필요)", updatedAt: now },
  { id: "hotel-루트인-다카마쓰", name: "루트인 다카마쓰", region: "다카마쓰", nightlyRates: wk(7500, 8500, 7500, 8500), memo: "원가표 헤더의 대체 호텔 — 사카이데와 동일 단가로 등록(확인 필요)", updatedAt: now },
  { id: "hotel-카메노이호텔-벳부", name: "카메노이호텔 벳부", region: "벳부", nightlyRates: { 0: 8543, 1: 8543, 2: 8543, 3: 8543, 4: 8543, 5: 8544, 6: 12761 }, memo: "TEL +81 977-22-3301 · 5-17 Chuomachi, Beppu, Oita 874-0936 · 체크인 15:00 / 체크아웃 11:00 · 조식 뷔페 06:40-10:00 · 온천 06:00-24:00 · 벳부역 도보 5분, 350객실. 단가: 0309 원가표(수 출발 3박 25,630엔 / 토 출발 4박 38,390엔)에서 역산(일~목 8,543 · 금 8,544 · 토 12,761) — 실제 요일별 단가 확인 필요", updatedAt: now },
  { id: "hotel-벳부골프호텔", name: "벳부골프호텔(벳부GC 내 로지)", region: "벳부", nightlyRates: flat(5800), memo: "TEL +81 977-44-6002 · 1753-4 Yamagamachi Oaza Kuginoo, Kitsuki, Oita 879-1313 · 체크인 16:00 / 체크아웃 09:00 · 1박 조식 5,800엔 / 조·석식 10,800엔(석식 사전예약 필수) · 온천 06:00-08:00, 16:00-23:00. 출처: 벳부GC 2025/2026 계약요금", updatedAt: now },
  { id: "hotel-쥬라쿠-스파-리조트", name: "쥬라쿠 스파&리조트", region: "마쓰야마", nightlyRates: flat(16000), memo: "TEL +81 89-955-1661 · 1110 Minara, Toon-shi, Ehime 791-0211 · 체크인 15:00 / 체크아웃 10:00 · 조식 뷔페 07:00-10:00 · 온천 06:00-24:00, 노천탕 8개. 단가 16,000엔은 2026 견적서의 석식 포함 예상가 — 확인 필요", updatedAt: now },
  { id: "hotel-히요리-호텔-마쓰야마", name: "히요리 호텔 마쓰야마", region: "마쓰야마", nightlyRates: flat(9000), memo: "TEL +81 89-941-0109 · 3-3-1 Ichiban-cho, Matsuyama, Ehime 790-0001 · 체크인 15:00 / 체크아웃 11:00 · 조식 뷔페 06:30-10:30 · 오카이도 중심, 마쓰야마성 도보 5분. 단가 9,000엔은 임시값(요금표 미확보) — 확인 필요", updatedAt: now },
  { id: "hotel-도큐레이-호텔-마쓰야마", name: "도큐레이 호텔 마쓰야마", region: "마쓰야마", nightlyRates: flat(11000), memo: "TEL +81 89-941-0109 · 단가 11,000엔은 2026 견적서 예상가(토요일) — 확인 필요", updatedAt: now },
  { id: "hotel-쿠레타케-인-후지노미야", name: "쿠레타케 인 프리미엄 후지노미야 에키마에", region: "후지(시즈오카)", nightlyRates: wk(7000, 9000), seasons: [
    { label: "7월~8월", from: "2026-07-01", to: "2026-08-31", rates: wk(7700, 9700) },
    { label: "오봉 8/8~8/15", from: "2026-08-08", to: "2026-08-15", rates: flat(9000) },
    { label: "9월 초", from: "2026-09-01", to: "2026-09-16", rates: wk(7000, 9000) },
    { label: "9월 말~10월", from: "2026-09-22", to: "2026-10-31", rates: wk(6300, 8300) },
  ], memo: "TEL +81 544-25-1511 · 15-14 Chuo-cho, Fujinomiya, Shizuoka 418-0065 · 트윈룸 1인 기준. 도쿠모 동경 렌터카 원가표(3박 합계)에서 역산 — 확인 필요", updatedAt: now },
];

const p = (from: string, to: string, weekday: number | null, weekend: number | null, holiday = weekend, label?: string) => ({ label, from, to, weekday, weekend, holiday });
const COURSES: GolfCourse[] = [
  // ── 벳부골프클럽 (계약요금 プレー総額 + 440엔: 0309 원가표 관행) ──
  { id: "golf-벳부gc-쯔루미코스", name: "벳부골프클럽 쯔루미코스", region: "벳부", tel: "+81 977-44-6002 (예약: PGM agent@pacificgolf.co.jp)", holes: 18, playStyle: "셀프플레이(페어웨이 카트 진입)", periods: [
    p("2026-04-29", "2026-05-06", 12640, 12640, 12640, "GW 특별요금"),
    p("2026-08-12", "2026-08-15", 8340, 8340, 8340, "오봉 특별요금"),
    p("2026-12-27", "2027-01-04", 13340, 13340, 13340, "연말연시 특별요금"),
    p("2026-01-01", "2026-02-28", 6640, 10240, 10240, "1~2월"),
    p("2026-03-01", "2026-12-31", 7440, 12040, 12040, "3~12월"),
    p("2027-01-05", "2027-02-28", 6640, 10240, 10240, "1~2월"),
    p("2027-03-01", "2027-12-31", 7440, 12040, 12040, "3~12월"),
  ], notes: "1930년 개장, 규슈 2번째 명문. 해발 500m 평원, 벳부만 조망. 계약요금(2025.4~2026.3, 인바운드 NET·세금포함): 3~12월 평일 7,000 / 토일축 11,600, 1~2월 6,200 / 9,800 — 원가표는 +440엔(락커 등) 적용. 2B 추가: 평일 550 / 토일축 1,650. 추가 9H: 평일 2,750 / 토일축 3,300. 월요일 셀프데이. 2026/27 갱신 요금 확인 필요", updatedAt: now },
  { id: "golf-벳부gc-유후코스", name: "벳부골프클럽 유후코스", region: "벳부", tel: "+81 977-44-6002 (예약: PGM agent@pacificgolf.co.jp)", holes: 18, playStyle: "셀프플레이(자동유도 카트)", periods: [
    p("2026-04-29", "2026-05-06", 10040, 10040, 10040, "GW 특별요금"),
    p("2026-08-12", "2026-08-15", 6940, 6940, 6940, "오봉 특별요금"),
    p("2026-12-27", "2027-01-04", 10540, 10540, 10540, "연말연시 특별요금"),
    p("2026-01-01", "2026-02-28", 5040, 7440, 7440, "1~2월"),
    p("2026-03-01", "2026-12-31", 5740, 9440, 9440, "3~12월"),
    p("2027-01-05", "2027-02-28", 5040, 7440, 7440, "1~2월"),
    p("2027-03-01", "2027-12-31", 5740, 9440, 9440, "3~12월"),
  ], notes: "쯔루미산·유후산 조망, OUT/IN 전략적 코스. 계약요금: 3~12월 평일 5,300 / 토일축 9,000, 1~2월 4,600 / 7,000 — 원가표는 +440엔 적용(0309 원가표: 평일 5,740, 토일축 9,440). 특별숙박팩(1박 조·석식+18H) 평일 14,900 / 토일축 17,400", updatedAt: now },
  // ── 마쓰야마 (에히메) — 2026-09-15 각 골프장 공식/예약 사이트에서 수집한 비지터 셀프플레이 요금(1인, 세금 포함). SGL 계약(에이전트) 요금과 다를 수 있음 ──
  { id: "golf-마쓰야마국제cc", name: "마쓰야마국제컨트리클럽", region: "마쓰야마", tel: "089-964-2350", holes: 18, playStyle: "셀프플레이(GPS 승용카트)", periods: [
    p("2026-11-01", "2026-11-30", 8700, 16100, 16100, "11월"), p("2026-12-01", "2026-12-31", 8300, 16700, 16700, "12월"), p("2027-01-01", "2027-01-31", 7700, 15600, 15600, "1월"),
    p("2026-01-01", "2027-12-31", 8100, 11900, 11900, "기본(9~10월 기준)"),
  ], notes: "PGM. 〒791-0221 愛媛県東温市上村乙347. Par72 6,639Y 산악형, 공항·시내 접근 최적. 요금은 じゃらん골프 월별 최저 플랜 총액(昼食別) 기준: 9~10월 평일 8,100 / 토일축 11,900, 11월 8,700 / 16,100, 12월 8,300 / 16,700, 1월 7,700 / 15,600. 2サム 보증 평일 8,700. PGM 계약요금 확인 필요", updatedAt: now },
  { id: "golf-마쓰야마gc", name: "마쓰야마골프클럽(가와우치코스)", region: "마쓰야마", holes: 18, playStyle: "셀프플레이", periods: [p("2026-01-01", "2027-12-31", 9960, 14960, 14960, "2023.6~ 비지터 셀프")], notes: "에히메현 최초 골프장(1948). 공식 요금표(2023.6~): 비지터 셀프 평일 9,960엔(식사 포함) / 토일축 14,960엔, 캐디 13,260 / 18,260. 2B 할증 1인 1,210엔(셀프), 3B 캐디 1,100. 오후 1R 비지터 평일 8,000 / 토일축 10,000. 홈페이지 matsuyama-golf.jp", updatedAt: now },
  { id: "golf-마쓰야마씨사이드cc", name: "마쓰야마씨사이드컨트리클럽", region: "마쓰야마", tel: "0898-54-3478", holes: 18, playStyle: "셀프플레이(카트내비 승용카트, 전조 셀프)", periods: [p("2026-01-01", "2027-12-31", 8800, 11880, 9130, "통상 요금")], notes: "〒799-2312 愛媛県今治市菊間町田ノ尻. 세토내해 해안형 7,000Y 챔피언 코스. 공식 요일별 요금(세금 포함): 월·화 셀프데이 8,890 / 수 8,680(스테이크 런치 포함) / 목 8,800 / 금 7,370 / 토·일 11,880 / 축일 9,130. 박모(薄暮) 1R 수~금 7,370, 토일축 10,430. 현금 결제만 가능", updatedAt: now },
  { id: "golf-치산호조cc", name: "치산컨트리클럽 호조", region: "마쓰야마", tel: "089-995-0016", holes: 18, playStyle: "셀프플레이(GPS 승용카트, 페어웨이 진입 +550엔)", periods: [p("2026-01-01", "2027-12-31", 7400, 10110, 10110, "예약사이트 기준")], notes: "PGM. 〒799-2403 愛媛県松山市萩原小畑乙396-2. Par72 6,469Y 구릉형, 에히메 최고 인기·바다 조망. じゃらん 기준 평일 4サム 셀프 7,400(昼食別) / GPS카트 플랜 8,700, 토일축 최저 10,110(11~1월). PGM 공식 예약 시 평일 500·토일축 1,000엔 할인. 계약요금 확인 필요", updatedAt: now },
  { id: "golf-마쓰야마로얄cc", name: "마쓰야마로얄골프클럽", region: "마쓰야마", tel: "089-967-1211", holes: 18, playStyle: "셀프플레이(GPS 승용카트, 카트 진입 가능)", periods: [p("2026-12-01", "2026-12-31", 8200, 8700, 8700, "12월"), p("2026-01-01", "2027-12-31", 7800, 8700, 8700, "기본")], notes: "PGM. 〒791-3202 愛媛県伊予市中山町栗田乙18-2. Par72 5,543Y 구릉형, 해발 500m. じゃらん 기준(税抜 표기) 평일 1R 승용카트·昼食付 7,791 / 薄暮 5,610~, 토일축 8,610~, 12월 평일 8,155 — 세금 포함 환산치로 등록. 계약요금 확인 필요", updatedAt: now },
  { id: "golf-에히메gc", name: "에히메골프클럽", region: "마쓰야마", tel: "0893-44-5151", holes: 18, playStyle: "셀프플레이", periods: [p("2026-01-01", "2027-12-31", 12100, 16500, 16500, "비지터 셀프")], notes: "업그레이드 코스. 〒791-3341 愛媛県喜多郡内子町論田950. 공식 요금: 비지터 셀프 평일 12,100 / 토일축 16,500(소비세·이용세·제경비 포함). 3B +440 / 2B +1,210. 토일축 취소료 1조 4,000엔(3일 전 17시 이후). ehimegc.com", updatedAt: now },
  { id: "golf-에리에루cc", name: "에리에루골프클럽 마쓰야마", region: "마쓰야마", tel: "089-977-7222", holes: 18, playStyle: "셀프플레이(4B 기준)", periods: [p("2026-04-01", "2027-12-31", 17510, 25650, 25650, "2026.4.1~ 비지터 셀프 4B")], notes: "업그레이드 코스. 〒790-2641 愛媛県松山市柳谷町乙45-1. 공식 요금(2026.4.1~, 세금 포함): 셀프 4B 평일 17,510 / 토일축 25,650, 3B 18,425 / 26,565, 2B 평일 20,260(토일축 불가). 캐디 4B 21,910 / 30,050. 렌탈 클럽 3,300, 슈즈 660. elleairgc.co.jp/ehime", updatedAt: now },
  { id: "golf-썬셋힐cc", name: "썬셋힐즈컨트리클럽", region: "마쓰야마", tel: "089-992-1333(예약)", holes: 18, playStyle: "셀프플레이(승용카트 4백 기준)", periods: [p("2026-01-01", "2027-12-31", 19000, 25875, 25875, "비지터 그린피+카트 1/4")], notes: "업그레이드 코스. 〒799-2404 愛媛県松山市庄乙360. 공식 요금(세금 포함): 비지터 그린피 평일 16,250 / 토일축 21,750 + 카트피(4백) 11,000 / 16,500 → 1인 환산 19,000 / 25,875. sunsethills.co.jp/fee", updatedAt: now },
  { id: "golf-오쿠도고cc", name: "오쿠도고골프클럽", region: "마쓰야마", tel: "089-993-3311", holes: 18, playStyle: "캐디 동반(캐디피·카트·락커 포함)", periods: [p("2026-04-01", "2027-12-31", 17800, 24500, 24500, "2026.4.1~ 비지터")], notes: "업그레이드 코스(명문). 〒799-2424 愛媛県松山市八反地乙102. 공식 요금: 비지터(3명 이상) 평일 17,800 / 토일축 24,500(소비세·이용세 포함, 그린피·캐디피·카트피·락커피·제경비 포함). 연말연시 특별요금 있음. okudogo-golf.co.jp", updatedAt: now },
  // ── 후지(시즈오카) — 도쿠모 동경 렌터카 원가표 '골프장 요금' 시트 (2026.7~10, 셀프플레이, 점심포함 표기 있음) ──
  { id: "golf-후지클래식", name: "후지클래식", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이(점심포함)", periods: [p("2026-07-01", "2026-09-30", 23500, 30000, 30000, "7~9월")], notes: "업그레이드 코스 ①. 8/8~8/16 오봉 휴일요금", updatedAt: now },
  { id: "golf-아사기리cc", name: "아사기리 컨트리클럽", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이", periods: [p("2026-07-01", "2026-08-31", 16950, 26300, 26300, "7~8월"), p("2026-09-01", "2026-09-30", 26300, 36500, 36500, "9월")], notes: "업그레이드 코스 ①. 10월 미정. 8/8~8/16 오봉 휴일요금", updatedAt: now },
  { id: "golf-쥬리키cc", name: "쥬리키 컨트리클럽", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이(점심포함)", periods: [p("2026-07-01", "2026-08-31", 11990, 17990, 17990, "7~8월"), p("2026-09-01", "2026-09-30", 9990, 17990, 17990, "9월"), p("2026-10-01", "2026-10-31", 9490, 17990, 17990, "10월")], notes: "1973년 개장 Par72, 해발 950m 후지산 뷰. 업그레이드 코스 ②", updatedAt: now },
  { id: "golf-니시후지gc", name: "니시후지 골프클럽", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이(점심포함)", periods: [p("2026-07-01", "2026-08-31", 9490, 15990, 15990, "7~8월"), p("2026-09-01", "2026-09-30", 8990, 16990, 16990, "9월"), p("2026-10-01", "2026-10-31", 9490, 16990, 16990, "10월")], notes: "기본 코스(2일차). 업그레이드 코스 ②", updatedAt: now },
  { id: "golf-후지노미야cc", name: "후지노미야 컨트리클럽", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이(점심포함)", periods: [p("2026-07-01", "2026-07-31", 9400, 18000, 18000, "7월"), p("2026-08-01", "2026-08-31", 9900, 18000, 18000, "8월"), p("2026-09-01", "2026-09-30", 9400, 18000, 18000, "9월"), p("2026-10-01", "2026-10-31", 9900, 18000, 18000, "10월")], notes: "기본 코스(3일차)", updatedAt: now },
  { id: "golf-후지치산cc", name: "후지치산 컨트리클럽", region: "후지(시즈오카)", holes: 18, playStyle: "셀프플레이(점심포함)", periods: [p("2026-07-01", "2026-07-31", 7080, 13880, 13880, "7월"), p("2026-08-01", "2026-08-31", 7280, 13880, 13880, "8월"), p("2026-09-01", "2026-09-30", 7780, 13880, 13880, "9월")], notes: "기본 대체 코스. 10월 미정", updatedAt: now },
  // ── 세부 ──
  { id: "golf-클럽-필리피노-데-세부", name: "클럽 필리피노 데 세부", region: "세부", holes: 18, playStyle: "셀프플레이", periods: [], notes: "엘사 리조트 패키지(USD, 7박~28박)에 라운딩 포함 — 개별 그린피 미확보. 리조트 TEL +63 32-253-8188", updatedAt: now },
];

const VEHICLES: VehicleRule[] = [
  { id: "veh-마쓰야마-셔틀", name: "마쓰야마 골프전용 셔틀 (4인 기준)", region: "마쓰야마", feesByWeekday: flat(0), memo: "공항⇒호텔⇔골프장⇔호텔⇒공항 골프전용 셔틀. 1인 요금 미확보 — 입력 필요(0원으로 등록). 에히메현 무료 셔틀(한국 여권)은 공항↔시내만", updatedAt: now },
  { id: "veh-벳부-3박", name: "벳부 차량+지원비 (3박4일, 4인 기준)", region: "벳부", feesByWeekday: flat(120000), memo: "0309 벳부 원가표: 1인 120,000원(오이타공항↔호텔↔골프장 송영)", updatedAt: now },
  { id: "veh-벳부-4박", name: "벳부 차량+지원비 (4박5일, 4인 기준)", region: "벳부", feesByWeekday: flat(140000), memo: "0309 벳부 원가표: 1인 140,000원", updatedAt: now },
  { id: "veh-후지-렌터카-80h", name: "시즈오카 렌터카 80시간 (4인 기준)", region: "후지(시즈오카)", feesByWeekday: flat(120000), memo: "13,000엔/1인(환율 9.2 기준 약 120,000원). 2인 소형 +3,000엔, 3인 소형밴 +4,000엔. 주유·고속도로 불포함", updatedAt: now },
];

/** 0309 벳부 원가표(타이베이 TI750/751) → 상품 2개 + 운임 */
async function importBeppu(file: string) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(readFileSync(file) as unknown as ArrayBuffer);
  const settings = await getSettings();
  const holidays = new Set(settings.holidays);
  const [hotel, yufu, tsurumi] = [HOTELS.find((h) => h.id === "hotel-카메노이호텔-벳부")!, COURSES.find((c) => c.id === "golf-벳부gc-유후코스")!, COURSES.find((c) => c.id === "golf-벳부gc-쯔루미코스")!];
  const num = (v: ExcelJS.CellValue): number | null => (typeof v === "number" ? v : typeof v === "object" && v && "result" in v && typeof v.result === "number" ? v.result : null);
  const dateOf = (v: ExcelJS.CellValue) => (v instanceof Date ? formatDate(new Date(Math.round(v.getTime() / 86400000) * 86400000)) : null);
  const label = (v: ExcelJS.CellValue): MoneyOrLabel | null => { const n = num(v); if (n != null) return n; const s = String(v ?? "").trim(); return s === "미정" || s === "운항없음" || s === "마감" ? s : null; };
  const out: Product[] = [];
  const fareRows = new Map<string, FlightFare>();
  for (const ws of wb.worksheets) {
    if (!/3박4일|4박5일/.test(ws.name)) continue;
    const nights = ws.name.includes("4박") ? 4 : 3;
    const plan = nights === 3 ? [0, 18, 18, 18] : [0, 18, 18, 18, 18];
    const courseIds = nights === 3 ? [yufu.id, tsurumi.id, yufu.id] : [yufu.id, tsurumi.id, yufu.id, tsurumi.id];
    const vehicleId = nights === 3 ? "veh-벳부-3박" : "veh-벳부-4박";
    const rate = parseFloat(String(ws.getCell("O3").value ?? "").replace(/[^\d.]/g, "")) || 9.8;
    type Raw = { date: string; ret: string; out: MoneyOrLabel | null; inn: MoneyOrLabel | null; hotelJpy: number | null; golfJpy: number | null; veh: number | null };
    const raws: Raw[] = [];
    for (let r = 5; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      let date = dateOf(row.getCell(1).value);
      const ret = dateOf(row.getCell(4).value);
      if (!date || !ret) continue;
      if (date.slice(0, 4) !== ret.slice(0, 4) && ret > date) date = ret.slice(0, 4) + date.slice(4); // 원본 A열 연도 오타(2025) 보정
      if (addDays(date, nights) !== ret) date = addDays(ret, -nights);
      raws.push({ date, ret, out: label(row.getCell(3).value), inn: label(row.getCell(6).value), hotelJpy: num(row.getCell(10).value), golfJpy: num(row.getCell(12).value), veh: num(row.getCell(13).value) });
    }
    if (!raws.length) continue;
    for (const x of raws) {
      const put = (flightNo: string, origin: string, destination: string, date: string, v: MoneyOrLabel | null) => {
        if (v == null || v === "미정") return;
        fareRows.set(fareKey(flightNo, date), { id: fareKey(flightNo, date), airline: "TI", flightNo, origin, destination, date, fareKrw: typeof v === "number" ? v : null, status: typeof v === "number" ? "ok" : v === "마감" ? "sold_out" : "no_flight", source: "import", capturedAt: now, meta: { sheet: ws.name, file: "0309 벳부 카메노이호텔 타이완 오이타" } });
      };
      put("TI750", "TPE", "OIT", x.date, x.out);
      put("TI751", "OIT", "TPE", x.ret, x.inn);
    }
    const product: Product = {
      id: `prd-벳부-카메노이-${nights}박-타이베이`, name: `벳부 카메노이호텔 ${nights}박${nights + 1}일 ${plan.reduce((a, b) => a + b, 0)}홀 (타이베이 TI750/751)`, region: "벳부", airline: "TI",
      outbound: { flightNo: "TI750", origin: "TPE", destination: "OIT", dep: "12:00", arr: "15:00" }, inbound: { flightNo: "TI751", origin: "OIT", destination: "TPE", dep: "16:30", arr: "17:55" },
      nights, golfPlan: plan, hotelId: hotel.id, hotelLabel: `카메노이호텔 벳부 ${nights}박\n(조식포함)`, golfCourseIds: courseIds, vehicleRuleId: vehicleId,
      exchangeRate: rate, margins: [0.2], dateFrom: raws[0].date, dateTo: raws[raws.length - 1].date, groupFares: {}, groupTaxByMonth: {}, overrides: {},
      legend: `타이완 타이거에어 수·토 주2편 · ${nights === 3 ? "수요일" : "토요일"} 출발`, createdAt: now, updatedAt: now,
    };
    const ctx = { hotel, courses: courseIds.map((id) => COURSES.find((c) => c.id === id)!), vehicle: VEHICLES.find((v) => v.id === vehicleId)!, holidays, fares: fareRows };
    const present = new Set(raws.map((x) => x.date));
    let n = 0;
    for (const d of eachDate(product.dateFrom, product.dateTo)) {
      if (!present.has(d)) { product.overrides[d] = { hidden: true }; continue; }
      const x = raws.find((r) => r.date === d)!;
      const calc = computeRow(product, ctx, d);
      const ov: RowOverride = {};
      if (x.hotelJpy != null && x.hotelJpy !== calc.hotelJpy) ov.hotelJpy = x.hotelJpy;
      if (x.golfJpy != null && x.golfJpy !== calc.golfJpy) ov.golfJpy = x.golfJpy;
      if (x.veh != null && x.veh !== calc.vehicleKrw) ov.vehicleKrw = x.veh;
      if (Object.keys(ov).length) { product.overrides[d] = ov; n++; }
    }
    console.log(`[${ws.name}] ${raws.length}행(${raws[0].date}~${raws.at(-1)!.date}), 수동조정 ${n}행, 요일 ${[...new Set(raws.map((x) => weekdayOf(x.date)))].join(",")}`);
    out.push(product);
  }
  await products().upsertMany(out);
  await fares().upsertMany([...fareRows.values()]);
  console.log(`벳부 상품 ${out.length}개, 운임 ${fareRows.size}건 저장`);
}

/** 마쓰야마 3박4일 54홀 (제주항공 7C1704/1703) — 확정서 일정표(M-20240229-1) 패턴 */
async function seedMatsuyamaProduct() {
  const id = "prd-마쓰야마-도큐레이-3박-54홀-제주항공";
  if (await products().get(id)) { console.log("마쓰야마 상품 이미 존재 — 유지"); return; }
  const settings = await getSettings();
  const dateFrom = new Date(Date.now() + 9 * 3600_000 + 86400_000).toISOString().slice(0, 10);
  const product: Product = {
    id, name: "마쓰야마 도큐레이호텔 3박4일 54홀 (제주항공 7C1704/1703)", region: "마쓰야마", airline: "7C",
    outbound: { flightNo: "7C1704", origin: "ICN", destination: "MYJ", dep: "13:05", arr: "14:40" }, inbound: { flightNo: "7C1703", origin: "MYJ", destination: "ICN", dep: "15:40", arr: "17:35" },
    nights: 3, golfPlan: [0, 18, 18, 18], hotelId: "hotel-도큐레이-호텔-마쓰야마", hotelLabel: "도큐레이호텔 3박\n(조식포함)",
    golfCourseIds: ["golf-마쓰야마국제cc", "golf-마쓰야마씨사이드cc", "golf-치산호조cc"], vehicleRuleId: "veh-마쓰야마-셔틀",
    exchangeRate: settings.exchangeRate, margins: settings.margins, dateFrom, dateTo: addDays(dateFrom, 179),
    groupFares: {}, groupTaxByMonth: {}, overrides: {}, legend: "**노란색날짜 : 스팟특가** · 4일차 골프 후 15:40 출발(18홀 미완료 가능)", createdAt: now, updatedAt: now,
  };
  await products().upsert(product);
  console.log(`마쓰야마 상품 생성: ${product.dateFrom}~${product.dateTo}`);
}

/** 진에어 노선 상품 2개: 기타큐슈(벳부골프클럽 3박 72홀), 다카마쓰(사카이데 3박 54홀) */
async function seedJinairProducts() {
  const settings = await getSettings();
  const dateFrom = new Date(Date.now() + 9 * 3600_000 + 86400_000).toISOString().slice(0, 10);
  const defs: Product[] = [
    {
      id: "prd-벳부-골프클럽-3박-72홀-진에어-기타큐슈", name: "벳부골프클럽 3박4일 72홀 (진에어 LJ349/350 기타큐슈)", region: "벳부", airline: "LJ",
      outbound: { flightNo: "LJ349", origin: "ICN", destination: "KKJ", dep: "15:45", arr: "17:15" }, inbound: { flightNo: "LJ350", origin: "KKJ", destination: "ICN", dep: "18:15", arr: "19:55" },
      nights: 3, golfPlan: [0, 18, 36, 18], hotelId: "hotel-벳부골프호텔", hotelLabel: "벳부골프호텔 3박\n(클럽 내 로지, 조식)",
      golfCourseIds: ["golf-벳부gc-쯔루미코스", "golf-벳부gc-유후코스", "golf-벳부gc-쯔루미코스"], vehicleRuleId: "veh-벳부-3박",
      exchangeRate: settings.exchangeRate, margins: settings.margins, dateFrom, dateTo: addDays(dateFrom, 179), groupFares: {}, groupTaxByMonth: {}, overrides: {},
      legend: "**노란색날짜 : 스팟특가** · 기타큐슈공항↔벳부GC 약 1시간 · 2일차 18H, 3일차 36H, 4일차 18H", createdAt: now, updatedAt: now,
    },
    {
      id: "prd-다카마쓰-사카이데-3박-54홀-진에어", name: "다카마쓰 사카이데 그랜드호텔 3박 54홀 (진에어 LJ359/360)", region: "다카마쓰", airline: "LJ",
      outbound: { flightNo: "LJ359", origin: "ICN", destination: "TAK", dep: "14:30", arr: "16:15" }, inbound: { flightNo: "LJ360", origin: "TAK", destination: "ICN", dep: "17:05", arr: "18:55" },
      nights: 3, golfPlan: [0, 18, 18, 18], hotelId: "hotel-사카이데그랜드호텔", hotelLabel: "사카이데그랜드호텔 3박\n우다츠 그랜드호텔 3박\n루트인 3박",
      golfCourseIds: ["golf-pkg-다카마쓰-사카이데-그랜드호텔-3박-54홀"], vehicleRuleId: "veh-다카마쓰",
      exchangeRate: settings.exchangeRate, margins: settings.margins, dateFrom, dateTo: addDays(dateFrom, 179), groupFares: {}, groupTaxByMonth: {}, overrides: {},
      legend: "**노란색날짜 : 스팟특가** · 진에어 오후편(에어서울 RS741/742 상품과 비교용)", createdAt: now, updatedAt: now,
    },
  ];
  for (const p of defs) { if (await products().get(p.id)) { console.log(`${p.name} 이미 존재 — 유지`); continue; } await products().upsert(p); console.log(`상품 생성: ${p.name}`); }
}

async function main() {
  await hotels().upsertMany(HOTELS);
  await golfCourses().upsertMany(COURSES);
  await vehicleRules().upsertMany(VEHICLES);
  console.log(`호텔 ${HOTELS.length}, 골프장 ${COURSES.length}, 차량규칙 ${VEHICLES.length} 저장`);
  await seedMatsuyamaProduct();
  await seedJinairProducts();
  const file = process.argv[2];
  if (file) await importBeppu(file);
}
main().catch((e) => { console.error(e); process.exit(1); });
