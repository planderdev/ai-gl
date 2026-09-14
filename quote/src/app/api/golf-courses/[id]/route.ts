import { fail, handle, json, decodeId } from "@/lib/api";
import { golfCourses } from "@/lib/masters/service";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/golf-courses/[id]">) => {
  const item = await golfCourses().get(decodeId((await ctx.params).id));
  return item ? json(item) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/golf-courses/[id]">) => {
  await golfCourses().remove(decodeId((await ctx.params).id));
  return json({ ok: true });
});
