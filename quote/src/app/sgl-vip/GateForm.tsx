"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { VIP_SUPPORT_TEL } from "@/lib/sgl-vip/config";
import { Icon } from "./Brand";

/** 입장 코드 입력. 코드 확인은 서버에서만 한다 */
export default function GateForm() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const code = input.current?.value.trim() ?? "";
    if (!code) { setError("입장 코드를 입력해 주세요"); input.current?.focus(); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/public/sgl-vip/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      if (res.ok) { router.push("/sgl-vip/apply"); return; } // 페이지가 바뀔 때까지 버튼은 접수 중으로 둔다
      setError(res.status === 401 ? "코드가 맞지 않아요. 다시 확인해 주세요." : res.status === 429 ? "시도가 너무 많아요. 몇 분 뒤 다시 시도해 주세요." : `일시적인 오류가 있어요. 다시 시도하거나 고객센터(${VIP_SUPPORT_TEL})로 연락해 주세요.`);
    } catch {
      setError("인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
    }
    setBusy(false);
    input.current?.select();
  }

  return (
    <form className="vip-gate__form" onSubmit={submit} noValidate>
      <label htmlFor="vip-code">입장 코드</label>
      <input ref={input} id="vip-code" className="vip-input vip-gate__input" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false} enterKeyHint="go" maxLength={40} placeholder="코드를 입력해 주세요" onChange={() => error && setError("")} aria-invalid={!!error} aria-describedby={error ? "vip-code-error" : "vip-code-help"} />
      {error && <p className="vip-gate__error" id="vip-code-error" role="alert">{error}</p>}
      <button type="submit" className="vip-btn vip-btn--full" disabled={busy}>{busy ? "확인 중…" : <>입장하기 <Icon name="arrow" /></>}</button>
      <p className="vip-gate__help" id="vip-code-help">코드가 없으신가요? 광고 댓글에 <b>&ldquo;26&rdquo;</b>을 남겨주시면 DM으로 보내드립니다.</p>
    </form>
  );
}
