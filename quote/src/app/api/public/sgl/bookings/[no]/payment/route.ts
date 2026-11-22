import { decodeId, fail, json } from "@/lib/api";
import { sglPaymentSchema } from "@/lib/schemas";
import { BookingError, bookingToken, createCardOrder, getBooking, requestOfflinePayment, verifyBookingToken } from "@/lib/sgl/bookings";
import { loadConfig } from "@/lib/sgl/catalog";
import { readPublicBody } from "@/lib/sgl/public-api";

/** 결제 수단 선택. 무통장·현장은 신청만 받고, 카드는 토스 결제창에 넘길 주문 정보를 만든다 */
export async function POST(req: Request, ctx: { params: Promise<{ no: string }> }) {
  const r = await readPublicBody(req, sglPaymentSchema, "sgl-payment", 30);
  if ("error" in r) return r.error;
  try {
    const b = await getBooking(decodeId((await ctx.params).no));
    if (!b || !verifyBookingToken(b.id, r.data.k)) return fail("not_found", 404);
    const config = await loadConfig();
    if (r.data.method !== "card") { await requestOfflinePayment(b, r.data.method, r.data.plan, r.data.depositor, config); return json({ ok: true }); }
    const order = await createCardOrder(b, r.data.plan, config);
    const origin = new URL(req.url).origin;
    const back = `no=${encodeURIComponent(b.id)}&k=${bookingToken(b.id)}`;
    return json({ ok: true, order: { ...order, successUrl: `${origin}/api/public/sgl/toss/success?${back}`, failUrl: `${origin}/sgl/booking/${b.id}?k=${bookingToken(b.id)}&pay=fail` } });
  } catch (e) {
    if (e instanceof BookingError) return fail(e.code, 409, { message: e.message });
    console.error("[sgl/payment] 처리 실패", e);
    return fail("temporarily_unavailable", 503);
  }
}
