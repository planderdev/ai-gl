/**
 * SGL 고객 사이트(/sgl)에 보여 줄 상품 카탈로그. 관리자의 상품군·원가표·단가·설정에서 만든다.
 * 고객에게는 판매가만 내려보낸다(원가·마진·운임 내역은 이 파일 밖으로 나가지 않는다).
 */
import type { Product, ProductGroup, QuoteRow } from "@/types";
import { getSiteSettings } from "@/lib/cms/service";
import { airlineName } from "@/lib/format";
import { golfCourses, hotels } from "@/lib/masters/service";
import { roundsOf, saleTypeOf, stayText } from "@/lib/products/describe";
import { productGroups, products, quoteProduct, sortSheets } from "@/lib/products/service";
import { staysOf } from "@/lib/pricing/engine";
import { addDaysIso, CARD_PHOTOS, GALLERY_PHOTOS, regionInfo, SGL_DEFAULTS, todayKstIso, type PayMethod, type PublicDeparture, type PublicPackage, type PublicSheet, type SglConfig } from "./config";

type Raw = Record<string, unknown>;
const str = (v: unknown, fallback = "") => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const num = (v: unknown, fallback: number) => { const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN; return Number.isFinite(n) ? n : fallback; };
const on = (v: unknown) => v === true || v === 1 || v === "1" || v === "true";
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

/** 가격 노출 기준(고객에게는 내려가지 않는다) */
interface PriceRule { mode: "direct_first" | "direct_only"; margin: number | null; round: number }
const priceRule = (s: Raw): PriceRule => {
  const pct = num(s.sgl_price_margin, NaN);
  return { mode: oneOf(s.sgl_price_mode, ["direct_first", "direct_only"] as const, "direct_first"), margin: pct > 0 && pct < 90 ? pct / 100 : null, round: Math.max(1, num(s.sgl_price_round, 1000)) };
};

/** 토스페이먼츠 결제창(API 개별 연동) 키 한 쌍이 모두 있어야 카드결제를 연다 */
export const tossKeys = () => { const clientKey = process.env.TOSS_CLIENT_KEY?.trim(), secretKey = process.env.TOSS_SECRET_KEY?.trim(); return clientKey && secretKey ? { clientKey, secretKey } : null; };

export function toConfig(s: Raw): SglConfig {
  const toss = tossKeys();
  const methods: PayMethod[] = [];
  if (on(s.payment_card_enabled) && toss) methods.push("card");
  if (on(s.payment_bank_enabled) && str(s.bank_account)) methods.push("bank");
  if (on(s.payment_onsite_enabled)) methods.push("onsite");
  return {
    // 공개 스위치(설정 › 고객 사이트)를 켜기 전에는 사이트 상태와 상관없이 비공개
    status: on(s.sgl_site_open) ? oneOf(s.site_status, ["open", "maintenance", "private"] as const, "open") : "private",
    brand: str(s.sgl_brand_name, SGL_DEFAULTS.brand), tel: str(s.sgl_tel, SGL_DEFAULTS.tel), hours: str(s.sgl_hours, SGL_DEFAULTS.hours),
    kakaoUrl: str(s.sgl_kakao_url), instagramUrl: str(s.sgl_instagram_url),
    company: str(s.sgl_company, SGL_DEFAULTS.company), ceo: str(s.sgl_ceo, SGL_DEFAULTS.ceo), bizNo: str(s.sgl_biz_no, SGL_DEFAULTS.bizNo), license: str(s.sgl_tour_license, SGL_DEFAULTS.license), address: str(s.sgl_address, SGL_DEFAULTS.address),
    minPax: Math.max(1, num(s.sgl_min_people, 2)), maxPax: Math.max(1, num(s.sgl_max_people, 8)), leadDays: Math.max(0, num(s.sgl_booking_lead_days, 7)),
    methods,
    partial: on(s.payment_partial_enabled),
    deposit: { type: oneOf(s.deposit_policy_type, ["fixed", "percent", "none"] as const, "none"), amount: Math.max(0, num(s.deposit_amount, 0)), percent: Math.min(100, Math.max(0, num(s.deposit_percent, 0))), unit: oneOf(s.deposit_unit, ["per_person", "per_booking"] as const, "per_person") },
    balanceDueDays: Math.max(0, num(s.sgl_balance_due_days, 30)),
    bankDeadlineHours: Math.max(1, num(s.sgl_bank_deadline_hours, 24)),
    bank: { name: str(s.bank_name), holder: str(s.bank_holder), account: str(s.bank_account) },
    notice: { booking: str(s.booking_notice), payment: str(s.payment_notice), refund: str(s.refund_notice), noshow: str(s.noshow_policy), weather: str(s.weather_policy), extra: str(s.cancellation_extra_notice) },
    cancel: { freeDays: Math.max(0, num(s.cancel_free_days, 0)), feePercent: Math.min(100, Math.max(0, num(s.cancel_fee_percent, 0))) },
    tossClientKey: toss?.clientKey ?? null,
  };
}
export const loadConfig = async () => toConfig(await getSiteSettings());

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const roundUp = (v: number, unit: number) => Math.ceil(v / unit) * unit;

