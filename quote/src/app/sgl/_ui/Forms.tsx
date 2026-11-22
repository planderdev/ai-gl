"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { formatPhone, isValidPhone, normalizePhone, PAY_METHOD_LABEL, won, type PayMethod } from "@/lib/sgl/config";
import { Icon } from "./icons";

type Errors = Record<string, string | undefined>;
type Result<T> = { ok: true; data: T } | { ok: false; status: number; fields?: Errors; message?: string };

async function post<T>(url: string, body: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { fields?: Errors; message?: string };
    return res.ok ? { ok: true, data } : { ok: false, status: res.status, fields: data.fields, message: data.message };
  } catch { return { ok: false, status: 0 }; }
}
const failText = (r: { status: number; message?: string }, tel: string) =>
  r.message ?? (r.status === 0 ? "인터넷 연결을 확인한 뒤 다시 시도해 주세요. 입력하신 내용은 그대로 있어요." : r.status === 429 ? `요청이 많아 잠시 제한되었어요. 몇 분 뒤 다시 시도하거나 고객센터(${tel})로 연락해 주세요.` : `일시적인 오류로 처리되지 않았어요. 다시 시도해 주세요. 계속되면 고객센터(${tel})로 연락해 주세요.`);
const tracking = () => { const q = new URLSearchParams(window.location.search); return { utm_source: q.get("utm_source") ?? "", utm_medium: q.get("utm_medium") ?? "", utm_campaign: q.get("utm_campaign") ?? "", utm_content: q.get("utm_content") ?? "", referrer: document.referrer }; };

function Field({ id, label, optional, error, help, children }: { id: string; label: string; optional?: boolean; error?: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <label className="sgl-label" htmlFor={id}>{label}{optional && <em>선택</em>}</label>
      {children}
      {error ? <p className="sgl-error" id={`${id}-error`}>{error}</p> : help ? <p className="sgl-help">{help}</p> : null}
    </div>
  );
}
function Consent({ id, checked, onChange, error, label, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; label: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <label className="sgl-check"><input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} /><span>{label}</span></label>
      {children && <details className="sgl-terms"><summary>내용 보기</summary>{children}</details>}
      {error && <p className="sgl-error" style={{ marginLeft: 29 }}>{error}</p>}
    </div>
  );
}
const Honeypot = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="sgl-honey" aria-hidden><label>웹사이트<input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} /></label></div>
);
const focusFirst = (prefix: string, errors: Errors) => { const k = Object.keys(errors).find((x) => errors[x]); if (k) document.getElementById(`${prefix}-${k}`)?.focus(); return !!k; };

