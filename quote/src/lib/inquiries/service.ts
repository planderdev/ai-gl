import type { Inquiry, InquiryStatus } from "@/types";
import { collection, newId, nowIso, recordCollection } from "@/lib/store/collection";
import type { CmsItem } from "@/lib/cms/service";
import { nowLocal } from "@/lib/cms/service";
import { matchKeyOf } from "./parse";

/**
 * 문의관리 저장소.
 * - 관리 문의(엑셀에서 가져온 것·직접 등록): 컬렉션 `inquiries` — 한 파일이라 수백 건도 한 번에 읽는다.
 * - 홈페이지 상담 폼(/sgl): `cms-inquiries` — 공개 폼이 동시에 쓰므로 건별 저장. 여기서는 읽어서 같은 모양으로 합치고, 고치면 그쪽에 다시 쓴다.
 */
const managed = () => collection<Inquiry>("inquiries");
const web = () => recordCollection<CmsItem>("cms-inquiries");

const s = (v: unknown) => (v == null ? "" : String(v));
const STATUS_IN: Record<string, InquiryStatus> = { new: "new", in_progress: "in_progress", confirmed: "confirmed", closed: "closed", done: "closed" };
/** 상담 폼 접수분 → 문의 한 건 */
function fromWeb(it: CmsItem): Inquiry {
  const created = s(it.created_at);
  return {
    id: it.id, channel: "web", receivedDate: created.slice(0, 10), name: s(it.name), phone: s(it.phone) || undefined,
    departText: s(it.depart_text), departDate: s(it.depart_date) || undefined, productText: s(it.product_title), route: s(it.region),
    people: typeof it.people === "number" ? it.people : null, status: STATUS_IN[s(it.status)] ?? "new",
    confirmText: s(it.confirm_text) || undefined, revisit: it.revisit === true || undefined, memo: s(it.admin_memo), message: s(it.message) || undefined,
    source: "sgl-web", createdAt: created, updatedAt: s(it.updated_at) || created,
  };
}
/** 문의에서 고친 값 → 상담 폼 접수분의 칸 */
function toWebPatch(p: Partial<Inquiry>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.phone !== undefined) o.phone = p.phone ?? "";
  if (p.departText !== undefined) o.depart_text = p.departText;
  if (p.departDate !== undefined) o.depart_date = p.departDate ?? "";
  if (p.productText !== undefined) o.product_title = p.productText;
  if (p.route !== undefined) o.region = p.route;
  if (p.people !== undefined) o.people = p.people;
  if (p.status !== undefined) o.status = p.status;
  if (p.confirmText !== undefined) o.confirm_text = p.confirmText ?? "";
  if (p.revisit !== undefined) o.revisit = !!p.revisit;
  if (p.memo !== undefined) o.admin_memo = p.memo;
  return o;
}

/** 최근 접수순(접수일 모르는 것은 뒤로). 같은 날은 엑셀의 아래 줄(나중에 적은 것)이 먼저 */
const byRecent = (a: Inquiry, b: Inquiry) => (b.receivedDate || "").localeCompare(a.receivedDate || "") || (b.sheetRow ?? 0) - (a.sheetRow ?? 0) || b.createdAt.localeCompare(a.createdAt);

export async function listInquiries(): Promise<Inquiry[]> {
  const [a, b] = await Promise.all([managed().list(), web().list().catch((e) => { console.error("[inquiries] 상담 폼 접수분을 읽지 못했습니다", e); return [] as CmsItem[]; })]);
  return [...a, ...b.map(fromWeb)].sort(byRecent);
}
export async function getInquiry(id: string): Promise<Inquiry | null> {
  const hit = await managed().get(id);
  if (hit) return hit;
  const w = await web().get(id).catch(() => null);
  return w ? fromWeb(w) : null;
}

