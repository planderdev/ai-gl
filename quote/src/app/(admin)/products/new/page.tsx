import ProductForm from "@/components/ProductForm";
import ImportForm from "@/components/ImportForm";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { productGroups } from "@/lib/products/service";

export const dynamic = "force-dynamic";
export default async function NewProduct() {
  const [h, g, v, s, groups] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings(), productGroups().list()]);
  return (
    <>
      <PageHead crumb="상품관리 › 새 원가표" title="새 원가표 만들기" desc="상품군을 고르고 항공편·박수·숙박 구성·라운드별 골프장·차량·기타 원가와 출발일 범위를 정하면 날짜별 원가표가 자동 생성됩니다. 엑셀로 한 번에 넣으려면 아래에서 입력표 양식을 받아 채워 올리거나, 쓰던 원가표 파일을 그대로 올리세요." />
      {!h.length || !v.length ? <p className="rounded-xl bg-[var(--admin-warning-soft)] p-3 text-sm text-[var(--admin-warning-hover)]">호텔·차량 규칙이 없습니다. 먼저 <a href="/masters" className="underline">단가</a>를 등록하거나 아래에서 기존 원가표를 가져오세요.</p> : null}
      <ProductForm groups={groups} hotels={h} courses={g} vehicles={v} defaults={{ exchangeRate: s.exchangeRate, margins: s.margins }} />
      <div id="import"><ImportForm /></div>
    </>
  );
}
