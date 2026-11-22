import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeId } from "@/lib/api";
import { guardSite, siteAccess } from "@/lib/sgl/access";
import { findPackage, loadCatalog } from "@/lib/sgl/catalog";
import Detail from "../../_ui/Detail";
import PackageCard from "../../_ui/PackageCard";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!(await siteAccess()).allowed) return {};
  const pkg = findPackage(await loadCatalog(), decodeId((await params).id));
  return pkg ? { title: pkg.title, description: pkg.summary } : {};
}

/** 상품 상세: 관리자의 상품군 하나. 일정(원가표)·출발일·인원을 고르면 그 날짜의 판매가로 예약을 시작한다 */
export default async function PackagePage({ params, searchParams }: Props) {
  if (!(await guardSite()).allowed) return null;
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const catalog = await loadCatalog();
  const pkg = findPackage(catalog, decodeId(id));
  if (!pkg) notFound();
  const { config } = catalog;
  const others = catalog.packages.filter((p) => p.id !== pkg.id).slice(0, 4);
  return (
    <div className="sgl-page">
      <nav className="sgl-crumb" aria-label="현재 위치">
        <Link href="/sgl">홈</Link><span aria-hidden>›</span>
        <Link href="/sgl#stays">골프여행 상품</Link><span aria-hidden>›</span>
        <span>{pkg.country} {pkg.region}</span><span aria-hidden>›</span>
        <span>{pkg.title}</span>
      </nav>
      <Detail pkg={pkg} initial={{ sheet: one(sp.sheet), date: one(sp.date), pax: Number(one(sp.pax)) || undefined }}
        config={{ minPax: config.minPax, maxPax: config.maxPax, tel: config.tel, deposit: config.deposit, partial: config.partial, balanceDueDays: config.balanceDueDays, cancel: config.cancel, notice: config.notice }} />
      {others.length > 0 && (
        <section style={{ marginTop: 72 }}>
          <div className="sgl-sec__head"><h2 className="sgl-h2">다른 골프여행</h2><Link href="/sgl#stays" className="sgl-pill">전체 보기</Link></div>
          <div className="sgl-grid">{others.map((p, i) => <PackageCard key={p.id} pkg={p} col={i} />)}</div>
        </section>
      )}
    </div>
  );
}
