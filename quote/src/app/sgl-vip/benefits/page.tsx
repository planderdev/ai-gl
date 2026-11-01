import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { dDayLabel, dDayOf, formatKst, nextRevealAt, ordinalLabel, VIP_ANNUAL_FEE } from "@/lib/sgl-vip/config";
import { listRevealedBenefits } from "@/lib/sgl-vip/service";
import type { VipBenefit } from "@/types";
import { Icon, SglLogo } from "../Brand";
import { AdReel, HeroSwing } from "../Media";
import StickyCta from "../StickyCta";
import { DdayText, RevealCountdown } from "../Timers";

/** 광고 유입을 CDN 캐시로 받되 일요일 19시 공개가 1분 안에 반영되도록 한다 */
export const revalidate = 60;

export const metadata: Metadata = { title: "SGL VIP 혜택 | 매주 일요일 19시 공개", alternates: { canonical: "/sgl-vip/benefits" } };

function BenefitCard({ benefit, index }: { benefit: VipBenefit; index: number }) {
  return (
    <article className="vip-card vip-reveal">
      {benefit.image && (
        <div className="vip-card__media">
          <Image src={benefit.image} alt={benefit.image_alt ?? ""} fill sizes="(min-width: 860px) 560px, 100vw" unoptimized={!benefit.image.startsWith("/")} />
        </div>
      )}
      <div className="vip-card__body">
        <p className="vip-tag">{ordinalLabel(index + 1)} 혜택</p>
        <h3 className="vip-card__title">{benefit.title}</h3>
        <p className="vip-card__highlight"><span>{benefit.highlight}</span></p>
        {benefit.before_text && benefit.after_text && (
          <dl className="vip-compare">
            <div className="is-before"><dt>기존</dt><dd>{benefit.before_text}</dd></div>
            <div className="is-after"><dt>VIP</dt><dd>{benefit.after_text}</dd></div>
          </dl>
        )}
        {benefit.note && <p className="vip-card__note">{benefit.note}</p>}
      </div>
    </article>
  );
}

async function loadLanding() {
  const now = Date.now();
  return { benefits: await listRevealedBenefits(now), reveal: nextRevealAt(now), dday: dDayLabel(dDayOf(now)) };
}

export default async function SglVipBenefitsPage() {
  const { benefits, reveal, dday } = await loadLanding();

  return (
    <>
      <section className="vip-hero">
        <header className="vip-top">
          <Link href="/sgl-vip" aria-label="SGL VIP 입장 페이지로"><SglLogo className="vip-top__logo" /></Link>
          <span className="vip-top__dday"><DdayText initial={dday} /></span>
        </header>
        <div className="vip-hero__copy">
          <p className="vip-hero__eyebrow">SGL 1주년 · 감사의 마음을 담아</p>
          <h1>
            <span className="vip-hero__date">12.26</span>
            <span className="vip-hero__title">SGL VIP 오픈</span>
          </h1>
          <p className="vip-hero__lead">일본 골프여행을 즐기시는 분들께 특별한 소식이 있습니다.</p>
          <ul className="vip-facts">
            <li><span>연회비</span><strong>{VIP_ANNUAL_FEE}</strong></li>
            <li><span>혜택 공개</span><strong>매주 일요일 19시</strong></li>
          </ul>
          <Link id="vip-hero-cta" className="vip-btn" href="/sgl-vip">입장 코드 입력하기 <Icon name="arrow" /></Link>
          <p className="vip-hero__foot">사전예약은 무료이며, 결제는 진행되지 않습니다.</p>
        </div>
        <div className="vip-hero__media"><HeroSwing /></div>
      </section>

      <section className="vip-story">
        <Image className="vip-story__bg" src="/sgl-vip/tree-sky.jpg" alt="" fill sizes="100vw" />
        <div className="vip-wrap vip-story__copy vip-reveal">
          <h2>오는 12월,<br />SGL이 1주년을 맞이합니다.</h2>
          <p>그동안 함께한 팀원들과 모든 팔로워분들께 감사드립니다.<br />그 감사한 마음을 담아, SGL VIP를 엽니다.</p>
        </div>
      </section>

      <section className="vip-benefits">
        <div className="vip-wrap">
          <header className="vip-head vip-reveal">
            <p className="vip-eyebrow">VIP 혜택 공개</p>
            <h2>매주 일요일 19시,<br />VIP 혜택을 하나씩 공개합니다.</h2>
          </header>
          <div className="vip-benefits__list">
            {benefits.map((b, i) => <BenefitCard key={b.id} benefit={b} index={i} />)}
            {reveal && (
              <aside className="vip-lock vip-reveal">
                <Image className="vip-lock__bg" src="/sgl-vip/onsen.jpg" alt="" fill sizes="(min-width: 860px) 1180px, 100vw" />
                <div className="vip-lock__copy">
                  <p className="vip-tag vip-tag--dark"><Icon name="lock" /> {ordinalLabel(benefits.length + 1)} 혜택</p>
                  <h3>다음 혜택은 <br className="vip-only-mobile" />{formatKst(reveal)} 공개</h3>
                  <p>사전예약하시면 공개되는 혜택과 가입 방법을 담당자가 함께 안내해 드려요.</p>
                </div>
                <RevealCountdown target={reveal} />
              </aside>
            )}
          </div>
        </div>
      </section>

      <section className="vip-flow">
        <div className="vip-wrap vip-flow__grid">
          <div className="vip-reveal">
            <p className="vip-eyebrow">오픈까지</p>
            <h2>SGL VIP는<br />이렇게 시작됩니다.</h2>
            <ol className="vip-steps">
              <li><span>지금</span><h3>사전예약</h3><p>입장 코드를 입력하고 정보를 남겨주시면 담당자가 상세 내용을 안내해 드립니다.</p></li>
              <li><span>매주 일요일 19시</span><h3>VIP 혜택 공개</h3><p>이 페이지에서 혜택을 하나씩 공개합니다.</p></li>
              <li><span>12월 26일</span><h3>SGL VIP 오픈</h3><p>연회비 {VIP_ANNUAL_FEE}</p></li>
            </ol>
          </div>
          <div className="vip-flow__reel vip-reveal">
            <AdReel />
            <p>30초 영상으로 다시 보기</p>
          </div>
        </div>
      </section>

      <section className="vip-apply vip-endcta" id="vip-endcta">
        <Image className="vip-apply__bg" src="/sgl-vip/fairway.jpg" alt="" fill sizes="100vw" />
        <div className="vip-wrap vip-reveal">
          <h2>입장 코드를 받으셨나요?</h2>
          <p>코드를 입력하면 사전예약 정보를 남기실 수 있어요.<br />코드가 없으시면 광고 댓글에 &ldquo;26&rdquo;을 남겨주세요.</p>
          <Link className="vip-btn" href="/sgl-vip">입장 코드 입력하기 <Icon name="arrow" /></Link>
        </div>
      </section>

      <StickyCta dday={dday} fee={VIP_ANNUAL_FEE} />
    </>
  );
}
