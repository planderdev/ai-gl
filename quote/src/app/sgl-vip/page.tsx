import type { Metadata } from "next";
import Link from "next/link";
import { VIP_ANNUAL_FEE, VIP_SUPPORT_TEL } from "@/lib/sgl-vip/config";
import { SglLogo } from "./Brand";
import GateForm from "./GateForm";
import { HeroSwing } from "./Media";
import { OpenCountdown } from "./Timers";

export const metadata: Metadata = { alternates: { canonical: "/sgl-vip" } };

/** 광고 유입 첫 화면: 12월 26일 카운트다운 + 입장 코드. 남은 시간은 브라우저에서 계산하므로 정적 페이지로 둔다 */
export default function SglVipGatePage() {
  return (
    <section className="vip-hero vip-gate">
      <header className="vip-top"><SglLogo className="vip-top__logo" /></header>
      <div className="vip-hero__copy">
        <p className="vip-hero__eyebrow">SGL 1주년 · 감사의 마음을 담아</p>
        <h1 className="vip-gate__title">SGL VIP 오픈까지</h1>
        <OpenCountdown />
        <p className="vip-gate__date">2026.12.26 (토) · 연회비 {VIP_ANNUAL_FEE}</p>
        <GateForm />
        <nav className="vip-gate__links" aria-label="더 보기">
          <Link href="/sgl-vip/benefits">VIP 혜택 보기</Link>
          <a href={`tel:${VIP_SUPPORT_TEL}`}>고객센터 {VIP_SUPPORT_TEL}</a>
        </nav>
      </div>
      <div className="vip-hero__media"><HeroSwing /></div>
    </section>
  );
}
