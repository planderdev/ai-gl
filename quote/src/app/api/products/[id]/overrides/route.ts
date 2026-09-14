import { fail, handle, json, parseBody } from "@/lib/api";
import { patchOverride, products, updateProduct } from "@/lib/products/service";
import { overridePatchSchema } from "@/lib/schemas";

/** 날짜 한 행의 수동 조정(빈 값/null 이면 해당 조정 해제). groupFare 는 product.groupFares 에 저장 */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/products/[id]/overrides">) => {
  const r = await parseBody(req, overridePatchSchema);
  if ("error" in r) return r.error;
  const { id } = await ctx.params;
  const { groupFare, ...rest } = r.data.patch;
  if (groupFare !== undefined) {
    const p = await products().get(id);
    if (!p) return fail("not_found", 404);
    const groupFares = { ...p.groupFares };
    if (groupFare === null) delete groupFares[r.data.date]; else groupFares[r.data.date] = groupFare;
    await updateProduct(id, { groupFares });
  }
  const p = Object.keys(rest).length ? await patchOverride(id, r.data.date, rest) : await products().get(id);
  return p ? json({ ok: true, overrides: p.overrides[r.data.date] ?? {}, groupFare: p.groupFares[r.data.date] ?? null }) : fail("not_found", 404);
});
