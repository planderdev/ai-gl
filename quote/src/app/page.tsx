import Link from "next/link";
import PageHead from "@/components/PageHead";
import { products, quoteProduct } from "@/lib/products/service";
import { fareRequests, fares } from "@/lib/fares/service";
import { golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { golfPlanLabel } from "@/lib/pricing/engine";
import { collectionById } from "@/lib/cms/schema";
import { listItems } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [list, allFares, reqs, h, g, v] = await Promise.all([products().list(), fares().list(), fareRequests().list(), hotels().list(), golfCourses().list(), vehicleRules().list()]);
  const quotes = (await Promise.all(list.map((p) => quoteProduct(p.id)))).filter((q): q is NonNullable<typeof q> => !!q);
  const pending = reqs.filter((r) => r.status === "pending" || r.status === "in_progress");
  const [cmsProducts, cmsBookings, cmsCustomers, cmsEvents] = await Promise.all(["products", "bookings", "customers", "events"].map((id) => listItems(collectionById(id)!)));
  const cmsCards = [
    { label: "상품", value: cmsProducts.length, sub: `공개 ${cmsProducts.filter((x) => x.status === "publish").length}`, href: "/cms/products", icon: "ri-golf-ball-line" },
    { label: "예약", value: cmsBookings.length, sub: `확정 ${cmsBookings.filter((x) => x.status === "confirmed").length} · 대기 ${cmsBookings.filter((x) => x.status === "pending").length}`, href: "/cms/bookings", icon: "ri-calendar-check-line" },
    { label: "고객", value: cmsCustomers.length, sub: `VIP ${cmsCustomers.filter((x) => x.grade === "vip").length}`, href: "/cms/customers", icon: "ri-user-3-line" },
    { label: "이벤트", value: cmsEvents.length, sub: `공개 ${cmsEvents.filter((x) => x.status === "publish").length}`, href: "/cms/events", icon: "ri-megaphone-line" },
  ];
  const missing = quotes.reduce((a, q) => a + q.missing.length, 0);
  const latest = allFares.map((f) => f.capturedAt).sort().at(-1);
  return (
    <>
      <PageHead
        crumb="대시보드"
        title="AIGL 대시보드"
        desc="숙박·골프·차량·항공 원가와 마진을 날짜별로 계산해 원가표 엑셀을 만듭니다. 항공 운임은 에어서울 크롤러가 채웁니다."
        stats={[
          { label: "상품(원가표)", value: list.length },
          { label: "항공 운임 보유", value: allFares.length.toLocaleString() },
          { label: "운임 미수집", value: missing },
          { label: "크롤링 대기", value: pending.length },
          { label: "호텔 / 골프장 / 차량", value: `${h.length} / ${g.length} / ${v.length}` },
        ]}
        actions={<><Link href="/products/new" className="admin-btn admin-btn--primary"><i className="ri-add-line" /> 새 상품</Link><a href="/api/export" className="admin-btn admin-btn--light"><i className="ri-file-excel-2-line" /> 전체 원가표</a></>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        {cmsCards.map((c) => (
          <Link key={c.label} href={c.href} className="admin-card flex items-start gap-3 p-5 transition hover:-translate-y-0.5">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-xl text-[var(--admin-primary)]"><i className={c.icon} /></span>
            <span className="min-w-0"><span className="block text-[13px] font-bold text-[var(--admin-text-muted)]">{c.label}</span><span className="block text-2xl font-extrabold tracking-tight text-[var(--admin-text-strong)]">{c.value}</span><span className="block text-xs text-[var(--admin-text-soft)]">{c.sub}</span></span>
          </Link>
        ))}
      </div>
      <section className="admin-card">
        <div className="admin-card__head"><div><h2>상품 · 원가표</h2><p className="admin-card__desc">시트 하나가 상품 하나입니다. 이름을 누르면 날짜별 요금표를 편집할 수 있습니다.</p></div><Link href="/products" className="admin-btn admin-btn--light admin-btn--xs">전체 보기</Link></div>
        <div className="admin-card__body admin-card__body--flush overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>상품명</th><th>일정</th><th>골프</th><th>출발 기간</th><th className="num">행</th><th className="num">운임 미수집</th><th className="num">환율</th><th></th></tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.product.id}>
                  <td><Link href={`/products/${q.product.id}`} className="font-bold text-[var(--admin-text-strong)] hover:text-[var(--admin-primary)]">{q.product.name}</Link></td>
                  <td className="text-[var(--admin-text-muted)]">{q.product.nights}박{q.product.nights + 1}일 · {q.product.outbound.flightNo}/{q.product.inbound.flightNo}</td>
                  <td>{golfPlanLabel(q.product.golfPlan)}</td>
                  <td className="text-[var(--admin-text-muted)]">{q.product.dateFrom} ~ {q.product.dateTo}</td>
                  <td className="num">{q.rows.length}</td>
                  <td className="num">{q.missing.length ? <span className="admin-chip admin-chip--warning">{q.missing.length}건</span> : <span className="admin-chip admin-chip--success">완료</span>}</td>
                  <td className="num">{q.product.exchangeRate}</td>
                  <td className="num"><a className="admin-btn admin-btn--light admin-btn--xs" href={`/api/products/${q.product.id}/export`}><i className="ri-download-2-line" /> .xlsx</a></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={8} className="py-8 text-center text-[var(--admin-text-muted)]">상품이 없습니다. 기존 원가표 엑셀을 <Link href="/products/new" className="underline">가져오거나</Link> 새 상품을 만드세요.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-card">
        <div className="admin-card__head"><div><h2>크롤링 요청 현황</h2><p className="admin-card__desc">최근 운임 수집 {latest ? latest.slice(0, 16).replace("T", " ") + " (UTC)" : "없음"}</p></div><Link href="/fares" className="admin-btn admin-btn--light admin-btn--xs">항공 운임</Link></div>
        <div className="admin-card__body">
          {pending.length ? (
            <ul className="space-y-2 text-sm">{pending.map((r) => (<li key={r.id} className="flex flex-wrap items-center gap-3"><span className={`admin-chip ${r.status === "pending" ? "admin-chip--warning" : ""}`}>{r.status}</span><span className="font-semibold">{r.flights.map((f) => f.flightNo).join(", ")}</span><span className="text-[var(--admin-text-muted)]">{r.from} ~ {r.to}</span><span className="text-[var(--admin-text-soft)]">{r.note}</span></li>))}</ul>
          ) : <p className="text-sm text-[var(--admin-text-muted)]">대기 중인 요청이 없습니다. 상품 화면의 “운임 크롤링 요청” 또는 항공 운임 화면의 “지금 수집”을 사용하세요.</p>}
        </div>
      </section>
    </>
  );
}
