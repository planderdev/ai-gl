"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FareRequestButton({ productId, missing }: { productId: string; missing: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  async function go(all: boolean) {
    const res = await fetch(`/api/products/${productId}/fare-request${all ? "?all=1" : ""}`, { method: "POST" });
    const j = await res.json();
    setMsg(j.created ? `요청 생성됨 (${j.request.from} ~ ${j.request.to})` : j.reason ?? j.error);
    router.refresh();
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button className="btn-ghost" onClick={() => go(false)} disabled={!missing}>운임 크롤링 요청 ({missing}건 미수집)</button>
      <button className="btn-ghost" onClick={() => go(true)}>전체 기간 재수집</button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </span>
  );
}
