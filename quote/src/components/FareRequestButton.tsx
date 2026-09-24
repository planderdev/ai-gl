"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FareRequestButton({ productId, missing }: { productId: string; missing: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pax, setPax] = useState(4);
  async function go(all: boolean) {
    const res = await fetch(`/api/products/${productId}/fare-request?pax=${pax}${all ? "&all=1" : ""}`, { method: "POST" });
    const j = await res.json();
    setMsg(j.created ? `요청 생성됨 (${j.request.from} ~ ${j.request.to})` : j.reason ?? j.error);
    router.refresh();
  }
  return (
    <span className="inline-flex items-center gap-2">
      <select value={pax} onChange={(e) => setPax(Number(e.target.value))} title="조회 기준 인원">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}인</option>)}</select>
      <button className="btn-ghost" onClick={() => go(false)} disabled={!missing}>운임 크롤링 요청 ({missing}건 미수집)</button>
      <button className="btn-ghost" onClick={() => go(true)}>전체 기간 재수집</button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </span>
  );
}
