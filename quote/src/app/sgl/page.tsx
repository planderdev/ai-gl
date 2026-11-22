import Link from "next/link";
import { collectionById } from "@/lib/cms/schema";
import { listItems } from "@/lib/cms/service";
import { guardSite } from "@/lib/sgl/access";
import { loadCatalog } from "@/lib/sgl/catalog";
import { HERO_SLIDES, PAY_METHOD_LABEL, todayKstIso } from "@/lib/sgl/config";
import { Icon } from "./_ui/icons";
import Landing from "./_ui/Landing";

/** 관리자에서 고친 상품·요금·설정이 곧바로 보이도록 요청마다 그린다(카탈로그는 30초 메모리 보관) */
export const dynamic = "force-dynamic";

/** 관리자 FAQ(콘텐츠관리) 중 노출 상태인 것. 답변은 HTML 로 저장돼 있어 글자만 뽑아 보여 준다 */
async function loadFaqs() {
  try {
    const items = await listItems(collectionById("faqs")!);
    return items.filter((f) => f.visibility === "visible").slice(0, 6).map((f) => ({ id: f.id, q: String(f.question ?? ""), a: String(f.answer ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() }));
  } catch { return []; }
}

export default async function SglHome() {
  if (!(await guardSite()).allowed) return null;
  const [{ config, packages }, faqs] = await Promise.all([loadCatalog(), loadFaqs()]);
  // 마지막 히어로 장의 설명에는 지금 판매 중인 지역을 적는다
  const regions = [...new Set(packages.map((p) => p.region))];
  const slides = HERO_SLIDES.map((s, i) => (i === 2 && regions.length ? { ...s, desc: `${regions.join(" · ")} — 직항으로 닿는 일본 골프 여행지` } : s));
  const pay = config.methods.map((m) => PAY_METHOD_LABEL[m]).join(" · ");

  return (
    <>
      <Landing packages={packages} slides={slides} today={todayKstIso()} minPax={config.minPax} maxPax={config.maxPax} />

      <section className="sgl-sec" id="how">
        <div className="sgl-sec__head"><div><h2 className="sgl-h2">상담부터 결제까지, 한 곳에서</h2><p className="sgl-sub">원하시는 방법으로 시작하세요. 일정이 정해졌다면 바로 예약하셔도 됩니다.</p></div></div>
        <ol className="sgl-steps">
          <li><span>01 · CONSULT</span><h3>상담</h3><p>일정·인원·예산을 알려 주시면 담당자가 맞는 상품과 출발일을 안내해 드립니다. {config.hours}</p></li>
          <li><span>02 · BOOK</span><h3>예약</h3><p>상품 화면에서 출발일별 요금을 확인하고 인원을 골라 예약합니다. {config.notice.booking}</p></li>
          <li><span>03 · PAY</span><h3>결제</h3><p>{pay ? `${pay}로 결제할 수 있습니다. ` : "결제 방법은 담당자가 안내해 드립니다. "}{config.notice.payment}</p></li>
        </ol>
      </section>

      <section className="sgl-sec" id="consult">
        <div className="sgl-cta">
          <div><h2 className="sgl-h2">원하는 일정이 따로 있으신가요?</h2><p>단체, 다른 출발일, 골프장 지정처럼 화면에 없는 조건도 상담으로 맞춰 드립니다.</p></div>
          <div className="sgl-cta__acts">
            <Link href="/sgl/consult" className="sgl-btn sgl-btn--full">상담 신청하기 <Icon name="arrow" size={18} /></Link>
            <a href={`tel:${config.tel}`} className="sgl-btn sgl-btn--line sgl-btn--full"><Icon name="phone" size={18} /> {config.tel}</a>
            {config.kakaoUrl && <a href={config.kakaoUrl} target="_blank" rel="noreferrer" className="sgl-btn sgl-btn--line sgl-btn--full"><Icon name="chat" size={18} /> 카카오톡 상담</a>}
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="sgl-sec" id="faq">
          <div className="sgl-sec__head"><h2 className="sgl-h2">자주 묻는 질문</h2></div>
          <div className="sgl-faq">
            {faqs.map((f) => <details key={f.id}><summary>{f.q}</summary><div className="sgl-faq__a"><p>{f.a}</p></div></details>)}
          </div>
        </section>
      )}
    </>
  );
}
