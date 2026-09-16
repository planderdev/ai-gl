import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import "./globals.css";

export const metadata: Metadata = { title: "AIGL 대시보드", description: "숙박·골프·차량·항공 원가와 마진을 계산해 원가표 엑셀을 만드는 여행사 업무 자동화" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" />
      </head>
      <body className="admin-body">
        <header className="admin-header" id="adminHeader">
          <div className="admin-header__left">
            <Link href="/" className="admin-header__brand"><span className="admin-header__brand-mark">A</span><span className="admin-header__brand-text">AIGL 대시보드</span></Link>
          </div>
          <div className="admin-header__right">
            <div className="admin-header__page-title">AI GOLF 관리자</div>
            <a href="/api/export" className="admin-btn admin-btn--light"><i className="ri-file-excel-2-line" /> 전체 원가표 .xlsx</a>
            <div className="admin-user-chip"><span className="admin-user-chip__avatar">관</span><span>관리자</span></div>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-sidebar" id="adminSidebar" aria-label="관리자 사이드바"><div className="admin-sidebar__inner"><AdminNav /></div></aside>
          <main className="admin-main"><div className="admin-content">{children}</div></main>
        </div>
      </body>
    </html>
  );
}