/* ---------- 예약 ---------- */
export function BookForm({ sheetId, date, people, tel, cancelSummary }: { sheetId: string; date: string; people: number; tel: string; cancelSummary: string[] }) {
  const [v, setV] = useState({ name: "", phone: "", email: "", companions: "", request: "", website: "" });
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }); setErrors((x) => ({ ...x, [k]: undefined })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {};
    if (!v.name.trim()) next.name = "예약자 이름을 입력해 주세요";
    if (!isValidPhone(normalizePhone(v.phone))) next.phone = "휴대폰 번호를 정확히 입력해 주세요 (예: 010-1234-5678)";
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) next.email = "이메일 주소를 확인해 주세요";
    if (!privacy) next.privacyConsent = "개인정보 수집·이용에 동의해 주세요";
    if (!terms) next.termsConsent = "예약·취소 규정을 확인해 주세요";
    setErrors(next); setFormError("");
    if (focusFirst("book", next)) return;
    setBusy(true);
    const r = await post<{ url: string }>("/api/public/sgl/bookings", { sheetId, date, people, ...v, privacyConsent: privacy, termsConsent: terms, ...tracking() });
    if (r.ok) { window.location.assign(r.data.url); return; }
    setBusy(false);
    if (r.status === 422 && r.fields) { setErrors(r.fields); focusFirst("book", r.fields); } else setFormError(failText(r, tel));
  }

  return (
    <form className="sgl-form" onSubmit={submit} noValidate>
      <div className="sgl-form__row">
        <Field id="book-name" label="예약자 이름" error={errors.name}><input id="book-name" className="sgl-input" value={v.name} onChange={set("name")} autoComplete="name" maxLength={30} placeholder="홍길동" aria-invalid={!!errors.name} /></Field>
        <Field id="book-phone" label="휴대폰 번호" error={errors.phone} help="예약 안내와 조회에 쓰입니다"><input id="book-phone" className="sgl-input" type="tel" inputMode="numeric" value={v.phone} onChange={set("phone")} autoComplete="tel-national" placeholder="010-1234-5678" aria-invalid={!!errors.phone} /></Field>
      </div>
      <Field id="book-email" label="이메일" optional error={errors.email} help="예약 확인서를 받으실 주소"><input id="book-email" className="sgl-input" type="email" value={v.email} onChange={set("email")} autoComplete="email" maxLength={100} placeholder="name@example.com" aria-invalid={!!errors.email} /></Field>
      <Field id="book-companions" label="동행자 이름" optional help="여권 영문 이름은 예약 확정 후 담당자가 따로 받습니다"><textarea id="book-companions" className="sgl-input" value={v.companions} onChange={set("companions")} maxLength={1000} placeholder="김철수, 이영희, 박민수" /></Field>
      <Field id="book-request" label="요청 사항" optional><textarea id="book-request" className="sgl-input" value={v.request} onChange={set("request")} maxLength={2000} placeholder="객실 배정, 티오프 시간, 클럽 대여 등 원하시는 점을 적어 주세요" /></Field>

      <Consent id="book-privacyConsent" checked={privacy} onChange={(c) => { setPrivacy(c); setErrors((x) => ({ ...x, privacyConsent: undefined })); }} error={errors.privacyConsent} label={<><b>[필수]</b> 개인정보 수집·이용 동의</>}>
        <dl>
          <div><dt>수집 항목</dt><dd>필수: 이름, 휴대폰 번호 / 선택: 이메일, 동행자 이름, 요청 사항</dd></div>
          <div><dt>이용 목적</dt><dd>여행 예약 접수·확정, 결제, 일정 안내</dd></div>
          <div><dt>보유 기간</dt><dd>여행 종료 후 5년(전자상거래법에 따른 계약·결제 기록 보존)</dd></div>
        </dl>
        <p>동의를 거부할 수 있으나, 거부하시면 예약하실 수 없습니다.</p>
      </Consent>
      <Consent id="book-termsConsent" checked={terms} onChange={(c) => { setTerms(c); setErrors((x) => ({ ...x, termsConsent: undefined })); }} error={errors.termsConsent} label={<><b>[필수]</b> 예약·취소 규정을 확인했습니다</>}>
        {cancelSummary.map((t) => <p key={t}>{t}</p>)}
        <p>예약은 결제 후 담당자가 항공·골프장·숙소를 확인해 확정하며, 자리가 없으면 결제 금액을 전액 환불해 드립니다.</p>
      </Consent>
      <Honeypot value={v.website} onChange={(w) => setV({ ...v, website: w })} />
      {formError && <p className="sgl-alert sgl-alert--bad" role="alert">{formError}</p>}
      <button type="submit" className="sgl-btn sgl-btn--full" disabled={busy}>{busy ? "접수 중…" : "예약 접수하고 결제로 이동"}</button>
    </form>
  );
}

/* ---------- 결제 ---------- */
interface TossOrder { orderId: string; amount: number; orderName: string; customerName: string; customerMobilePhone: string; customerEmail?: string; successUrl: string; failUrl: string }
type TossWindow = Window & { TossPayments?: ((clientKey: string) => { payment: (o: { customerKey: string }) => { requestPayment: (o: Record<string, unknown>) => Promise<void> } }) & { ANONYMOUS: string } };
const loadToss = () => new Promise<NonNullable<TossWindow["TossPayments"]>>((resolve, reject) => {
  const w = window as TossWindow;
  if (w.TossPayments) return resolve(w.TossPayments);
  const s = document.createElement("script");
  s.src = "https://js.tosspayments.com/v2/standard";
  s.onload = () => (w.TossPayments ? resolve(w.TossPayments) : reject(new Error("toss")));
  s.onerror = () => reject(new Error("toss"));
  document.head.appendChild(s);
});

