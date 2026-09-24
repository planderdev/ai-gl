import { handle, json } from "@/lib/api";
import { listVehicleFares, VEHICLE_PROVIDERS } from "@/lib/vehicles/service";

/** GET /api/vehicle-fares?provider=mk-tokyo */
export const GET = handle(async (req: Request) => {
  const provider = new URL(req.url).searchParams.get("provider") ?? undefined;
  const items = await listVehicleFares(provider);
  return json({ items, providers: VEHICLE_PROVIDERS.map((p) => ({ id: p.id, label: p.label })), count: items.length });
});
