import { fail, handle, json, parseBody, decodeId } from "@/lib/api";
import { products, updateProduct } from "@/lib/products/service";
import { productPatchSchema } from "@/lib/schemas";
import type { Product } from "@/types";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/products/[id]">) => {
  const p = await products().get(decodeId((await ctx.params).id));
  return p ? json(p) : fail("not_found", 404);
});
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/products/[id]">) => {
  const r = await parseBody(req, productPatchSchema);
  if ("error" in r) return r.error;
  const p = await updateProduct(decodeId((await ctx.params).id), r.data as Partial<Product>);
  return p ? json(p) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/products/[id]">) => {
  await products().remove(decodeId((await ctx.params).id));
  return json({ ok: true });
});
