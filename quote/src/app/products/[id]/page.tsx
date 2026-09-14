import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import QuoteTable from "@/components/QuoteTable";
import FareRequestButton from "@/components/FareRequestButton";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { quoteProduct } from "@/lib/products/service";
import { golfPlanLabel } from "@/lib/pricing/engine";
import { WEEKDAYS } from "@/lib/format";
import { decodeId } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: PageProps<"/products/[id]">) {
  const id = decodeId((await params).id);
  const sp = await searchParams;
  const q = await quoteProduct(id);
  if (!q) notFound();
  const [h, g, v, s] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings()]);
  const { product: p, rows, ctx, missing } = q;
  const edit = sp?.edit === "1";
  return (
    <>
      <PageHead
        crumb="상품 · 원가표"
        title={p.name}
        desc={<>{p.nights}박{p.nights + 1}일 · {p.outbound.flightNo} {p.outbound.dep}-{p.outbound.arr} / {p.inbound.flightNo} {p.inbound.dep}-{p.inbound.arr} · 골프 {golfPlanLabel(p.golfPlan)} · 환율 {p.exchangeRate} · 마진 {p.margins.map((m) => `${Math.round(m * 100)}%`).join("/")}<br />
          호텔 {ctx.hotel?.name ?? "-"} ({ctx.hotel ? WEEKDAYS.map((w, i) => `${w}${ctx.hotel!.nightlyRates[i as 0]}`).join(" ") : ""}) · 골프장 {ctx.courses.map((c) => c.name).join(", ") || "-"} · 차량 {ctx.vehicle?.name ?? "-"} · 그룹 유택 {Object.entries(p.groupTaxByMonth).map(([k, v]) => `${k.slice(5)}월 ${typeof v === "number" ? v.toLocaleString() : v}`).join(", ") || "-"}</>}
        stats={[{ label: "출발일", value: `${p.dateFrom.slice(2)} ~ ${p.dateTo.slice(2)}` }, { label: "행", value: rows.length }, { label: "운임 미수집", value: missing.length }]}
        actions={<>
          <FareRequestButton productId={p.id} missing={missing.length} />
          <Link href={edit ? `/products/${p.id}` : `/products/${p.id}?edit=1`} className="admin-btn admin-btn--light"><i className="ri-settings-3-line" /> {edit ? "설정 닫기" : "상품 설정"}</Link>
          <a href={`/api/products/${p.id}/export`} className="admin-btn admin-btn--primary"><i className="ri-file-excel-2-line" /> 원가표 .xlsx</a>
        </>}
      />
      {edit && <ProductForm product={p} hotels={h} courses={g} vehicles={v} defaults={{ exchangeRate: s.exchangeRate, margins: s.margins }} />}
      <QuoteTable product={p} rows={rows} />
    </>
  );
}
