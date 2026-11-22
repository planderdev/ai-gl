import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import ProductComposition from "@/components/ProductComposition";
import QuoteTable from "@/components/QuoteTable";
import FareRequestButton from "@/components/FareRequestButton";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { productGroups, products, quoteProduct, sortSheets } from "@/lib/products/service";
import { golfPlanLabel } from "@/lib/pricing/engine";
import { SALE_TYPE_LABEL, saleTypeOf } from "@/lib/products/describe";
import { decodeId } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: PageProps<"/products/[id]">) {
  const id = decodeId((await params).id);
  const sp = await searchParams;
  const q = await quoteProduct(id);
  if (!q) notFound();
  const [h, g, v, s, groups, all] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings(), productGroups().list(), products().list()]);
  const { product: p, rows, ctx, missing } = q;
  const edit = sp?.edit === "1";
  const group = groups.find((x) => x.id === p.groupId) ?? null;
  const siblings = group ? sortSheets(all.filter((x) => x.groupId === group.id)) : [];
  const type = saleTypeOf(p);
  const priced = rows.filter((r) => r.saleMargin != null);
  const avgMargin = priced.length ? priced.reduce((a, r) => a + (r.saleMargin ?? 0), 0) / priced.length : null;
  return (
    <>
      <PageHead
        crumb={["상품관리", group?.country ?? "일본", p.region, group?.name ?? "미분류"].join(" › ")}
        title={<>{p.name} <span className={`admin-chip align-middle ${type === "land" ? "admin-chip--success" : ""}`}>{SALE_TYPE_LABEL[type]}</span></>}
        desc={<>{p.nights}박{p.nights + 1}일 · {p.outbound.flightNo} {p.outbound.dep}-{p.outbound.arr} / {p.inbound.flightNo} {p.inbound.dep}-{p.inbound.arr} · 골프 {golfPlanLabel(p.golfPlan)} · 환율 {p.exchangeRate} · 마진 {p.margins.map((m) => `${Math.round(m * 100)}%`).join("/")}{p.paxBasis ? ` · ${p.paxBasis}인 기준` : ""}</>}
        stats={[
          { label: "출발일", value: `${p.dateFrom.slice(2)} ~ ${p.dateTo.slice(2)}` }, { label: "행", value: rows.length },
          type === "land" ? { label: "판매가 입력", value: `${priced.length}/${rows.length}` } : { label: "운임 미수집", value: missing.length },
          ...(avgMargin != null ? [{ label: "판매가 평균 수익률", value: `${(avgMargin * 100).toFixed(1)}%` }] : []),
        ]}
        actions={<>
          <FareRequestButton productId={p.id} missing={missing.length} />
          <Link href={edit ? `/products/${p.id}` : `/products/${p.id}?edit=1`} className="admin-btn admin-btn--light"><i className="ri-settings-3-line" /> {edit ? "설정 닫기" : "원가표 설정"}</Link>
          <a href={`/api/products/${p.id}/export`} className="admin-btn admin-btn--primary"><i className="ri-file-excel-2-line" /> 원가표 .xlsx</a>
        </>}
      />
      {group && (
        <nav className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="같은 상품군의 원가표">
          <Link href="/products" className="mr-1 inline-flex items-center gap-1 font-bold text-[var(--admin-text-muted)] hover:text-[var(--admin-primary)]"><i className="ri-folder-3-fill text-[var(--admin-primary)]" />{group.name}</Link>
          {siblings.map((x) => (
            <Link key={x.id} href={`/products/${x.id}`} className={`rounded-xl border px-3 py-1.5 font-semibold ${x.id === p.id ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]" : "border-[var(--admin-border)] bg-white text-[var(--admin-text-muted)] hover:border-[var(--admin-border-strong)]"}`}>{x.name}</Link>
          ))}
          <a href={`/api/product-groups/${encodeURIComponent(group.id)}/export`} className="admin-btn admin-btn--light admin-btn--xs ml-auto" title="이 상품군의 원가표를 시트로 묶은 파일"><i className="ri-file-excel-2-line" /> 묶음 .xlsx</a>
        </nav>
      )}
      {edit ? <ProductForm product={p} groups={groups} hotels={h} courses={g} vehicles={v} defaults={{ exchangeRate: s.exchangeRate, margins: s.margins }} /> : <ProductComposition product={p} ctx={ctx} courses={g} />}
      <QuoteTable product={p} rows={rows} />
    </>
  );
}
