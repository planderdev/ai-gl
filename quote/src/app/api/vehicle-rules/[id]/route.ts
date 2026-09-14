import { fail, handle, json, decodeId } from "@/lib/api";
import { vehicleRules } from "@/lib/masters/service";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/vehicle-rules/[id]">) => {
  const item = await vehicleRules().get(decodeId((await ctx.params).id));
  return item ? json(item) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/vehicle-rules/[id]">) => {
  await vehicleRules().remove(decodeId((await ctx.params).id));
  return json({ ok: true });
});
