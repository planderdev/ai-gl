"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ImportForm() {
  const router = useRouter();
  const [log, setLog] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const res = await fetch("/api/import", { method: "POST", body: new FormData(e.currentTarget) });
    const j = await res.json(); setBusy(false);
    setLog(res.ok ? j.log : [j.error ?? "실패"]);
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card space-y-2">
      <h2 className="font-bold">기존 원가표 엑셀 가져오기</h2>
      <p className="text-xs text-neutral-500">수작업 원가표(.xlsx)를 올리면 시트마다 상품을 만들고, 항공 운임·그룹가·유택·요일별 숙박/차량 규칙을 추출합니다. 규칙과 다른 셀은 수동조정으로 보존됩니다.</p>
      <div className="flex flex-wrap items-center gap-2"><input type="file" name="file" accept=".xlsx" required /><input name="region" placeholder="지역 (기본 다카마쓰)" /><button className="btn" disabled={busy}>{busy ? "가져오는 중…" : "가져오기"}</button></div>
      {log && <pre className="whitespace-pre-wrap rounded bg-neutral-50 p-2 text-xs">{log.join("\n")}</pre>}
    </form>
  );
}
