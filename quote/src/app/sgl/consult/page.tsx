import type { Metadata } from "next";
import Link from "next/link";
import { guardSite } from "@/lib/sgl/access";
import { findSheet, loadCatalog } from "@/lib/sgl/catalog";
import { dateKo } from "@/lib/sgl/config";
import { ConsultForm } from "../_ui/Forms";
import { Icon } from "../_ui/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "상담 문의", description: "일정·인원·예산을 알려 주시면 담당자가 맞는 골프여행을 안내해 드립니다." };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

/** 상담 신청. 상세에서 넘어오면 보던 상품·출발일·인원이 미리 채워진다 */
export default async function ConsultPage({ searchParams }: Props) {
  if (!(await guardSite()).allowed) return null;
  const sp = await searchParams;
  const catalog = await loadCatalog();
  const { config, packages } = catalog;
  const packageId = packages.some((p) => p.id === one(sp.package)) ? one(sp.package) : "";
  const hit = packageId ? findSheet(catalog, one(sp.sheet)) : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(one(sp.date)) ? one(sp.date) : "";
  return (
    <div className="sgl-page">
      <div className="sgl-narrow">
        <nav className="sgl-crumb" aria-label="현재 위치"><Link href="/sgl">홈</Link><span aria-hidden>›</span><span>상담 문의</span></nav>
        <h1 className="sgl-h1">상담 문의</h1>
        <p className="sgl-sub" style={{ marginBottom: 26 }}>일정·인원·예산을 알려 주시면 담당자가 맞는 상품과 출발일을 안내해 드립니다.</p>
        <div className="sgl-two">
          <section className="sgl-panel">
            <ConsultForm tel={config.tel} regions={[...new Set(packages.map((p) => p.region))]} packages={packages.map((p) => ({ id: p.id, title: `${p.title}${p.airline ? ` (${p.airline})` : ""}`, region: p.region }))}
              initial={{ packageId, sheetId: hit?.sheet.id ?? "", date, people: one(sp.pax).replace(/\D/g, "").slice(0, 2) }} />
          </section>
          <aside>
            {hit && <div className="sgl-panel"><h2 className="sgl-h3">보고 계신 상품</h2><p style={{ margin: 0 }}><b>{hit.pkg.title}</b></p><p className="sgl-muted" style={{ margin: "4px 0 0" }}>{hit.sheet.label}{date ? ` · ${dateKo(date)} 출발` : ""}</p></div>}
            <div className="sgl-panel">
              <h2 className="sgl-h3">바로 연락하기</h2>
              <p className="sgl-muted" style={{ margin: 0 }}>상담 시간 {config.hours}</p>
              <div className="sgl-contact">
                <a href={`tel:${config.tel}`}><Icon name="phone" size={20} /><span>{config.tel}<small>전화 상담</small></span></a>
                {config.kakaoUrl && <a href={config.kakaoUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={20} /><span>카카오톡 채널<small>채팅 상담</small></span></a>}
                <Link href="/sgl/lookup"><Icon name="search" size={20} /><span>예약 조회 · 결제<small>이미 예약하셨다면</small></span></Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
