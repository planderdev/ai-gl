"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** 캐디스 Admin(admin/includes/menu-data.php)과 같은 메뉴 구조 + 견적 시스템 */
type Child = { label: string; href: string; external?: boolean };
type Group = { key: string; label: string; icon: string; href?: string; children?: Child[] };
const MENU: Group[] = [
  { key: "dashboard", label: "대시보드", icon: "ri-dashboard-line", href: "/" },
  { key: "product", label: "상품관리", icon: "ri-golf-ball-line", children: [
    { label: "전체 상품", href: "/cms/products" }, { label: "골프장 등록", href: "/cms/products/new?type=golf_course" }, { label: "패키지 등록", href: "/cms/products/new?type=travel_package" },
    { label: "호텔 관리", href: "/cms/hotels" }, { label: "국가 관리", href: "/cms/taxonomy-countries" }, { label: "지역 관리", href: "/cms/taxonomy-regions" }, { label: "테마 관리", href: "/cms/taxonomy-themes" }, { label: "배지 관리", href: "/cms/taxonomy-badges" },
  ] },
  { key: "event", label: "이벤트관리", icon: "ri-megaphone-line", children: [{ label: "이벤트 목록", href: "/cms/events" }, { label: "이벤트 등록", href: "/cms/events/new" }] },
  { key: "booking", label: "예약관리", icon: "ri-calendar-check-line", children: [{ label: "예약 목록", href: "/cms/bookings" }, { label: "예약 캘린더", href: "/cms/bookings/calendar" }, { label: "예약 등록", href: "/cms/bookings/new" }] },
  { key: "customer", label: "고객관리", icon: "ri-user-3-line", children: [{ label: "고객 목록", href: "/cms/customers" }, { label: "고객 등록", href: "/cms/customers/new" }] },
  { key: "content", label: "콘텐츠관리", icon: "ri-file-list-3-line", children: [{ label: "공지사항", href: "/cms/notices" }, { label: "FAQ", href: "/cms/faqs" }, { label: "배너관리", href: "/cms/banners" }] },
  { key: "quote", label: "견적 시스템", icon: "ri-file-excel-2-line", children: [
    { label: "상품(원가표) 목록", href: "/products" }, { label: "새 상품 만들기", href: "/products/new" }, { label: "원가표 엑셀 가져오기", href: "/products/new#import" }, { label: "전체 원가표 다운로드", href: "/api/export", external: true },
    { label: "항공 운임·크롤러", href: "/fares" }, { label: "호텔·골프장·차량 단가", href: "/masters" },
  ] },
  { key: "setting", label: "설정", icon: "ri-settings-3-line", children: [{ label: "기본 설정", href: "/cms/settings/general" }, { label: "결제 설정", href: "/cms/settings/payment" }, { label: "취소/환불 설정", href: "/cms/settings/cancellation" }, { label: "API 설정", href: "/cms/settings/api" }] },
];

export default function AdminNav() {
  const path = usePathname();
  const isCur = (href: string) => {
    const p = href.split(/[?#]/)[0];
    if (p === "/") return path === "/";
    if (href.includes("?") || href.includes("#")) return false;
    if (/\/new$/.test(p)) return path === p;
    return path === p || path.startsWith(p + "/");
  };
  const groupCur = (g: Group) => (g.children ?? []).some((c) => !c.external && (isCur(c.href) || path === c.href.split(/[?#]/)[0] || path.startsWith(c.href.split(/[?#]/)[0] + "/")));
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <nav className="admin-nav" aria-label="관리자 메뉴">
      {MENU.map((m) => {
        if (!m.children) return (
          <div key={m.key} className={`admin-nav__group ${isCur(m.href!) ? "is-current" : ""}`}>
            <Link href={m.href!} className={`admin-nav__single ${isCur(m.href!) ? "is-current" : ""}`}><i className={m.icon} aria-hidden /> <span>{m.label}</span></Link>
          </div>
        );
        const hasCur = groupCur(m);
        const isOpen = open[m.key] ?? hasCur;
        return (
          <div key={m.key} className={`admin-nav__group ${isOpen ? "is-open" : ""} ${hasCur ? "is-current" : ""}`}>
            <button type="button" className="admin-nav__parent" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [m.key]: !isOpen })}>
              <span className="admin-nav__parent-left"><i className={m.icon} aria-hidden /> <span>{m.label}</span></span>
              <i className="ri-arrow-down-s-line admin-nav__arrow" aria-hidden />
            </button>
            <div className="admin-nav__children">
              {m.children.map((c) => c.external
                ? <a key={c.href} href={c.href} className="admin-nav__child">{c.label} <i className="ri-download-2-line ml-auto text-sm opacity-60" /></a>
                : <Link key={c.href} href={c.href} className={`admin-nav__child ${isCur(c.href) ? "is-current" : ""}`}>{c.label}</Link>)}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