const METHOD_HELP: Record<PayMethod, string> = { card: "토스페이먼츠 결제창에서 카드·간편결제로 결제합니다", bank: "안내되는 계좌로 입금하시면 확인 후 결제 완료로 바뀝니다", onsite: "담당자와 통화 후 안내에 따라 결제합니다" };

export function PaymentPanel({ no, k, total, deposit, methods, tossClientKey, defaultName, balanceDueDays, tel, current }: {
  no: string; k: string; total: number; deposit: number | null; methods: PayMethod[]; tossClientKey: string | null; defaultName: string; balanceDueDays: number; tel: string; current?: { method?: PayMethod | ""; plan?: string };
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<"deposit" | "full">(current?.plan === "full" || deposit == null ? "full" : "deposit");
  const [method, setMethod] = useState<PayMethod>(current?.method && methods.includes(current.method) ? current.method : methods[0]);
  const [depositor, setDepositor] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const payPlan = method === "onsite" ? "full" : plan;
  const amount = payPlan === "deposit" && deposit != null ? deposit : total;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const r = await post<{ order?: TossOrder }>(`/api/public/sgl/bookings/${encodeURIComponent(no)}/payment`, { k, method, plan: payPlan, depositor });
    if (!r.ok) { setBusy(false); setError(failText(r, tel)); return; }
    if (method !== "card" || !r.data.order || !tossClientKey) { router.refresh(); setBusy(false); return; }
    try {
      const o = r.data.order;
      const TossPayments = await loadToss();
      await TossPayments(tossClientKey).payment({ customerKey: TossPayments.ANONYMOUS }).requestPayment({
        method: "CARD", amount: { currency: "KRW", value: o.amount }, orderId: o.orderId, orderName: o.orderName, successUrl: o.successUrl, failUrl: o.failUrl,
        customerName: o.customerName, customerMobilePhone: o.customerMobilePhone, ...(o.customerEmail ? { customerEmail: o.customerEmail } : {}),
        card: { useEscrow: false, flowMode: "DEFAULT", useCardPoint: false, useAppCardOnly: false },
      });
    } catch (err) {
      // 결제창을 닫은 경우는 오류가 아니다
      const code = (err as { code?: string })?.code;
      if (code !== "USER_CANCEL" && code !== "PAY_PROCESS_CANCELED") setError("결제창을 열지 못했어요. 잠시 후 다시 시도하거나 다른 결제 수단을 골라 주세요.");
      setBusy(false);
    }
  }

  return (
    <form className="sgl-form" onSubmit={submit}>
      {deposit != null && method !== "onsite" && (
        <fieldset className="sgl-choice" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="sgl-label">결제 금액</legend>
          <label><input type="radio" name="plan" checked={plan === "deposit"} onChange={() => setPlan("deposit")} /><span style={{ flex: 1 }}><i>{won(deposit)}</i><b>예약금만 먼저 결제</b><small>잔금 {won(total - deposit)}은 출발 {balanceDueDays}일 전까지</small></span></label>
          <label><input type="radio" name="plan" checked={plan === "full"} onChange={() => setPlan("full")} /><span style={{ flex: 1 }}><i>{won(total)}</i><b>전액 결제</b><small>한 번에 결제하고 끝내기</small></span></label>
        </fieldset>
      )}
      <fieldset className="sgl-choice" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sgl-label">결제 수단</legend>
        {methods.map((m) => (
          <label key={m}><input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} /><span style={{ flex: 1 }}><b>{PAY_METHOD_LABEL[m]}</b><small>{METHOD_HELP[m]}</small></span></label>
        ))}
      </fieldset>
      {method === "bank" && (
        <div><label className="sgl-label" htmlFor="pay-depositor">입금자명</label><input id="pay-depositor" className="sgl-input" value={depositor} onChange={(e) => setDepositor(e.target.value)} maxLength={30} placeholder="입금하실 분의 이름" /><p className="sgl-help">예약자와 입금자가 다르면 꼭 적어 주세요.</p></div>
      )}
      {error && <p className="sgl-alert sgl-alert--bad" role="alert">{error}</p>}
      <button type="submit" className="sgl-btn sgl-btn--full" disabled={busy}>
        {busy ? "처리 중…" : method === "card" ? <><Icon name="card" size={18} /> {won(amount)} 카드 결제</> : method === "bank" ? <><Icon name="bank" size={18} /> {won(amount)} 무통장 입금 신청</> : "현장 결제로 신청"}
      </button>
    </form>
  );
}

