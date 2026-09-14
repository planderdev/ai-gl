import type { ReactNode } from "react";

/** 캐디스 Admin 의 admin-page-head 와 같은 페이지 상단 히어로 */
export default function PageHead({ crumb, title, desc, actions, stats }: { crumb?: string; title: ReactNode; desc?: ReactNode; actions?: ReactNode; stats?: { label: string; value: ReactNode }[] }) {
  return (
    <section className="admin-page-head">
      <div className="min-w-0 flex-1">
        {crumb && <div className="admin-breadcrumb"><span>견적 시스템</span><i className="ri-arrow-right-s-line" /><span className="admin-breadcrumb__current">{crumb}</span></div>}
        <h1 className="admin-page-head__title">{title}</h1>
        {desc && <p className="admin-page-head__desc">{desc}</p>}
        {stats && stats.length > 0 && (
          <div className="admin-page-head__stats">{stats.map((s) => (<div key={s.label} className="admin-hero-stat"><span className="admin-hero-stat__label">{s.label}</span><span className="admin-hero-stat__value">{s.value}</span></div>))}</div>
        )}
      </div>
      {actions && <div className="admin-page-head__actions">{actions}</div>}
    </section>
  );
}
