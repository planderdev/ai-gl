import Link from "next/link";
import PageHead from "@/components/PageHead";
import GroupEditor from "@/components/GroupEditor";
import AutoGroupButton from "@/components/AutoGroupButton";
import { productGroups, products, quoteProduct, sortSheets } from "@/lib/products/service";
import { golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { todayKst } from "@/lib/crawler/airseoul";
import { loadConfig } from "@/lib/sgl/catalog";
import { golfText, SALE_TYPE_LABEL, saleTypeOf, stayText } from "@/lib/products/describe";
import { airlineName } from "@/lib/format";
import type { ProductGroup } from "@/types";

export const dynamic = "force-dynamic";

type Quote = NonNullable<Awaited<ReturnType<typeof quoteProduct>>>;

/** 상품관리 첫 화면: 국가 › 지역 › 상품군(원가표 파일) › 원가표(시트) */
export default async function ProductsPage() {
  const [list, groups, h, g, v, sgl] = await Promise.all([products().list(), productGroups().list(), hotels().list(), golfCourses().list(), vehicleRules().list(), loadConfig()]);
  const siteOpen = sgl.status === "open"; // 설정 › 고객 사이트의 공개 스위치와 사이트 상태
  const quotes = new Map((await Promise.all(list.map((p) => quoteProduct(p.id)))).filter((q): q is Quote => !!q).map((q) => [q.product.id, q]));
  const hotelsById = new Map(h.map((x) => [x.id, x])), coursesById = new Map(g.map((x) => [x.id, x]));
  const groupIds = new Set(groups.map((x) => x.id));
  const countryOf = new Map(groups.map((x) => [x.region, x.country]));
  const regions = [...new Set([...groups.map((x) => x.region), ...list.map((p) => p.region)])].sort((a, b) => a.localeCompare(b, "ko"));
  const masterRegions = [...new Set([...regions, ...h.map((x) => x.region), ...g.map((x) => x.region)])].sort((a, b) => a.localeCompare(b, "ko"));
  const missing = [...quotes.values()].reduce((a, q) => a + q.missing.length, 0);
  const today = todayKst();

  const sheetRows = (items: typeof list) => sortSheets(items).map((p) => {
    const q = quotes.get(p.id);
    const type = saleTypeOf(p);
    return (
      <tr key={p.id}>
        <td className="pl-12">
          <Link href={`/products/${p.id}`} className="font-bold text-[var(--admin-text-strong)] hover:text-[var(--admin-primary)]"><i className="ri-file-list-3-line mr-1.5 text-[var(--admin-text-soft)]" />{p.name}</Link>
        </td>
        <td className="whitespace-nowrap"><span className={`admin-chip ${type === "land" ? "admin-chip--success" : ""}`}>{SALE_TYPE_LABEL[type]}</span>{p.paxBasis ? <span className="ml-1 text-xs text-[var(--admin-text-soft)]">{p.paxBasis}인</span> : null}</td>
        <td className="text-[var(--admin-text-muted)]">{p.nights}박{p.nights + 1}일 · {p.outbound.flightNo}/{p.inbound.flightNo}</td>
        <td>{stayText(p, hotelsById)}</td>
        <td>{golfText(p, coursesById)}</td>
        <td className="whitespace-nowrap text-[var(--admin-text-muted)]">{p.dateFrom.slice(2)} ~ {p.dateTo.slice(2)}</td>
        <td className="num">{q?.rows.length ?? 0}</td>
        <td className="num whitespace-nowrap">{type === "land" ? <span className="admin-chip admin-chip--gray">참고용</span> : q?.missing.length ? <span className="admin-chip admin-chip--warning">미수집 {q.missing.length}</span> : <span className="admin-chip admin-chip--success">완료</span>}</td>
        <td className="num whitespace-nowrap"><a className="admin-btn admin-btn--light admin-btn--xs" href={`/api/products/${p.id}/export`}><i className="ri-download-2-line" /> .xlsx</a></td>
      </tr>
    );
  });
  const groupBlock = (grp: ProductGroup) => {
    const children = list.filter((p) => p.groupId === grp.id);
    const types = [...new Set(children.map(saleTypeOf))];
    return (
      <tbody key={grp.id}>
        <tr className="bg-[var(--admin-surface-muted)]">
          <td colSpan={7} className="!py-3">
            <div className="flex flex-wrap items-center gap-2">
              <i className="ri-folder-3-fill text-lg text-[var(--admin-primary)]" />
              <span className="text-[15px] font-extrabold text-[var(--admin-text-strong)]">{grp.name}</span>
              {grp.airline && <span className="admin-chip admin-chip--gray">{airlineName(grp.airline)}</span>}
              {types.map((t) => <span key={t} className={`admin-chip ${t === "land" ? "admin-chip--success" : ""}`}>{SALE_TYPE_LABEL[t]}</span>)}
              <span className="text-xs text-[var(--admin-text-soft)]">원가표 {children.length}개</span>
              {grp.publicStatus === "hidden"
                ? <span className="admin-chip admin-chip--gray" title="고객 사이트(/sgl)에 보이지 않습니다"><i className="ri-eye-off-line" /> 고객 사이트 숨김</span>
                : children.some((p) => p.dateTo > today)
                  ? siteOpen
                    ? <a className="admin-chip admin-chip--success" href={`/sgl/p/${encodeURIComponent(grp.id)}`} target="_blank" title="고객 사이트에서 보기"><i className="ri-global-line" /> 고객 사이트 공개</a>
                    : <a className="admin-chip admin-chip--warning" href={`/sgl/p/${encodeURIComponent(grp.id)}`} target="_blank" title="고객 사이트가 아직 미공개입니다. 관리자만 미리 볼 수 있어요"><i className="ri-eye-line" /> 미리보기(사이트 미공개)</a>
                  : <span className="admin-chip admin-chip--warning" title="출발일이 남은 원가표가 없어 고객 사이트에 보이지 않습니다"><i className="ri-calendar-close-line" /> 출발일 지남</span>}
            </div>
            {grp.summary && <p className="mt-1 pl-7 text-xs text-[var(--admin-text-muted)]">{grp.summary}</p>}
          </td>
          <td colSpan={2} className="num !py-3">
            <span className="inline-flex justify-end gap-1.5 whitespace-nowrap">
              <GroupEditor group={grp} regions={masterRegions} childCount={children.length} />
              {children.length > 0 && <a className="admin-btn admin-btn--light admin-btn--xs" href={`/api/input-template?group=${encodeURIComponent(grp.id)}`} title="이 상품군의 설정·단가·날짜별 값을 채운 입력표. 고쳐서 엑셀 가져오기로 다시 올리면 반영됩니다"><i className="ri-edit-box-line" /> 입력표</a>}
              {children.length > 0 && <a className="admin-btn admin-btn--light admin-btn--xs" href={`/api/product-groups/${encodeURIComponent(grp.id)}/export`} title="하위 원가표를 시트로 묶은 엑셀 파일"><i className="ri-file-excel-2-line" /> 묶음 .xlsx</a>}
            </span>
          </td>
        </tr>
        {sheetRows(children)}
        {!children.length && <tr><td colSpan={9} className="pl-12 text-sm text-[var(--admin-text-soft)]">아직 원가표가 없습니다. 원가표 설정에서 이 상품군을 고르면 여기에 붙습니다.</td></tr>}
      </tbody>
    );
  };

  return (
    <>
      <PageHead
        crumb="상품관리"
        title="상품 구조 · 원가표"
        desc={<>국가 › 지역 › <b>상품군</b>(원가표 엑셀 파일 1개) › <b>원가표</b>(시트 1장) 순으로 묶여 있습니다. 원가표마다 숙박·골프·차량·기타 원가와 항공(포함 또는 현지착)을 조합해 출발일별 원가와 판매가를 계산합니다.</>}
        stats={[{ label: "지역", value: regions.length }, { label: "상품군", value: groups.length }, { label: "원가표", value: list.length }, { label: "운임 미수집", value: missing }]}
        actions={<>
          <Link href="/products/new" className="admin-btn admin-btn--primary"><i className="ri-add-line" /> 새 원가표</Link>
          <Link href="/products/new#import" className="admin-btn admin-btn--light"><i className="ri-upload-2-line" /> 엑셀 가져오기</Link>
          <GroupEditor regions={masterRegions} />
          <a href="/sgl" target="_blank" className="admin-btn admin-btn--light" title={siteOpen ? "고객 사이트 열기" : "아직 미공개입니다. 설정 › 고객 사이트에서 공개를 켜면 고객에게 열립니다"}><i className="ri-external-link-line" /> {siteOpen ? "고객 사이트" : "고객 사이트 미리보기"}</a>
          {!siteOpen && <Link href="/cms/settings/sgl" className="admin-chip admin-chip--warning" title="설정 › 고객 사이트에서 공개를 켜세요"><i className="ri-lock-line" /> 고객 사이트 미공개</Link>}
          <AutoGroupButton count={list.filter((p) => !p.groupId || !groupIds.has(p.groupId)).length} />
        </>}
      />
      {regions.map((region) => {
        const regionGroups = groups.filter((x) => x.region === region).sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.name.localeCompare(b.name, "ko"));
        const loose = list.filter((p) => p.region === region && (!p.groupId || !groupIds.has(p.groupId)));
        const count = { hotel: h.filter((x) => x.region === region).length, golf: g.filter((x) => x.region === region && !x.id.startsWith("golf-pkg-")).length, vehicle: v.filter((x) => x.region === region).length };
        return (
          <section key={region} className="admin-card">
            <div className="admin-card__head">
              <div className="flex flex-wrap items-center gap-2">
                <i className="ri-map-pin-2-fill text-lg text-[var(--admin-primary)]" />
                <h2><span className="font-semibold text-[var(--admin-text-muted)]">{countryOf.get(region) ?? "일본"} ›</span> {region}</h2>
                <span className="admin-card__desc">상품군 {regionGroups.length} · 원가표 {list.filter((p) => p.region === region).length}</span>
              </div>
              <Link href={`/masters?region=${encodeURIComponent(region)}`} className="admin-btn admin-btn--light admin-btn--xs" title="이 지역의 호텔·골프장·차량 단가"><i className="ri-price-tag-3-line" /> 단가: 호텔 {count.hotel} · 골프장 {count.golf} · 차량 {count.vehicle}</Link>
            </div>
            <div className="admin-card__body admin-card__body--flush overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>상품군 › 원가표</th><th>유형</th><th>일정 · 항공편</th><th>숙박</th><th>골프</th><th>출발 기간</th><th className="num">행</th><th className="num">항공 운임</th><th></th></tr></thead>
                {regionGroups.map(groupBlock)}
                {loose.length > 0 && (
                  <tbody>
                    <tr className="bg-[var(--admin-surface-muted)]"><td colSpan={9} className="!py-3"><i className="ri-folder-unknow-line mr-1.5 text-lg text-[var(--admin-text-soft)]" /><span className="font-bold text-[var(--admin-text-muted)]">미분류</span><span className="ml-2 text-xs text-[var(--admin-text-soft)]">원가표 설정에서 상품군을 지정하세요</span></td></tr>
                    {sheetRows(loose)}
                  </tbody>
                )}
              </table>
            </div>
          </section>
        );
      })}
      {!list.length && !groups.length && <section className="admin-card"><div className="admin-card__body text-center text-[var(--admin-text-muted)]">상품이 없습니다. 새 원가표를 만들거나 기존 원가표 엑셀을 가져오세요.</div></section>}
    </>
  );
}
