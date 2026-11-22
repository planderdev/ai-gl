/**
 * SGL 고객 사이트의 예약·결제·상담 접수. 예약은 관리자 예약관리(cms-bookings), 상담은 상담 문의(cms-inquiries)에 쌓인다.
 * 금액은 항상 서버가 카탈로그에서 다시 계산한다(화면에서 보낸 금액은 받지 않는다).
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { nowLocal, type CmsItem } from "@/lib/cms/service";
import type { SglBookingInput, SglInquiryInput } from "@/lib/schemas";
import { recordCollection } from "@/lib/store/collection";
import { findDeparture, findSheet, loadCatalog, tossKeys } from "./catalog";
import { addDaysIso, depositOf, formatPhone, normalizePhone, SGL_CONSENT_VERSION, type PayMethod, type SglConfig } from "./config";

export interface SglBooking extends CmsItem {
  product_id: string; product_group_id: string; product_title: string;
  date: string; return_date: string; nights: number; people: number;
  unit_price: number; total_price: number; deposit_amount: number; balance_amount: number;
  status: "pending" | "paid" | "confirmed" | "cancelled";
  payment_method: PayMethod | ""; payment_plan: "deposit" | "full" | ""; payment_status: "pending" | "paid" | "refunded";
  payment_due: number; payment_amount: number; payment_date: string;
  customer_name: string; customer_phone: string; customer_email: string; companions: string; request_note: string;
  depositor_name: string; bank_deadline: string;
  pg_order_id: string; pg_order_amount: number; pg_payment_key: string; pg_receipt_url: string;
  status_logs: { status: string; label: string; changed_at: string }[];
  source: string; created_at: string; updated_at: string;
}

const bookings = () => recordCollection<SglBooking>("cms-bookings");
const inquiries = () => recordCollection<CmsItem>("cms-inquiries");

/* ---------- 예약번호 · 열람 토큰 ---------- */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 0·O·1·I 제외
const randomCode = (n: number) => [...randomBytes(n)].map((b) => ALPHABET[b % ALPHABET.length]).join("");
const newBookingNo = () => `SGL${nowLocal().slice(2, 10).replace(/-/g, "")}${randomCode(5)}`;
export const normalizeBookingNo = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");

