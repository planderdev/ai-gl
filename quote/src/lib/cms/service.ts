import { blobReadJson, blobWriteJson } from "@/lib/store/blob-collection";
import { collection, isBlobEnabled, nowIso, readDoc, recordCollection, writeDoc } from "@/lib/store/collection";
import { allFields, collectionById, type CollectionDef } from "./schema";

export type CmsItem = { id: string; [k: string]: unknown };
export const cmsStore = (c: CollectionDef) => (c.perRecord ? recordCollection<CmsItem> : collection<CmsItem>)(`cms-${c.id}`);

export const nowLocal = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 19).replace("T", " ");

/** 코드로 정의한 기본 항목(seedItems)은 스토어에 없어도 목록·상세에 보인다. 관리자에서 저장하면 스토어 값이 우선한다 */
const seedsOf = (c: CollectionDef) => (c.seedItems ?? []) as CmsItem[];
export const isSeedItem = (c: CollectionDef, id: string) => seedsOf(c).some((s) => s.id === id);
/**
 * 건별 저장(perRecord)으로 바꾸기 전 단일 파일(Blob)에 남아 있는 항목. 로컬 파일 스토어는 같은 파일을 쓰므로 해당 없다.
 * 건별 저장분이 우선하고, 관리자에서 저장하면 건별로 옮겨진다
 */
const legacyCache = new Map<string, { at: number; items: CmsItem[] }>();
async function legacyItems(c: CollectionDef): Promise<CmsItem[]> {
  if (!c.perRecord || !c.legacySingle || !isBlobEnabled()) return [];
  const hit = legacyCache.get(c.id);
  if (hit && Date.now() - hit.at < 30_000) return hit.items;
  const items = (await blobReadJson<CmsItem[]>(`cms-${c.id}`).catch(() => null)) ?? [];
  legacyCache.set(c.id, { at: Date.now(), items });
  return items;
}
export async function getItem(c: CollectionDef, id: string) {
  return (await cmsStore(c).get(id)) ?? (await legacyItems(c)).find((s) => s.id === id) ?? seedsOf(c).find((s) => s.id === id) ?? null;
}

export async function listItems(c: CollectionDef, q: { search?: string; status?: string } = {}) {
  const stored = await cmsStore(c).list();
  const ids = new Set(stored.map((it) => it.id));
  for (const it of await legacyItems(c)) if (!ids.has(it.id)) { stored.push(it); ids.add(it.id); }
  let items = [...stored, ...seedsOf(c).filter((s) => !ids.has(s.id))];
  if (q.search) { const s = q.search.toLowerCase(); items = items.filter((it) => c.searchFields.some((f) => String(it[f] ?? "").toLowerCase().includes(s))); }
  if (q.status && c.statusField) items = items.filter((it) => String(it[c.statusField!]) === q.status);
  const sb = c.sortBy;
  if (sb) items.sort((a, b) => { const x = a[sb.key] as string | number | undefined, y = b[sb.key] as string | number | undefined; const r = x == null ? 1 : y == null ? -1 : x < y ? -1 : x > y ? 1 : 0; return sb.dir === "asc" ? r : -r; });
  return items;
}

export async function nextId(c: CollectionDef) {
  const items = [...(await cmsStore(c).list()), ...(await legacyItems(c))];
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
  const cur = await getItem(c, id); if (!cur) return null;
  return cmsStore(c).upsert({ ...cur, ...normalize(c, input), id, updated_at: nowLocal() });
}
export async function removeItem(cid: string, id: string) {
  const c = collectionById(cid); if (!c) return false;
  await cmsStore(c).remove(id);
  const legacy = await legacyItems(c);
  if (legacy.some((it) => it.id === id)) { await blobWriteJson(`cms-${c.id}`, legacy.filter((it) => it.id !== id)); legacyCache.delete(c.id); }
  return true;
}

export const getSiteSettings = () => readDoc<Record<string, unknown>>("cms-settings", {});
export async function saveSiteSettings(patch: Record<string, unknown>) { const cur = await getSiteSettings(); return writeDoc("cms-settings", { ...cur, ...patch, updated_at: nowIso() }); }
