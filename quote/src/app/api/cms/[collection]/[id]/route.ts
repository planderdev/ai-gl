import { fail, handle, json, decodeId } from "@/lib/api";
import { collectionById } from "@/lib/cms/schema";
import { cmsStore, removeItem, updateItem } from "@/lib/cms/service";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/cms/[collection]/[id]">) => {
  const p = await ctx.params; const c = collectionById(decodeId(p.collection));
  if (!c) return fail("not_found", 404);
  const item = await cmsStore(c).get(decodeId(p.id));
  return item ? json(item) : fail("not_found", 404);
});
export const PUT = handle(async (req: Request, ctx: RouteContext<"/api/cms/[collection]/[id]">) => {
  const p = await ctx.params;
  try { const item = await updateItem(decodeId(p.collection), decodeId(p.id), await req.json()); return item ? json(item) : fail("not_found", 404); }
  catch (e) { return fail((e as Error).message, 422); }
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/cms/[collection]/[id]">) => {
  const p = await ctx.params;
  return (await removeItem(decodeId(p.collection), decodeId(p.id))) ? json({ ok: true }) : fail("not_found", 404);
});