const secret = () => process.env.AUTH_SECRET || process.env.CRAWLER_API_KEY || "aigl-dev-secret";
/** 예약 화면 주소에 붙는 열람 토큰. 예약번호만으로는 예약 내용을 볼 수 없다 */
export const bookingToken = (no: string) => createHmac("sha256", secret()).update(`sgl-booking:${no}`).digest("base64url").slice(0, 24);
export function verifyBookingToken(no: string, token: string | undefined | null) {
  if (!token) return false;
  const a = Buffer.from(bookingToken(no)), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
export const bookingPath = (no: string) => `/sgl/booking/${no}?k=${bookingToken(no)}`;

const log = (b: SglBooking, status: string, label: string): SglBooking["status_logs"] => [...(b.status_logs ?? []), { status, label, changed_at: nowLocal().slice(0, 16) }];

export class BookingError extends Error { constructor(public code: string, message: string) { super(message); } }

/* ---------- 예약 ---------- */
export async function createBooking(input: SglBookingInput): Promise<SglBooking> {
  const catalog = await loadCatalog(true);
  const hit = findDeparture(catalog, input.sheetId, input.date);
  if (!hit) throw new BookingError("not_found", "선택하신 상품이나 출발일을 찾을 수 없어요. 상품 화면에서 다시 선택해 주세요.");
  const { pkg, sheet, dep } = hit;
  const { config } = catalog;
  if (dep.s !== "o" || dep.p == null) throw new BookingError("not_bookable", "이 출발일은 온라인 예약을 받지 않아요. 상담으로 문의해 주세요.");
  if (input.people < config.minPax || input.people > config.maxPax) throw new BookingError("people", `온라인 예약은 ${config.minPax}~${config.maxPax}명까지 가능해요. 그 밖의 인원은 상담으로 문의해 주세요.`);
  const total = dep.p * input.people;
  const deposit = depositOf(total, input.people, config) ?? 0;
  const at = nowLocal();
  for (let attempt = 0; attempt < 5; attempt++) {
    const b: SglBooking = {
      id: newBookingNo(),
      product_id: sheet.id, product_group_id: pkg.id, product_title: `${pkg.title} · ${sheet.label}`,
      date: dep.d, return_date: addDaysIso(dep.d, sheet.nights), nights: sheet.nights, people: input.people,
      unit_price: dep.p, total_price: total, deposit_amount: deposit, balance_amount: 0,
      status: "pending", payment_method: "", payment_plan: "", payment_status: "pending", payment_due: 0, payment_amount: 0, payment_date: "",
      customer_name: input.name, customer_phone: formatPhone(input.phone), customer_email: input.email, companions: input.companions, request_note: input.request,
      depositor_name: "", bank_deadline: "", pg_order_id: "", pg_order_amount: 0, pg_payment_key: "", pg_receipt_url: "",
      cancel_reason: "", cancel_date: "", refund_status: "none", refund_amount: 0, refund_date: "", refund_memo: "", admin_memo: "",
      status_logs: [{ status: "pending", label: "예약 접수", changed_at: at.slice(0, 16) }],
      source: "sgl-web", privacy_consent_at: at, terms_consent_at: at, consent_version: SGL_CONSENT_VERSION,
      utm_source: input.utm_source, utm_medium: input.utm_medium, utm_campaign: input.utm_campaign, utm_content: input.utm_content, referrer: input.referrer,
      created_at: at, updated_at: at,
    };
    if (await bookings().createIfAbsent(b)) return b;
  }
  throw new Error("예약번호를 만들지 못했습니다");
}

export async function getBooking(no: string): Promise<SglBooking | null> {
  const id = normalizeBookingNo(no);
  return id ? bookings().get(id) : null;
}
/** 예약번호 + 휴대폰 번호로 조회. 틀리면 이유를 구분하지 않고 null */
export async function lookupBooking(no: string, phoneDigits: string) {
  const b = await getBooking(no);
  return b && normalizePhone(String(b.customer_phone)) === phoneDigits ? b : null;
}

const save = (b: SglBooking) => bookings().upsert({ ...b, updated_at: nowLocal() });
export const isPayable = (b: SglBooking) => b.status === "pending" && b.payment_status === "pending";

/** 이번에 결제할 금액. 예약금 결제는 예약금 정책이 있을 때만 */
export function amountFor(b: SglBooking, plan: "deposit" | "full") {
  return plan === "deposit" && b.deposit_amount > 0 && b.deposit_amount < b.total_price ? { plan, amount: b.deposit_amount } as const : { plan: "full", amount: b.total_price } as const;
}

/** 무통장 입금·현장 결제 신청. 입금 확인은 관리자가 예약관리에서 한다 */
export async function requestOfflinePayment(b: SglBooking, method: "bank" | "onsite", plan: "deposit" | "full", depositor: string, config: SglConfig) {
  if (!isPayable(b)) throw new BookingError("not_payable", "이미 결제가 진행된 예약이에요.");
  if (!config.methods.includes(method)) throw new BookingError("method", "지금은 사용할 수 없는 결제 수단이에요.");
  const pay = method === "onsite" ? ({ plan: "full", amount: b.total_price } as const) : amountFor(b, plan);
  const deadline = method === "bank" ? new Date(Date.now() + 9 * 3600_000 + config.bankDeadlineHours * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "";
  return save({ ...b, payment_method: method, payment_plan: pay.plan, payment_due: pay.amount, balance_amount: b.total_price - pay.amount, depositor_name: depositor || b.customer_name, bank_deadline: deadline, pg_order_id: "", pg_order_amount: 0, status_logs: log(b, "pending", method === "bank" ? "무통장 입금 신청" : "현장 결제 신청") });
}

/** 카드 결제 주문 만들기 → 화면이 이 값으로 토스 결제창을 연다 */
export async function createCardOrder(b: SglBooking, plan: "deposit" | "full", config: SglConfig) {
  if (!isPayable(b)) throw new BookingError("not_payable", "이미 결제가 진행된 예약이에요.");
  if (!config.methods.includes("card")) throw new BookingError("method", "지금은 카드 결제를 사용할 수 없어요.");
  const pay = amountFor(b, plan);
  const orderId = `${b.id}-${randomCode(6)}`;
  await save({ ...b, payment_method: "card", payment_plan: pay.plan, payment_due: pay.amount, balance_amount: b.total_price - pay.amount, pg_order_id: orderId, pg_order_amount: pay.amount });
  return { orderId, amount: pay.amount, orderName: String(b.product_title).slice(0, 90), customerName: b.customer_name, customerMobilePhone: normalizePhone(String(b.customer_phone)), customerEmail: b.customer_email || undefined };
}

/** 토스페이먼츠 결제 승인. 주문번호·금액이 서버에 저장한 값과 같을 때만 승인을 요청한다 */
export async function confirmCardPayment(b: SglBooking, q: { orderId: string; paymentKey: string; amount: number }): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  if (b.payment_status === "paid") return b.pg_payment_key === q.paymentKey ? { ok: true } : { ok: false, code: "ALREADY_PAID", message: "이미 결제가 완료된 예약이에요." };
  if (!b.pg_order_id || b.pg_order_id !== q.orderId || b.pg_order_amount !== q.amount) return { ok: false, code: "ORDER_MISMATCH", message: "결제 정보가 예약과 달라 승인하지 않았어요. 다시 시도해 주세요." };
  const keys = tossKeys();
  if (!keys) return { ok: false, code: "NOT_CONFIGURED", message: "카드 결제가 설정되지 않았어요." };
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${keys.secretKey}:`).toString("base64")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey: q.paymentKey, orderId: q.orderId, amount: q.amount }),
  });
  const body = (await res.json().catch(() => ({}))) as { status?: string; totalAmount?: number; approvedAt?: string; receipt?: { url?: string }; code?: string; message?: string };
  if (!res.ok || body.status !== "DONE") return { ok: false, code: body.code ?? `HTTP_${res.status}`, message: body.message ?? "결제 승인에 실패했어요." };
  await save({ ...b, status: "paid", payment_status: "paid", payment_amount: body.totalAmount ?? q.amount, payment_date: (body.approvedAt ?? "").slice(0, 16) || nowLocal().slice(0, 16).replace(" ", "T"), pg_payment_key: q.paymentKey, pg_receipt_url: body.receipt?.url ?? "", status_logs: log(b, "paid", b.payment_plan === "deposit" ? "예약금 카드 결제" : "카드 결제 완료") });
  return { ok: true };
}

/* ---------- 상담 ---------- */
export async function createInquiry(input: SglInquiryInput) {
  const at = nowLocal();
  const hit = input.sheetId ? findSheet(await loadCatalog(), input.sheetId) : null;
  const pkg = hit?.pkg ?? (input.packageId ? (await loadCatalog()).packages.find((p) => p.id === input.packageId) : null);
  const item: CmsItem = {
    id: `inq-${at.replace(/\D/g, "").slice(2, 14)}-${randomCode(4).toLowerCase()}`,
    name: input.name, phone: formatPhone(input.phone), contact_method: input.contact, status: "new",
    region: input.region || pkg?.region || "", product_title: pkg ? `${pkg.title}${hit ? ` · ${hit.sheet.label}` : ""}` : "", product_id: hit?.sheet.id ?? "", product_group_id: pkg?.id ?? "",
    depart_date: input.date, people: input.people, message: input.message, admin_memo: "",
    marketing_consent: input.marketingConsent, privacy_consent_at: at, consent_version: SGL_CONSENT_VERSION,
    utm_source: input.utm_source, utm_medium: input.utm_medium, utm_campaign: input.utm_campaign, utm_content: input.utm_content, referrer: input.referrer,
    source: "sgl-web", created_at: at, updated_at: at,
  };
  await inquiries().upsert(item);
  return item;
}

/* ---------- 공개 API 공용: 간이 호출 제한 ---------- */
const buckets = new Map<string, { count: number; resetAt: number }>();
/** 인스턴스별 간이 제한. 대량 공격 방어는 Vercel Firewall 몫이고, 여기서는 단순 반복 호출만 막는다 */
export function rateLimited(req: Request, scope: string, max: number, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${ip}`, now = Date.now();
  if (buckets.size > 5000) buckets.clear();
  const h = buckets.get(key);
  if (!h || h.resetAt < now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return false; }
  return ++h.count > max;
}
