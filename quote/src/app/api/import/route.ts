import { fail, handle, json } from "@/lib/api";
import { importCostWorkbook } from "@/lib/excel/import";
import { fares } from "@/lib/fares/service";
import { getSettings, golfCourses, hotels, saveSettings, vehicleRules } from "@/lib/masters/service";
import { products } from "@/lib/products/service";

/** POST multipart/form-data { file: .xlsx, region? } — 기존 원가표를 상품/운임/마스터로 가져오기 */
export const POST = handle(async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("file 필드(.xlsx)가 필요합니다");
  const settings = await getSettings();
  const res = await importCostWorkbook(Buffer.from(await file.arrayBuffer()), { region: (form.get("region") as string) || undefined, holidays: settings.holidays });
  await hotels().upsert(res.hotel);
  await vehicleRules().upsert(res.vehicle);
  await golfCourses().upsertMany(res.courses);
  await products().upsertMany(res.products);
  await fares().upsertMany(res.fares);
  await saveSettings({ exchangeRate: res.exchangeRate, margins: res.margins });
  return json({ ok: true, log: res.log, products: res.products.map((p) => ({ id: p.id, name: p.name })), fares: res.fares.length });
});
