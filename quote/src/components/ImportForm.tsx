"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** 원가표 입력표(직접 채우는 양식) 또는 기존 원가표 파일을 올린다. 양식은 서버가 파일 내용으로 구분한다 */
export default function ImportForm() {
  const router = useRouter();
  const [log, setLog] = useState<string[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const res = await fetch("/api/import", { method: "POST", body: new FormData(e.currentTarget) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    setFailed(res.ok ? null : j.error ?? "가져오지 못했습니다");
    setLog(j.log ?? (res.ok ? [] : null));
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-bold">원가표 엑셀 가져오기</h2>
        <a href="/api/input-template" className="admin-btn admin-btn--light admin-btn--xs ml-auto" title="채워서 올리면 상품군·원가표·단가가 만들어지는 입력 양식"><i className="ri-download-2-line" /> 입력표 빈 양식 받기</a>
      </div>
      <div className="grid gap-2 text-xs text-neutral-500 md:grid-cols-2">
        <p className="rounded-xl bg-[var(--admin-surface-muted)] p-3"><b className="text-[var(--admin-text-strong)]">원가표 입력표</b><br />빈 양식을 받아 상품군·원가표·호텔·골프장·차량 요금을 채워 올립니다. 고칠 곳이 있으면 저장하지 않고 어디인지 알려 줍니다. 이미 있는 상품군은 상품 구조 화면의 <b>입력표</b> 버튼으로 채워진 양식을 받아 고쳐 올릴 수 있습니다.</p>
        <p className="rounded-xl bg-[var(--admin-surface-muted)] p-3"><b className="text-[var(--admin-text-strong)]">기존 원가표 파일</b><br />쓰던 원가표(.xlsx)를 그대로 올립니다. 항공 포함(인디비·그룹) 양식과 현지착 양식을 머리글로 구분하고, 호텔 요금표·골프장 요금표 시트가 있으면 단가에 반영합니다. 규칙과 다른 셀만 수동조정으로 보존됩니다.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2"><input type="file" name="file" accept=".xlsx" required /><input name="region" placeholder="지역 (기존 원가표만 · 비우면 자동)" className="w-56" /><button className="btn" disabled={busy}>{busy ? "가져오는 중…" : "가져오기"}</button></div>
      {failed && <p className="text-sm font-bold text-red-600"><i className="ri-error-warning-line" /> {failed}</p>}
      {log && log.length > 0 && <pre className={`whitespace-pre-wrap rounded p-2 text-xs ${failed ? "bg-red-50 text-red-900" : "bg-neutral-50"}`}>{log.map((l) => (failed ? `· ${l}` : l)).join("\n")}</pre>}
      {!failed && log && <p className="text-sm text-emerald-700"><i className="ri-check-line" /> 가져왔습니다. <Link href="/products" className="font-bold underline">상품 구조</Link>에서 확인하세요.</p>}
    </form>
  );
}
