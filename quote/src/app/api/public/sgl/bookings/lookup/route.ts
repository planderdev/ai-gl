import { fail, json } from "@/lib/api";
import { sglLookupSchema } from "@/lib/schemas";
import { bookingPath, lookupBooking } from "@/lib/sgl/bookings";
import { readPublicBody } from "@/lib/sgl/public-api";

/** 예약 조회: 예약번호와 휴대폰 번호가 모두 맞아야 예약 화면 주소를 준다(틀린 이유는 구분하지 않는다) */
export async function POST(req: Request) {
  const r = await readPublicBody(req, sglLookupSchema, "sgl-lookup", 10);
  if ("error" in r) return r.error;
  try {
    const b = await lookupBooking(r.data.no, r.data.phone);
    return b ? json({ ok: true, url: bookingPath(b.id) }) : fail("not_found", 404);
  } catch (e) { console.error("[sgl/lookup] 조회 실패", e); return fail("temporarily_unavailable", 503); }
}
