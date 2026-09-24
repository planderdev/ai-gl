import type { VehicleFare } from "@/types";
import { collection } from "@/lib/store/collection";
import { crawlMk, MK_CITIES } from "@/lib/crawler/mk-taxi";

export const vehicleFares = () => collection<VehicleFare>("vehicle-fares");

export interface VehicleProvider { id: string; label: string; crawl(): Promise<{ fares: VehicleFare[]; sections: string[] }> }
export const VEHICLE_PROVIDERS: VehicleProvider[] = MK_CITIES.map((c) => ({ id: `mk-${c.slug}`, label: `MK택시 ${c.label} 공항 송영`, crawl: () => crawlMk(c) }));
export const vehicleProviderById = (id: string) => VEHICLE_PROVIDERS.find((p) => p.id === id);

/** 공급자 단위로 교체 저장(사라진 행은 제거) */
export async function replaceProviderFares(providerId: string, fares: VehicleFare[]) {
  const store = vehicleFares();
  const others = (await store.list()).filter((f) => f.provider !== providerId);
  await store.replaceAll([...others, ...fares]);
  return fares.length;
}
export async function listVehicleFares(providerId?: string) {
  const all = await vehicleFares().list();
  return (providerId ? all.filter((f) => f.provider === providerId) : all).sort((a, b) => a.provider.localeCompare(b.provider) || a.section.localeCompare(b.section) || a.route.localeCompare(b.route));
}
