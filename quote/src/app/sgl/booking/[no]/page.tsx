import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { decodeId } from "@/lib/api";
import { getBooking, isPayable, verifyBookingToken } from "@/lib/sgl/bookings";
import { findPackage, loadCatalog } from "@/lib/sgl/catalog";
import { addDaysIso, BOOKING_STATUS_LABEL, dateKo, PAY_METHOD_LABEL, sized, won, type PayMethod } from "@/lib/sgl/config";
import { PaymentPanel } from "../../_ui/Forms";
import { Icon } from "../../_ui/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "예약 확인 · 결제", robots: { index: false } };
type Props = { params: Promise<{ no: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

/** 예약 현황과 결제. 주소의 열람 토큰(k)이 맞아야 볼 수 있고, 없으면 예약 조회로 보낸다 */
export default async function BookingPage({ params, searchParams }: Props) {
  const [{ no }, sp] = await Promise.all([params, searchParams]);
  const b = await getBooking(decodeId(no));
  const k = one(sp.k);
  if (!b || !verifyBookingToken(b.id, k)) redirect(`/sgl/lookup?no=${encodeURIComponent(decodeId(no))}`);
  const catalog = await loadCatalog();
  const { config } = catalog;
  const pkg = findPackage(catalog, String(b.product_group_id ?? ""));
  const payable = isPayable(b);
  const paid = b.payment_status === "paid";
  const cancelled = b.status === "cancelled";
  const deposit = b.deposit_amount > 0 && b.deposit_amount < b.total_price ? b.deposit_amount : null;
  const method = (b.payment_method || "") as PayMethod | "";
  const chosen = payable && (method === "bank" || method === "onsite");
  const balance = paid ? Math.max(0, b.total_price - b.payment_amount) : 0;
  const title = cancelled ? "취소된 예약입니다" : b.status === "confirmed" ? "예약이 확정되었습니다" : paid ? "결제가 완료되었습니다" : method === "bank" ? "입금을 기다리고 있어요" : method === "onsite" ? "현장 결제로 신청되었습니다" : "예약이 접수되었습니다";
  const lead = cancelled ? "문의가 있으시면 고객센터로 연락해 주세요." : b.status === "confirmed" ? "항공·골프장·숙소 예약이 모두 끝났습니다. 출발 전 담당자가 최종 안내를 드립니다." : paid ? "담당자가 항공·골프장·숙소를 확인한 뒤 예약 확정을 안내해 드립니다." : method === "bank" ? "아래 계좌로 입금하시면 확인 후 결제 완료로 바뀝니다." : method === "onsite" ? "담당자가 확인 후 연락드립니다." : "결제를 마치면 담당자가 예약 확정을 안내해 드립니다.";
  const panel = <PaymentPanel no={b.id} k={k} total={b.total_price} deposit={deposit} methods={config.methods} tossClientKey={config.tossClientKey} defaultName={b.depositor_name || b.customer_name} balanceDueDays={config.balanceDueDays} tel={config.tel} current={{ method, plan: b.payment_plan }} />;

  return (
    <div className="sgl-page">
      <div className="sgl-narrow">
        <nav className="sgl-crumb" aria-label="현재 위치"><Link href="/sgl">홈</Link><span aria-hidden>›</span><span>예약 확인 · 결제</span></nav>
        <p className="sgl-small" style={{ marginBottom: 6 }}>예약번호 <b style={{ color: "var(--ink)", letterSpacing: "0.04em" }}>{b.id}</b> <span className={`sgl-status is-${cancelled ? "cancelled" : b.status === "confirmed" ? "confirmed" : paid ? "paid" : "pending"}`} style={{ marginLeft: 8 }}>{BOOKING_STATUS_LABEL[cancelled ? "cancelled" : b.status === "confirmed" ? "confirmed" : paid ? "paid" : "pending"]}</span></p>
        <h1 className="sgl-h1">{title}</h1>
        <p className="sgl-sub" style={{ marginBottom: 26 }}>{lead} 이 화면은 <Link href="/sgl/lookup" className="sgl-linkbtn">예약 조회</Link>에서 예약번호와 휴대폰 번호로 다시 열 수 있습니다.</p>

        <div className="sgl-two">
          <div>
            {one(sp.pay) === "done" && paid && <p className="sgl-alert sgl-alert--ok" role="status">카드 결제가 승인되었습니다.</p>}
            {one(sp.pay) === "fail" && !paid && <p className="sgl-alert sgl-alert--bad" role="alert">결제가 완료되지 않았어요. {one(sp.message) || "다시 시도하거나 다른 결제 수단을 골라 주세요."}</p>}

            {!cancelled && (
              <section className="sgl-panel">
                <h2 className="sgl-h3">진행 상황</h2>
                <ol className="sgl-timeline">
                  <li className="is-done">예약 접수</li>
                  <li className={paid ? "is-done" : ""}>결제</li>
                  <li className={b.status === "confirmed" ? "is-done" : ""}>예약 확정</li>
                </ol>
              </section>
            )}

            {payable && method === "bank" && (
              <section className="sgl-panel">
                <h2 className="sgl-h3">무통장 입금 안내</h2>
                <dl className="sgl-bank">
                  <div><dt>은행</dt><dd>{config.bank.name}</dd></div>
                  <div className="is-big"><dt>계좌번호</dt><dd>{config.bank.account}</dd></div>
                  <div><dt>예금주</dt><dd>{config.bank.holder}</dd></div>
                  <div className="is-big"><dt>입금 금액</dt><dd>{won(b.payment_due)}</dd></div>
                  <div><dt>입금자명</dt><dd>{b.depositor_name}</dd></div>
                  {b.bank_deadline && <div><dt>입금 기한</dt><dd>{b.bank_deadline} 까지</dd></div>}
                </dl>
                {b.payment_plan === "deposit" && <p className="sgl-note">예약금입니다. 잔금 {won(b.total_price - b.payment_due)}은 출발 {config.balanceDueDays}일 전({dateKo(addDaysIso(b.date, -config.balanceDueDays))})까지 내시면 됩니다.</p>}
                {config.notice.payment && <p className="sgl-note">{config.notice.payment}</p>}
              </section>
            )}
            {payable && method === "onsite" && <section className="sgl-panel"><h2 className="sgl-h3">현장 결제 신청</h2><p className="sgl-muted">담당자가 예약 내용을 확인한 뒤 연락드립니다. 결제 금액 {won(b.total_price)}</p></section>}

            {payable && config.methods.length > 0 && (chosen
              ? <details className="sgl-panel"><summary style={{ fontWeight: 600 }}>결제 수단 · 금액 바꾸기</summary><div style={{ marginTop: 18 }}>{panel}</div></details>
              : <section className="sgl-panel"><h2 className="sgl-h3">결제하기</h2>{panel}</section>)}
            {payable && !config.methods.length && <section className="sgl-panel"><h2 className="sgl-h3">결제 안내</h2><p className="sgl-muted">결제 방법은 담당자가 연락드려 안내해 드립니다. 급하시면 고객센터 {config.tel}로 연락해 주세요.</p></section>}

            {paid && (
              <section className="sgl-panel">
                <h2 className="sgl-h3">결제 내역</h2>
                <dl className="sgl-sum">
                  <div><dt>결제 수단</dt><dd>{method ? PAY_METHOD_LABEL[method as PayMethod] ?? method : "-"}</dd></div>
                  <div><dt>결제 금액</dt><dd>{won(b.payment_amount)}</dd></div>
                  {b.payment_date && <div><dt>결제 일시</dt><dd>{String(b.payment_date).replace("T", " ").slice(0, 16)}</dd></div>}
                  {balance > 0 && <div><dt>잔금</dt><dd>{won(balance)} · {dateKo(addDaysIso(b.date, -config.balanceDueDays))}까지</dd></div>}
                </dl>
                {b.pg_receipt_url && <p style={{ marginTop: 14 }}><a className="sgl-linkbtn" href={b.pg_receipt_url} target="_blank" rel="noreferrer">카드 영수증 보기</a></p>}
              </section>
            )}

            <div className="sgl-contact">
              <a href={`tel:${config.tel}`}><Icon name="phone" size={20} /><span>고객센터 {config.tel}<small>{config.hours}</small></span></a>
              {config.kakaoUrl && <a href={config.kakaoUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={20} /><span>카카오톡 상담<small>예약번호를 알려 주시면 빠르게 도와드려요</small></span></a>}
            </div>
          </div>

          <aside className="sgl-panel">
            {pkg && <div className="sgl-sum-photo" style={{ backgroundImage: `url("${sized(pkg.image, 700)}")` }} />}
            <h2 className="sgl-h3">{b.product_title}</h2>
            <dl className="sgl-sum">
              <div><dt>예약자</dt><dd>{b.customer_name}</dd></div>
              <div><dt>가는 날</dt><dd>{dateKo(b.date)}</dd></div>
              {b.return_date && <div><dt>오는 날</dt><dd>{dateKo(b.return_date)}</dd></div>}
              <div><dt>인원</dt><dd>{b.people}명</dd></div>
              {b.unit_price > 0 && <div><dt>1인 요금</dt><dd>{won(b.unit_price)}</dd></div>}
              <div className="is-total"><dt>총 금액</dt><dd>{won(b.total_price)}</dd></div>
            </dl>
            {b.companions && <p className="sgl-note">동행자: {b.companions}</p>}
            {b.request_note && <p className="sgl-note">요청 사항: {b.request_note}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
}
