import { z } from "zod";
import { isValidInstagram, isValidPhone, normalizeInstagram, normalizePhone, VIP_REGIONS } from "@/lib/sgl-vip/config";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const money = z.union([z.number(), z.literal("미정"), z.literal("운항없음"), z.literal("마감")]);
const weekdayRates = z.object({ 0: z.number(), 1: z.number(), 2: z.number(), 3: z.number(), 4: z.number(), 5: z.number(), 6: z.number() });

export const fareInputSchema = z.object({
  flightNo: z.string().min(3),
  origin: z.string().length(3),
  destination: z.string().length(3),
  date,
  fareKrw: z.number().nullable().optional(),
  status: z.enum(["ok", "no_flight", "sold_out", "unknown"]).optional(),
  source: z.enum(["crawler", "manual", "import"]).optional(),
  airline: z.string().optional(),
  capturedAt: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
export const faresPostSchema = z.object({ fares: z.array(fareInputSchema).min(1).max(5000), requestId: z.string().optional() });

export const fareRequestSchema = z.object({
  flights: z.array(z.object({ flightNo: z.string(), origin: z.string(), destination: z.string() })).min(1),
  from: date,
  to: date,
  pax: z.number().int().min(1).max(9).optional(),
  productId: z.string().optional(),
  note: z.string().optional(),
});
export const fareRequestPatchSchema = z.object({
  status: z.enum(["pending", "in_progress", "done", "failed"]).optional(),
  resultCount: z.number().optional(),
  error: z.string().optional(),
  note: z.string().optional(),
});

const leg = z.object({ flightNo: z.string(), origin: z.string(), destination: z.string(), dep: z.string(), arr: z.string() });
// 수정(PATCH)용 스키마는 기본값이 없는 원형에서 만든다. zod 4 는 .partial() 뒤에도 .default() 를 채우므로,
// 기본값이 붙은 스키마로 부분 수정을 받으면 보내지 않은 필드(overrides·groupFares 등)가 빈 값으로 덮인다.
const productGroupBase = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  airline: z.string().optional(),
  summary: z.string().optional(),
  fileName: z.string().optional(),
  sortOrder: z.number().optional(),
  publicStatus: z.enum(["publish", "hidden"]).optional(),
  publicTitle: z.string().max(80).optional(),
  publicImage: z.string().max(600).optional(),
  publicGallery: z.array(z.string().max(600)).max(12).optional(),
  publicDescription: z.string().max(2000).optional(),
  publicHighlights: z.array(z.string().max(120)).max(8).optional(),
});
export const productGroupSchema = productGroupBase.extend({ country: z.string().min(1).default("일본") });
export const productGroupPatchSchema = productGroupBase.partial();

const productBase = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  groupId: z.string().optional(),
  saleType: z.enum(["air", "land"]).optional(),
  paxBasis: z.number().int().min(1).max(40).nullable().optional(),
  region: z.string().min(1),
  airline: z.string().min(1),
  outbound: leg,
  inbound: leg,
  nights: z.number().int().min(1).max(14),
  golfPlan: z.array(z.number().int().min(0)),
  hotelId: z.string(),
  stays: z.array(z.object({ hotelId: z.string().min(1), nights: z.number().int().min(1).max(14) })).optional(),
  hotelLabel: z.string().optional(),
  golfCourseIds: z.array(z.string()),
  golfStyles: z.array(z.string()).optional(),
  golfLabel: z.string().optional(),
  vehicleRuleId: z.string(),
  extras: z.array(z.object({ label: z.string().min(1), krw: z.number().optional(), jpy: z.number().optional() })).optional(),
  note: z.string().optional(),
  exchangeRate: z.number().positive(),
  margins: z.array(z.number().min(0).max(0.9)).min(1),
  dateFrom: date,
  dateTo: date,
  groupFares: z.record(z.string(), money),
  groupTaxByMonth: z.record(z.string(), money),
  overrides: z.record(z.string(), z.record(z.string(), z.unknown())),
  legend: z.string().optional(),
});
export const productSchema = productBase.extend({
  groupFares: productBase.shape.groupFares.default({}),
  groupTaxByMonth: productBase.shape.groupTaxByMonth.default({}),
  overrides: productBase.shape.overrides.default({}),
});
export const productPatchSchema = productBase.partial();

export const overridePatchSchema = z.object({
  date,
  patch: z.object({
    outboundFare: money.nullable().optional(),
    inboundFare: money.nullable().optional(),
    airIndivKrw: z.number().nullable().optional(),
    soldOut: z.boolean().nullable().optional(),
    hotelJpy: z.number().nullable().optional(),
    golfJpy: z.number().nullable().optional(),
    vehicleKrw: z.number().nullable().optional(),
    extrasKrw: z.number().nullable().optional(),
    airSurchargeKrw: z.number().nullable().optional(),
    spotSpecial: z.boolean().nullable().optional(),
    groupSpecial: z.boolean().nullable().optional(),
    directSalePrice: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    hidden: z.boolean().nullable().optional(),
    groupFare: money.nullable().optional(), // product.groupFares 로 저장
  }),
});

