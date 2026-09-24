import { z } from "zod";

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
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  region: z.string().min(1),
  airline: z.string().min(1),
  outbound: leg,
  inbound: leg,
  nights: z.number().int().min(1).max(14),
  golfPlan: z.array(z.number().int().min(0)),
  hotelId: z.string(),
  hotelLabel: z.string().optional(),
  golfCourseIds: z.array(z.string()),
  vehicleRuleId: z.string(),
  exchangeRate: z.number().positive(),
  margins: z.array(z.number().min(0).max(0.9)).min(1),
  dateFrom: date,
  dateTo: date,
  groupFares: z.record(z.string(), money).default({}),
  groupTaxByMonth: z.record(z.string(), money).default({}),
  overrides: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  legend: z.string().optional(),
});
export const productPatchSchema = productSchema.partial();

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
  seasons: z.array(z.object({ label: z.string(), from: date, to: date, rates: weekdayRates.partial() })).optional(), memo: z.string().optional(),
});
export const golfCourseSchema = z.object({
  id: z.string().optional(), name: z.string().min(1), region: z.string().min(1), tel: z.string().optional(), holes: z.number().int().default(18), playStyle: z.string().default("셀프플레이"),
  periods: z.array(z.object({ label: z.string().optional(), from: z.string(), to: z.string(), weekday: z.number().nullable(), weekend: z.number().nullable(), holiday: z.number().nullable() })),
  notes: z.string().optional(),
});
export const vehicleRuleSchema = z.object({ id: z.string().optional(), name: z.string().min(1), region: z.string().min(1), feesByWeekday: weekdayRates, memo: z.string().optional() });
export const settingsSchema = z.object({ exchangeRate: z.number().positive().optional(), margins: z.array(z.number()).optional(), holidays: z.array(date).optional() });
