/**
 * 캐디스 PHP 관리자(admin/)가 관리하던 컬렉션을 Next.js 에서 그대로 관리하기 위한 스키마.
 * 필드·섹션·옵션은 admin/pages 의 각 form.php 와 admin/data 의 json 구조를 따른다.
 */
export type FieldType = "text" | "textarea" | "html" | "number" | "select" | "boolean" | "date" | "datetime" | "list" | "json" | "password";
export interface FieldDef { name: string; label: string; type: FieldType; options?: [string, string][]; help?: string; full?: boolean; readonly?: boolean }
export interface SectionDef { title: string; fields: FieldDef[] }
export interface ColumnDef { key: string; label: string; type?: "text" | "status" | "number" | "date" | "boolean" | "money"; width?: string }
export interface CollectionDef {
  id: string;            // URL 및 스토어 이름(cms-<id>)
  label: string;         // 메뉴/제목
  singular: string;      // 새로 만들기 문구
  titleField: string;    // 목록 대표 텍스트
  searchFields: string[];
  statusField?: string;
  statusOptions?: [string, string][];
  columns: ColumnDef[];
  sections: SectionDef[];
  defaults?: Record<string, unknown>;
  sortBy?: { key: string; dir: "asc" | "desc" };
  source: string;        // 시드 원본(저장소 루트 기준)
  sourceGroup?: string;  // taxonomy.json 처럼 dict 안의 그룹
}

const status = (opts: [string, string][]): FieldDef => ({ name: "status", label: "상태", type: "select", options: opts });
const PUBLISH: [string, string][] = [["draft", "임시저장"], ["publish", "공개"], ["hidden", "숨김"]];
export const BOOKING_STATUS: [string, string][] = [["pending", "결제대기"], ["paid", "결제완료"], ["confirmed", "예약확정"], ["cancelled", "취소"]];
const t = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, label, type: "text", ...extra });
const ta = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, label, type: "textarea", full: true, ...extra });
const n = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef => ({ name, label, type: "number", ...extra });
const b = (name: string, label: string): FieldDef => ({ name, label, type: "boolean" });
const sel = (name: string, label: string, options: [string, string][]): FieldDef => ({ name, label, type: "select", options });
const list = (name: string, label: string, help = "한 줄에 하나"): FieldDef => ({ name, label, type: "list", help, full: true });
const js = (name: string, label: string, help = "JSON 그대로 편집"): FieldDef => ({ name, label, type: "json", help, full: true });

