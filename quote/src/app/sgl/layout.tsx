import type { Metadata, Viewport } from "next";
import { Gilda_Display, Noto_Serif_KR, Urbanist } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadConfig } from "@/lib/sgl/catalog";
import Chrome from "./_ui/Chrome";
import "./sgl.css";

const TITLE = "SGL 일본 골프여행 | 상담 · 예약 · 결제";
const DESCRIPTION = "항공·숙박·그린피·차량을 한 번에. 다카마쓰·마쓰야마·벳부 골프여행의 출발일별 요금을 확인하고 상담부터 예약, 결제까지 한 곳에서 진행하세요.";
export const metadata: Metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "ai-gl.vercel.app"}`),
  title: { default: TITLE, template: "%s | SGL 골프여행" },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/sgl", siteName: "SGL", locale: "ko_KR", type: "website" },
};
export const viewport: Viewport = { themeColor: "#f7d9c6" };

const urbanist = Urbanist({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--f-urbanist", display: "swap" });
const gilda = Gilda_Display({ subsets: ["latin"], weight: "400", variable: "--f-gilda", display: "swap" });
const serifKr = Noto_Serif_KR({ weight: ["400", "500"], variable: "--f-serif-kr", display: "swap", preload: false });

/** 고객 사이트 공통 틀: 관리자 설정의 사이트 상태(정상/점검/비공개)와 연락처·사업자 정보를 따른다 */
export default async function SglLayout({ children }: { children: React.ReactNode }) {
  const config = await loadConfig();
  if (config.status === "private") notFound();
  const fonts = `${urbanist.variable} ${gilda.variable} ${serifKr.variable}`;
  if (config.status === "maintenance") return (
    <div className={`sgl ${fonts}`}>
      <main className="sgl-maint">
        <div>
          <h1 className="sgl-h1">잠시 점검 중입니다</h1>
          <p className="sgl-sub">더 나은 서비스를 위해 준비하고 있어요. 급한 문의는 고객센터 <a href={`tel:${config.tel}`}><b>{config.tel}</b></a> ({config.hours})로 연락해 주세요.</p>
        </div>
      </main>
    </div>
  );
  return (
    <div className={`sgl ${fonts}`}>
      <Chrome config={config}>
        <main>{children}</main>
        <footer className="sgl-footer">
          <div className="sgl-footer__top">
            <span className="sgl-logo"><b>{config.brand}</b> Golf Travel</span>
            <nav className="sgl-footer__links" aria-label="바로가기">
              <Link href="/sgl#stays">골프여행 상품</Link>
              <Link href="/sgl/consult">상담 문의</Link>
              <Link href="/sgl/lookup">예약 조회 · 결제</Link>
              {config.instagramUrl && <a href={config.instagramUrl} target="_blank" rel="noreferrer">인스타그램</a>}
            </nav>
          </div>
          <p><span>{config.company}</span> · <span>대표 {config.ceo}</span> · <span>사업자등록번호 {config.bizNo}</span> · <span>관광사업 등록번호 {config.license}</span></p>
          <p>{config.address} · <span>고객센터 <a href={`tel:${config.tel}`}>{config.tel}</a> ({config.hours})</span></p>
          <p>사진은 여행 분위기를 보여 주는 예시이며 실제 골프장·숙소와 다를 수 있습니다. © {config.brand}. All rights reserved.</p>
        </footer>
      </Chrome>
    </div>
  );
}
