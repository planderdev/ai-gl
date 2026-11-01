import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { VIP_SUPPORT_TEL } from "@/lib/sgl-vip/config";
import { SglLogo } from "./Brand";
import { CaptureSource } from "./Source";
import "./sgl-vip.css";

const TITLE = "SGL VIP 사전예약 | 12월 26일 오픈";
const DESCRIPTION = "SGL 1주년, 감사의 마음을 담아 SGL VIP가 12월 26일 오픈합니다. 연회비 10만원, 매주 일요일 19시 VIP 혜택 공개. 입장 코드를 입력하고 사전예약하세요.";
export const metadata: Metadata = {
  // 링크 미리보기(카카오톡·인스타 DM)는 절대 주소가 필요하다. 운영 도메인을 연결하면 Vercel 이 이 값을 바꿔 준다
  metadataBase: new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "ai-gl.vercel.app"}`),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/sgl-vip", siteName: "SGL", locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};
export const viewport: Viewport = { themeColor: "#06140d" };

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--vip-display", display: "swap" });

export default function SglVipLayout({ children }: LayoutProps<"/sgl-vip">) {
  return (
    <div className={`vip ${display.variable}`}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" precedence="default" />
      <CaptureSource />
      {children}
      <footer className="vip-footer">
        <div className="vip-wrap">
          <SglLogo className="vip-footer__logo" />
          <p><span>에이지엘 주식회사</span> · <span>대표 방윤식</span> · <span>사업자등록번호 659-86-02339</span> · <span>관광사업 등록번호 2020-제주광역-2331</span></p>
          <p>제주특별자치도 제주시 전농로 119, 909호 · <span>고객센터 <a href={`tel:${VIP_SUPPORT_TEL}`}>{VIP_SUPPORT_TEL}</a> (09:00~18:00)</span></p>
          <p>© SGL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