export const COLLECTIONS: CollectionDef[] = [
  {
    id: "products", label: "전체 상품", singular: "상품", titleField: "title", searchFields: ["title", "subtitle", "region", "golf_name", "hotel_name", "sku"],
    statusField: "status", statusOptions: [...PUBLISH, ["soldout", "판매중지"]],
    columns: [{ key: "title", label: "상품정보" }, { key: "type", label: "유형" }, { key: "display_region", label: "지역" }, { key: "status", label: "상태", type: "status" }, { key: "price", label: "가격", type: "money" }, { key: "updated_at", label: "수정일", type: "date" }],
    defaults: { type: "golf_course", product_type: "golf_course", status: "draft", currency: "JPY", holes: "18", sort_order: 1 },
    sortBy: { key: "sort_order", dir: "asc" }, source: "admin/modules/product/data/products.json",
    sections: [
      { title: "기본 정보", fields: [sel("type", "상품 유형", [["golf_course", "골프장"], ["travel_package", "패키지"]]), t("title", "상품명"), t("subtitle", "서브타이틀"), status([...PUBLISH, ["soldout", "판매중지"]]), n("sort_order", "정렬 우선순위"), t("sku", "SKU"), ta("summary", "카드용 요약 설명"), ta("description", "상세 설명"), ta("highlight", "하이라이트")] },
      { title: "분류 / 노출", fields: [t("country", "국가"), t("region", "지역"), t("display_region", "표시 지역"), t("breadcrumb_country", "브레드크럼 국가"), t("breadcrumb_region", "브레드크럼 지역"), t("theme", "테마"), list("badges", "배지"), t("card_label", "카드 라벨"), t("card_price_from", "카드 가격 표시"), t("card_discount_rate", "카드 할인율"), b("is_recommended", "추천"), b("is_best", "베스트"), b("is_new", "신규"), b("is_featured", "메인 노출"), b("expose_country", "국가 페이지 노출"), b("expose_theme", "테마 페이지 노출"), list("related_product_ids", "연관 상품 ID")] },
      { title: "가격 / 예약", fields: [t("booking_type", "예약 유형"), t("price_type", "가격 유형"), sel("currency", "통화", [["KRW", "KRW"], ["JPY", "JPY"], ["USD", "USD"]]), t("price_label", "가격 라벨"), n("price", "표시 가격"), n("base_price", "정가"), n("sale_price", "판매가"), n("deposit_price", "예약금"), n("remaining_price", "잔금"), n("adult_price", "성인"), n("child_price", "소아"), n("infant_price", "유아"), n("default_price", "기본 단가"), n("default_stock", "기본 재고"), b("default_closed", "기본 마감"), n("min_people", "최소 인원"), n("max_people", "최대 인원"), t("tee_time_text", "티타임 안내"), b("consult_only", "상담 전용"), b("hide_price", "가격 숨김"), ta("price_policy_note", "가격 정책 메모"), js("tee_time_slots", "티타임 슬롯")] },
      { title: "이미지", fields: [t("thumbnail", "대표 이미지 URL", { full: true }), list("gallery", "갤러리 이미지 URL"), list("hotel_gallery", "호텔 갤러리"), list("golf_gallery", "골프장 갤러리"), js("theme_visuals", "테마 비주얼")] },
      { title: "위치 / 교통", fields: [t("location_name", "장소명"), t("address", "주소"), t("latitude", "위도"), t("longitude", "경도"), t("google_map_url", "구글 지도 URL"), t("naver_map_url", "네이버 지도 URL"), ta("map_embed", "지도 임베드"), t("airport", "공항"), t("airport_name", "공항명"), t("airport_distance", "공항 거리"), t("airport_time", "공항 소요시간"), t("transport_type", "이동 수단")] },
      { title: "호텔", fields: [t("hotel_name", "호텔명"), t("hotel_checkin_out", "체크인/아웃"), t("hotel_phone", "전화"), t("hotel_website", "웹사이트"), t("hotel_address", "주소"), ta("hotel_description", "호텔 소개")] },
      { title: "골프장", fields: [t("golf_name", "골프장명"), t("golf_phone", "전화"), t("golf_address", "주소"), t("course_type", "코스 유형"), t("holes", "홀"), t("par", "파"), t("yard", "야드"), t("course_summary", "코스 요약"), ta("golf_intro", "골프장 소개"), js("facilities", "부대시설", '[{"label":"클럽하우스"}] 형식')] },
      { title: "일정 / 포함 / 유의사항", fields: [ta("itinerary", "일정 요약"), js("itinerary_days", "일차별 일정"), js("itinerary_items", "일정 항목"), ta("included", "포함 내역"), ta("excluded", "불포함 내역"), ta("notice", "유의사항"), list("round_notice_items", "라운드 안내"), list("weather_notice_items", "기상 안내"), list("important_notice_items", "중요 안내"), list("cancel_refund_items", "취소/환불 안내")] },
      { title: "예약 가능 설정", fields: [t("availability_mode", "예약 가능 모드"), { name: "booking_open_start", label: "예약 오픈 시작", type: "date" }, { name: "booking_open_end", label: "예약 오픈 종료", type: "date" }, list("available_weekdays", "예약 가능 요일", "mon,tue,… 한 줄에 하나"), b("auto_soldout", "자동 매진"), js("availability_calendar", "가용 캘린더")] },
      { title: "취소 / 결제", fields: [sel("cancel_policy_type", "취소 정책", [["flexible", "유연"], ["standard", "일반"], ["strict", "엄격"], ["non_refundable", "환불불가"]]), n("cancel_free_days", "무료 취소 일수"), n("cancel_fee_percent", "취소 수수료율(%)"), ta("cancel_notes", "취소 안내"), t("payment_timing", "결제 시점"), list("payment_methods", "결제 수단", "card / bank / onsite"), t("bank_name", "은행"), t("bank_account", "계좌번호"), t("bank_holder", "예금주"), ta("payment_notes", "결제 안내")] },
    ],
  },
  {
    id: "hotels", label: "호텔 관리", singular: "호텔", titleField: "name", searchFields: ["name", "tag", "address", "phone"], statusField: "status", statusOptions: PUBLISH,
    columns: [{ key: "name", label: "호텔정보" }, { key: "phone", label: "연락처" }, { key: "address", label: "주소" }, { key: "status", label: "상태", type: "status" }, { key: "sort_order", label: "정렬", type: "number" }, { key: "updated_at", label: "수정일", type: "date" }],
    defaults: { status: "draft", brand_label: "HOTEL INFO", sort_order: 1, gallery: [] }, sortBy: { key: "sort_order", dir: "asc" }, source: "admin/data/hotels.json",
    sections: [
      { title: "호텔 정보", fields: [t("name", "호텔명"), status(PUBLISH), n("sort_order", "정렬순서"), t("tag", "상단 태그"), t("brand_label", "정보 배지명"), t("checkin_out", "체크인 / 체크아웃"), t("website", "웹사이트"), t("phone", "전화번호"), t("address", "주소", { full: true })] },
      { title: "소개", fields: [ta("description", "소개 문단 1"), ta("description_2", "소개 문단 2"), ta("description_3", "소개 문단 3")] },
      { title: "호텔 갤러리", fields: [js("gallery", "갤러리", '[{"url":"...","alt":"...","is_cover":true}] 형식')] },
    ],
  },
  {
    id: "events", label: "이벤트 목록", singular: "이벤트", titleField: "title", searchFields: ["title", "summary", "region"], statusField: "status", statusOptions: PUBLISH,
    columns: [{ key: "title", label: "이벤트명" }, { key: "event_type", label: "유형" }, { key: "region", label: "지역" }, { key: "start_date", label: "시작", type: "date" }, { key: "end_date", label: "종료", type: "date" }, { key: "status", label: "상태", type: "status" }],
    defaults: { status: "draft", event_type: "promotion", related_product_ids: [] }, sortBy: { key: "start_date", dir: "desc" }, source: "admin/data/events.json",
    sections: [
      { title: "기본 정보", fields: [t("title", "이벤트명"), status(PUBLISH), sel("event_type", "이벤트 유형", [["promotion", "프로모션"], ["special", "특가"], ["exhibition", "기획전"]]), t("region", "지역"), { name: "start_date", label: "시작일", type: "date" }, { name: "end_date", label: "종료일", type: "date" }, t("status_label", "상태 라벨"), t("badge_text", "보조 배지 텍스트"), t("target_text", "대상 텍스트"), t("booking_method", "예약 방식"), ta("summary", "요약 설명")] },
      { title: "대표 배너 / CTA", fields: [t("banner_image", "대표 배너 이미지", { full: true }), t("cta_primary_text", "1차 CTA 텍스트"), t("cta_primary_url", "1차 CTA URL"), t("cta_secondary_text", "2차 CTA 텍스트"), t("cta_secondary_url", "2차 CTA URL")] },
      { title: "본문", fields: [{ name: "content", label: "상세 내용", type: "html", full: true }, ta("benefit", "혜택 안내")] },
      { title: "연결 상품", fields: [list("related_product_ids", "연결 상품 ID"), t("featured_product_id", "대표 상품 ID"), t("featured_label", "대표 라벨"), t("featured_discount_rate", "할인율 텍스트"), t("featured_price_text", "가격 텍스트"), js("venue_sections", "장소 소개 블록")] },
    ],
  },
  {
    id: "bookings", label: "예약 목록", singular: "예약", titleField: "customer_name", searchFields: ["customer_name", "customer_phone", "product_title"], statusField: "status", statusOptions: BOOKING_STATUS,
    columns: [{ key: "id", label: "ID", width: "60px" }, { key: "customer_name", label: "고객" }, { key: "product_title", label: "상품" }, { key: "date", label: "예약일", type: "date" }, { key: "people", label: "인원", type: "number" }, { key: "total_price", label: "금액", type: "money" }, { key: "payment_status", label: "결제" }, { key: "status", label: "상태", type: "status" }],
    defaults: { status: "pending", payment_method: "card", payment_status: "pending", people: 1, refund_status: "none", status_logs: [] }, sortBy: { key: "date", dir: "desc" }, source: "admin/data/bookings.json",
    sections: [
      { title: "예약 정보", fields: [t("product_id", "상품 ID"), t("product_title", "상품명"), { name: "date", label: "예약일", type: "date" }, n("people", "인원"), n("total_price", "총 금액"), status(BOOKING_STATUS)] },
      { title: "고객 정보", fields: [t("customer_name", "고객명"), t("customer_phone", "연락처")] },
      { title: "결제 정보", fields: [sel("payment_method", "결제 수단", [["card", "카드결제"], ["bank", "무통장입금"], ["onsite", "현장결제"], ["partial", "부분결제"]]), sel("payment_status", "결제 상태", [["pending", "결제대기"], ["paid", "결제완료"], ["refunded", "환불완료"]]), n("payment_amount", "결제 금액"), { name: "payment_date", label: "결제 일시", type: "datetime" }] },
      { title: "취소 / 환불", fields: [ta("cancel_reason", "취소 사유"), { name: "cancel_date", label: "취소일", type: "date" }, sel("refund_status", "환불 상태", [["none", "없음"], ["requested", "요청"], ["done", "완료"]]), n("refund_amount", "환불 금액"), { name: "refund_date", label: "환불일", type: "date" }, ta("refund_memo", "환불 메모")] },
      { title: "내부 메모", fields: [ta("admin_memo", "운영 메모"), js("status_logs", "상태 변경 이력")] },
    ],
  },
  {
    id: "customers", label: "고객 목록", singular: "고객", titleField: "name", searchFields: ["name", "phone", "email", "region"], statusField: "status", statusOptions: [["active", "활성"], ["inactive", "휴면"], ["lead", "리드"]],
    columns: [{ key: "name", label: "고객" }, { key: "grade", label: "등급" }, { key: "segment", label: "세그먼트" }, { key: "region", label: "지역" }, { key: "booking_count", label: "예약 수", type: "number" }, { key: "total_amount", label: "누적 결제", type: "money" }, { key: "last_booking_date", label: "최근 예약", type: "date" }, { key: "marketing", label: "마케팅", type: "boolean" }, { key: "status", label: "상태", type: "status" }],
    defaults: { status: "active", grade: "normal", segment: "new", marketing: false, booking_count: 0, cancel_count: 0, total_amount: 0, avg_amount: 0, tags: [], preferred_destinations: [], recent_bookings: [] }, sortBy: { key: "last_booking_date", dir: "desc" }, source: "admin/data/customers.json",
    sections: [
      { title: "기본 정보", fields: [t("name", "고객명"), t("phone", "연락처"), t("email", "이메일"), t("region", "지역"), { name: "joined_at", label: "가입일", type: "date" }] },
      { title: "CRM 정보", fields: [sel("grade", "등급", [["vip", "VIP"], ["gold", "골드"], ["silver", "실버"], ["normal", "일반"]]), sel("status", "고객 상태", [["active", "활성"], ["inactive", "휴면"], ["lead", "리드"]]), sel("segment", "세그먼트", [["high_value", "고가치"], ["loyal", "충성 고객"], ["new", "신규"], ["risk", "이탈 위험"]]), b("marketing", "마케팅 수신 동의"), list("tags", "태그"), list("preferred_destinations", "선호 목적지")] },
      { title: "실적", fields: [n("booking_count", "예약 수"), n("cancel_count", "취소 수"), n("total_amount", "누적 결제액"), n("avg_amount", "평균 결제액"), { name: "last_booking_date", label: "최근 예약일", type: "date" }, t("last_product", "최근 예약 상품"), js("recent_bookings", "최근 예약 내역")] },
      { title: "메모", fields: [ta("memo", "운영 메모")] },
    ],
  },
  {
    id: "notices", label: "공지사항", singular: "공지", titleField: "title", searchFields: ["title", "summary", "author"], statusField: "status", statusOptions: [["draft", "임시저장"], ["published", "게시중"], ["scheduled", "예약발행"], ["hidden", "비노출"]],
    columns: [{ key: "title", label: "공지 정보" }, { key: "category", label: "카테고리" }, { key: "status", label: "상태", type: "status" }, { key: "author", label: "작성자" }, { key: "publish_at", label: "게시일", type: "date" }, { key: "is_pinned", label: "고정", type: "boolean" }],
    defaults: { status: "draft", category: "general", author: "관리자", is_pinned: false }, sortBy: { key: "publish_at", dir: "desc" }, source: "admin/data/notices.json",
    sections: [
      { title: "기본 정보", fields: [t("title", "제목", { full: true }), sel("category", "카테고리", [["general", "일반공지"], ["booking", "예약 안내"], ["event", "이벤트"], ["service", "서비스 안내"], ["system", "시스템"]]), t("author", "작성자"), ta("summary", "요약"), { name: "content", label: "내용", type: "html", full: true }, t("attachment_name", "첨부파일명")] },
      { title: "게시 설정", fields: [sel("status", "상태", [["draft", "임시저장"], ["published", "게시중"], ["scheduled", "예약발행"], ["hidden", "비노출"]]), b("is_pinned", "상단 고정"), { name: "publish_at", label: "게시일시", type: "datetime" }] },
    ],
  },
  {
    id: "faqs", label: "FAQ", singular: "FAQ", titleField: "question", searchFields: ["question", "answer", "category"], statusField: "visibility", statusOptions: [["visible", "노출"], ["hidden", "비노출"]],
    columns: [{ key: "question", label: "질문" }, { key: "category", label: "카테고리" }, { key: "visibility", label: "노출", type: "status" }, { key: "is_popular", label: "인기", type: "boolean" }, { key: "sort_order", label: "정렬", type: "number" }, { key: "updated_at", label: "수정일", type: "date" }],
    defaults: { visibility: "visible", category: "booking", is_popular: false, sort_order: 1, author: "관리자" }, sortBy: { key: "sort_order", dir: "asc" }, source: "admin/data/faqs.json",
    sections: [
      { title: "FAQ 정보", fields: [t("question", "질문", { full: true }), { name: "answer", label: "답변", type: "html", full: true }, sel("category", "카테고리", [["booking", "예약/결제"], ["cancel", "취소/환불"], ["product", "상품/일정"], ["service", "서비스 이용"], ["account", "회원/계정"], ["etc", "기타"]]), t("author", "작성자")] },
      { title: "노출 설정", fields: [sel("visibility", "노출 상태", [["visible", "노출"], ["hidden", "비노출"]]), b("is_popular", "인기 질문"), n("sort_order", "정렬 순서")] },
    ],
  },
  {
    id: "banners", label: "배너관리", singular: "배너", titleField: "name", searchFields: ["name", "title", "position"], statusField: "status", statusOptions: [["active", "노출중"], ["scheduled", "예약 노출"], ["inactive", "비활성"]],
    columns: [{ key: "name", label: "배너 정보" }, { key: "position", label: "노출 위치" }, { key: "status", label: "상태", type: "status" }, { key: "start_at", label: "시작", type: "date" }, { key: "end_at", label: "종료", type: "date" }, { key: "sort_order", label: "정렬", type: "number" }],
    defaults: { status: "inactive", position: "main_hero", open_in_new_tab: false, sort_order: 1, author: "관리자" }, sortBy: { key: "sort_order", dir: "asc" }, source: "admin/data/banners.json",
    sections: [
      { title: "배너 정보", fields: [t("name", "배너명"), sel("position", "노출 위치", [["main_hero", "메인 히어로"], ["main_middle", "메인 중간 배너"], ["sub_top", "서브 상단 배너"], ["promo", "프로모션 배너"]]), t("title", "타이틀", { full: true }), ta("description", "설명"), t("button_text", "버튼 텍스트"), t("link_url", "링크 URL"), b("open_in_new_tab", "새 창에서 열기"), t("pc_image", "PC 이미지 URL", { full: true }), t("mobile_image", "모바일 이미지 URL", { full: true })] },
      { title: "배너 상태", fields: [sel("status", "상태", [["active", "노출중"], ["scheduled", "예약 노출"], ["inactive", "비활성"]]), { name: "start_at", label: "노출 시작", type: "datetime" }, { name: "end_at", label: "노출 종료", type: "datetime" }, n("sort_order", "정렬"), t("author", "작성자")] },
    ],
  },
  ...(["countries", "regions", "themes", "badges"] as const).map((g): CollectionDef => ({
    id: `taxonomy-${g}`, label: { countries: "국가 관리", regions: "지역 관리", themes: "테마 관리", badges: "배지 관리" }[g], singular: { countries: "국가", regions: "지역", themes: "테마", badges: "배지" }[g], titleField: "name", searchFields: ["name", "slug"],
    statusField: "is_active", statusOptions: [["1", "사용"], ["0", "미사용"]],
    columns: [{ key: "name", label: "이름" }, { key: "slug", label: "슬러그" }, ...(g === "regions" ? [{ key: "country", label: "국가" }] : []), { key: "sort_order", label: "정렬", type: "number" as const }, { key: "is_active", label: "사용", type: "boolean" as const }],
    defaults: { sort_order: 1, is_active: 1 }, sortBy: { key: "sort_order", dir: "asc" }, source: "admin/data/taxonomy.json", sourceGroup: g,
    sections: [{ title: "정보", fields: [t("name", "이름"), t("slug", "슬러그"), ...(g === "regions" ? [t("country", "국가 연결")] : []), n("sort_order", "정렬 순서"), sel("is_active", "사용 여부", [["1", "사용"], ["0", "미사용"]])] }],
  })),
];

