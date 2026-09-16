import { collection, nowIso, readDoc, writeDoc } from "@/lib/store/collection";
import { allFields, collectionById, type CollectionDef } from "./schema";

export type CmsItem = { id: string; [k: string]: unknown };
export const cmsStore = (c: CollectionDef) => collection<CmsItem>(`cms-${c.id}`);

const nowLocal = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 19).replace("T", " ");

export async function listItems(c: CollectionDef, q: { search?: string; status?: string } = {}) {
  let items = await cmsStore(c).list();
  if (q.search) { const s = q.search.toLowerCase(); items = items.filter((it) => c.searchFields.some((f) => String(it[f] ?? "").toLowerCase().includes(s))); }
  if (q.status && c.statusField) items = items.filter((it) => String(it[c.statusField!]) === q.status);
  const sb = c.sortBy;
  if (sb) items.sort((a, b) => { const x = a[sb.key] as string | number | undefined, y = b[sb.key] as string | number | undefined; const r = x == null ? 1 : y == null ? -1 : x < y ? -1 : x > y ? 1 : 0; return sb.dir === "asc" ? r : -r; });
  return items;
}

export async function nextId(c: CollectionDef) {
  const items = await cmsStore(c).list();
  return String(items.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0) + 1);
}

/** 폼 입력(문자열 위주)을 필드 타입에 맞게 정규화 */
export function normalize(c: CollectionDef, input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };
  for (const f of allFields(c)) {
    const v = input[f.name];
    if (v === undefined) continue;
    switch (f.type) {
      case "number": out[f.name] = v === "" || v === null ? null : Number(v); break;
      case "boolean": out[f.name] = v === true || v === "true" || v === "1" || v === 1 || v === "on"; break;
      case "list": out[f.name] = Array.isArray(v) ? v : String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean); break;
      case "json": if (typeof v === "string") { try { out[f.name] = v.trim() ? JSON.parse(v) : null; } catch { throw new Error(`${f.label}: JSON 형식 오류`); } } break;
      default: out[f.name] = v == null ? "" : v;
    }
  }
  return out;
}

export async function createItem(cid: string, input: Record<string, unknown>) {
  const c = collectionById(cid); if (!c) return null;
  const item: CmsItem = { ...(c.defaults ?? {}), ...normalize(c, input), id: String(input.id || (await nextId(c))), created_at: nowLocal(), updated_at: nowLocal() };
  return cmsStore(c).upsert(item);
}
export async function updateItem(cid: string, id: string, input: Record<string, unknown>) {
  const c = collectionById(cid); if (!c) return null;
  const cur = await cmsStore(c).get(id); if (!cur) return null;
  return cmsStore(c).upsert({ ...cur, ...normalize(c, input), id, updated_at: nowLocal() });
}
export async function removeItem(cid: string, id: string) { const c = collectionById(cid); if (!c) return false; await cmsStore(c).remove(id); return true; }

export const getSiteSettings = () => readDoc<Record<string, unknown>>("cms-settings", {});
export async function saveSiteSettings(patch: Record<string, unknown>) { const cur = await getSiteSettings(); return writeDoc("cms-settings", { ...cur, ...patch, updated_at: nowIso() }); }
