import { fail, handle, json } from "@/lib/api";
import { calendarToFares, DEFAULT_ROUTES, fetchMinFareCalendar, routesForFlights } from "@/lib/crawler/airseoul";
import { fareRequests, updateFareRequest, upsertFares } from "@/lib/fares/service";

export const maxDuration = 300;

/**
 * POST /api/crawl/airseoul  — 서버(로컬 PC)에서 Chrome 을 띄워 에어서울 달력을 바로 수집.
 * body: { mode: "all" | "requests", from?, to?, headed? (기본 true: Chrome 창 표시) }
 *  - all: 오늘 이후 전체 달력을 저장
 *  - requests: 대기(pending) 요청을 모두 처리
 */
export const POST = handle(async (req: Request) => {
  if (process.env.VERCEL) return fail("배포 서버에는 Chrome 이 없어 크롤러를 실행할 수 없습니다. 로컬 PC 에서 `npm run crawl:airseoul -- --all --server <배포주소> --api-key <키>` 로 실행하세요.", 501);
  const body = (await req.json().catch(() => ({}))) as { mode?: string; from?: string; to?: string; headed?: boolean };
  body.headed = body.headed !== false;
  const logs: string[] = [];
  const log = (m: string) => logs.push(`${new Date().toISOString().slice(11, 19)} ${m}`);
  try {
    if (body.mode === "requests") {
      const pending = (await fareRequests().list()).filter((r) => r.status === "pending");
      if (!pending.length) return json({ ok: true, processed: 0, logs: ["대기 중인 요청 없음"] });
      const calCache = new Map<string, Awaited<ReturnType<typeof fetchMinFareCalendar>>>();
      let saved = 0;
      for (const r of pending) {
        await updateFareRequest(r.id, { status: "in_progress", claimedAt: new Date().toISOString() });
        try {
          const flightNos = r.flights.map((f) => f.flightNo);
          const routes = routesForFlights(flightNos, DEFAULT_ROUTES);
          if (!routes.length) throw new Error(`처리할 수 없는 편명: ${flightNos.join(",")}`);
          let fares: ReturnType<typeof calendarToFares> = [];
          for (const route of routes) {
            const key = `${route.departure}-${route.arrival}`;
            if (!calCache.has(key)) calCache.set(key, await fetchMinFareCalendar(route, { headed: body.headed, log }));
            fares = fares.concat(calendarToFares(calCache.get(key)!, route, { from: r.from, to: r.to, flightNos }));
          }
          const rows = await upsertFares(fares);
          saved += rows.length;
          await updateFareRequest(r.id, { status: "done", completedAt: new Date().toISOString(), resultCount: rows.length });
          log(`요청 ${r.id} 완료: ${rows.length}건`);
        } catch (e) {
          await updateFareRequest(r.id, { status: "failed", completedAt: new Date().toISOString(), error: (e as Error).message.slice(0, 500) });
          log(`요청 ${r.id} 실패: ${(e as Error).message}`);
        }
      }
      return json({ ok: true, processed: pending.length, saved, logs });
    }
    let saved = 0;
    for (const route of DEFAULT_ROUTES) {
      const cal = await fetchMinFareCalendar(route, { headed: body.headed, log });
      const fares = calendarToFares(cal, route, { from: body.from, to: body.to });
      saved += (await upsertFares(fares)).length;
      log(`${route.departure}-${route.arrival}: ${fares.length}건 저장`);
    }
    return json({ ok: true, saved, logs });
  } catch (e) {
    log(`실패: ${(e as Error).message}`);
    return fail((e as Error).message, 500, { logs });
  }
});
