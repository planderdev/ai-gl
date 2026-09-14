import { handle, json, parseBody } from "@/lib/api";
import { createFareRequest, fareRequests } from "@/lib/fares/service";
import { fareRequestSchema } from "@/lib/schemas";

/** GET /api/fares/requests?status=pending — 크롤러가 할 일 목록 조회 */
export const GET = handle(async (req: Request) => {
  const status = new URL(req.url).searchParams.get("status");
  const items = (await fareRequests().list()).filter((r) => !status || r.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ items });
});
export const POST = handle(async (req: Request) => {
  const r = await parseBody(req, fareRequestSchema);
  if ("error" in r) return r.error;
  return json(await createFareRequest(r.data), { status: 201 });
});
