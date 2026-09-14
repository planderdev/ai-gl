"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GolfCourse, Hotel, Product, VehicleRule } from "@/types";

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (<label className="block text-sm"><span className="admin-label mb-1 block">{label}</span>{children}{hint && <span className="mt-0.5 block text-[11px] text-neutral-400">{hint}</span>}</label>);

type Props = { product?: Product; hotels: Hotel[]; courses: GolfCourse[]; vehicles: VehicleRule[]; defaults: { exchangeRate: number; margins: number[] } };

export default function ProductForm({ product, hotels, courses, vehicles, defaults }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState(() => ({
    name: product?.name ?? "", region: product?.region ?? hotels[0]?.region ?? "다카마쓰", airline: product?.airline ?? "RS",
    outFlight: product?.outbound.flightNo ?? "RS741", outDep: product?.outbound.dep ?? "08:45", outArr: product?.outbound.arr ?? "10:30", origin: product?.outbound.origin ?? "ICN", destination: product?.outbound.destination ?? "TAK",
    inFlight: product?.inbound.flightNo ?? "RS742", inDep: product?.inbound.dep ?? "11:35", inArr: product?.inbound.arr ?? "13:20",
    nights: product?.nights ?? 3, golfPlan: (product?.golfPlan ?? [18, 18, 0, 0]).join(","),
    hotelId: product?.hotelId ?? hotels[0]?.id ?? "", hotelLabel: product?.hotelLabel ?? "",
    golfCourseIds: product?.golfCourseIds ?? (courses[0] ? [courses[0].id] : []), vehicleRuleId: product?.vehicleRuleId ?? vehicles[0]?.id ?? "",
    exchangeRate: product?.exchangeRate ?? defaults.exchangeRate, margins: (product?.margins ?? defaults.margins).map((m) => Math.round(m * 100)).join(","),
    dateFrom: product?.dateFrom ?? "", dateTo: product?.dateTo ?? "", legend: product?.legend ?? "**노란색날짜 : 스팟특가**",
    groupTax: Object.entries(product?.groupTaxByMonth ?? {}).map(([k, v]) => `${k}=${v}`).join("\n"),
  }));
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const golfPlan = f.golfPlan.split(",").map((x) => parseInt(x.trim()) || 0);
    const groupTaxByMonth: Record<string, number | "미정"> = {};
    for (const line of f.groupTax.split("\n")) { const [k, v] = line.split("="); if (k?.trim()) groupTaxByMonth[k.trim()] = v?.trim() === "미정" || !v ? "미정" : Number(v.replace(/[^\d]/g, "")); }
    const body = {
      name: f.name, region: f.region, airline: f.airline,
      outbound: { flightNo: f.outFlight, origin: f.origin, destination: f.destination, dep: f.outDep, arr: f.outArr },
      inbound: { flightNo: f.inFlight, origin: f.destination, destination: f.origin, dep: f.inDep, arr: f.inArr },
      nights: Number(f.nights), golfPlan, hotelId: f.hotelId, hotelLabel: f.hotelLabel || undefined, golfCourseIds: f.golfCourseIds, vehicleRuleId: f.vehicleRuleId,
      exchangeRate: Number(f.exchangeRate), margins: f.margins.split(",").map((m) => Number(m) / 100).filter((m) => m > 0),
      dateFrom: f.dateFrom, dateTo: f.dateTo, legend: f.legend || undefined, groupTaxByMonth,
    };
    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", { method: product ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); setErr(j.error === "validation_error" ? JSON.stringify(j.issues?.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`)) : j.error ?? res.statusText); return; }
    const p = await res.json();
    router.push(`/products/${p.id}`); router.refresh();
  }
  const dayCount = Number(f.nights) + 1;
  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="상품명(시트명)"><input required value={f.name} onChange={set("name")} className="w-full" placeholder="다카마쓰 사카이데 그랜드호텔 3박 36홀" /></Field>
        <Field label="지역"><input value={f.region} onChange={set("region")} className="w-full" /></Field>
        <Field label="항공사 코드"><input value={f.airline} onChange={set("airline")} className="w-full" /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-6">
        <Field label="출발편"><input value={f.outFlight} onChange={set("outFlight")} className="w-full" /></Field>
        <Field label="출발 → 도착"><div className="flex gap-1"><input value={f.origin} onChange={set("origin")} className="w-full" /><input value={f.destination} onChange={set("destination")} className="w-full" /></div></Field>
        <Field label="출발편 시간"><div className="flex gap-1"><input value={f.outDep} onChange={set("outDep")} className="w-full" /><input value={f.outArr} onChange={set("outArr")} className="w-full" /></div></Field>
        <Field label="귀국편"><input value={f.inFlight} onChange={set("inFlight")} className="w-full" /></Field>
        <Field label="귀국편 시간"><div className="flex gap-1"><input value={f.inDep} onChange={set("inDep")} className="w-full" /><input value={f.inArr} onChange={set("inArr")} className="w-full" /></div></Field>
        <Field label="박수"><input type="number" min={1} max={14} value={f.nights} onChange={set("nights")} className="w-full" /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label={`일자별 홀수 (${dayCount}일, 콤마 구분)`} hint="예: 0,18,18,0 → 2일차·3일차 18홀"><input value={f.golfPlan} onChange={set("golfPlan")} className="w-full" /></Field>
        <Field label="호텔"><select value={f.hotelId} onChange={set("hotelId")} className="w-full">{hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>
        <Field label="골프장(라운드 순서, 복수 선택)" hint="선택한 순서대로 1·2·3라운드 배정, 부족하면 순환">
          <select multiple value={f.golfCourseIds} onChange={(e) => setF({ ...f, golfCourseIds: [...e.target.selectedOptions].map((o) => o.value) })} className="h-24 w-full">{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </Field>
        <Field label="차량+지원비 규칙"><select value={f.vehicleRuleId} onChange={set("vehicleRuleId")} className="w-full">{vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Field label="출발일 시작"><input type="date" required value={f.dateFrom} onChange={set("dateFrom")} className="w-full" /></Field>
        <Field label="출발일 끝"><input type="date" required value={f.dateTo} onChange={set("dateTo")} className="w-full" /></Field>
        <Field label="환율 (원/엔)"><input type="number" step="0.01" value={f.exchangeRate} onChange={set("exchangeRate")} className="w-full" /></Field>
        <Field label="마진 % (콤마 구분)" hint="판매가 = 원가 ÷ (1 − 마진)"><input value={f.margins} onChange={set("margins")} className="w-full" /></Field>
        <Field label="범례 문구"><input value={f.legend} onChange={set("legend")} className="w-full" /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="헤더 호텔 문구(선택)" hint="비우면 호텔명 + N박"><input value={f.hotelLabel} onChange={set("hotelLabel")} className="w-full" placeholder={"사카이데그랜드호텔 3박\n우다츠 그랜드호텔 3박"} /></Field>
        <Field label="월별 그룹 유류할증+택스(유택)" hint="한 줄에 하나: 2026-09=172000 / 2026-11=미정"><textarea rows={3} value={f.groupTax} onChange={set("groupTax")} className="w-full font-mono text-xs" /></Field>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2"><button className="btn" disabled={busy}>{product ? "저장" : "상품 만들기"}</button>{product && <span className="self-center text-xs text-neutral-500">날짜별 그룹가·수동조정은 아래 표에서 셀을 직접 편집하세요.</span>}</div>
    </form>
  );
}
