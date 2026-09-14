import Link from "next/link";
import PageHead from "@/components/PageHead";
import { products, quoteProduct } from "@/lib/products/service";
import { golfPlanLabel } from "@/lib/pricing/engine";

export const dynamic = "force-dynamic";
export default async function ProductsPage() {
  const list = (await products().list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const quotes = (await Promise.all(list.map((p) => quoteProduct(p.id)))).filter((q): q is NonNullable<typeof q> => !!q);
  return (
    <>
      <PageHead crumb="상품(원가표) 목록" title="상품 · 원가표" desc="상품별로 출발일 범위, 호텔·골프장·차량 규칙, 환율과 마진을 설정하고 원가표 엑셀을 내려받습니다." actions={<Link href="/products/new" className="admin-btn admin-btn--primary"><i className="ri-add-line" /> 새 상품</Link>} />
      <section className="admin-card">
        <div className="admin-card__body admin-card__body--flush overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>상품명</th><th>지역</th><th>일정</th><th>골프</th><th>출발 기간</th><th className="num">행</th><th className="num">미수집</th><th>수정</th><th></th></tr></thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.product.id}>
                  <td><Link href={`/products/${q.product.id}`} className="font-bold text-[var(--admin-text-strong)] hover:text-[var(--admin-primary)]">{q.product.name}</Link></td>
                  <td>{q.product.region}</td>
                  <td className="text-[var(--admin-text-muted)]">{q.product.nights}박{q.product.nights + 1}일 · {q.product.outbound.flightNo}/{q.product.inbound.flightNo}</td>
                  <td>{golfPlanLabel(q.product.golfPlan)}</td>
                  <td className="text-[var(--admin-text-muted)]">{q.product.dateFrom} ~ {q.product.dateTo}</td>
                  <td className="num">{q.rows.length}</td>
                  <td className="num">{q.missing.length ? <span className="admin-chip admin-chip--warning">{q.missing.length}</span> : <span className="admin-chip admin-chip--success">완료</span>}</td>
                  <td className="text-[var(--admin-text-soft)]">{q.product.updatedAt.slice(0, 10)}</td>
                  <td className="num"><a className="admin-btn admin-btn--light admin-btn--xs" href={`/api/products/${q.product.id}/export`}><i className="ri-download-2-line" /> .xlsx</a></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={9} className="py-8 text-center text-[var(--admin-text-muted)]">상품이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
