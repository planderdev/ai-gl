import { checkApiKey, handle, json, parseBody } from "@/lib/api";
import { listFares, updateFareRequest, upsertFares } from "@/lib/fares/service";
import { faresPostSchema } from "@/lib/schemas";

/** GET /api/fares?flightNo=RS741&from=2026-09-01&to=2026-09-30 */
export const GET = handle(async (req: Request) => {
  const q = new URL(req.url).searchParams;
  const items = await listFares({ flightNo: q.get("flightNo") ?? undefined, from: q.get("from") ?? undefined, to: q.get("to") ?? undefined });
  return json({ items, count: items.length });
});

/**
 * POST /api/fares  (크롤러 → 서버)  헤더 x-api-key
 * body: { fares: [{ flightNo, origin, destination, date, fareKrw, status? }], requestId? }
 * 같은 편명+날짜는 덮어씀. requestId 를 주면 해당 요청을 done 처리.
 */
export const POST = handle(async (req: Request) => {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const r = await parseBody(req, faresPostSchema);
  if ("error" in r) return r.error;
  const saved = await upsertFares(r.data.fares.map((f) => ({ ...f, source: f.source ?? "crawler" })));
  if (r.data.requestId) await updateFareRequest(r.data.requestId, { status: "done", completedAt: new Date().toISOString(), resultCount: saved.length });
  return json({ saved: saved.length }, { status: 201 });
});
