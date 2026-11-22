"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GolfCourse, Hotel, Product, ProductGroup, VehicleRule } from "@/types";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (<label className="block text-sm"><span className="admin-label mb-1 block">{label}</span>{children}{hint && <span className="mt-0.5 block text-[11px] text-neutral-400">{hint}</span>}</label>);
const Section = ({ icon, title, hint, children }: { icon: string; title: string; hint?: string; children: React.ReactNode }) => (
  <fieldset className="space-y-3 rounded-2xl border border-[var(--admin-border)] p-4">
    <legend className="px-1.5 text-sm font-bold text-[var(--admin-text-strong)]"><i className={`${icon} mr-1 text-[var(--admin-primary)]`} />{title}{hint && <span className="ml-2 text-[11px] font-normal text-neutral-400">{hint}</span>}</legend>
    {children}
  </fieldset>
);

type Props = { product?: Product; groups: ProductGroup[]; hotels: Hotel[]; courses: GolfCourse[]; vehicles: VehicleRule[]; defaults: { exchangeRate: number; margins: number[] } };
type Stay = { hotelId: string; nights: number };
type Round = { courseId: string; style: string };
type Extra = { label: string; krw: string; jpy: string };

const parsePlan = (s: string) => s.split(",").map((x) => parseInt(x.trim()) || 0);
/** 골프장이 가진 플레이 스타일(요금 구간에 적힌 것) */
const stylesOf = (c?: GolfCourse) => [...new Set((c?.periods ?? []).map((p) => p.style).filter((s): s is string => !!s))];

