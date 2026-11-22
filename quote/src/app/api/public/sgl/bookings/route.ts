import { fail, json } from "@/lib/api";
import { sglBookingSchema } from "@/lib/schemas";
import { BookingError, bookingPath, createBooking } from "@/lib/sgl/bookings";
import { readPublicBody } from "@/lib/sgl/public-api";

/** 예약 접수. 금액은 서버가 원가표에서 다시 계산하고, 응답으로 결제 화면 주소를 준다 */
export async function POST(req: Request) {
  const r = await readPublicBody(req, sglBookingSchema, "sgl-booking", 12);
  if ("error" in r) return r.error;
  if (r.data.website) return json({ ok: true, url: "/sgl" }); // 허니팟
  try {
    const b = await createBooking(r.data);
    return json({ ok: true, url: bookingPath(b.id) }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError) return fail(e.code, 409, { message: e.message });
    console.error("[sgl/bookings] 저장 실패", e);
    return fail("temporarily_unavailable", 503);
  }
}
