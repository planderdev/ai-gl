import { fail, json } from "@/lib/api";
import { sglInquirySchema } from "@/lib/schemas";
import { createInquiry } from "@/lib/sgl/bookings";
import { readPublicBody } from "@/lib/sgl/public-api";

/** 상담 신청(로그인 불필요). 내부 오류 내용은 응답에 싣지 않는다 */
export async function POST(req: Request) {
  const r = await readPublicBody(req, sglInquirySchema, "sgl-inquiry", 20);
  if ("error" in r) return r.error;
  if (r.data.website) return json({ ok: true }); // 허니팟
  try { await createInquiry(r.data); return json({ ok: true }); }
  catch (e) { console.error("[sgl/inquiries] 저장 실패", e); return fail("temporarily_unavailable", 503); }
}