/**
 * 출발일 한 행의 고객 판매가.
 * 1) 원가표에 적은 실제 판매가(directSalePrice)  2) 없으면 원가 ÷ (1 − 마진) — 인디비 항공이 마감·미정이면 그룹 원가로 계산
 * 3) 둘 다 없으면 상담(가격 미정) 또는 마감
 */
function publicDeparture(row: QuoteRow, p: Product, rule: PriceRule, bookableFrom: string): PublicDeparture {
  const sp = row.override.spotSpecial ? ({ sp: 1 } as const) : {};
  const late = row.date < bookableFrom; // 출발이 임박한 날짜는 온라인 예약 대신 상담
  if (row.salePriceKrw) return { d: row.date, p: row.salePriceKrw, s: late ? "a" : "o", ...sp };
  if (rule.mode === "direct_only") return { d: row.date, p: null, s: "a" };
  const cost = isNum(row.costIndiv) ? row.costIndiv : isNum(row.costGroup) ? row.costGroup : null;
  if (cost == null) return { d: row.date, p: null, s: row.costIndiv === "마감" ? "c" : "a" };
  const margin = rule.margin ?? Math.max(...p.margins);
  return { d: row.date, p: roundUp(cost / (1 - margin), rule.round), s: late ? "a" : "o", ...sp };
}

const short = (name: string) => name.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
const totalHoles = (p: Product) => p.golfPlan.reduce((a, b) => a + b, 0);

function publicSheet(p: Product, rows: QuoteRow[], rule: PriceRule, ctx: { hotelsById: Map<string, { name: string }>; coursesById: Parameters<typeof roundsOf>[1]; today: string; bookableFrom: string }): PublicSheet {
  const departures = rows.filter((r) => r.date > ctx.today).map((r) => publicDeparture(r, p, rule, ctx.bookableFrom));
  const open = departures.filter((d) => d.s === "o" && d.p != null).map((d) => d.p as number);
  const type = saleTypeOf(p);
  // 패키지 그린피(golf-pkg-…)는 원가 계산용 가상 골프장이라 고객에게는 지역 골프장으로만 안내한다
  const rounds = roundsOf(p, ctx.coursesById).map((r) => ({ day: r.day, holes: r.holes, course: r.courseId.startsWith("golf-pkg-") || r.courseName === "-" ? `${p.region} 지역 골프장` : r.courseName, ...(r.style ? { style: r.style } : {}) }));
  const hotelNames = staysOf(p).map((s) => short(ctx.hotelsById.get(s.hotelId)?.name ?? "호텔"));
  const includes = [
    ...(type === "air" ? [`왕복 항공권 (${airlineName(p.airline)} ${p.outbound.flightNo} / ${p.inbound.flightNo})`] : []),
    `숙박 ${p.nights}박 (${[...new Set(hotelNames)].join(" · ")})`,
    `그린피 ${rounds.length}회 · ${totalHoles(p)}홀`,
    ...(p.vehicleRuleId ? ["현지 차량 · 지원"] : []),
    ...(p.extras ?? []).map((e) => e.label),
  ];
  return {
    id: p.id, label: `${p.nights}박 ${p.nights + 1}일 · ${totalHoles(p)}홀`, nights: p.nights, holes: totalHoles(p), saleType: type, paxBasis: p.paxBasis ?? null,
    outbound: p.outbound, inbound: p.inbound,
    stay: stayText(p, ctx.hotelsById as never), stays: staysOf(p).map((s, k) => ({ hotel: hotelNames[k], nights: s.nights })), rounds, includes,
    excludes: [...(type === "land" ? ["항공권 (현지 합류 상품)"] : []), "여행자 보험 · 개인 경비", "포함 사항에 없는 식사"],
    note: type === "land" ? `${airlineName(p.airline)} ${p.outbound.flightNo} / ${p.inbound.flightNo} 편에 맞춘 일정입니다. 항공권은 직접 준비하시거나 상담 시 함께 요청하실 수 있습니다.` : "",
    minPrice: open.length ? Math.min(...open) : null,
    departures,
  };
}

