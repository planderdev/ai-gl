import type { Product, ProductGroup, QuoteContext } from "@/types";
import { collection, newId, nowIso } from "@/lib/store/collection";
import { golfCourses, getSettings, hotels, vehicleRules } from "@/lib/masters/service";
import { fareMap } from "@/lib/fares/service";
import { buildRouteIndex, computeQuote, missingFares, staysOf } from "@/lib/pricing/engine";
import { airlineName } from "@/lib/format";

export const products = () => collection<Product>("products");
/** 상위 상품(상품군) — 원가표 파일 단위 */
export const productGroups = () => collection<ProductGroup>("product-groups");

export async function buildContext(p: Product): Promise<QuoteContext> {
  const [allHotels, allCourses, vehicle, settings, fares] = await Promise.all([
    hotels().list(),
    golfCourses().list(),
    vehicleRules().get(p.vehicleRuleId),
    getSettings(),
    fareMap(),
  ]);
  const byId = new Map(allCourses.map((c) => [c.id, c]));
  const courses = p.golfCourseIds.map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => !!c);
  const stayIds = new Set(staysOf(p).map((s) => s.hotelId));
  const hotelsById = new Map(allHotels.filter((h) => stayIds.has(h.id)).map((h) => [h.id, h]));
  const hotel = hotelsById.get(p.hotelId) ?? allHotels.find((h) => h.id === p.hotelId) ?? null;
  return { hotel, hotelsById, courses, vehicle, holidays: new Set(settings.holidays), fares, routeFares: buildRouteIndex(fares.values()) };
}

export async function upsertGroup(input: Omit<ProductGroup, "id" | "createdAt" | "updatedAt"> & Partial<Pick<ProductGroup, "id">>) {
  const now = nowIso();
  const cur = input.id ? await productGroups().get(input.id) : null;
  return productGroups().upsert({ ...(cur ?? {}), ...input, id: input.id ?? newId("grp"), createdAt: cur?.createdAt ?? now, updatedAt: now } as ProductGroup);
}

export async function quoteProduct(id: string) {
  const p = await products().get(id);
  if (!p) return null;
  const ctx = await buildContext(p);
  return { product: p, ctx, rows: computeQuote(p, ctx), missing: missingFares(p, ctx) };
}

/** 비운 선택 항목(빈 문자열·null·빈 배열)은 저장하지 않는다 → 화면에서 값을 지우면 기본 동작으로 돌아간다 */
function tidy(p: Product): Product {
  const o = { ...p } as Record<string, unknown>;
  for (const k of ["groupId", "hotelLabel", "golfLabel", "note", "legend", "paxBasis", "saleType"]) if (o[k] === "" || o[k] == null) delete o[k];
  for (const k of ["stays", "golfStyles", "extras"]) if (Array.isArray(o[k]) && !(o[k] as unknown[]).length) delete o[k];
  return o as unknown as Product;
}

export async function createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Product, "id">>) {
  const now = nowIso();
  const p: Product = { ...input, id: input.id ?? newId("prd"), createdAt: now, updatedAt: now };
  return products().upsert(tidy(p));
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const cur = await products().get(id);
  if (!cur) return null;
  return products().upsert(tidy({ ...cur, ...patch, id, createdAt: cur.createdAt, updatedAt: nowIso() }));
}

/** 날짜별 수동 조정 병합(undefined/null 값은 해당 키 제거) */
export async function patchOverride(id: string, date: string, patch: Record<string, unknown>) {
  const cur = await products().get(id);
  if (!cur) return null;
  const next = { ...(cur.overrides[date] ?? {}) } as Record<string, unknown>;
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") delete next[k];
    else next[k] = v;
  }
  const overrides = { ...cur.overrides };
  if (Object.keys(next).length) overrides[date] = next as Product["overrides"][string];
  else delete overrides[date];
  return products().upsert({ ...cur, overrides, updatedAt: nowIso() });
}

/** 엑셀 시트 한 장에 필요한 입력(상품·계산 행·호텔·골프장·상품군) */
export async function sheetInput(id: string) {
  const q = await quoteProduct(id);
  if (!q) return null;
  const group = q.product.groupId ? await productGroups().get(q.product.groupId) : null;
  return { product: q.product, rows: q.rows, hotel: q.ctx.hotel, hotels: [...(q.ctx.hotelsById?.values() ?? [])], courses: q.ctx.courses, group };
}

/** 상품군 삭제: 하위 원가표는 지우지 않고 미분류로 돌린다 */
export async function removeGroup(id: string) {
  const children = (await products().list()).filter((p) => p.groupId === id);
  if (children.length) await products().upsertMany(children.map((p) => ({ ...p, groupId: undefined, updatedAt: nowIso() })));
  await productGroups().remove(id);
  return children.length;
}

/** 상품군 안에서 원가표를 늘어놓는 순서: 박수 → 홀수 → 이름 */
export const sortSheets = (list: Product[]) => [...list].sort((a, b) => a.nights - b.nights || a.golfPlan.reduce((x, y) => x + y, 0) - b.golfPlan.reduce((x, y) => x + y, 0) || a.name.localeCompare(b.name, "ko"));

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
/**
 * 상품군이 없는 원가표를 지역·호텔·항공편이 같은 것끼리 묶어 상품군을 만든다(원가표 파일 한 개에 해당하는 단위).
 * 상품군 id 는 엑셀 가져오기와 같은 규칙(grp-이름-항공사)이라 같은 파일을 다시 가져와도 같은 상품군에 붙는다.
 */
export async function autoGroup() {
  const [all, groups] = await Promise.all([products().list(), productGroups().list()]);
  const known = new Map(groups.map((g) => [g.id, g]));
  const loose = all.filter((p) => !p.groupId || !known.has(p.groupId));
  const buckets = new Map<string, Product[]>();
  for (const p of loose) { const k = [p.region, staysOf(p).map((s) => s.hotelId).join("+"), p.outbound.flightNo, p.inbound.flightNo, p.saleType ?? "air"].join("|"); buckets.set(k, [...(buckets.get(k) ?? []), p]); }
  const created: ProductGroup[] = [];
  const now = nowIso();
  for (const items of buckets.values()) {
    const p0 = items[0];
    const base = p0.name.replace(/\s*\d+박.*$/, "").trim() || p0.name;
    const flights = `${p0.outbound.flightNo}/${p0.inbound.flightNo.startsWith(p0.airline) ? p0.inbound.flightNo.slice(p0.airline.length) : p0.inbound.flightNo}`;
    const id = `grp-${slug(`${base} ${p0.airline}`)}`;
    const group: ProductGroup = known.get(id) ?? { id, name: `${base} (${airlineName(p0.airline)} ${flights})`, country: "일본", region: p0.region, airline: p0.airline, createdAt: now, updatedAt: now };
    if (!known.has(id)) { known.set(id, group); created.push(group); }
    for (const p of items) p.groupId = id;
  }
  if (created.length) await productGroups().upsertMany(created);
  if (loose.length) await products().upsertMany(loose.map((p) => ({ ...p, updatedAt: now })));
  return { groups: created, assigned: loose.length };
}
