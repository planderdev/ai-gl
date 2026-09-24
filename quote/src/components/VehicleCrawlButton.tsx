"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VehicleCrawlButton({ providers, current }: { providers: { id: string; label: string }[]; current: string }) {
  const router = useRouter();
  const [provider, setProvider] = useState(current);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[] | null>(null);
  async function run() {
    setBusy(true); setLogs(["요금표 페이지를 읽는 중…"]);
    try {
      const res = await fetch(`/api/crawl/vehicles/${provider}`, { method: "POST" });
      const j = await res.json();
      setLogs([...(j.logs ?? []), res.ok ? `완료: ${j.saved}건 저장` : `실패: ${j.error}`]);
      router.push(`/vehicles?provider=${provider === "all" ? current : provider}`); router.refresh();
    } catch (e) { setLogs([`실패: ${(e as Error).message}`]); } finally { setBusy(false); }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>{providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}<option value="all">전체 도시</option></select>
      <button className="admin-btn admin-btn--primary" disabled={busy} onClick={run}><i className="ri-refresh-line" /> 지금 수집</button>
      {logs && <span className="text-xs text-[var(--admin-text-muted)]">{logs.join(" · ")}</span>}
    </div>
  );
}
