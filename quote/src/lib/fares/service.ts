import type { FareRequest, FlightFare } from "@/types";
import { collection, newId, nowIso } from "@/lib/store/collection";
import { fareKey } from "@/lib/pricing/engine";

export const fares = () => collection<FlightFare>("fares");
export const fareRequests = () => collection<FareRequest>("fare-requests");

export type FareInput = Omit<FlightFare, "id" | "capturedAt" | "status" | "airline" | "fareKrw" | "source"> & Partial<Pick<FlightFare, "status" | "airline" | "capturedAt" | "fareKrw" | "source">>;

/** 크롤러/수동 입력 공통 업서트. 같은 편명·날짜는 최신값으로 덮어씀. */
export async function upsertFares(inputs: FareInput[]): Promise<FlightFare[]> {
  const now = nowIso();
  const rows = inputs.map<FlightFare>((f) => ({
    id: fareKey(f.flightNo, f.date),
    airline: f.airline ?? f.flightNo.replace(/\d+$/, ""),
    flightNo: f.flightNo,
    origin: f.origin,
    destination: f.destination,
    date: f.date,
    fareKrw: f.fareKrw ?? null,
    status: f.status ?? (f.fareKrw == null ? "unknown" : "ok"),
    source: f.source ?? "manual",
    capturedAt: f.capturedAt ?? now,
    meta: f.meta,
  }));
  await fares().upsertMany(rows);
  return rows;
}

export async function fareMap(): Promise<Map<string, FlightFare>> {
  return new Map((await fares().list()).map((f) => [f.id, f]));
}

export async function listFares(q: { flightNo?: string; from?: string; to?: string } = {}) {
  return (await fares().list())
    .filter((f) => (!q.flightNo || f.flightNo === q.flightNo) && (!q.from || f.date >= q.from) && (!q.to || f.date <= q.to))
    .sort((a, b) => a.date.localeCompare(b.date) || a.flightNo.localeCompare(b.flightNo));
}

export async function createFareRequest(input: Pick<FareRequest, "flights" | "from" | "to"> & Partial<Pick<FareRequest, "productId" | "note">>) {
  const req: FareRequest = { id: newId("freq"), status: "pending", createdAt: nowIso(), ...input };
  return fareRequests().upsert(req);
}

export async function updateFareRequest(id: string, patch: Partial<FareRequest>) {
  const cur = await fareRequests().get(id);
  if (!cur) return null;
  return fareRequests().upsert({ ...cur, ...patch, id });
}
