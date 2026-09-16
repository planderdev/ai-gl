"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ next, passwordRequired }: { next: string; passwordRequired: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password, remember }) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(j.error ?? "로그인 실패"); return; }
    router.push(next); router.refresh();
  }
  return (
    <form onSubmit={submit} className="admin-login-form">
      <div className="admin-field"><label className="admin-label" htmlFor="adminId">아이디(이메일)</label><input id="adminId" type="text" autoComplete="username" value={name} onChange={(e) => setName(e.target.value)} className="admin-input admin-input--lg" placeholder="planderdev@gmail.com" autoFocus required /></div>
      {passwordRequired && <div className="admin-field"><label className="admin-label" htmlFor="adminPassword">비밀번호</label><input id="adminPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input admin-input--lg" placeholder="비밀번호를 입력하세요" required /></div>}
      <label className="admin-login-form__check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>로그인 상태 유지 (30일)</span></label>
      {err && <p className="text-sm text-[var(--admin-danger)]">{err}</p>}
      <button type="submit" className="admin-btn admin-btn--primary admin-btn--xl admin-btn--block" disabled={busy}>{busy ? "로그인 중…" : "로그인"}</button>
    </form>
  );
}
