"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Product, QuoteRow } from "@/types";
import { krw, pct } from "@/lib/format";

type Props = { product: Product; rows: QuoteRow[] };
type Key = "outboundFare" | "inboundFare" | "groupFare" | "hotelJpy" | "golfJpy" | "vehicleKrw" | "airSurchargeKrw" | "airIndivKrw" | "directSalePrice" | "memo";

const md = (s: string) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`;
const parseMoney = (raw: string): number | "미정" | "운항없음" | "마감" | null => {
  const s = raw.trim();
  if (!s) return null;
  if (s === "미정" || s === "운항없음" || s === "마감") return s;
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function Cell({ r, k, value, jp, text, onSave }: { r: QuoteRow; k: Key; value: unknown; jp?: boolean; text?: boolean; onSave: (date: string, patch: Record<string, unknown>) => void }) {
  const overridden = k === "groupFare" ? false : (r.override as Record<string, unknown>)[k] != null;
  const display = text ? String(value ?? "") : typeof value === "number" ? Math.round(value).toLocaleString("ko-KR") : String(value ?? "");
  return (
    <input
      key={`${r.date}-${k}-${display}`}
      defaultValue={display}
      title={overridden ? "수동 입력값 — 비우면 자동계산으로 복귀" : jp ? "엔" : "원"}
      className={`cell-input ${overridden ? "bg-orange-50 font-medium text-orange-900" : ""} ${text ? "w-24 text-left" : ""}`}
      onBlur={(e) => {
        if (e.target.value === display) return;
        const v = text ? e.target.value || null : parseMoney(e.target.value);
        if (!text && k !== "outboundFare" && k !== "inboundFare" && k !== "groupFare" && typeof v === "string") return alert("숫자를 입력하세요");
        onSave(r.date, { [k]: v });
      }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "NumpadEnter") (e.target as HTMLInputElement).blur(); }}
    />
  );
}

export default function QuoteTable({ product, rows }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showHidden, setShowHidden] = useState(false);
  const [detail, setDetail] = useState<QuoteRow | null>(null);
  const m = product.margins;

  async function save(date: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/products/${product.id}/overrides`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, patch }) });
    if (!res.ok) alert("저장 실패: " + (await res.text()));
    start(() => router.refresh());
  }
  const hiddenDates = Object.entries(product.overrides).filter(([, o]) => o.hidden).map(([d]) => d);
  const num = (v: unknown) => (typeof v === "number" ? Math.round(v).toLocaleString("ko-KR") : String(v ?? "미정"));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
        <span className="admin-chip admin-chip--warning">주황 셀 = 수동 입력(비우면 자동)</span>
        <span className="admin-chip" style={{ background: "#fef9c3", color: "#854d0e" }}>노란 날짜 = 스팟특가</span>
        <span className="admin-chip admin-chip--gray">회색 운임 = 미수집</span>
        <label className="ml-auto flex items-center gap-1"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /> 숨긴 날짜 표시 ({hiddenDates.length})</label>
        {pending && <span className="text-neutral-400">저장 중…</span>}
      </div>
      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-[var(--admin-border)] bg-white shadow-[var(--shadow-card)]">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="th sticky left-0 z-20 bg-neutral-100">날짜</th><th className="th">요일</th><th className="th">{product.outbound.flightNo}</th><th className="th">귀국</th><th className="th">{product.inbound.flightNo}</th>
              <th className="th">그룹가</th><th className="th">유택</th><th className="th">항공{"\n"}인디비</th><th className="th">항공{"\n"}그룹</th>
              <th className="th">호텔 ¥</th><th className="th">호텔 ₩</th><th className="th">골프 ¥</th><th className="th">골프 ₩</th><th className="th">차량+{"\n"}지원비</th><th className="th">항공{"\n"}추가금</th>
              <th className="th bg-neutral-200">인디비{"\n"}원가</th><th className="th bg-neutral-200">그룹{"\n"}원가</th>
              {m.map((x) => <th key={`i${x}`} className="th bg-sky-100">인디비{"\n"}{pct(x)}</th>)}
              {m.map((x) => <th key={`g${x}`} className="th bg-emerald-100">그룹{"\n"}{pct(x)}</th>)}
              <th className="th">인스타{"\n"}직판</th><th className="th">메모</th><th className="th">플래그</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const ov = r.override;
              const dateCls = ov.spotSpecial ? "bg-yellow-100 font-semibold text-red-600" : "bg-white";
              const fareCls = (v: unknown) => (typeof v === "number" ? "" : "text-neutral-400");
              return (
                <tr key={r.date} className={`hover:bg-neutral-50 ${r.weekday === 0 || r.weekday === 6 ? "bg-neutral-50/60" : ""}`}>
                  <td className={`td sticky left-0 z-10 cursor-pointer text-center ${dateCls}`} onClick={() => setDetail(r)} title="계산 내역 보기">{md(r.date)}</td>
                  <td className={`td text-center ${r.weekday === 0 ? "text-red-500" : r.weekday === 6 ? "text-blue-600" : ""}`}>{r.weekdayLabel}</td>
                  <td className={`td ${fareCls(r.outboundFare)}`}><Cell onSave={save} r={r} k="outboundFare" value={r.outboundFare ?? "미정"} /></td>
                  <td className="td text-center text-neutral-500">{md(r.returnDate)}</td>
                  <td className={`td ${fareCls(r.inboundFare)}`}><Cell onSave={save} r={r} k="inboundFare" value={r.inboundFare ?? "미정"} /></td>
                  <td className={`td ${ov.groupSpecial ? "bg-yellow-100" : ""}`}><Cell onSave={save} r={r} k="groupFare" value={r.groupFare ?? ""} /></td>
                  <td className="td text-neutral-600">{num(r.groupTax)}</td>
                  <td className={`td font-medium ${ov.airIndivKrw != null ? "bg-orange-50" : ""}`}><Cell onSave={save} r={r} k="airIndivKrw" value={r.airIndiv} /></td>
                  <td className={`td font-medium ${ov.groupSpecial ? "bg-yellow-100" : ""}`}>{num(r.airGroup)}</td>
                  <td className="td"><Cell onSave={save} r={r} k="hotelJpy" value={r.hotelJpy} jp /></td>
                  <td className="td text-neutral-600">{krw(r.hotelKrw)}</td>
                  <td className="td"><Cell onSave={save} r={r} k="golfJpy" value={r.golfJpy} jp /></td>
                  <td className="td text-neutral-600">{krw(r.golfKrw)}</td>
                  <td className="td"><Cell onSave={save} r={r} k="vehicleKrw" value={r.vehicleKrw} /></td>
                  <td className="td"><Cell onSave={save} r={r} k="airSurchargeKrw" value={r.airSurchargeKrw || ""} /></td>
                  <td className="td bg-neutral-100 font-semibold">{num(r.costIndiv)}</td>
                  <td className="td bg-neutral-100 font-semibold">{num(r.costGroup)}</td>
                  {r.salesIndiv.map((v, i) => <td key={i} className="td bg-sky-50 font-semibold text-sky-900">{num(v)}</td>)}
                  {r.salesGroup.map((v, i) => <td key={i} className="td bg-emerald-50 font-semibold text-emerald-900">{num(v)}</td>)}
                  <td className="td"><Cell onSave={save} r={r} k="directSalePrice" value={ov.directSalePrice} text /></td>
                  <td className="td"><Cell onSave={save} r={r} k="memo" value={ov.memo} text /></td>
                  <td className="td whitespace-nowrap text-center">
                    <button title="스팟특가" onClick={() => save(r.date, { spotSpecial: ov.spotSpecial ? null : true })} className={`rounded px-1 text-[11px] ${ov.spotSpecial ? "bg-yellow-300" : "bg-neutral-100 text-neutral-400"}`}>특가</button>{" "}
                    <button title="그룹가 강조" onClick={() => save(r.date, { groupSpecial: ov.groupSpecial ? null : true })} className={`rounded px-1 text-[11px] ${ov.groupSpecial ? "bg-yellow-300" : "bg-neutral-100 text-neutral-400"}`}>그룹</button>{" "}
                    <button title="마감" onClick={() => save(r.date, { soldOut: ov.soldOut ? null : true })} className={`rounded px-1 text-[11px] ${ov.soldOut ? "bg-red-200 text-red-800" : "bg-neutral-100 text-neutral-400"}`}>마감</button>{" "}
                    <button title="이 날짜 숨김" onClick={() => save(r.date, { hidden: true })} className="rounded bg-neutral-100 px-1 text-[11px] text-neutral-400 hover:bg-red-100 hover:text-red-700">숨김</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showHidden && hiddenDates.length > 0 && (
        <div className="card text-sm"><b>숨긴 날짜</b>: {hiddenDates.map((d) => <button key={d} onClick={() => save(d, { hidden: null })} className="ml-2 rounded bg-neutral-100 px-1.5 text-xs hover:bg-neutral-200" title="복원">{d} ✕</button>)}</div>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setDetail(null)}>
          <div className="card max-h-[80vh] w-full max-w-lg overflow-auto text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">{detail.date} ({detail.weekdayLabel}) 계산 내역</h3><button onClick={() => setDetail(null)} className="btn-ghost">닫기</button></div>
            <p className="mb-1 font-medium">숙박 {detail.hotelJpy.toLocaleString()}엔 {detail.override.hotelJpy != null && <span className="text-orange-700">(수동)</span>}</p>
            <ul className="mb-3 text-xs text-neutral-600">{detail.breakdown.hotelNights.map((n) => <li key={n.date}>{n.date} ({["일","월","화","수","목","금","토"][n.weekday]}) ¥{n.jpy.toLocaleString()}</li>)}</ul>
            <p className="mb-1 font-medium">골프 {detail.golfJpy.toLocaleString()}엔 {detail.override.golfJpy != null && <span className="text-orange-700">(수동)</span>}</p>
            <ul className="mb-3 text-xs text-neutral-600">{detail.breakdown.golfRounds.map((g, i) => <li key={i}>{g.date} ({["일","월","화","수","목","금","토"][g.weekday]} · {g.dayType === "weekday" ? "평일" : g.dayType === "weekend" ? "주말" : "연휴"}) {g.courseName} {g.holes}H ¥{g.jpy.toLocaleString()}</li>)}</ul>
            <p className="text-xs text-neutral-600">차량+지원비 {detail.vehicleKrw.toLocaleString()}원 · 환율 {product.exchangeRate} · 항공 인디비 {num(detail.airIndiv)} / 그룹 {num(detail.airGroup)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
