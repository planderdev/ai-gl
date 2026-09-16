"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CollectionDef, FieldDef, SectionDef } from "@/lib/cms/schema";

type Rec = Record<string, unknown>;
const toInput = (f: FieldDef, v: unknown): string => {
  if (v == null) return "";
  if (f.type === "list") return Array.isArray(v) ? v.join("\n") : String(v);
  if (f.type === "json") return typeof v === "string" ? v : JSON.stringify(v, null, 2);
  if (f.type === "datetime") return String(v).replace(" ", "T").slice(0, 16);
  if (f.type === "date") return String(v).slice(0, 10);
  return String(v);
};

/** 섹션·필드 정의로 폼을 그리는 공용 에디터 (컬렉션 문서 / 설정 탭 공용) */
export function FieldGrid({ sections, value, onChange }: { sections: SectionDef[]; value: Rec; onChange: (k: string, v: unknown) => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <>
      {sections.map((s) => (
        <section key={s.title} className="admin-card">
          <div className="admin-card__head"><h3>{s.title}</h3>{s.fields.some((f) => f.type === "password") && <button type="button" className="admin-btn admin-btn--light admin-btn--xs" onClick={() => setShowPw(!showPw)}>{showPw ? "값 숨기기" : "값 보기"}</button>}</div>
          <div className="admin-card__body grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {s.fields.map((f) => {
              const v = value[f.name];
              const cls = f.full || ["textarea", "html", "list", "json"].includes(f.type) ? "md:col-span-2 xl:col-span-3" : "";
              return (
                <label key={f.name} className={`block text-sm ${cls}`}>
                  <span className="admin-label mb-1 block">{f.label}</span>
                  {f.type === "boolean" ? (
                    <span className="inline-flex items-center gap-2"><input type="checkbox" checked={v === true || v === 1 || v === "1"} onChange={(e) => onChange(f.name, e.target.checked)} /> <span className="text-[var(--admin-text-muted)]">{v === true || v === 1 || v === "1" ? "사용" : "미사용"}</span></span>
                  ) : f.type === "select" ? (
                    <>
                      <input list={`opts-${f.name}`} value={toInput(f, v)} onChange={(e) => onChange(f.name, e.target.value)} className="w-full" placeholder="선택 또는 입력" />
                      <datalist id={`opts-${f.name}`}>{f.options?.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}</datalist>
                      {f.options && <span className="admin-help mt-0.5 block">{f.options.map(([val, lab]) => `${val}=${lab}`).join(" · ")}</span>}
                    </>
                  ) : ["textarea", "html", "list", "json"].includes(f.type) ? (
                    <textarea rows={f.type === "json" ? 6 : f.type === "html" ? 8 : 4} value={toInput(f, v)} onChange={(e) => onChange(f.name, e.target.value)} className={`w-full ${f.type === "json" ? "font-mono text-xs" : ""}`} />
                  ) : (
                    <input type={f.type === "password" && !showPw ? "password" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"} value={toInput(f, v)} onChange={(e) => onChange(f.name, e.target.value)} className="w-full" readOnly={f.readonly} />
                  )}
                  {f.help && f.type !== "select" && <span className="admin-help mt-0.5 block">{f.help}</span>}
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export default function CmsForm({ collection, item }: { collection: CollectionDef; item: Rec | null }) {
  const router = useRouter();
  const [value, setValue] = useState<Rec>(item ?? { ...(collection.defaults ?? {}) });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const isNew = !item;
  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch(isNew ? `/api/cms/${collection.id}` : `/api/cms/${collection.id}/${encodeURIComponent(String(item!.id))}`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(`저장 실패: ${j.error ?? res.statusText}`); return; }
    setMsg("저장됨");
    if (isNew) router.push(`/cms/${collection.id}/${encodeURIComponent(String(j.id))}`);
    router.refresh();
  }
  async function remove() {
    if (!item || !confirm(`${collection.singular}을(를) 삭제할까요?`)) return;
    await fetch(`/api/cms/${collection.id}/${encodeURIComponent(String(item.id))}`, { method: "DELETE" });
    router.push(`/cms/${collection.id}`); router.refresh();
  }
  return (
    <div className="space-y-4">
      <FieldGrid sections={collection.sections} value={value} onChange={(k, v) => setValue((s) => ({ ...s, [k]: v }))} />
      <div className="sticky bottom-0 flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white/90 p-3 backdrop-blur">
        <button className="admin-btn admin-btn--primary" disabled={busy} onClick={save}><i className="ri-save-3-line" /> {isNew ? `${collection.singular} 등록` : "저장"}</button>
        {!isNew && <button className="admin-btn admin-btn--danger" disabled={busy} onClick={remove}><i className="ri-delete-bin-6-line" /> 삭제</button>}
        {msg && <span className="text-sm text-[var(--admin-text-muted)]">{msg}</span>}
        {!isNew && <span className="ml-auto text-xs text-[var(--admin-text-soft)]">ID {String(item!.id)} · 수정 {String(item!.updated_at ?? "-")}</span>}
      </div>
    </div>
  );
}
