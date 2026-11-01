import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasVipAccess, VIP_ACCESS_COOKIE } from "@/lib/sgl-vip/access";
import { VIP_ANNUAL_FEE } from "@/lib/sgl-vip/config";
import ApplyForm from "../ApplyForm";
import { SglLogo } from "../Brand";

export const metadata: Metadata = { title: "SGL VIP 사전예약 정보 입력", robots: { index: false, follow: false } };

/** 입장 코드를 통과한 고객만 볼 수 있다. 쿠키가 없으면 입장 페이지로 돌려보낸다 */
export default async function SglVipApplyPage() {
  if (!hasVipAccess((await cookies()).get(VIP_ACCESS_COOKIE)?.value)) redirect("/sgl-vip");
  return (
    <section className="vip-apply vip-apply--page">
      <Image className="vip-apply__bg" src="/sgl-vip/fairway.jpg" alt="" fill sizes="100vw" />
      <header className="vip-top"><Link href="/sgl-vip" aria-label="SGL VIP 입장 페이지로"><SglLogo className="vip-top__logo" /></Link></header>
      <div className="vip-wrap vip-apply__grid">
        <div className="vip-apply__copy">
          <p className="vip-eyebrow">입장 완료</p>
          <h1 className="vip-apply__title">사전예약 정보를<br />입력해 주세요.</h1>
          <p>남겨주신 연락처로 담당자가 VIP 혜택과 가입 방법을 상세히 안내해 드립니다.</p>
          <ul className="vip-apply__facts">
            <li>12월 26일 오픈</li>
            <li>연회비 {VIP_ANNUAL_FEE}</li>
            <li>사전예약 무료</li>
          </ul>
        </div>
        <div className="vip-formcard"><ApplyForm /></div>
      </div>
    </section>
  );
}
