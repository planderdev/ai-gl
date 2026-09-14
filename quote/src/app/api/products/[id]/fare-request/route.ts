import { fail, handle, json, decodeId } from "@/lib/api";
import { createFareRequest } from "@/lib/fares/service";
import { quoteProduct } from "@/lib/products/service";
import { addDays } from "@/lib/pricing/date";

/** 이 상품의 항공 운임 크롤링 요청 생성. ?all=1 이면 미수집 여부와 관계없이 전체 기간 재수집 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/products/[id]/fare-request">) => {
  const q = await quoteProduct(decodeId((await ctx.params).id));
  if (!q) return fail("not_found", 404);
  const all = new URL(req.url).searchParams.get("all") === "1";
  const { product: p, missing } = q;
  if (!all && !missing.length) return json({ created: false, reason: "미수집 운임 없음" });
  const dates = all ? [p.dateFrom, addDays(p.dateTo, p.nights)] : [missing.map((m) => m.date).sort()[0], missing.map((m) => m.date).sort().at(-1)!];
  const reqDoc = await createFareRequest({
    flights: [p.outbound, p.inbound].map(({ flightNo, origin, destination }) => ({ flightNo, origin, destination })),
    from: dates[0], to: dates[1], productId: p.id,
    note: all ? `${p.name} 전체 재수집` : `${p.name} 미수집 ${missing.length}건`,
  });
  return json({ created: true, request: reqDoc, missing: missing.length }, { status: 201 });
});
