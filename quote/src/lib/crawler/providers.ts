/** 항공사별 크롤러 레지스트리 — 편명 접두(항공사 코드)로 공급자를 고른다 */
import type { FareInput } from "@/lib/fares/service";
import { calendarToFares, DEFAULT_ROUTES, fetchMinFareCalendar, type FetchOptions, type RouteConfig } from "./airseoul";
import { crawlJejuRoute, JEJUAIR_ROUTES } from "./jejuair";
import { crawlJinRoute, JINAIR_ROUTES } from "./jinair";

export interface FareProvider {
  id: "airseoul" | "jejuair" | "jinair";
  label: string;
  airline: string; // 편명 접두
  routes: RouteConfig[];
  /** from~to(YYYY-MM-DD) 기간의 왕복 편 운임 수집 */
  crawl(route: RouteConfig, from: string, to: string, opts?: FetchOptions): Promise<FareInput[]>;
}

export const PROVIDERS: FareProvider[] = [
  {
    id: "airseoul", label: "에어서울", airline: "RS", routes: DEFAULT_ROUTES,
    async crawl(route, from, to, opts) { const cal = await fetchMinFareCalendar(route, opts); return calendarToFares(cal, route, { from, to }); },
  },
  { id: "jejuair", label: "제주항공", airline: "7C", routes: JEJUAIR_ROUTES, crawl: (route, from, to, opts) => crawlJejuRoute(route, from, to, opts) },
  { id: "jinair", label: "진에어", airline: "LJ", routes: JINAIR_ROUTES, crawl: (route, from, to, opts) => crawlJinRoute(route, from, to, opts) },
];

export const providerById = (id: string) => PROVIDERS.find((p) => p.id === id);
export const providerForFlight = (flightNo: string) => PROVIDERS.find((p) => flightNo.toUpperCase().startsWith(p.airline));
/** 요청 편명 목록 → (공급자, 노선) 쌍. 편명이 노선의 출발/귀국편에 포함되면 매칭 */
export function resolveRoutes(flightNos: string[], extraRoutes: RouteConfig[] = []): { provider: FareProvider; route: RouteConfig }[] {
  const out: { provider: FareProvider; route: RouteConfig }[] = [];
  for (const p of PROVIDERS) {
    for (const r of [...p.routes, ...extraRoutes.filter((x) => providerForFlight(x.outboundFlightNo)?.id === p.id)]) {
      if (flightNos.includes(r.outboundFlightNo) || flightNos.includes(r.returnFlightNo)) out.push({ provider: p, route: r });
    }
  }
  return out;
}
