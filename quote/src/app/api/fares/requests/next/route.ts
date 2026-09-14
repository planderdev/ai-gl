import { checkApiKey, handle, json } from "@/lib/api";
import { fareRequests, updateFareRequest } from "@/lib/fares/service";
import { eachDate } from "@/lib/pricing/date";

/**
 * POST /api/fares/requests/next  (크롤러 폴링) — 가장 오래된 pending 요청을 in_progress 로 바꿔 반환.
 * 응답: { request, tasks: [{ flightNo, origin, destination, date }] }  없으면 { request: null }
 */
export const POST = handle(async (req: Request) => {
  const denied = checkApiKey(req);
  if (denied) return denied;
  const pending = (await fareRequests().list()).filter((r) => r.status === "pending").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const next = pending[0];
  if (!next) return json({ request: null, tasks: [] });
  const claimed = await updateFareRequest(next.id, { status: "in_progress", claimedAt: new Date().toISOString() });
  const tasks = next.flights.flatMap((f) => [...eachDate(next.from, next.to)].map((date) => ({ ...f, date })));
  return json({ request: claimed, tasks });
});
