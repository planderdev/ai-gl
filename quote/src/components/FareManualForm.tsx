"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FareManualForm() {
  const router = useRouter();
  const [f, setF] = useState({ flightNo: "RS741", origin: "ICN", destination: "TAK", date: "", fareKrw: "", status: "ok" });
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/fares", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fares: [{ ...f, fareKrw: f.fareKrw ? Number(f.fareKrw) : null, source: "manual" }] }) });
    setMsg(res.ok ? "저장됨" : `실패 ${res.status}`); router.refresh();
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 text-sm">
      <label>편명<input value={f.flightNo} onChange={set("flightNo")} className="ml-1 w-20" /></label>
      <label>출발<input value={f.origin} onChange={set("origin")} className="ml-1 w-14" /></label>
      <label>도착<input value={f.destination} onChange={set("destination")} className="ml-1 w-14" /></label>
      <label>날짜<input type="date" required value={f.date} onChange={set("date")} className="ml-1" /></label>
      <label>운임(원)<input type="number" value={f.fareKrw} onChange={set("fareKrw")} className="ml-1 w-28" /></label>
      <label>상태<select value={f.status} onChange={set("status")} className="ml-1"><option value="ok">확인</option><option value="no_flight">운항없음</option><option value="sold_out">마감</option><option value="unknown">미정</option></select></label>
      <button className="btn">수동 입력</button><span className="text-xs text-neutral-500">{msg}</span>
    </form>
  );
}
