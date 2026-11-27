"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Inquiry, InquiryChannel, InquiryStatus } from "@/types";
import { CHANNEL_LABEL, CHANNELS, STATUS_LABEL, STATUSES, mdLabel, type InquiryView } from "@/lib/inquiries/parse";
import { dayOf, isMonth, tripDateOf, tripMonthOf, weekdayOf, type CalendarBasis } from "@/lib/inquiries/calendar";
import InquiryCalendar, { NO_DAY, Segmented } from "./InquiryCalendar";

/** 문의관리 화면: 요약(채널·목적지·출발 달) + 달력(문의일·출발일 기준) + 조건 + 목록 + 등록/수정/엑셀 가져오기 */
type Filters = { q: string; channel: string; status: string; origin: string; dest: string; depart: string; received: string };
const NONE: Filters = { q: "", channel: "", status: "", origin: "", dest: "", depart: "", received: "" };
/** 달력에서 고른 날(달은 Filters 의 depart·received 로 넘긴다). NO_DAY 는 날짜 없이 달만 적힌 문의 */
type DaySel = { basis: CalendarBasis; day: string } | null;
function match(q: InquiryView, x: Filters, sel: DaySel): boolean {
  if (x.channel && q.channel !== x.channel) return false;
  if (x.status && q.status !== x.status) return false;
  if (x.origin && !q.origins.includes(x.origin)) return false;
  if (x.dest && !q.destinations.includes(x.dest)) return false;
  if (x.depart) { const m = tripMonthOf(q); if (x.depart === "none" ? !!m : m !== x.depart) return false; }
  if (x.received && (x.received === "none" ? !!q.receivedDate : q.receivedDate.slice(0, 7) !== x.received)) return false;
  if (sel?.day) { const d = dayOf(q, sel.basis); if (sel.day === NO_DAY ? !!d : d !== sel.day) return false; }
  if (x.q) { const s = x.q.trim().toLowerCase(); if (s && ![q.name, q.productText, q.route, q.memo, q.confirmText ?? "", q.departText, q.phone ?? "", q.message ?? ""].some((v) => v.toLowerCase().includes(s))) return false; }
  return true;
}
/** 출발일이 이른 순(날짜를 모르는 문의는 뒤) */
const byTrip = (a: InquiryView, b: InquiryView) => (tripDateOf(a) || "9999").localeCompare(tripDateOf(b) || "9999");
const STATUS_CHIP: Record<InquiryStatus, string> = { new: "admin-chip", in_progress: "admin-chip admin-chip--warning", confirmed: "admin-chip admin-chip--success", closed: "admin-chip admin-chip--gray" };
const PAGE = 100;
const monthLabel = (ym: string) => `${ym.slice(2, 4)}년 ${Number(ym.slice(5, 7))}월`;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/** 표 안의 가로 막대 한 줄: 이름 · 건수 막대 · 확정 수. 누르면 그 조건으로 좁힌다 */
function BarRow({ label, count, max, confirmed, active, onClick }: { label: string; count: number; max: number; confirmed?: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={`${label}: 문의 ${count}건${confirmed != null ? ` · 출발 확정 ${confirmed}건(${pct(confirmed, count)}%)` : ""}`}
      className={`grid w-full grid-cols-[84px_1fr_auto] items-center gap-2 rounded-lg px-2 py-1 text-left text-[13px] hover:bg-[var(--admin-surface-muted)] ${active ? "bg-[var(--admin-primary-soft)]" : ""}`}>
      <span className="truncate font-semibold text-[var(--admin-text-strong)]">{label}</span>
      <span className="h-1.5 rounded bg-[var(--admin-surface-muted)]"><span className="block h-1.5 rounded bg-[var(--admin-primary)]" style={{ width: `${Math.max(2, (count / Math.max(1, max)) * 100)}%` }} /></span>
      <span className="whitespace-nowrap tabular-nums text-[var(--admin-text-muted)]"><b className="text-[var(--admin-text-strong)]">{count}</b>{confirmed != null && <> · 확정 {confirmed} <span className="text-[var(--admin-text-soft)]">({pct(confirmed, count)}%)</span></>}</span>
    </button>
  );
}
function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="admin-card">
      <div className="admin-card__head"><h2>{title}</h2>{hint && <span className="admin-card__desc">{hint}</span>}</div>
      <div className="admin-card__body space-y-0.5 !p-3">{children}</div>
    </section>
  );
}
const Field = ({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) => (<label className={`block text-sm ${wide ? "md:col-span-2" : ""}`}><span className="admin-label mb-1 block">{label}</span>{children}</label>);

type Draft = { id?: string; channel: InquiryChannel; receivedDate: string; name: string; phone: string; departText: string; productText: string; route: string; people: string; status: InquiryStatus; confirmText: string; revisit: boolean; memo: string; message?: string; source?: Inquiry["source"] };
const toDraft = (q: Inquiry | null, today: string): Draft => ({
  id: q?.id, channel: q?.channel ?? "instagram", receivedDate: q ? q.receivedDate : today, name: q?.name ?? "", phone: q?.phone ?? "", departText: q?.departText || (q?.departDate ? mdLabel(q.departDate).replace(" ", "") : ""),
  productText: q?.productText ?? "", route: q?.route ?? "", people: q?.people ? String(q.people) : "", status: q?.status ?? "new", confirmText: q?.confirmText ?? "", revisit: !!q?.revisit, memo: q?.memo ?? "", message: q?.message, source: q?.source,
});

export default function InquiryBoard({ items, today }: { items: InquiryView[]; today: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState<Filters>(NONE);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [cal, setCal] = useState<{ basis: CalendarBasis; month: string; day: string }>({ basis: "received", month: today.slice(0, 7), day: "" });
  const [limit, setLimit] = useState(PAGE);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  /** 저장 직후 새로 고침이 끝나기 전까지 화면에 먼저 보여 줄 값 */
  const [local, setLocal] = useState<Record<string, Partial<Inquiry>>>({});
  const rows = useMemo(() => items.map((q) => (local[q.id] ? { ...q, ...local[q.id] } : q)), [items, local]);

  const options = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];
    const byCount = (xs: string[]) => { const m = new Map<string, number>(); xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]).map(([k]) => k); };
    return { origins: byCount(rows.flatMap((q) => q.origins)), dests: byCount(rows.flatMap((q) => q.destinations)), departs: uniq(rows.map(tripMonthOf)).sort(), receiveds: uniq(rows.map((q) => q.receivedDate.slice(0, 7))).sort().reverse() };
  }, [rows]);

  /**
   * 달력 보기에서는 달력의 달이 그 기준의 달 조건(접수 달·출발 달)을 대신하고, 고른 날이 조건에 더해진다.
   * → 요약·목록·건수가 모두 달력에 보이는 달(또는 고른 날)의 문의를 가리킨다.
   */
  const calOn = view === "calendar";
  const eff = useMemo<Filters>(() => (calOn ? { ...f, [cal.basis]: cal.month } : f), [calOn, f, cal.basis, cal.month]);
  const sel = useMemo<DaySel>(() => (calOn && cal.day ? { basis: cal.basis, day: cal.day } : null), [calOn, cal.basis, cal.day]);
  const shown = useMemo(() => { const xs = rows.filter((q) => match(q, eff, sel)); return calOn && cal.basis === "depart" ? xs.sort(byTrip) : xs; }, [rows, eff, sel, calOn, cal.basis]);
  /** 달력에 넘길 문의: 다른 조건은 그대로, 달력의 달·날만 뺀 것 */
  const calItems = useMemo(() => (calOn ? rows.filter((q) => match(q, { ...f, [cal.basis]: "" }, null)) : []), [rows, f, calOn, cal.basis]);
  /** 요약의 각 표는 자기 조건만 뺀 나머지 조건으로 센다 → 줄을 눌러 바꿔 가며 비교할 수 있다 */
  const tally = (without: keyof Filters, keyOf: (q: InquiryView) => string[]) => {
    const m = new Map<string, { count: number; confirmed: number }>();
    for (const q of rows) { if (!match(q, { ...eff, [without]: "" }, without === sel?.basis ? null : sel)) continue; for (const k of keyOf(q)) { const v = m.get(k) ?? { count: 0, confirmed: 0 }; v.count++; if (q.status === "confirmed") v.confirmed++; m.set(k, v); } }
    return m;
  };
  const byChannel = tally("channel", (q) => [q.channel]);
  const byDest = [...tally("dest", (q) => q.destinations)].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  const byDepart = [...tally("depart", (q) => [tripMonthOf(q) || "none"])].sort((a, b) => (a[0] === "none" ? 1 : b[0] === "none" ? -1 : a[0].localeCompare(b[0])));
  /** 조건을 켜고 끈다. 달력 보기에서 달력 기준과 같은 달 조건을 누르면 달력이 그 달로 옮겨 간다 */
  const set = (k: keyof Filters, v: string) => {
    setLimit(PAGE);
    if (calOn && k === cal.basis) { if (isMonth(v)) setCal((c) => ({ ...c, month: v, day: "" })); return; }
    setF((p) => ({ ...p, [k]: p[k] === v ? "" : v }));
  };
  const openView = (v: "list" | "calendar") => {
    setView(v); setLimit(PAGE);
    // 목록에서 이미 달을 골라 두었으면 달력도 그 달에서 시작한다
    if (v === "calendar") setCal((c) => ({ ...c, month: isMonth(f[c.basis]) ? f[c.basis] : c.month, day: "" }));
  };
  const moveCal = (next: Partial<typeof cal>) => { setCal((c) => ({ ...c, day: "", ...next })); setLimit(PAGE); };
  const confirmedShown = shown.filter((q) => q.status === "confirmed");
  /** 달력이 대신하고 있는 달 조건은 화면에 보이지 않으므로 "조건 지우기"의 대상으로 세지 않는다 */
  const filtered = (Object.keys(f) as (keyof Filters)[]).some((k) => f[k] && !(calOn && k === cal.basis));
  const calNoun = cal.basis === "received" ? "접수" : "출발";

  async function patch(id: string, body: Partial<Inquiry>) {
    setLocal((p) => ({ ...p, [id]: { ...p[id], ...body } }));
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { alert("저장하지 못했습니다. 다시 시도해 주세요."); setLocal((p) => { const n = { ...p }; delete n[id]; return n; }); }
    start(() => router.refresh());
  }
  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true); setErr("");
    const body = { channel: draft.channel, receivedDate: draft.receivedDate, name: draft.name.trim(), phone: draft.phone.trim() || null, departText: draft.departText.trim(), ...(draft.id ? { departDate: null } : {}), productText: draft.productText.trim(), route: draft.route.trim(), people: draft.people ? Number(draft.people) : null, status: draft.status, confirmText: draft.confirmText.trim() || null, revisit: draft.revisit, memo: draft.memo };
    const res = await fetch(draft.id ? `/api/inquiries/${encodeURIComponent(draft.id)}` : "/api/inquiries", { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); setErr(j.error === "validation_error" ? (j.issues ?? []).map((i: { message: string }) => i.message).join(", ") || "입력값을 확인해 주세요" : j.error ?? "저장하지 못했습니다"); return; }
    setDraft(null); setLocal({});
    start(() => router.refresh());
  }
  async function removeDraft() {
    if (!draft?.id || !confirm(`${draft.name} 님의 문의를 지울까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    const res = await fetch(`/api/inquiries/${encodeURIComponent(draft.id)}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) { setErr("지우지 못했습니다"); return; }
    setDraft(null); start(() => router.refresh());
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setImportLog(null);
    const res = await fetch("/api/inquiries/import", { method: "POST", body: new FormData(e.currentTarget) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    setImportLog({ ok: res.ok, lines: res.ok ? j.log ?? [] : [j.error ?? "가져오지 못했습니다"] });
    if (res.ok) { setLocal({}); start(() => router.refresh()); }
  }
  const D = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setDraft((d) => (d ? { ...d, [k]: e.target.value } : d));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => { setErr(""); setDraft(toDraft(null, today)); }}><i className="ri-add-line" /> 문의 등록</button>
        <button type="button" className="admin-btn admin-btn--light" onClick={() => { setImportLog(null); setImporting(true); }}><i className="ri-upload-2-line" /> 엑셀 가져오기</button>
        <a href="/api/inquiries/export" download className="admin-btn admin-btn--light"><i className="ri-file-excel-2-line" /> 엑셀 내려받기</a>
        {pending && <span className="text-xs text-[var(--admin-text-soft)]">새로 고치는 중…</span>}
        <span className="ml-auto"><Segmented label="보기 방식" value={view} onChange={openView} options={[["list", "목록", "ri-list-check"], ["calendar", "달력", "ri-calendar-line"]]} /></span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="접수 채널" hint="문의 · 출발 확정(확정률)">
          {CHANNELS.filter((c) => byChannel.has(c)).map((c) => <BarRow key={c} label={CHANNEL_LABEL[c]} count={byChannel.get(c)!.count} confirmed={byChannel.get(c)!.confirmed} max={Math.max(...[...byChannel.values()].map((v) => v.count))} active={f.channel === c} onClick={() => set("channel", c)} />)}
          {!byChannel.size && <p className="px-2 py-3 text-sm text-[var(--admin-text-soft)]">조건에 맞는 문의가 없습니다.</p>}
        </Panel>
        <Panel title="목적지" hint="문의 많은 순">
          {byDest.map(([k, v]) => <BarRow key={k} label={k} count={v.count} confirmed={v.confirmed} max={byDest[0][1].count} active={f.dest === k} onClick={() => set("dest", k)} />)}
          {!byDest.length && <p className="px-2 py-3 text-sm text-[var(--admin-text-soft)]">조건에 맞는 문의가 없습니다.</p>}
        </Panel>
        <Panel title="출발 달" hint="확정 건은 확정된 출발일">
          {byDepart.map(([k, v]) => <BarRow key={k} label={k === "none" ? "미정" : monthLabel(k)} count={v.count} confirmed={v.confirmed} max={Math.max(...byDepart.map(([, x]) => x.count))} active={eff.depart === k} onClick={() => set("depart", k)} />)}
          {!byDepart.length && <p className="px-2 py-3 text-sm text-[var(--admin-text-soft)]">조건에 맞는 문의가 없습니다.</p>}
        </Panel>
      </div>

      {calOn && <InquiryCalendar items={calItems} basis={cal.basis} month={cal.month} day={cal.day} today={today} onBasis={(basis) => moveCal({ basis })} onMonth={(month) => moveCal({ month })} onDay={(day) => moveCal({ day })} />}

      <section className="admin-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--admin-border)] p-3">
          <input value={f.q} onChange={(e) => { setF({ ...f, q: e.target.value }); setLimit(PAGE); }} placeholder="이름 · 상품내용 · 비고 검색" className="w-56" aria-label="검색" />
          <select value={f.channel} onChange={(e) => set("channel", e.target.value)} aria-label="채널"><option value="">채널 전체</option>{CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}</select>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} aria-label="상태"><option value="">상태 전체</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
          <select value={f.origin} onChange={(e) => set("origin", e.target.value)} aria-label="출발지"><option value="">출발지 전체</option>{options.origins.map((o) => <option key={o} value={o}>{o} 출발</option>)}</select>
          <select value={f.dest} onChange={(e) => set("dest", e.target.value)} aria-label="목적지"><option value="">목적지 전체</option>{options.dests.map((o) => <option key={o} value={o}>{o}</option>)}</select>
          {/* 달력 보기에서는 달력이 그 기준의 달을 정하므로 같은 달 조건은 숨긴다 */}
          {!(calOn && cal.basis === "depart") && <select value={f.depart} onChange={(e) => set("depart", e.target.value)} aria-label="출발 달"><option value="">출발 달 전체</option>{options.departs.map((m) => <option key={m} value={m}>{monthLabel(m)} 출발</option>)}<option value="none">출발 미정</option></select>}
          {!(calOn && cal.basis === "received") && <select value={f.received} onChange={(e) => set("received", e.target.value)} aria-label="접수 달"><option value="">접수 달 전체</option>{options.receiveds.map((m) => <option key={m} value={m}>{monthLabel(m)} 접수</option>)}<option value="none">접수일 없음</option></select>}
          {calOn && (cal.day
            ? <button type="button" className="admin-chip" title="고른 날짜 풀기" onClick={() => moveCal({ day: "" })}>{cal.day === NO_DAY ? `${monthLabel(cal.month)} ${calNoun} · 날짜 미정` : `${mdLabel(cal.day)}(${weekdayOf(cal.day)}) ${calNoun}`} <i className="ri-close-line" /></button>
            : <span className="admin-chip admin-chip--gray">{monthLabel(cal.month)} {calNoun}</span>)}
          {filtered && <button type="button" className="btn-ghost" onClick={() => { setF(NONE); setLimit(PAGE); }}><i className="ri-close-line" /> 조건 지우기</button>}
          <span className="ml-auto text-sm text-[var(--admin-text-muted)]"><b className="text-[var(--admin-text-strong)]">{shown.length.toLocaleString()}</b>건{filtered || calOn ? ` / 전체 ${rows.length.toLocaleString()}건` : ""} · 출발 확정 {confirmedShown.length}건{confirmedShown.some((q) => q.confirmPeople) ? ` (${confirmedShown.reduce((a, q) => a + (q.confirmPeople ?? 0), 0)}명 이상)` : ""}</span>
        </div>
        <div className="max-h-[72vh] overflow-auto">
          <table className="admin-table min-w-[1060px]">
            <thead className="sticky top-0 z-10"><tr><th>접수</th><th>이름</th><th>출발날짜</th><th>상품내용</th><th>희망 지역</th><th>상태</th><th>출발 확정</th><th>비고</th><th></th></tr></thead>
            <tbody>
              {shown.slice(0, limit).map((q) => (
                <tr key={q.id} className="align-top">
                  <td className="whitespace-nowrap"><span className="block tabular-nums text-[var(--admin-text-strong)]">{q.receivedDate ? mdLabel(q.receivedDate) : "-"}</span><span className="text-xs text-[var(--admin-text-muted)]">{CHANNEL_LABEL[q.channel]}{q.extraChannels?.length ? ` +${q.extraChannels.map((x) => CHANNEL_LABEL[x.channel]).join("·")}` : ""}</span></td>
                  <td className="whitespace-nowrap"><button type="button" className="font-bold text-[var(--admin-text-strong)] hover:text-[var(--admin-primary)]" onClick={() => { setErr(""); setDraft(toDraft(q, today)); }}>{q.name || "(이름 없음)"}</button>{q.revisit && <span className="admin-chip admin-chip--success ml-1.5 !min-h-5 !px-1.5 !text-[11px]">재방문</span>}{q.phone && <span className="block text-xs text-[var(--admin-text-muted)]">{q.phone}</span>}</td>
                  <td className="whitespace-nowrap"><span className="block">{q.departText || (q.departIso ? mdLabel(q.departIso) : "-")}</span>{q.departIso && q.departText.replace(/\s/g, "") !== mdLabel(q.departIso).replace(/\s/g, "") && <span className="text-xs text-[var(--admin-text-soft)]">{q.departIso}</span>}</td>
                  <td className="min-w-36 max-w-60">{q.productText || "-"}{q.message && <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">“{q.message}”</span>}</td>
                  <td className="whitespace-nowrap">{q.route || "-"}</td>
                  <td>
                    <select value={q.status} onChange={(e) => patch(q.id, { status: e.target.value as InquiryStatus })} aria-label={`${q.name} 상태`} className={`!h-8 !rounded-full !border-0 !py-0 !pl-3 !pr-7 text-xs font-bold ${STATUS_CHIP[q.status]}`}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
                  </td>
                  <td className="min-w-28 max-w-48 text-[var(--admin-text-strong)]">{q.confirmText || <span className="text-[var(--admin-text-soft)]">-</span>}</td>
                  <td className="min-w-52 max-w-md text-[13px] leading-snug text-[var(--admin-text-muted)]">{q.memo || "-"}</td>
                  <td className="whitespace-nowrap"><button type="button" className="admin-btn admin-btn--light admin-btn--xs" onClick={() => { setErr(""); setDraft(toDraft(q, today)); }}><i className="ri-pencil-line" /> 수정</button></td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={9} className="py-10 text-center text-[var(--admin-text-muted)]">{rows.length ? "조건에 맞는 문의가 없습니다." : "아직 문의가 없습니다. 문의 등록을 누르거나 엑셀을 가져오세요."}</td></tr>}
            </tbody>
          </table>
        </div>
        {shown.length > limit && <div className="border-t border-[var(--admin-border)] p-3 text-center"><button type="button" className="btn-ghost" onClick={() => setLimit(limit + PAGE * 2)}>더 보기 ({(shown.length - limit).toLocaleString()}건 남음)</button></div>}
      </section>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-4" onClick={() => setDraft(null)}>
          <form onSubmit={saveDraft} className="card my-6 w-full max-w-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-base font-bold">{draft.id ? "문의 수정" : "문의 등록"}</h3><button type="button" className="btn-ghost" onClick={() => setDraft(null)}>닫기</button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="접수 채널"><select value={draft.channel} onChange={D("channel")} className="w-full" disabled={draft.source === "sgl-web"}>{CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}{c === "instagram" ? " (플러그인)" : c === "kakao" ? " (카카오 채널)" : ""}</option>)}</select></Field>
              <Field label="접수일"><input type="date" value={draft.receivedDate} onChange={D("receivedDate")} className="w-full" disabled={draft.source === "sgl-web"} /></Field>
              <Field label="이름"><input required value={draft.name} onChange={D("name")} className="w-full" /></Field>
              <Field label="연락처"><input value={draft.phone} onChange={D("phone")} className="w-full" placeholder="선택" /></Field>
              <Field label="출발날짜"><input value={draft.departText} onChange={D("departText")} className="w-full" placeholder="12월4일 · 1월 하순 · 날짜미정" /></Field>
              <Field label="인원"><input type="number" min={1} value={draft.people} onChange={D("people")} className="w-full" placeholder="비우면 상품내용에서 읽음" /></Field>
              <Field label="상품내용"><input value={draft.productText} onChange={D("productText")} className="w-full" placeholder="인천-벳부 3박4일 2명" /></Field>
              <Field label="고객이 원하는 지역"><input value={draft.route} onChange={D("route")} className="w-full" placeholder="인천-가고시마" /></Field>
              <Field label="상태"><select value={draft.status} onChange={D("status")} className="w-full">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Field>
              <Field label="출발 확정 내용"><input value={draft.confirmText} onChange={(e) => setDraft({ ...draft, confirmText: e.target.value, status: e.target.value.trim() ? "confirmed" : draft.status })} className="w-full" placeholder="12월20일 출발 2명 확정" /></Field>
              <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={draft.revisit} onChange={(e) => setDraft({ ...draft, revisit: e.target.checked })} /> 재방문 고객</label>
              {draft.message && <div className="rounded-xl bg-[var(--admin-surface-muted)] p-3 text-sm md:col-span-2"><span className="admin-label mb-1 block">고객이 적은 문의 내용</span>{draft.message}</div>}
              <Field label="비고 (상담 경과)" wide><textarea rows={4} value={draft.memo} onChange={D("memo")} className="w-full" placeholder="견적 발송, 재연락 예정일 등" /></Field>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex items-center gap-2"><button className="btn" disabled={busy}>{busy ? "저장 중…" : "저장"}</button>{draft.id && <button type="button" className="btn-ghost ml-auto" disabled={busy} onClick={removeDraft}><i className="ri-delete-bin-line" /> 문의 삭제</button>}</div>
          </form>
        </div>
      )}

      {importing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setImporting(false)}>
          <form onSubmit={upload} className="card w-full max-w-xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-base font-bold">문의 엑셀 가져오기</h3><button type="button" className="btn-ghost" onClick={() => setImporting(false)}>닫기</button></div>
            <p className="text-xs text-[var(--admin-text-muted)]">‘문의관리현황 목록’ 엑셀을 그대로 올립니다. 머리글(직판문의 · 채널 문의 · 인스타문의 · 출발날짜 · 이름 · 상품내용 · 고객이 원하는 지역 · 출발 확정 · 인스타 재방문 확정 · 비고)으로 열을 찾습니다. 이름·채널·접수일이 같은 문의는 이미 있는 것으로 보고 건너뛰므로, 같은 파일을 다시 올려도 두 번 들어가지 않습니다.</p>
            <input type="file" name="file" accept=".xlsx" required />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="overwrite" value="1" /> 이미 있는 문의도 엑셀 내용(출발날짜·상품·지역·확정·비고)으로 고치기</label>
            <button className="btn" disabled={busy}>{busy ? "가져오는 중…" : "가져오기"}</button>
            {importLog && <pre className={`whitespace-pre-wrap rounded p-2 text-xs ${importLog.ok ? "bg-neutral-50" : "bg-red-50 text-red-900"}`}>{importLog.lines.join("\n")}</pre>}
          </form>
        </div>
      )}
    </>
  );
}
