import { decodeId, fail, handle, json, parseBody } from "@/lib/api";
import { getInquiry, removeInquiry, updateInquiry } from "@/lib/inquiries/service";
import { inquiryPatchSchema } from "@/lib/schemas";
import type { Inquiry } from "@/types";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/inquiries/[id]">) => {
  const item = await getInquiry(decodeId((await ctx.params).id));
  return item ? json(item) : fail("not_found", 404);
});
/** 보낸 칸만 고친다. 출발 확정 내용을 넣으면서 상태를 따로 보내지 않으면 상태도 출발 확정으로 맞춘다 */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/inquiries/[id]">) => {
  const r = await parseBody(req, inquiryPatchSchema);
  if ("error" in r) return r.error;
  const patch = { ...r.data } as Partial<Inquiry>;
  if (patch.confirmText && patch.status === undefined) patch.status = "confirmed";
  const item = await updateInquiry(decodeId((await ctx.params).id), patch);
  return item ? json(item) : fail("not_found", 404);
});
export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/inquiries/[id]">) => ((await removeInquiry(decodeId((await ctx.params).id))) ? json({ ok: true }) : fail("not_found", 404)));
