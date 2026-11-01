"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatPhone, isValidInstagram, isValidPhone, normalizeInstagram, normalizePhone, VIP_REGIONS, VIP_SUPPORT_TEL } from "@/lib/sgl-vip/config";
import { Icon } from "./Brand";

type Field = "name" | "phone" | "instagram" | "privacyConsent";

export default function ApplyForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [usedBefore, setUsedBefore] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState(""); // 허니팟
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const doneTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!done) return;
    document.documentElement.dataset.vipApplied = "1"; // 떠 있는 신청 버튼을 숨긴다
    doneTitle.current?.focus();
  }, [done]);

  const clearError = (f: Field) => setErrors((e) => ({ ...e, [f]: undefined }));

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (!name.trim()) next.name = "이름을 입력해 주세요";
    if (!isValidPhone(normalizePhone(phone))) next.phone = "휴대폰 번호를 정확히 입력해 주세요 (예: 010-1234-5678)";
    if (!isValidInstagram(normalizeInstagram(instagram))) next.instagram = "인스타그램 아이디를 확인해 주세요 (영문·숫자·마침표·밑줄)";
    if (!privacy) next.privacyConsent = "개인정보 수집·이용에 동의해 주세요";
    return next;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next = validate();
    setErrors(next);
    setFormError("");
    const first = Object.keys(next)[0];
    if (first) { document.getElementById(`vip-${first}`)?.focus(); return; }
    setBusy(true);
    const q = new URLSearchParams(window.location.search);
    try {
      const res = await fetch("/api/public/sgl-vip/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, instagram, regions, usedBefore, privacyConsent: privacy, marketingConsent: marketing, website,
          utm_source: q.get("utm_source") ?? "", utm_medium: q.get("utm_medium") ?? "", utm_campaign: q.get("utm_campaign") ?? "", utm_content: q.get("utm_content") ?? "", referrer: document.referrer,
        }),
      });
      if (res.ok) { setDone(true); return; }
      const body = (await res.json().catch(() => ({}))) as { fields?: Partial<Record<Field, string>> };
      if (res.status === 422 && body.fields) setErrors(body.fields);
      else if (res.status === 429) setFormError(`신청이 많아 잠시 제한되었어요. 몇 분 뒤 다시 시도하거나 고객센터(${VIP_SUPPORT_TEL})로 연락해 주세요.`);
      else setFormError(`일시적인 오류로 접수되지 않았어요. 입력하신 내용은 그대로 있으니 다시 시도해 주세요. 계속되면 고객센터(${VIP_SUPPORT_TEL})로 연락해 주세요.`);
    } catch {
      setFormError("인터넷 연결을 확인한 뒤 다시 시도해 주세요. 입력하신 내용은 그대로 있어요.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/sgl-vip`;
    try {
      if (navigator.share) await navigator.share({ title: "SGL VIP 사전신청", text: "SGL VIP가 12월 26일 오픈합니다. 사전신청하고 먼저 안내받으세요.", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); }
    } catch { /* 공유 창을 닫은 경우 */ }
  }

  if (done) return (
    <div className="vip-done">
      <span className="vip-done__mark"><Icon name="check" /></span>
      <h3 ref={doneTitle} tabIndex={-1}>사전신청이 완료되었습니다</h3>
      <p><b>{name.trim()}</b>님, 남겨주신 연락처로 담당자가 SGL VIP 상세 내용을 안내해 드릴게요.</p>
      <ul>
        <li><span>매주 일요일 19시</span>새 혜택 공개</li>
        <li><span>12월 26일</span>SGL VIP 오픈</li>
      </ul>
      <button type="button" className="vip-btn vip-btn--ghost" onClick={share}><Icon name="share" /> {copied ? "링크를 복사했어요" : "함께 라운딩할 분께 공유하기"}</button>
    </div>
  );

  return (
    <form className="vip-form" onSubmit={submit} noValidate>
      <div className="vip-field">
        <label htmlFor="vip-name">이름</label>
        <input id="vip-name" className="vip-input" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} autoComplete="name" maxLength={30} placeholder="홍길동" aria-invalid={!!errors.name} aria-describedby={errors.name ? "vip-name-error" : undefined} />
        {errors.name && <p className="vip-error" id="vip-name-error">{errors.name}</p>}
      </div>
      <div className="vip-field">
        <label htmlFor="vip-phone">휴대폰 번호</label>
        <input id="vip-phone" className="vip-input" type="tel" inputMode="numeric" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError("phone"); }} autoComplete="tel-national" placeholder="010-1234-5678" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "vip-phone-error" : undefined} />
        {errors.phone && <p className="vip-error" id="vip-phone-error">{errors.phone}</p>}
      </div>
      <div className="vip-field">
        <label htmlFor="vip-instagram">인스타그램 ID <em>선택</em></label>
        <input id="vip-instagram" className="vip-input" value={instagram} onChange={(e) => { setInstagram(e.target.value); clearError("instagram"); }} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={80} placeholder="@golf_lover" aria-invalid={!!errors.instagram} aria-describedby={errors.instagram ? "vip-instagram-error" : "vip-instagram-help"} />
        {errors.instagram ? <p className="vip-error" id="vip-instagram-error">{errors.instagram}</p> : <p className="vip-help" id="vip-instagram-help">남겨주시면 DM으로도 상세 내용을 안내해 드려요.</p>}
      </div>
      <fieldset className="vip-field">
        <legend>관심 여행지 <em>선택</em></legend>
        <div className="vip-chips">
          {VIP_REGIONS.map((r) => (
            <label key={r} className="vip-chip">
              <input type="checkbox" checked={regions.includes(r)} onChange={(e) => setRegions(e.target.checked ? [...regions, r] : regions.filter((x) => x !== r))} />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="vip-check vip-check--card">
        <input type="checkbox" checked={usedBefore} onChange={(e) => setUsedBefore(e.target.checked)} />
        <span className="vip-check__box" aria-hidden><Icon name="check" /></span>
        <span>SGL을 1번 이상 이용해 봤어요</span>
      </label>

      <div className="vip-consents">
        <label className="vip-check">
          <input id="vip-privacyConsent" type="checkbox" checked={privacy} onChange={(e) => { setPrivacy(e.target.checked); clearError("privacyConsent"); }} aria-invalid={!!errors.privacyConsent} aria-describedby={errors.privacyConsent ? "vip-privacy-error" : undefined} />
          <span className="vip-check__box" aria-hidden><Icon name="check" /></span>
          <span><b>[필수]</b> 개인정보 수집·이용 동의</span>
        </label>
        <details className="vip-terms">
          <summary>내용 보기</summary>
          <dl>
            <div><dt>수집 항목</dt><dd>필수: 이름, 휴대폰 번호 / 선택: 인스타그램 ID, 관심 여행지, SGL 이용 여부</dd></div>
            <div><dt>이용 목적</dt><dd>SGL VIP 사전신청 접수, 오픈·혜택·가입 방법 안내</dd></div>
            <div><dt>보유 기간</dt><dd>신청일로부터 1년 또는 동의 철회 시까지</dd></div>
          </dl>
          <p>동의를 거부할 수 있으나, 거부하시면 사전신청을 하실 수 없습니다. 철회·삭제 요청은 <span className="vip-nowrap">고객센터({VIP_SUPPORT_TEL})</span>로 연락해 주세요.</p>
        </details>
        {errors.privacyConsent && <p className="vip-error" id="vip-privacy-error">{errors.privacyConsent}</p>}
        <label className="vip-check">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <span className="vip-check__box" aria-hidden><Icon name="check" /></span>
          <span><b className="is-optional">[선택]</b> 마케팅 정보 수신 동의</span>
        </label>
        <details className="vip-terms">
          <summary>내용 보기</summary>
          <p>SGL의 혜택·이벤트 소식을 문자, 카카오톡, 인스타그램 DM으로 받습니다. 동의하지 않아도 사전신청에는 영향이 없으며, 언제든 철회할 수 있습니다.</p>
        </details>
      </div>

      <div className="vip-honey" aria-hidden>
        <label>웹사이트<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {formError && <p className="vip-error vip-error--form" role="alert">{formError}</p>}
      <button type="submit" className="vip-btn vip-btn--full" disabled={busy}>{busy ? "접수 중…" : "사전신청 완료하기"}</button>
      <p className="vip-form__foot">사전신청은 무료이며, 결제는 진행되지 않습니다.</p>
    </form>
  );
}
