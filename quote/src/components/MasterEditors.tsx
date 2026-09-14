"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GolfCourse, Hotel, Settings, VehicleRule, WeekdayRates } from "@/types";
import { WEEKDAYS } from "@/lib/format";

const emptyRates = (v = 0): WeekdayRates => ({ 0: v, 1: v, 2: v, 3: v, 4: v, 5: v, 6: v });

async function post(url: string, body: unknown, method = "POST") {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error === "validation_error" ? j.issues?.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join(", ") : j.error ?? res.statusText); }
  return res.json();
}
function useSave() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const run = async (fn: () => Promise<unknown>) => { try { await fn(); setMsg("저장됨"); router.refresh(); } catch (e) { setMsg(`오류: ${(e as Error).message}`); } };
  return { run, msg };
}

function RatesRow({ rates, onChange, unit }: { rates: WeekdayRates; onChange: (r: WeekdayRates) => void; unit: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {WEEKDAYS.map((w, i) => (
        <label key={w} className={`text-xs ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-600" : ""}`}>{w}<input type="number" value={rates[i as 0]} onChange={(e) => onChange({ ...rates, [i]: Number(e.target.value) })} className="ml-0.5 w-[72px]" title={unit} /></label>
      ))}
    </div>
  );
}

/** 요일별 단가형 마스터(호텔·차량) 공용 편집기 */
function WeekdayMasterEditor<T extends { id: string; name: string; region: string; memo?: string }>({ items, api, ratesKey, unit, title, hint }: { items: T[]; api: string; ratesKey: "nightlyRates" | "feesByWeekday"; unit: string; title: string; hint: string }) {
  const { run, msg } = useSave();
  const [drafts, setDrafts] = useState<Record<string, T>>(() => Object.fromEntries(items.map((i) => [i.id, i])));
  const [neu, setNeu] = useState<{ name: string; region: string; rates: WeekdayRates }>({ name: "", region: items[0]?.region ?? "다카마쓰", rates: emptyRates() });
  const rates = (i: T) => (i as unknown as Record<string, WeekdayRates>)[ratesKey];
  return (
    <section className="card space-y-3">
      <div className="flex items-baseline gap-3"><h2 className="font-bold">{title}</h2><span className="text-xs text-neutral-500">{hint}</span><span className="ml-auto text-xs text-neutral-500">{msg}</span></div>
      {items.map((it) => { const d = drafts[it.id] ?? it; return (
        <div key={it.id} className="grid gap-2 rounded border border-neutral-100 p-2 md:grid-cols-[180px_100px_1fr_auto]">
          <input value={d.name} onChange={(e) => setDrafts({ ...drafts, [it.id]: { ...d, name: e.target.value } })} />
          <input value={d.region} onChange={(e) => setDrafts({ ...drafts, [it.id]: { ...d, region: e.target.value } })} />
          <div><RatesRow rates={rates(d)} unit={unit} onChange={(r) => setDrafts({ ...drafts, [it.id]: { ...d, [ratesKey]: r } })} /><input value={d.memo ?? ""} placeholder="메모" onChange={(e) => setDrafts({ ...drafts, [it.id]: { ...d, memo: e.target.value } })} className="mt-1 w-full text-xs" /></div>
          <div className="flex gap-1"><button className="btn" onClick={() => run(() => post(api, d))}>저장</button><button className="btn-ghost" onClick={() => confirm(`${d.name} 삭제?`) && run(() => post(`${api}/${it.id}`, undefined, "DELETE"))}>삭제</button></div>
        </div>); })}
      <div className="grid gap-2 rounded border border-dashed border-neutral-300 p-2 md:grid-cols-[180px_100px_1fr_auto]">
        <input placeholder="새 항목 이름" value={neu.name} onChange={(e) => setNeu({ ...neu, name: e.target.value })} />
        <input placeholder="지역" value={neu.region} onChange={(e) => setNeu({ ...neu, region: e.target.value })} />
        <RatesRow rates={neu.rates} unit={unit} onChange={(r) => setNeu({ ...neu, rates: r })} />
        <button className="btn" disabled={!neu.name} onClick={() => run(() => post(api, { name: neu.name, region: neu.region, [ratesKey]: neu.rates })).then(() => setNeu({ ...neu, name: "" }))}>추가</button>
      </div>
    </section>
  );
}
export const HotelEditor = ({ items }: { items: Hotel[] }) => <WeekdayMasterEditor items={items} api="/api/hotels" ratesKey="nightlyRates" unit="엔/1인 1박" title="호텔 (요일별 1인 1박 단가, 엔)" hint="체크인일부터 N박의 각 날짜 요일 단가를 합산 → 호텔 ¥" />;
export const VehicleEditor = ({ items }: { items: VehicleRule[] }) => <WeekdayMasterEditor items={items} api="/api/vehicle-rules" ratesKey="feesByWeekday" unit="원/1인" title="차량+지원비 (출발 요일별, 원)" hint="출발일 요일 기준 1인 금액" />;

