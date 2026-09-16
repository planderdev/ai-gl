import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import { currentUser } from "@/lib/auth/session";

/** 관리자 셸(헤더 + 사이드바). 로그인 페이지는 이 그룹 밖에 있다. */
export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();
  return (
    <>
      <header className="admin-header" id="adminHeader">
        <div className="admin-header__left">
          <Link href="/" className="admin-header__brand"><span className="admin-header__brand-mark">A</span><span className="admin-header__brand-text">AIGL 대시보드</span></Link>
        </div>
        <div className="admin-header__right">
          <div className="admin-header__page-title">AI GOLF 관리자</div>
          <a href="/api/export" className="admin-btn admin-btn--light"><i className="ri-file-excel-2-line" /> 전체 원가표 .xlsx</a>
          <div className="admin-user-chip"><span className="admin-user-chip__avatar">{(user?.name ?? "관").slice(0, 1)}</span><span>{user?.name ?? "관리자"}</span></div>
          <a href="/api/auth/logout" className="admin-btn admin-btn--light admin-btn--xs" title="로그아웃"><i className="ri-logout-box-r-line" /> 로그아웃</a>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar" id="adminSidebar" aria-label="관리자 사이드바"><div className="admin-sidebar__inner"><AdminNav /></div></aside>
        <main className="admin-main"><div className="admin-content">{children}</div></main>
      </div>
    </>
  );
}