export const collectionById = (id: string) => COLLECTIONS.find((c) => c.id === id);
export const allFields = (c: CollectionDef) => c.sections.flatMap((s) => s.fields);

/** 설정 탭(admin/pages/setting/*.php) — settings.json 의 평면 키 */
export const SETTINGS_TABS: { id: string; label: string; sections: SectionDef[] }[] = [
  { id: "general", label: "기본 설정", sections: [
    { title: "사이트 기본 정보", fields: [t("site_name", "사이트명"), sel("default_currency", "기본 통화", [["KRW", "KRW"], ["JPY", "JPY"], ["USD", "USD"]]), ta("site_description", "사이트 설명")] },
    { title: "운영 연락처", fields: [t("admin_email", "관리자 이메일"), t("contact_phone", "대표 연락처"), t("contact_kakao", "카카오 채널"), ta("booking_notice", "예약 안내 문구")] },
    { title: "푸터 정보", fields: [t("footer_company", "회사명"), t("footer_ceo", "대표자명"), t("footer_business_number", "사업자번호"), t("footer_address", "주소", { full: true })] },
    { title: "기본 SEO", fields: [t("seo_title", "기본 SEO 제목", { full: true }), ta("seo_description", "기본 SEO 설명"), t("seo_keywords", "기본 SEO 키워드", { full: true })] },
    { title: "운영 상태", fields: [sel("site_status", "사이트 상태", [["open", "정상 운영"], ["maintenance", "점검중"], ["private", "비공개"]])] },
  ] },
  { id: "payment", label: "결제 설정", sections: [
    { title: "결제 수단 사용 여부", fields: [b("payment_card_enabled", "카드결제"), b("payment_bank_enabled", "무통장입금"), b("payment_onsite_enabled", "현장결제"), b("payment_partial_enabled", "부분결제")] },
    { title: "무통장입금 계좌 정보", fields: [t("bank_name", "은행명"), t("bank_holder", "예금주"), t("bank_account", "계좌번호")] },
    { title: "예약금 정책", fields: [sel("deposit_policy_type", "예약금 정책", [["fixed", "고정 금액"], ["percent", "비율"], ["none", "사용 안함"]]), n("deposit_amount", "예약금 금액"), n("deposit_percent", "예약금 비율(%)"), ta("payment_notice", "결제 안내 문구")] },
  ] },
  { id: "cancellation", label: "취소/환불 설정", sections: [
    { title: "기본 취소 정책", fields: [sel("cancel_policy_type", "취소 정책 유형", [["flexible", "유연"], ["standard", "일반"], ["strict", "엄격"], ["non_refundable", "환불불가"]]), n("cancel_free_days", "무료 취소 가능 일수"), n("cancel_fee_percent", "기본 취소 수수료율(%)"), ta("refund_notice", "환불 기본 안내 문구")] },
    { title: "예외 규정", fields: [ta("noshow_policy", "노쇼 규정"), ta("weather_policy", "우천 / 기상 규정"), ta("cancellation_extra_notice", "추가 안내 문구")] },
  ] },
  { id: "api", label: "API 설정", sections: [
    { title: "운영 모드", fields: [sel("api_mode", "API 모드", [["test", "테스트"], ["live", "운영"]])] },
    { title: "지도 API", fields: [{ name: "google_maps_api_key", label: "Google Maps API Key", type: "password" }, t("naver_map_client_id", "Naver Map Client ID"), { name: "naver_map_client_secret", label: "Naver Map Client Secret", type: "password" }] },
    { title: "카카오 API", fields: [{ name: "kakao_javascript_key", label: "Kakao JavaScript Key", type: "password" }, { name: "kakao_rest_api_key", label: "Kakao REST API Key", type: "password" }] },
    { title: "메일 발송 설정", fields: [t("smtp_host", "SMTP Host"), t("smtp_port", "SMTP Port"), t("smtp_username", "SMTP Username"), { name: "smtp_password", label: "SMTP Password", type: "password" }] },
    { title: "문자 / 외부 연동", fields: [sel("sms_provider", "SMS Provider", [["none", "사용 안함"], ["solapi", "Solapi"], ["alimtalk", "알림톡"]]), { name: "sms_api_key", label: "SMS API Key", type: "password" }, { name: "sms_api_secret", label: "SMS API Secret", type: "password" }, { name: "external_booking_token", label: "외부 예약 연동 토큰", type: "password" }] },
  ] },
];
export const settingsTabById = (id: string) => SETTINGS_TABS.find((x) => x.id === id);
