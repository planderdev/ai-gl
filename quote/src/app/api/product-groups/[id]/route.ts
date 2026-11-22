import { fail, handle, json, parseBody, decodeId } from "@/lib/api";
import { productGroups, removeGroup, upsertGroup } from "@/lib/products/service";
import { productGroupPatchSchema } from "@/lib/schemas";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/product-groups/[id]">) => {
  const g = await productGroups().get(decodeId((await ctx.params).id));
  return g ? json(g) : fail("not_found", 404);
});
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/product-groups/[id]">) => {
  const r = await parseBody(req, productGroupPatchSchema);
  if ("error" in r) return r.error;
  const cur = await productGroups().get(decodeId((await ctx.params).id));
  if (!cur) return fail("not_found", 404);
  return json(await upsertGroup({ ...cur, ...r.data, id: cur.id }));
});
/** 하위 원가표는 지우지 않고 미분류로 돌린다 */
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/product-groups/[id]">) => {
  const detached = await removeGroup(decodeId((await ctx.params).id));
  return json({ ok: true, detached });
});
