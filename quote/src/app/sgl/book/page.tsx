import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { findDeparture, loadCatalog } from "@/lib/sgl/catalog";
import { addDaysIso, dateKo, depositOf, sized, won } from "@/lib/sgl/config";
import { BookForm } from "../_ui/Forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "예약하기", robots: { index: false } };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

/** 예약 작성: 상세에서 고른 일정·출발일·인원을 서버가 다시 확인하고 금액을 계산해 보여 준다 */
export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const catalog = await loadCatalog();
  const hit = findDeparture(catalog, one(sp.sheet), one(sp.date));
  if (!hit) redirect("/sgl#stays");
  const { pkg, sheet, dep } = hit;
  const { config } = catalog;
  const back = `/sgl/p/${encodeURIComponent(pkg.id)}?sheet=${encodeURIComponent(sheet.id)}&date=${dep.d}`;
  if (dep.s !== "o" || dep.p == null) redirect(back);
  const people = Math.min(config.maxPax, Math.max(config.minPax, Math.round(Number(one(sp.pax))) || config.minPax));
  const total = dep.p * people;
  const deposit = depositOf(total, people, config);
  const cancel = [config.cancel.freeDays > 0 ? `출발 ${config.cancel.freeDays}일 전까지는 수수료 없이 취소할 수 있습니다.` : "", config.cancel.feePercent > 0 ? `그 이후 취소는 결제 금액의 ${config.cancel.feePercent}%가 수수료로 부과됩니다.` : "", config.notice.refund, config.notice.noshow, config.notice.weather, config.notice.extra].filter(Boolean);

  return (
    <div className="sgl-page">
      <div className="sgl-narrow">
        <nav className="sgl-crumb" aria-label="현재 위치"><Link href="/sgl">홈</Link><span aria-hidden>›</span><Link href={back}>{pkg.title}</Link><span aria-hidden>›</span><span>예약하기</span></nav>
        <h1 className="sgl-h1" style={{ marginBottom: 26 }}>예약하기</h1>
        <div className="sgl-two">
          <section className="sgl-panel">
            <h2 className="sgl-h3">예약자 정보</h2>
            <BookForm sheetId={sheet.id} date={dep.d} people={people} tel={config.tel} cancelSummary={cancel} />
          </section>
          <aside className="sgl-panel">
            <div className="sgl-sum-photo" style={{ backgroundImage: `url("${sized(pkg.image, 700)}")` }} />
            <h2 className="sgl-h3">{pkg.title}</h2>
            <dl className="sgl-sum">
              <div><dt>일정</dt><dd>{sheet.label}</dd></div>
              <div><dt>가는 날</dt><dd>{dateKo(dep.d)}</dd></div>
              <div><dt>오는 날</dt><dd>{dateKo(addDaysIso(dep.d, sheet.nights))}</dd></div>
              <div><dt>숙박</dt><dd>{sheet.stay}</dd></div>
              <div><dt>인원</dt><dd>{people}명</dd></div>
              <div><dt>1인 요금</dt><dd>{won(dep.p)}</dd></div>
              <div className="is-total"><dt>총 금액</dt><dd>{won(total)}</dd></div>
            </dl>
            {deposit != null && <p className="sgl-note">예약금 {won(deposit)}만 먼저 결제하고, 잔금은 출발 {config.balanceDueDays}일 전까지 내실 수 있습니다.</p>}
            {sheet.paxBasis && people !== sheet.paxBasis && <p className="sgl-note">{sheet.paxBasis}인 기준 요금입니다. 인원이 다르면 요금이 달라질 수 있으며, 담당자가 확정 금액을 안내해 드립니다.</p>}
            <p className="sgl-small" style={{ marginTop: 14 }}><Link href={back} className="sgl-linkbtn">일정·인원 바꾸기</Link></p>
          </aside>
        </div>
      </div>
    </div>
  );
}