export type InquiryInput = Pick<Inquiry, "name"> & Partial<Omit<Inquiry, "id" | "createdAt" | "updatedAt" | "name">>;
export async function createInquiry(input: InquiryInput): Promise<Inquiry> {
  const now = nowIso();
  const item: Inquiry = {
    id: newId("inq"), channel: input.channel ?? "etc", receivedDate: input.receivedDate ?? "", name: input.name, departText: input.departText ?? "", productText: input.productText ?? "", route: input.route ?? "",
    status: input.status ?? "new", memo: input.memo ?? "", source: input.source ?? "manual", createdAt: now, updatedAt: now,
    ...tidy({ phone: input.phone, departDate: input.departDate, people: input.people, confirmText: input.confirmText, revisit: input.revisit, message: input.message, extraChannels: input.extraChannels }),
  };
  return managed().upsert(item);
}
/** 빈 문자열·null·false 인 선택 칸은 저장하지 않는다 */
function tidy<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => !(v == null || v === "" || v === false || (Array.isArray(v) && !v.length)))) as Partial<T>;
}

export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<Inquiry | null> {
  const cur = await managed().get(id);
  if (cur) {
    const next = { ...cur, ...patch, id, createdAt: cur.createdAt, updatedAt: nowIso() } as Record<string, unknown>;
    for (const k of ["phone", "departDate", "people", "confirmText", "revisit", "message", "extraChannels"]) { const v = next[k]; if (v == null || v === "" || v === false || (Array.isArray(v) && !v.length)) delete next[k]; }
    return managed().upsert(next as unknown as Inquiry);
  }
  const w = await web().get(id).catch(() => null);
  if (!w) return null;
  const saved = await web().upsert({ ...w, ...toWebPatch(patch), id, updated_at: nowLocal() });
  return fromWeb(saved);
}
export async function removeInquiry(id: string): Promise<boolean> {
  if (await managed().get(id)) { await managed().remove(id); return true; }
  if (await web().get(id).catch(() => null)) { await web().remove(id); return true; }
  return false;
}

export interface ImportSummary { added: number; updated: number; skipped: number }
/**
 * 엑셀에서 읽은 문의를 합친다. 이름·채널·접수일이 같은 문의가 이미 있으면 같은 것으로 본다(같은 열쇠가 여러 건이면 순서대로 짝짓는다).
 * 이미 있는 문의는 기본으로 건너뛰고, overwrite 면 엑셀의 내용(출발날짜·상품·지역·확정·비고)으로 고친다. 시스템에서 바꾼 상태는 확정이 아닌 한 지킨다.
 */
export async function mergeInquiries(rows: Inquiry[], overwrite: boolean): Promise<ImportSummary> {
  const existing = await managed().list();
  const pool = new Map<string, Inquiry[]>();
  for (const q of [...existing].sort((a, b) => (a.sheetRow ?? 1e9) - (b.sheetRow ?? 1e9) || a.createdAt.localeCompare(b.createdAt))) { const k = matchKeyOf(q); pool.set(k, [...(pool.get(k) ?? []), q]); }
  const out: Inquiry[] = [];
  const sum: ImportSummary = { added: 0, updated: 0, skipped: 0 };
  const ids = new Set(existing.map((q) => q.id));
  for (const row of rows) {
    const cur = pool.get(matchKeyOf(row))?.shift();
    if (!cur) { let id = row.id; while (ids.has(id)) id = `${row.id}-${Math.random().toString(36).slice(2, 5)}`; ids.add(id); out.push({ ...row, id }); sum.added++; continue; }
    if (!overwrite) { sum.skipped++; continue; }
    const next: Inquiry = { ...cur, departText: row.departText, productText: row.productText, route: row.route, memo: row.memo, sheetRow: row.sheetRow, extraChannels: row.extraChannels, confirmText: row.confirmText, revisit: row.revisit, status: row.status === "confirmed" ? "confirmed" : cur.status, updatedAt: row.updatedAt };
    const same = (["departText", "productText", "route", "memo", "confirmText", "revisit", "status", "sheetRow"] as const).every((k) => (cur[k] ?? "") === (next[k] ?? "")) && JSON.stringify(cur.extraChannels ?? []) === JSON.stringify(next.extraChannels ?? []);
    if (same) { sum.skipped++; continue; }
    out.push(tidyInquiry(next)); sum.updated++;
  }
  if (out.length) await managed().upsertMany(out);
  return sum;
}
const tidyInquiry = (q: Inquiry): Inquiry => { const o = { ...q } as Record<string, unknown>; for (const k of ["phone", "departDate", "people", "confirmText", "revisit", "message", "extraChannels"]) { const v = o[k]; if (v == null || v === "" || v === false || (Array.isArray(v) && !v.length)) delete o[k]; } return o as unknown as Inquiry; };
