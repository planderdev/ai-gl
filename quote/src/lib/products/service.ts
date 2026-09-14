import type { Product, QuoteContext } from "@/types";
import { collection, newId, nowIso } from "@/lib/store/collection";
import { golfCourses, getSettings, hotels, vehicleRules } from "@/lib/masters/service";
import { fareMap } from "@/lib/fares/service";
import { computeQuote, missingFares } from "@/lib/pricing/engine";

export const products = () => collection<Product>("products");

export async function buildContext(p: Product): Promise<QuoteContext> {
  const [hotel, allCourses, vehicle, settings, fares] = await Promise.all([
    hotels().get(p.hotelId),
    golfCourses().list(),
    vehicleRules().get(p.vehicleRuleId),
    getSettings(),
    fareMap(),
  ]);
  const byId = new Map(allCourses.map((c) => [c.id, c]));
  const courses = p.golfCourseIds.map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => !!c);
  return { hotel, courses, vehicle, holidays: new Set(settings.holidays), fares };
}

export async function quoteProduct(id: string) {
  const p = await products().get(id);
  if (!p) return null;
  const ctx = await buildContext(p);
  return { product: p, ctx, rows: computeQuote(p, ctx), missing: missingFares(p, ctx) };
}

export async function createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Product, "id">>) {
  const now = nowIso();
  const p: Product = { ...input, id: input.id ?? newId("prd"), createdAt: now, updatedAt: now };
  return products().upsert(p);
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const cur = await products().get(id);
  if (!cur) return null;
  return products().upsert({ ...cur, ...patch, id, createdAt: cur.createdAt, updatedAt: nowIso() });
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
