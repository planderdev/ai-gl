"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** 캐디스 Admin 사이드바와 같은 구조(admin-nav). 현재 경로에 맞춰 그룹을 열고 강조 */
const MENU = [
  { key: "dashboard", label: "대시보드", icon: "ri-dashboard-line", href: "/" },
  { key: "quote", label: "견적·원가표", icon: "ri-file-excel-2-line", children: [
    { label: "상품(원가표) 목록", href: "/products" },
    { label: "새 상품 만들기", href: "/products/new" },
    { label: "원가표 엑셀 가져오기", href: "/products/new#import" },
    { label: "전체 원가표 다운로드", href: "/api/export", external: true },
  ] },
  { key: "fares", label: "항공 운임", icon: "ri-flight-takeoff-line", children: [
    { label: "운임 조회", href: "/fares" },
    { label: "크롤링 요청·API", href: "/fares#requests" },
  ] },
  { key: "masters", label: "마스터 데이터", icon: "ri-database-2-line", children: [
    { label: "호텔", href: "/masters#hotels" },
    { label: "골프장 요금표", href: "/masters#golf" },
    { label: "차량+지원비", href: "/masters#vehicles" },
    { label: "환율·마진·공휴일", href: "/masters#settings" },
  ] },
];

export default function AdminNav() {
  const path = usePathname();
  const isCur = (href: string) => { const p = href.split("#")[0]; return p === "/" ? path === "/" : path === p || (p !== "/products" && path.startsWith(p + "/")) || (p === "/products" && path.startsWith("/products/") && !path.startsWith("/products/new")); };
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <nav className="admin-nav" aria-label="견적 시스템 메뉴">
      {MENU.map((m) => {
        if (!m.children) return (
          <div key={m.key} className={`admin-nav__group ${isCur(m.href!) ? "is-current" : ""}`}>
            <Link href={m.href!} className={`admin-nav__single ${isCur(m.href!) ? "is-current" : ""}`}><i className={m.icon} aria-hidden /> <span>{m.label}</span></Link>
          </div>
        );
        const hasCur = m.children.some((c) => !c.external && isCur(c.href));
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
                : <Link key={c.href} href={c.href} className={`admin-nav__child ${isCur(c.href) && !c.href.includes("#") ? "is-current" : ""}`}>{c.label}</Link>)}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
