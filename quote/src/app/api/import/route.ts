import { fail, handle, json } from "@/lib/api";
import { importCostWorkbook, type ImportResult } from "@/lib/excel/import";
import { InputIssues } from "@/lib/excel/input-import";
import { fares } from "@/lib/fares/service";
import { getSettings, golfCourses, hotels, saveSettings, vehicleRules } from "@/lib/masters/service";
import { productGroups, products } from "@/lib/products/service";

/**
 * POST multipart/form-data { file: .xlsx, region? } — 원가표 입력표 또는 기존 원가표를 상품군·원가표·단가·운임으로 가져오기.
 * 입력표에 고칠 곳이 있으면 422 { error, log: [고칠 곳…] } 을 돌려주고 아무것도 저장하지 않는다.
 */
export const POST = handle(async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("file 필드(.xlsx)가 필요합니다");
  const [settings, h, g, v, groups, prods] = await Promise.all([getSettings(), hotels().list(), golfCourses().list(), vehicleRules().list(), productGroups().list(), products().list()]);
  let res: ImportResult;
  try {
    res = await importCostWorkbook(Buffer.from(await file.arrayBuffer()), { region: (form.get("region") as string) || undefined, holidays: settings.holidays, fileName: file.name, existing: { hotels: h, courses: g, vehicles: v, groups, products: prods } });
  } catch (e) {
    if (e instanceof InputIssues) return fail(`${e.message} (${e.issues.length}곳) — 저장된 것은 없습니다`, 422, { log: e.issues });
    throw e;
  }
  // 기존 원가표 파일: 이미 있는 상품군은 이름·정렬 등 사람이 고친 값을 지키고 파일명만 갱신. 입력표: 파일 내용대로 고친다
  const known = new Map(groups.map((x) => [x.id, x]));
  await productGroups().upsertMany(res.groups.map((x) => (res.kind === "sheet" && known.has(x.id) ? { ...known.get(x.id)!, fileName: x.fileName ?? known.get(x.id)!.fileName, updatedAt: x.updatedAt } : x)));
  await hotels().upsertMany(res.hotels);
  await vehicleRules().upsertMany(res.vehicles);
  await golfCourses().upsertMany(res.courses);
  await products().upsertMany(res.products);
  await fares().upsertMany(res.fares);
  // 가장 최근 원가표의 환율·마진을 새 원가표 기본값으로 삼는다(이미 있는 원가표는 각자 값을 유지)
  if (!(form.get("keepSettings") as string)) { await saveSettings({ exchangeRate: res.exchangeRate, margins: res.margins }); res.log.push(`새 원가표 기본값을 환율 ${res.exchangeRate} · 마진 ${res.margins.map((m) => `${Math.round(m * 100)}%`).join("/")} 로 맞춤`); }
  return json({ ok: true, log: res.log, groups: res.groups.map((x) => ({ id: x.id, name: x.name })), products: res.products.map((p) => ({ id: p.id, name: p.name })), fares: res.fares.length });
});
