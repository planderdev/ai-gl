import { fail, handle, json, decodeId } from "@/lib/api";
import { collectionById } from "@/lib/cms/schema";
import { createItem, listItems } from "@/lib/cms/service";

export const GET = handle(async (req: Request, ctx: RouteContext<"/api/cms/[collection]">) => {
  const c = collectionById(decodeId((await ctx.params).collection));
  if (!c) return fail("not_found", 404);
  const q = new URL(req.url).searchParams;
  return json({ items: await listItems(c, { search: q.get("q") ?? undefined, status: q.get("status") ?? undefined }) });
});
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/cms/[collection]">) => {
  const cid = decodeId((await ctx.params).collection);
  if (!collectionById(cid)) return fail("not_found", 404);
  try { const item = await createItem(cid, await req.json()); return json(item, { status: 201 }); }
  catch (e) { return fail((e as Error).message, 422); }
});
