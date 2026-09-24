import { fail, handle, json, decodeId } from "@/lib/api";
import { replaceProviderFares, VEHICLE_PROVIDERS, vehicleProviderById } from "@/lib/vehicles/service";

export const maxDuration = 120;
/** POST /api/crawl/vehicles/{mk-tokyo|all} — 정적 페이지 fetch 라 배포 서버에서도 동작 */
export const POST = handle(async (_req: Request, ctx: RouteContext<"/api/crawl/vehicles/[provider]">) => {
  const id = decodeId((await ctx.params).provider);
  const providers = id === "all" ? VEHICLE_PROVIDERS : [vehicleProviderById(id)].filter((p): p is NonNullable<typeof p> => !!p);
  if (!providers.length) return fail(`알 수 없는 공급자: ${id}`, 404);
  const logs: string[] = [];
  let saved = 0;
  for (const p of providers) {
    try {
      const r = await p.crawl();
      if (!r.fares.length) throw new Error("요금표를 찾지 못했습니다(페이지 구조 변경?)");
      saved += await replaceProviderFares(p.id, r.fares);
      logs.push(`${p.label}: ${r.fares.length}건 (${r.sections.join(" / ")})`);
    } catch (e) { logs.push(`${p.label}: 실패 — ${(e as Error).message}`); }
  }
  return json({ ok: true, saved, logs });
});