/* ---------- 상담 ---------- */
export function ConsultForm({ packages, regions, initial, tel }: { packages: { id: string; title: string; region: string }[]; regions: string[]; initial: { packageId: string; sheetId: string; date: string; people: string }; tel: string }) {
  const [v, setV] = useState({ name: "", phone: "", contact: "phone", region: packages.find((p) => p.id === initial.packageId)?.region ?? "", packageId: initial.packageId, date: initial.date, people: initial.people, message: "", website: "" });
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setV({ ...v, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }); setErrors((x) => ({ ...x, [k]: undefined })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {};
    if (!v.name.trim()) next.name = "이름을 입력해 주세요";
    if (!isValidPhone(normalizePhone(v.phone))) next.phone = "휴대폰 번호를 정확히 입력해 주세요 (예: 010-1234-5678)";
    if (!privacy) next.privacyConsent = "개인정보 수집·이용에 동의해 주세요";
    setErrors(next); setFormError("");
    if (focusFirst("consult", next)) return;
    setBusy(true);
    const r = await post("/api/public/sgl/inquiries", { ...v, sheetId: v.packageId === initial.packageId ? initial.sheetId : "", people: v.people ? Number(v.people) : null, privacyConsent: privacy, marketingConsent: marketing, ...tracking() });
    setBusy(false);
    if (r.ok) { setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (r.status === 422 && r.fields) { setErrors(r.fields); focusFirst("consult", r.fields); }
    else setFormError(failText(r, tel));
  }

  if (done) return (
    <div className="sgl-done">
      <span className="sgl-done__mark"><Icon name="check" size={30} stroke={2.2} /></span>
      <h2 className="sgl-h3" style={{ fontSize: 26 }}>상담 신청이 접수되었습니다</h2>
      <p className="sgl-muted"><b>{v.name.trim()}</b>님, 남겨 주신 연락처로 담당자가 {v.contact === "kakao" ? "카카오톡" : "전화"}로 연락드릴게요.</p>
      <p style={{ marginTop: 22 }}><a className="sgl-btn sgl-btn--ink" href="/sgl#stays">골프여행 상품 보기</a></p>
    </div>
  );

  const list = packages.filter((p) => !v.region || p.region === v.region);
  return (
    <form className="sgl-form" onSubmit={submit} noValidate>
      <div className="sgl-form__row">
        <Field id="consult-name" label="이름" error={errors.name}><input id="consult-name" className="sgl-input" value={v.name} onChange={set("name")} autoComplete="name" maxLength={30} placeholder="홍길동" aria-invalid={!!errors.name} /></Field>
        <Field id="consult-phone" label="휴대폰 번호" error={errors.phone}><input id="consult-phone" className="sgl-input" type="tel" inputMode="numeric" value={v.phone} onChange={set("phone")} autoComplete="tel-national" placeholder="010-1234-5678" aria-invalid={!!errors.phone} /></Field>
      </div>
      <fieldset className="sgl-choice" style={{ border: 0, padding: 0, margin: 0, gridTemplateColumns: "1fr 1fr" }}>
        <legend className="sgl-label">연락받을 방법</legend>
        <label><input type="radio" name="contact" checked={v.contact === "phone"} onChange={() => setV({ ...v, contact: "phone" })} /><span><b>전화</b></span></label>
        <label><input type="radio" name="contact" checked={v.contact === "kakao"} onChange={() => setV({ ...v, contact: "kakao" })} /><span><b>카카오톡</b></span></label>
      </fieldset>
      <div className="sgl-form__row">
        <Field id="consult-region" label="여행지" optional><select id="consult-region" className="sgl-input" value={v.region} onChange={(e) => setV({ ...v, region: e.target.value, packageId: "" })}><option value="">아직 정하지 않았어요</option>{regions.map((r) => <option key={r} value={r}>{r}</option>)}</select></Field>
        <Field id="consult-package" label="관심 상품" optional><select id="consult-package" className="sgl-input" value={v.packageId} onChange={set("packageId")}><option value="">선택 안 함</option>{list.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
      </div>
      <div className="sgl-form__row">
        <Field id="consult-date" label="희망 출발일" optional><input id="consult-date" className="sgl-input" type="date" value={v.date} onChange={set("date")} /></Field>
        <Field id="consult-people" label="인원" optional><input id="consult-people" className="sgl-input" type="number" inputMode="numeric" min={1} max={99} value={v.people} onChange={set("people")} placeholder="4" /></Field>
      </div>
      <Field id="consult-message" label="문의 내용" optional error={errors.message}><textarea id="consult-message" className="sgl-input" value={v.message} onChange={set("message")} maxLength={2000} placeholder="원하시는 일정, 골프장, 예산 등을 편하게 적어 주세요" /></Field>
      <Consent id="consult-privacyConsent" checked={privacy} onChange={(c) => { setPrivacy(c); setErrors((x) => ({ ...x, privacyConsent: undefined })); }} error={errors.privacyConsent} label={<><b>[필수]</b> 개인정보 수집·이용 동의</>}>
        <dl>
          <div><dt>수집 항목</dt><dd>필수: 이름, 휴대폰 번호 / 선택: 여행지, 관심 상품, 희망 출발일, 인원, 문의 내용</dd></div>
          <div><dt>이용 목적</dt><dd>골프여행 상담과 견적 안내</dd></div>
          <div><dt>보유 기간</dt><dd>상담 접수일로부터 1년 또는 삭제 요청 시까지</dd></div>
        </dl>
        <p>동의를 거부할 수 있으나, 거부하시면 상담을 신청하실 수 없습니다.</p>
      </Consent>
      <Consent id="consult-marketing" checked={marketing} onChange={setMarketing} label={<><b>[선택]</b> 혜택·이벤트 소식 받기</>} />
      <Honeypot value={v.website} onChange={(w) => setV({ ...v, website: w })} />
      {formError && <p className="sgl-alert sgl-alert--bad" role="alert">{formError}</p>}
      <button type="submit" className="sgl-btn sgl-btn--full" disabled={busy}>{busy ? "접수 중…" : "상담 신청하기"}</button>
    </form>
  );
}

/* ---------- 예약 조회 ---------- */
export function LookupForm({ initialNo, tel }: { initialNo: string; tel: string }) {
  const [no, setNo] = useState(initialNo);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (no.trim().length < 6 || !isValidPhone(normalizePhone(phone))) { setError("예약번호와 휴대폰 번호를 정확히 입력해 주세요."); return; }
    setBusy(true); setError("");
    const r = await post<{ url: string }>("/api/public/sgl/bookings/lookup", { no, phone });
    if (r.ok) { window.location.assign(r.data.url); return; }
    setBusy(false);
    setError(r.status === 404 || r.status === 422 ? "일치하는 예약을 찾지 못했어요. 예약번호와 예약자 휴대폰 번호를 다시 확인해 주세요." : failText(r, tel));
  }
  return (
    <form className="sgl-form" onSubmit={submit} noValidate>
      <Field id="lookup-no" label="예약번호" help="예약 접수 화면에 표시된 SGL로 시작하는 번호"><input id="lookup-no" className="sgl-input" value={no} onChange={(e) => setNo(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={30} placeholder="SGL261122ABCDE" /></Field>
      <Field id="lookup-phone" label="예약자 휴대폰 번호"><input id="lookup-phone" className="sgl-input" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} autoComplete="tel-national" placeholder="010-1234-5678" /></Field>
      {error && <p className="sgl-alert sgl-alert--bad" role="alert">{error}</p>}
      <button type="submit" className="sgl-btn sgl-btn--ink sgl-btn--full" disabled={busy}>{busy ? "조회 중…" : "예약 조회"}</button>
    </form>
  );
}
