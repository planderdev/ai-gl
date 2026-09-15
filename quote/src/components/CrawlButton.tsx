"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PROVIDERS = [{ id: "all", label: "전체(에어서울+제주항공)" }, { id: "airseoul", label: "에어서울 (RS741/742 다카마쓰)" }, { id: "jejuair", label: "제주항공 (7C1704/1703 마쓰야마)" }];

/** 로컬 PC 에서 Chrome 을 띄워 항공사 최저가 달력을 수집 (서버 API 가 Playwright 실행) */
export default function CrawlButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("all");
  const [days, setDays] = useState(180);
  const [logs, setLogs] = useState<string[] | null>(null);
  async function run(mode: "all" | "requests") {
    setBusy(true); setLogs(["Chrome 을 열어 항공사 달력을 조회하는 중… (노선당 수십 초)"]);
    try {
      const res = await fetch(`/api/crawl/${mode === "requests" ? "all" : provider}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, days }) });
      const j = await res.json();
      setLogs([...(j.logs ?? []), res.ok ? `완료: ${j.saved ?? 0}건 저장${j.processed != null ? `, 요청 ${j.processed}건 처리` : ""}` : `실패: ${j.error}`]);
      router.refresh();
    } catch (e) { setLogs([`실패: ${(e as Error).message}`]); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>{PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
        <label className="text-xs text-[var(--admin-text-muted)]">기간 <input type="number" min={30} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-20" /> 일</label>
        <button className="admin-btn admin-btn--primary" disabled={busy} onClick={() => run("all")}><i className="ri-refresh-line" /> 지금 수집</button>
        <button className="admin-btn admin-btn--light" disabled={busy || !pendingCount} onClick={() => run("requests")}>대기 요청 {pendingCount}건 처리</button>
      </div>
      {logs && <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--admin-surface-muted)] p-2 text-[11px] text-[var(--admin-text-muted)]">{logs.join("\n")}</pre>}
    </div>
  );
}
