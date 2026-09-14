import { fail, handle, json, decodeId } from "@/lib/api";
import { hotels } from "@/lib/masters/service";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/hotels/[id]">) => {
  const item = await hotels().get(decodeId((await ctx.params).id));
  return item ? json(item) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/hotels/[id]">) => {
  await hotels().remove(decodeId((await ctx.params).id));
  return json({ ok: true });
});
