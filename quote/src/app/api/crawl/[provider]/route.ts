import { fail, handle, json, decodeId } from "@/lib/api";
import { PROVIDERS, providerById, resolveRoutes } from "@/lib/crawler/providers";
import { todayKst } from "@/lib/crawler/airseoul";
import { fareRequests, updateFareRequest, upsertFares } from "@/lib/fares/service";
import { addDays } from "@/lib/pricing/date";

export const maxDuration = 300;

/**
 * POST /api/crawl/{airseoul|jejuair|all}  — 서버(로컬 PC)에서 Chrome 을 띄워 운임 수집.
 * body: { mode: "all" | "requests", from?, to?, days?(기본 180), pax?(기준 인원, 기본 4), headed?(기본 true) }
 *  - all: 공급자 노선 전체를 오늘 이후 days 일까지 저장
 *  - requests: 대기(pending) 요청을 모두 처리(편명으로 공급자 자동 선택)
 */
export const POST = handle(async (req: Request, ctx: RouteContext<"/api/crawl/[provider]">) => {
  if (process.env.VERCEL) return fail("배포 서버에는 Chrome 이 없어 크롤러를 실행할 수 없습니다. 로컬 PC 에서 `npm run crawl -- --all --server <배포주소> --api-key <키>` 로 실행하세요.", 501);
  const id = decodeId((await ctx.params).provider);
  const body = (await req.json().catch(() => ({}))) as { mode?: string; from?: string; to?: string; days?: number; headed?: boolean; pax?: number };
  const pax = Math.min(9, Math.max(1, Number(body.pax) || 4));
  const opts = { headed: body.headed !== false, pax, log: (m: string) => logs.push(`${new Date().toISOString().slice(11, 19)} ${m}`) };
  const logs: string[] = [];
  try {
    if (body.mode === "requests") {
      const pending = (await fareRequests().list()).filter((r) => r.status === "pending");
      if (!pending.length) return json({ ok: true, processed: 0, logs: ["대기 중인 요청 없음"] });
      let saved = 0;
      for (const r of pending) {
        await updateFareRequest(r.id, { status: "in_progress", claimedAt: new Date().toISOString() });
        try {
          const flightNos = r.flights.map((f) => f.flightNo);
          const matched = resolveRoutes(flightNos);
          if (!matched.length) throw new Error(`처리할 수 없는 편명: ${flightNos.join(",")}`);
          let fares: Awaited<ReturnType<typeof matched[0]["provider"]["crawl"]>> = [];
          for (const { provider, route } of matched) fares = fares.concat((await provider.crawl(route, r.from, r.to, { ...opts, pax: r.pax ?? pax })).filter((f) => flightNos.includes(f.flightNo)));
          const rows = await upsertFares(fares);
          saved += rows.length;
          await updateFareRequest(r.id, { status: "done", completedAt: new Date().toISOString(), resultCount: rows.length });
          opts.log(`요청 ${r.id} 완료: ${rows.length}건`);
        } catch (e) {
          await updateFareRequest(r.id, { status: "failed", completedAt: new Date().toISOString(), error: (e as Error).message.slice(0, 500) });
          opts.log(`요청 ${r.id} 실패: ${(e as Error).message}`);
        }
      }
      return json({ ok: true, processed: pending.length, saved, logs });
    }
    const providers = id === "all" ? PROVIDERS : [providerById(id)].filter((p): p is NonNullable<typeof p> => !!p);
    if (!providers.length) return fail(`알 수 없는 공급자: ${id}`, 404);
    const from = body.from ?? todayKst();
    const to = body.to ?? addDays(todayKst(), body.days ?? 180);
    let saved = 0;
    for (const p of providers) for (const route of p.routes) {
      const fares = await p.crawl(route, from, to, opts);
      saved += (await upsertFares(fares)).length;
      opts.log(`${p.label} ${route.departure}-${route.arrival}: ${fares.length}건 저장`);
    }
    return json({ ok: true, saved, logs });
  } catch (e) {
    opts.log(`실패: ${(e as Error).message}`);
    return fail((e as Error).message, 500, { logs });
  }
});
