import { checkApiKey, fail, handle, json, parseBody, decodeId } from "@/lib/api";
import { fareRequests, updateFareRequest } from "@/lib/fares/service";
import { fareRequestPatchSchema } from "@/lib/schemas";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/fares/requests/[id]">) => {
  const r = await fareRequests().get(decodeId((await ctx.params).id));
  return r ? json(r) : fail("not_found", 404);
});
/** PATCH — 크롤러가 진행상태 보고 { status: "in_progress"|"done"|"failed", resultCount?, error? } */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/fares/requests/[id]">) => {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const r = await parseBody(req, fareRequestPatchSchema);
  if ("error" in r) return r.error;
  const patch = { ...r.data } as Record<string, unknown>;
  if (r.data.status === "in_progress") patch.claimedAt = new Date().toISOString();
  if (r.data.status === "done" || r.data.status === "failed") patch.completedAt = new Date().toISOString();
  const doc = await updateFareRequest(decodeId((await ctx.params).id), patch);
  return doc ? json(doc) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/fares/requests/[id]">) => {
  await fareRequests().remove(decodeId((await ctx.params).id));
  return json({ ok: true });
});
