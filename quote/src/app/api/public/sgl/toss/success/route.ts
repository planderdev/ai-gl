import { NextResponse } from "next/server";
import { bookingPath, confirmCardPayment, getBooking, verifyBookingToken } from "@/lib/sgl/bookings";

/** 토스 결제창이 결제 인증 뒤 돌아오는 주소. 서버에서 승인까지 마치고 예약 화면으로 보낸다 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const no = q.get("no") ?? "";
  const home = new URL("/sgl", url.origin);
  try {
    const b = await getBooking(no);
    if (!b || !verifyBookingToken(b.id, q.get("k"))) return NextResponse.redirect(home);
    const back = new URL(bookingPath(b.id), url.origin);
    const result = await confirmCardPayment(b, { orderId: q.get("orderId") ?? "", paymentKey: q.get("paymentKey") ?? "", amount: Number(q.get("amount")) });
    if (result.ok) back.searchParams.set("pay", "done");
    else { back.searchParams.set("pay", "fail"); back.searchParams.set("code", result.code); back.searchParams.set("message", result.message.slice(0, 120)); }
    return NextResponse.redirect(back);
  } catch (e) {
    console.error("[sgl/toss] 승인 실패", e);
    return NextResponse.redirect(home);
  }
}