export const hotelSchema = z.object({
  id: z.string().optional(), name: z.string().min(1), region: z.string().min(1), nightlyRates: weekdayRates,
  seasons: z.array(z.object({ label: z.string(), from: date, to: date, rates: weekdayRates.partial() })).optional(),
  dateRates: z.record(date, z.number()).optional(), roomBasis: z.string().optional(), memo: z.string().optional(),
});
export const golfCourseSchema = z.object({
  id: z.string().optional(), name: z.string().min(1), region: z.string().min(1), tel: z.string().optional(), holes: z.number().int().default(18), playStyle: z.string().default("셀프플레이"),
  periods: z.array(z.object({ label: z.string().optional(), from: z.string(), to: z.string(), weekday: z.number().nullable(), weekend: z.number().nullable(), holiday: z.number().nullable(), style: z.string().optional() })),
  notes: z.string().optional(),
});
export const vehicleRuleSchema = z.object({ id: z.string().optional(), name: z.string().min(1), region: z.string().min(1), feesByWeekday: weekdayRates, memo: z.string().optional() });
export const settingsSchema = z.object({ exchangeRate: z.number().positive().optional(), margins: z.array(z.number()).optional(), holidays: z.array(date).optional() });

const clipped = z.string().transform((v) => v.slice(0, 300)).default("");
export const vipApplySchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(30, "이름은 30자까지 입력할 수 있어요"),
  phone: z.string().transform(normalizePhone).refine(isValidPhone, "휴대폰 번호를 정확히 입력해 주세요"),
  instagram: z.string().transform(normalizeInstagram).refine(isValidInstagram, "인스타그램 아이디를 확인해 주세요").default(""),
  regions: z.array(z.enum(VIP_REGIONS)).max(VIP_REGIONS.length).default([]),
  usedBefore: z.boolean().default(false),
  privacyConsent: z.literal(true, "개인정보 수집·이용에 동의해 주세요"),
  marketingConsent: z.boolean().default(false),
  website: z.string().max(300).default(""), // 허니팟: 사람에게는 보이지 않는 입력란
  utm_source: clipped, utm_medium: clipped, utm_campaign: clipped, utm_content: clipped, referrer: clipped,
});
export type VipApplyInput = z.infer<typeof vipApplySchema>;

/* ---------- SGL 고객 사이트(/sgl) 공개 폼 ---------- */
const personName = z.string().trim().min(1, "이름을 입력해 주세요").max(30, "이름은 30자까지 입력할 수 있어요");
const mobile = z.string().transform(normalizePhone).refine(isValidPhone, "휴대폰 번호를 정확히 입력해 주세요");
const utm = { utm_source: clipped, utm_medium: clipped, utm_campaign: clipped, utm_content: clipped, referrer: clipped };
const honeypot = z.string().max(300).default("");
export const sglInquirySchema = z.object({
  name: personName,
  phone: mobile,
  contact: z.enum(["phone", "kakao"]).default("phone"),
  region: z.string().trim().max(40).default(""),
  packageId: z.string().max(200).default(""),
  sheetId: z.string().max(200).default(""),
  date: z.union([date, z.literal("")]).default(""),
  people: z.number().int().min(1).max(99).nullable().default(null),
  message: z.string().trim().max(2000, "문의 내용은 2,000자까지 입력할 수 있어요").default(""),
  privacyConsent: z.literal(true, "개인정보 수집·이용에 동의해 주세요"),
  marketingConsent: z.boolean().default(false),
  website: honeypot,
  ...utm,
});
export type SglInquiryInput = z.infer<typeof sglInquirySchema>;
export const sglBookingSchema = z.object({
  sheetId: z.string().min(1).max(200),
  date,
  people: z.number().int().min(1).max(40),
  name: personName,
  phone: mobile,
  email: z.union([z.email("이메일 주소를 확인해 주세요"), z.literal("")]).default(""),
  companions: z.string().trim().max(1000).default(""),
  request: z.string().trim().max(2000).default(""),
  privacyConsent: z.literal(true, "개인정보 수집·이용에 동의해 주세요"),
  termsConsent: z.literal(true, "예약·취소 규정을 확인해 주세요"),
  website: honeypot,
  ...utm,
});
export type SglBookingInput = z.infer<typeof sglBookingSchema>;
export const sglPaymentSchema = z.object({
  k: z.string().min(8).max(64),
  method: z.enum(["card", "bank", "onsite"]),
  plan: z.enum(["deposit", "full"]).default("full"),
  depositor: z.string().trim().max(30).default(""),
});
export const sglLookupSchema = z.object({ no: z.string().trim().min(6).max(30), phone: mobile });

/** 문의관리. 수정(PATCH)에 기본값이 끼어들지 않도록 어느 칸에도 .default() 를 두지 않는다 */
const inquiryBase = z.object({
  channel: z.enum(["instagram", "kakao", "direct", "web", "etc"]),
  receivedDate: z.union([date, z.literal("")]),
  name: z.string().trim().min(1, "이름을 입력하세요").max(60),
  phone: z.string().trim().max(30).nullable(),
  departText: z.string().trim().max(100),
  departDate: z.union([date, z.literal("")]).nullable(),
  productText: z.string().trim().max(300),
  route: z.string().trim().max(100),
  people: z.number().int().min(1).max(999).nullable(),
  status: z.enum(["new", "in_progress", "confirmed", "closed"]),
  confirmText: z.string().trim().max(200).nullable(),
  revisit: z.boolean().nullable(),
  memo: z.string().max(4000),
});
export const inquiryPatchSchema = inquiryBase.partial();
export const inquiryCreateSchema = inquiryBase.partial().extend({ name: inquiryBase.shape.name });