export function GolfEditor({ items }: { items: GolfCourse[] }) {
  const { run, msg } = useSave();
  const [drafts, setDrafts] = useState<Record<string, GolfCourse>>(() => Object.fromEntries(items.map((i) => [i.id, i])));
  const [open, setOpen] = useState<string | null>(null);
  const upd = (id: string, patch: Partial<GolfCourse>) => setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? items.find((i) => i.id === id)!), ...patch } }));
  const blank: GolfCourse = { id: "", name: "", region: items[0]?.region ?? "다카마쓰", holes: 18, playStyle: "셀프플레이", periods: [{ from: "2026-01-01", to: "2026-12-31", weekday: 0, weekend: 0, holiday: 0 }], updatedAt: "" };
  const list = [...items.map((i) => drafts[i.id] ?? i), ...(drafts["__new"] ? [drafts["__new"]] : [])];
  return (
    <section className="card space-y-2">
      <div className="flex items-baseline gap-3"><h2 className="font-bold">골프장 요금표 (1인 그린피, 엔)</h2><span className="text-xs text-neutral-500">플레이 날짜가 속한 기간의 평일/주말/연휴(일본 공휴일) 단가 × 홀수/18</span><span className="ml-auto text-xs text-neutral-500">{msg}</span><button className="btn-ghost" onClick={() => { setDrafts({ ...drafts, __new: blank }); setOpen("__new"); }}>+ 골프장</button></div>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-neutral-500"><th>골프장</th><th>지역</th><th>TEL</th><th>홀</th><th>기간</th><th className="text-right">주중</th><th className="text-right">주말</th><th className="text-right">연휴</th><th></th></tr></thead>
        <tbody>
          {list.map((c) => { const key = c.id || "__new"; const p0 = c.periods[0]; const isOpen = open === key; return (
            <tr key={key} className="border-t border-neutral-100 align-top">
              <td colSpan={isOpen ? 9 : 1} className="py-1.5">
                {!isOpen ? <button className="font-medium hover:underline" onClick={() => setOpen(key)}>{c.name}</button> : (
                  <div className="space-y-2 rounded bg-neutral-50 p-2">
                    <div className="grid gap-2 md:grid-cols-6">
                      <input value={c.name} placeholder="골프장명" onChange={(e) => upd(key, { name: e.target.value })} />
                      <input value={c.region} placeholder="지역" onChange={(e) => upd(key, { region: e.target.value })} />
                      <input value={c.tel ?? ""} placeholder="TEL" onChange={(e) => upd(key, { tel: e.target.value })} />
                      <input type="number" value={c.holes} onChange={(e) => upd(key, { holes: Number(e.target.value) })} />
                      <input value={c.playStyle} onChange={(e) => upd(key, { playStyle: e.target.value })} />
                      <input value={c.notes ?? ""} placeholder="기타사항" onChange={(e) => upd(key, { notes: e.target.value })} />
                    </div>
                    <table className="w-full text-xs"><thead><tr className="text-neutral-500"><th>라벨</th><th>부터</th><th>까지</th><th>주중</th><th>주말</th><th>연휴</th><th></th></tr></thead><tbody>
                      {c.periods.map((p, i) => (
                        <tr key={i}>
                          <td><input value={p.label ?? ""} onChange={(e) => upd(key, { periods: c.periods.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} className="w-full" /></td>
                          <td><input type="date" value={p.from} onChange={(e) => upd(key, { periods: c.periods.map((x, j) => j === i ? { ...x, from: e.target.value } : x) })} /></td>
                          <td><input type="date" value={p.to} onChange={(e) => upd(key, { periods: c.periods.map((x, j) => j === i ? { ...x, to: e.target.value } : x) })} /></td>
                          {(["weekday", "weekend", "holiday"] as const).map((k) => <td key={k}><input type="number" value={p[k] ?? ""} onChange={(e) => upd(key, { periods: c.periods.map((x, j) => j === i ? { ...x, [k]: e.target.value === "" ? null : Number(e.target.value) } : x) })} className="w-24" /></td>)}
                          <td><button className="text-neutral-400 hover:text-red-600" onClick={() => upd(key, { periods: c.periods.filter((_, j) => j !== i) })}>✕</button></td>
                        </tr>))}
                    </tbody></table>
                    <div className="flex gap-2">
                      <button className="btn-ghost" onClick={() => upd(key, { periods: [...c.periods, { from: p0?.to ?? "", to: p0?.to ?? "", weekday: p0?.weekday ?? 0, weekend: p0?.weekend ?? 0, holiday: p0?.holiday ?? 0 }] })}>+ 기간</button>
                      <button className="btn" onClick={() => run(() => post("/api/golf-courses", { ...c, id: c.id || undefined })).then(() => { setOpen(null); if (key === "__new") setDrafts((d) => { const n = { ...d }; delete n.__new; return n; }); })}>저장</button>
                      {c.id && <button className="btn-ghost" onClick={() => confirm(`${c.name} 삭제?`) && run(() => post(`/api/golf-courses/${c.id}`, undefined, "DELETE"))}>삭제</button>}
                      <button className="btn-ghost" onClick={() => setOpen(null)}>닫기</button>
                    </div>
                  </div>)}
              </td>
              {!isOpen && <><td>{c.region}</td><td className="text-xs">{c.tel}</td><td>{c.holes}</td><td className="text-xs">{p0 ? `${p0.from}~${p0.to}${c.periods.length > 1 ? ` 외 ${c.periods.length - 1}` : ""}` : "-"}</td><td className="text-right">{p0?.weekday?.toLocaleString() ?? "-"}</td><td className="text-right">{p0?.weekend?.toLocaleString() ?? "-"}</td><td className="text-right">{p0?.holiday?.toLocaleString() ?? "-"}</td><td className="text-right"><button className="text-xs text-neutral-500 hover:underline" onClick={() => setOpen(key)}>편집</button></td></>}
            </tr>); })}
        </tbody>
      </table>
    </section>
  );
}

export function SettingsEditor({ settings }: { settings: Settings }) {
  const { run, msg } = useSave();
  const [s, setS] = useState({ exchangeRate: String(settings.exchangeRate), margins: settings.margins.map((m) => Math.round(m * 100)).join(","), holidays: settings.holidays.join("\n") });
  return (
    <section className="card space-y-2">
      <div className="flex items-baseline gap-3"><h2 className="font-bold">기본 설정</h2><span className="ml-auto text-xs text-neutral-500">{msg}</span></div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm"><span className="block text-xs text-neutral-500">기본 환율 (원/엔) — 새 상품 기본값</span><input type="number" step="0.01" value={s.exchangeRate} onChange={(e) => setS({ ...s, exchangeRate: e.target.value })} className="w-full" /></label>
        <label className="text-sm"><span className="block text-xs text-neutral-500">기본 마진 % (콤마)</span><input value={s.margins} onChange={(e) => setS({ ...s, margins: e.target.value })} className="w-full" /></label>
        <label className="text-sm md:row-span-2"><span className="block text-xs text-neutral-500">일본 공휴일 (한 줄에 하나, 골프 연휴요금)</span><textarea rows={8} value={s.holidays} onChange={(e) => setS({ ...s, holidays: e.target.value })} className="w-full font-mono text-xs" /></label>
      </div>
      <button className="btn" onClick={() => run(() => post("/api/settings", { exchangeRate: Number(s.exchangeRate), margins: s.margins.split(",").map((m) => Number(m) / 100).filter(Boolean), holidays: s.holidays.split(/\s+/).filter(Boolean) }, "PUT"))}>저장</button>
    </section>
  );
}
