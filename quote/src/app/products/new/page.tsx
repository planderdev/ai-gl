import ProductForm from "@/components/ProductForm";
import ImportForm from "@/components/ImportForm";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";

export const dynamic = "force-dynamic";
export default async function NewProduct() {
  const [h, g, v, s] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings()]);
  return (
    <>
      <PageHead crumb="새 상품" title="새 상품 만들기" desc="항공편·박수·골프 일정·호텔·골프장·차량 규칙과 출발일 범위를 정하면 날짜별 원가표가 자동 생성됩니다. 기존 원가표 엑셀을 올려 한 번에 가져올 수도 있습니다." />
      {!h.length || !v.length ? <p className="rounded-xl bg-[var(--admin-warning-soft)] p-3 text-sm text-[var(--admin-warning-hover)]">호텔·차량 규칙이 없습니다. 먼저 <a href="/masters" className="underline">마스터 데이터</a>를 등록하거나 아래에서 기존 원가표를 가져오세요.</p> : null}
      <ProductForm hotels={h} courses={g} vehicles={v} defaults={{ exchangeRate: s.exchangeRate, margins: s.margins }} />
      <div id="import"><ImportForm /></div>
    </>
  );
}
