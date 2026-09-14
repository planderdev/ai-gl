import { handle, json, parseBody } from "@/lib/api";
import { vehicleRules } from "@/lib/masters/service";
import { vehicleRuleSchema } from "@/lib/schemas";
import { newId, nowIso } from "@/lib/store/collection";

export const GET = handle(async () => json({ items: (await vehicleRules().list()).sort((a, b) => a.name.localeCompare(b.name, "ko")) }));
/** POST = 생성 또는 수정(id 포함 시) */
export const POST = handle(async (req: Request) => {
  const r = await parseBody(req, vehicleRuleSchema);
  if ("error" in r) return r.error;
  const item = { ...r.data, id: r.data.id ?? newId("veh"), updatedAt: nowIso() };
  await vehicleRules().upsert(item);
  return json(item, { status: 201 });
});
