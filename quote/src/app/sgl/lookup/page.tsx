import type { Metadata } from "next";
import Link from "next/link";
import { guardSite } from "@/lib/sgl/access";
import { loadConfig } from "@/lib/sgl/catalog";
import { LookupForm } from "../_ui/Forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "예약 조회", robots: { index: false } };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LookupPage({ searchParams }: Props) {
  if (!(await guardSite()).allowed) return null;
  const [sp, config] = await Promise.all([searchParams, loadConfig()]);
  const no = typeof sp.no === "string" ? sp.no.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30) : "";
  return (
    <div className="sgl-page">
      <div className="sgl-narrow" style={{ maxWidth: 520 }}>
        <nav className="sgl-crumb" aria-label="현재 위치"><Link href="/sgl">홈</Link><span aria-hidden>›</span><span>예약 조회</span></nav>
        <h1 className="sgl-h1">예약 조회 · 결제</h1>
        <p className="sgl-sub" style={{ marginBottom: 26 }}>예약번호와 예약자 휴대폰 번호로 예약 현황을 확인하고 결제를 이어서 진행할 수 있습니다.</p>
        <section className="sgl-panel"><LookupForm initialNo={no} tel={config.tel} /></section>
        <p className="sgl-small" style={{ marginTop: 18 }}>예약번호를 잊으셨다면 고객센터 <a href={`tel:${config.tel}`}><b>{config.tel}</b></a> ({config.hours})로 연락해 주세요.</p>
      </div>
    </div>
  );
}
