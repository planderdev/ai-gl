import { fail, handle, json, decodeId } from "@/lib/api";
import { quoteProduct } from "@/lib/products/service";

/** 계산된 요금표(JSON). 크롤링 미수집 편·날짜 목록(missing) 포함 */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/products/[id]/quote">) => {
  const q = await quoteProduct(decodeId((await ctx.params).id));
  if (!q) return fail("not_found", 404);
  return json({ product: q.product, rows: q.rows, missing: q.missing, hotel: q.ctx.hotel, courses: q.ctx.courses, vehicle: q.ctx.vehicle });
});