export default function ProductForm({ product, groups, hotels, courses, vehicles, defaults }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState(() => ({
    name: product?.name ?? "", groupId: product?.groupId ?? "", saleType: product?.saleType ?? "air", paxBasis: product?.paxBasis ? String(product.paxBasis) : "",
    region: product?.region ?? hotels[0]?.region ?? "다카마쓰", airline: product?.airline ?? "RS",
    outFlight: product?.outbound.flightNo ?? "RS741", outDep: product?.outbound.dep ?? "08:45", outArr: product?.outbound.arr ?? "10:30", origin: product?.outbound.origin ?? "ICN", destination: product?.outbound.destination ?? "TAK",
    inFlight: product?.inbound.flightNo ?? "RS742", inDep: product?.inbound.dep ?? "11:35", inArr: product?.inbound.arr ?? "13:20",
    nights: product?.nights ?? 3, golfPlan: (product?.golfPlan ?? [18, 18, 0, 0]).join(","),
    hotelLabel: product?.hotelLabel ?? "", golfLabel: product?.golfLabel ?? "", note: product?.note ?? "", vehicleRuleId: product?.vehicleRuleId ?? vehicles[0]?.id ?? "",
    exchangeRate: product?.exchangeRate ?? defaults.exchangeRate, margins: (product?.margins ?? defaults.margins).map((m) => Math.round(m * 100)).join(","),
    dateFrom: product?.dateFrom ?? "", dateTo: product?.dateTo ?? "", legend: product?.legend ?? (product ? "" : "**노란색날짜 : 스팟특가**"),
    groupTax: Object.entries(product?.groupTaxByMonth ?? {}).map(([k, v]) => `${k}=${v}`).join("\n"),
  }));
  const [stays, setStays] = useState<Stay[]>(() => (product?.stays?.length ? product.stays : [{ hotelId: product?.hotelId ?? hotels[0]?.id ?? "", nights: product?.nights ?? 3 }]));
  const [rounds, setRounds] = useState<Round[]>(() => {
    const ids = product?.golfCourseIds ?? (courses[0] ? [courses[0].id] : []);
    const n = (product?.golfPlan ?? [18, 18, 0, 0]).filter(Boolean).length;
    return Array.from({ length: n }, (_, i) => ({ courseId: ids[i % (ids.length || 1)] ?? "", style: product?.golfStyles?.[i % (ids.length || 1)] ?? "" }));
  });
  const [extras, setExtras] = useState<Extra[]>(() => (product?.extras ?? []).map((e) => ({ label: e.label, krw: e.krw ? String(e.krw) : "", jpy: e.jpy ? String(e.jpy) : "" })));
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const plan = parsePlan(f.golfPlan);
  const playDays = plan.map((h, i) => ({ h, day: i + 1 })).filter((x) => x.h > 0);
  // 일자별 홀수가 바뀌면 라운드 수에 맞춰 늘리거나 줄인다(늘릴 때는 앞에서부터 되풀이)
  const shownRounds = playDays.map((_, i) => rounds[i] ?? rounds[i % (rounds.length || 1)] ?? { courseId: courses[0]?.id ?? "", style: "" });
  const setRound = (i: number, patch: Partial<Round>) => setRounds(shownRounds.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const stayNights = stays.reduce((a, s) => a + (Number(s.nights) || 0), 0);
  const nights = Number(f.nights) || 0;
  const regionHotels = (id: string) => hotels.filter((h) => h.region === f.region || h.id === id);
  const regionCourses = (id: string) => courses.filter((c) => c.region === f.region || c.id === id);
  const land = f.saleType === "land";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    if (stayNights !== nights) { setErr(`숙박 구성의 박수 합(${stayNights}박)이 전체 박수(${nights}박)와 다릅니다.`); return; }
    setBusy(true);
    const groupTaxByMonth: Record<string, number | "미정"> = {};
    for (const line of f.groupTax.split("\n")) { const [k, v] = line.split("="); if (k?.trim()) groupTaxByMonth[k.trim()] = v?.trim() === "미정" || !v ? "미정" : Number(v.replace(/[^\d]/g, "")); }
    const cleanStays = stays.filter((s) => s.hotelId && s.nights > 0).map((s) => ({ hotelId: s.hotelId, nights: Number(s.nights) }));
    const body = {
      name: f.name, groupId: f.groupId, saleType: f.saleType, paxBasis: f.paxBasis ? Number(f.paxBasis) : undefined, region: f.region, airline: f.airline,
      outbound: { flightNo: f.outFlight, origin: f.origin, destination: f.destination, dep: f.outDep, arr: f.outArr },
      inbound: { flightNo: f.inFlight, origin: f.destination, destination: f.origin, dep: f.inDep, arr: f.inArr },
      nights, golfPlan: plan, hotelId: cleanStays[0]?.hotelId ?? "", stays: cleanStays.length > 1 ? cleanStays : [], hotelLabel: f.hotelLabel,
      golfCourseIds: shownRounds.map((r) => r.courseId).filter(Boolean), golfStyles: shownRounds.some((r) => r.style) ? shownRounds.map((r) => r.style) : [], golfLabel: f.golfLabel,
      vehicleRuleId: f.vehicleRuleId, extras: extras.filter((x) => x.label.trim() && (x.krw || x.jpy)).map((x) => ({ label: x.label.trim(), krw: x.krw ? Number(x.krw.replace(/[^\d.-]/g, "")) : undefined, jpy: x.jpy ? Number(x.jpy.replace(/[^\d.-]/g, "")) : undefined })), note: f.note,
      exchangeRate: Number(f.exchangeRate), margins: f.margins.split(",").map((m) => Number(m) / 100).filter((m) => m > 0),
      dateFrom: f.dateFrom, dateTo: f.dateTo, legend: f.legend, groupTaxByMonth,
    };
    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", { method: product ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); setErr(j.error === "validation_error" ? JSON.stringify(j.issues?.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`)) : j.error ?? res.statusText); return; }
    const p = await res.json();
    router.push(`/products/${p.id}`); router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <Section icon="ri-node-tree" title="위치" hint="국가 › 지역 › 상품군 › 원가표">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="상품군(상위 상품)" hint="원가표 엑셀 파일 단위 묶음">
            <select value={f.groupId} onChange={(e) => { const g = groups.find((x) => x.id === e.target.value); setF({ ...f, groupId: e.target.value, region: g?.region ?? f.region, airline: g?.airline ?? f.airline }); }} className="w-full">
              <option value="">미분류</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.region} › {g.name}</option>)}
            </select>
          </Field>
          <Field label="원가표 이름(시트명)"><input required value={f.name} onChange={set("name")} className="w-full" placeholder="다카마쓰 사카이데 그랜드호텔 3박 36홀" /></Field>
          <Field label="지역"><input value={f.region} onChange={set("region")} className="w-full" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="판매 유형"><select value={f.saleType} onChange={set("saleType")} className="w-full"><option value="air">항공 포함</option><option value="land">현지착</option></select></Field>
            <Field label="기준 인원"><input type="number" min={1} value={f.paxBasis} onChange={set("paxBasis")} className="w-full" placeholder="4" /></Field>
          </div>
        </div>
      </Section>

      <Section icon="ri-flight-takeoff-line" title="항공 · 일정" hint={land ? "현지착: 항공료는 원가에 넣지 않고 참고용으로만 보여 줍니다" : "인디비 운임은 크롤러, 그룹가는 표에서 날짜별 입력"}>
        <div className="grid gap-3 md:grid-cols-7">
          <Field label="항공사 코드"><input value={f.airline} onChange={set("airline")} className="w-full" /></Field>
          <Field label="출발편"><input value={f.outFlight} onChange={set("outFlight")} className="w-full" /></Field>
          <Field label="출발 → 도착"><div className="flex gap-1"><input value={f.origin} onChange={set("origin")} className="w-full" /><input value={f.destination} onChange={set("destination")} className="w-full" /></div></Field>
          <Field label="출발편 시간"><div className="flex gap-1"><input value={f.outDep} onChange={set("outDep")} className="w-full" /><input value={f.outArr} onChange={set("outArr")} className="w-full" /></div></Field>
          <Field label="귀국편"><input value={f.inFlight} onChange={set("inFlight")} className="w-full" /></Field>
          <Field label="귀국편 시간"><div className="flex gap-1"><input value={f.inDep} onChange={set("inDep")} className="w-full" /><input value={f.inArr} onChange={set("inArr")} className="w-full" /></div></Field>
          <Field label="박수"><input type="number" min={1} max={14} value={f.nights} onChange={(e) => { setF({ ...f, nights: Number(e.target.value) }); if (stays.length === 1) setStays([{ ...stays[0], nights: Number(e.target.value) }]); }} className="w-full" /></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="출발일 시작"><input type="date" required value={f.dateFrom} onChange={set("dateFrom")} className="w-full" /></Field>
          <Field label="출발일 끝"><input type="date" required value={f.dateTo} onChange={set("dateTo")} className="w-full" /></Field>
          {!land && <div className="md:col-span-2"><Field label="월별 그룹 유류할증+택스(유택)" hint="한 줄에 하나: 2026-09=172000 / 2026-11=미정"><textarea rows={2} value={f.groupTax} onChange={set("groupTax")} className="w-full font-mono text-xs" /></Field></div>}
        </div>
      </Section>

      <Section icon="ri-hotel-bed-line" title="숙박" hint={`순서대로 묵습니다 · 박수 합 ${stayNights}/${nights}박`}>
        {stays.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-16 text-xs font-bold text-[var(--admin-text-muted)]">{stays.slice(0, i).reduce((a, x) => a + x.nights, 0) + 1}박째부터</span>
            <select value={s.hotelId} onChange={(e) => setStays(stays.map((x, j) => (j === i ? { ...x, hotelId: e.target.value } : x)))} className="min-w-64">{regionHotels(s.hotelId).map((h) => <option key={h.id} value={h.id}>{h.name}{h.dateRates && Object.keys(h.dateRates).length ? " · 일자별 요금" : ""}</option>)}</select>
            <input type="number" min={1} max={14} value={s.nights} onChange={(e) => setStays(stays.map((x, j) => (j === i ? { ...x, nights: Number(e.target.value) } : x)))} className="w-20" /> 박
            {stays.length > 1 && <button type="button" className="text-neutral-400 hover:text-red-600" onClick={() => setStays(stays.filter((_, j) => j !== i))}>✕</button>}
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-3">
          <button type="button" className="btn-ghost" onClick={() => setStays([...stays, { hotelId: regionHotels("")[0]?.id ?? hotels[0]?.id ?? "", nights: 1 }])}>+ 호텔 나눠 묵기</button>
          <div className="min-w-72 flex-1"><Field label="엑셀 머리글 호텔 문구(선택)" hint="줄바꿈 그대로 머리글에 들어갑니다 · 비우면 호텔명 + N박"><textarea rows={2} value={f.hotelLabel} onChange={set("hotelLabel")} className="w-full" placeholder={"사카이데그랜드호텔 3박\n우다츠 그랜드호텔 3박"} /></Field></div>
        </div>
      </Section>

      <Section icon="ri-golf-ball-line" title="골프" hint="라운드마다 골프장과 플레이 스타일을 지정합니다">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`일자별 홀수 (${nights + 1}일, 콤마 구분)`} hint="예: 0,18,18,0 → 2·3일차 18홀 / 조조 항공편은 18,18,18,0"><input value={f.golfPlan} onChange={set("golfPlan")} className="w-full" /></Field>
          <Field label="엑셀 머리글 골프 문구(선택)" hint="비우면 골프 N회 + 홀수"><textarea rows={2} value={f.golfLabel} onChange={set("golfLabel")} className="w-full" /></Field>
        </div>
        {playDays.map((d, i) => { const r = shownRounds[i]; const styles = stylesOf(courses.find((c) => c.id === r.courseId)); return (
          <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-28 text-xs font-bold text-[var(--admin-text-muted)]">{i + 1}R · {d.day}일차 {d.h}H</span>
            <select value={r.courseId} onChange={(e) => setRound(i, { courseId: e.target.value, style: stylesOf(courses.find((c) => c.id === e.target.value)).includes(r.style) ? r.style : "" })} className="min-w-64">{regionCourses(r.courseId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={r.style} onChange={(e) => setRound(i, { style: e.target.value })} className="w-40" title="골프장 요금표에 스타일별 요금이 있을 때 고릅니다">
              <option value="">기본 요금</option>
              {styles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>); })}
      </Section>

      <Section icon="ri-taxi-line" title="차량 · 기타 원가" hint="1인 기준 금액">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="차량+지원비 규칙"><select value={f.vehicleRuleId} onChange={set("vehicleRuleId")} className="w-full">{vehicles.filter((v) => v.region === f.region || v.id === f.vehicleRuleId).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
          <div className="space-y-1.5">
            <span className="admin-label block text-sm">기타 원가(석식·가이드비 등)</span>
            {extras.map((x, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm">
                <input value={x.label} placeholder="항목 이름" onChange={(e) => setExtras(extras.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} className="min-w-0 flex-1" />
                <input value={x.krw} placeholder="원" onChange={(e) => setExtras(extras.map((y, j) => (j === i ? { ...y, krw: e.target.value } : y)))} className="w-28 text-right" />
                <input value={x.jpy} placeholder="엔" onChange={(e) => setExtras(extras.map((y, j) => (j === i ? { ...y, jpy: e.target.value } : y)))} className="w-24 text-right" />
                <button type="button" className="text-neutral-400 hover:text-red-600" onClick={() => setExtras(extras.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={() => setExtras([...extras, { label: "", krw: "", jpy: "" }])}>+ 기타 원가</button>
          </div>
        </div>
      </Section>

      <Section icon="ri-percent-line" title="환율 · 마진 · 표기">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="환율 (원/엔)"><input type="number" step="0.01" value={f.exchangeRate} onChange={set("exchangeRate")} className="w-full" /></Field>
          <Field label="마진 % (콤마 구분)" hint="판매가 = 원가 ÷ (1 − 마진)"><input value={f.margins} onChange={set("margins")} className="w-full" /></Field>
          <Field label="범례 문구"><input value={f.legend} onChange={set("legend")} className="w-full" /></Field>
          <Field label="비고(추천 조합 등)"><input value={f.note} onChange={set("note")} className="w-full" /></Field>
        </div>
      </Section>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2"><button className="btn" disabled={busy}>{product ? "저장" : "원가표 만들기"}</button>{product && <span className="self-center text-xs text-neutral-500">날짜별 그룹가·판매가·수동조정은 아래 표에서 셀을 직접 편집하세요.</span>}</div>
    </form>
  );
}