const defaultTitle = (g: ProductGroup) => g.name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim() || g.name;

export interface Catalog { config: SglConfig; packages: PublicPackage[]; builtAt: number }

async function build(): Promise<Catalog> {
  const [settings, groups, list, allHotels, allCourses] = await Promise.all([getSiteSettings(), productGroups().list(), products().list(), hotels().list(), golfCourses().list()]);
  const config = toConfig(settings);
  const rule = priceRule(settings);
  const today = todayKstIso();
  const ctx = { hotelsById: new Map(allHotels.map((h) => [h.id, h])), coursesById: new Map(allCourses.map((c) => [c.id, c])), today, bookableFrom: addDaysIso(today, config.leadDays) };
  const visible = groups.filter((g) => g.publicStatus !== "hidden").sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.name.localeCompare(b.name, "ko"));
  const packages: PublicPackage[] = [];
  for (const g of visible) {
    const children = sortSheets(list.filter((p) => p.groupId === g.id && p.dateTo > today));
    const sheets: PublicSheet[] = [];
    for (const p of children) {
      const q = await quoteProduct(p.id);
      if (!q) continue;
      const sheet = publicSheet(q.product, q.rows, rule, ctx);
      if (sheet.departures.some((d) => d.s !== "c")) sheets.push(sheet);
    }
    if (!sheets.length) continue; // 출발일이 남지 않은 상품군은 보이지 않는다
    const info = regionInfo(g.region);
    const prices = sheets.map((s) => s.minPrice).filter(isNum);
    const first = sheets.flatMap((s) => s.departures.filter((d) => d.s === "o").map((d) => d.d)).sort()[0] ?? null;
    const i = packages.length;
    const gallery = g.publicGallery?.length ? g.publicGallery : [0, 1, 2].map((k) => GALLERY_PHOTOS[(i + k) % GALLERY_PHOTOS.length]);
    packages.push({
      id: g.id, title: str(g.publicTitle, defaultTitle(g)), region: g.region, regionEn: info.en, area: info.area, country: g.country, airline: g.airline ? airlineName(g.airline) : "",
      summary: str(g.summary, `${sheets[0].stay} · ${sheets[0].rounds.map((r) => r.course).filter((c, k, a) => a.indexOf(c) === k).join(" · ")}`),
      description: str(g.publicDescription), highlights: g.publicHighlights ?? [],
      image: str(g.publicImage, CARD_PHOTOS[i % CARD_PHOTOS.length]), gallery,
      saleTypes: [...new Set(sheets.map((s) => s.saleType))], minPrice: prices.length ? Math.min(...prices) : null, nextDate: first, sheets,
    });
  }
  return { config, packages, builtAt: Date.now() };
}

/** 인스턴스 메모리에 30초 보관한다 → 관리자에서 고친 값은 30초 안에 고객 화면에 반영된다 */
const TTL_MS = 30_000;
const g = globalThis as unknown as { __sglCatalog?: { at: number; value: Promise<Catalog> } };
export function loadCatalog(fresh = false): Promise<Catalog> {
  const hit = g.__sglCatalog;
  if (!fresh && hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = build();
  g.__sglCatalog = { at: Date.now(), value };
  value.catch(() => { if (g.__sglCatalog?.value === value) g.__sglCatalog = undefined; });
  return value;
}

export const findPackage = (c: Catalog, id: string) => c.packages.find((p) => p.id === id) ?? null;
export function findSheet(c: Catalog, sheetId: string) {
  for (const pkg of c.packages) { const sheet = pkg.sheets.find((s) => s.id === sheetId); if (sheet) return { pkg, sheet }; }
  return null;
}
/** 예약 시 서버가 다시 계산하는 가격(화면에서 보낸 금액은 믿지 않는다) */
export function findDeparture(c: Catalog, sheetId: string, date: string) {
  const hit = findSheet(c, sheetId);
  const dep = hit?.sheet.departures.find((d) => d.d === date);
  return hit && dep ? { ...hit, dep } : null;
}
