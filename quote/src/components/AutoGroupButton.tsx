"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** 미분류 원가표를 지역·호텔·항공편이 같은 것끼리 상품군으로 묶는다 */
export default function AutoGroupButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!count) return null;
  return (
    <button type="button" className="admin-btn admin-btn--light" disabled={busy} title="지역·호텔·항공편이 같은 원가표끼리 상품군을 만들어 묶습니다" onClick={async () => { setBusy(true); const res = await fetch("/api/product-groups/auto", { method: "POST" }); setBusy(false); if (!res.ok) alert("묶기 실패: " + (await res.text())); router.refresh(); }}>
      <i className="ri-node-tree" /> {busy ? "묶는 중…" : `미분류 ${count}개 자동 묶기`}
    </button>
  );
}
