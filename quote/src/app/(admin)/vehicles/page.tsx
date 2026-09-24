import Link from "next/link";
import PageHead from "@/components/PageHead";
import VehicleCrawlButton from "@/components/VehicleCrawlButton";
import { listVehicleFares, VEHICLE_PROVIDERS } from "@/lib/vehicles/service";
import { getSettings } from "@/lib/masters/service";

export const dynamic = "force-dynamic";

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicles">) {
  const sp = await searchParams;
  const provider = typeof sp.provider === "string" ? sp.provider : "mk-tokyo";
  const [items, all, settings] = await Promise.all([listVehicleFares(provider), listVehicleFares(), getSettings()]);
  const captured = items.map((f) => f.capturedAt).sort().at(-1);
  const providersWithData = new Set(all.map((f) => f.provider));
  // 섹션 → 노선 행 × 차종 열
  const sections = [...new Set(items.map((f) => `${f.section}|${f.validity ?? ""}`))].map((key) => {
    const [section, validity] = key.split("|");
    const rows = items.filter((f) => f.section === section && (f.validity ?? "") === validity);
    const classes = [...new Set(rows.map((f) => f.vehicleClass))];
    const routes = [...new Set(rows.map((f) => f.route))];
    return { section, validity, classes, routes, cell: (r: string, c: string) => rows.find((f) => f.route === r && f.vehicleClass === c) };
  });
  const rate = settings.exchangeRate;
  return (
    <>
      <PageHead crumb="차량 요금표" title="차량 요금표 (MK택시 공항 송영)" desc="MK택시 홈페이지의 공항⇔시내 정액 요금(1대 기준, 엔)을 그대로 수집합니다. 고속도로 통행료 별도, 22:00~05:00 심야 25% 할증. 1인 원가는 1대 요금 ÷ 탑승 인원 × 환율로 계산하세요."
        stats={[{ label: "수집 건수", value: items.length }, { label: "최근 수집", value: captured ? captured.slice(0, 10) : "-" }, { label: "환율", value: rate }, { label: "도시(수집됨)", value: `${providersWithData.size} / ${VEHICLE_PROVIDERS.length}` }]}
        actions={<VehicleCrawlButton providers={VEHICLE_PROVIDERS.map((p) => ({ id: p.id, label: p.label }))} current={provider} />} />
      <div className="flex flex-wrap gap-2">
        {VEHICLE_PROVIDERS.map((p) => <Link key={p.id} href={`/vehicles?provider=${p.id}`} className={`admin-chip ${p.id === provider ? "" : providersWithData.has(p.id) ? "admin-chip--gray" : "admin-chip--gray opacity-50"}`}>{p.label.replace(" 공항 송영", "")}{providersWithData.has(p.id) ? "" : " (미수집)"}</Link>)}
      </div>
      {!items.length && <section className="admin-card"><div className="admin-card__body text-sm text-[var(--admin-text-muted)]">아직 수집된 요금이 없습니다. 오른쪽 위 “지금 수집”을 누르세요.</div></section>}
      {sections.map((s) => (
        <section key={`${s.section}|${s.validity}`} className="admin-card">
          <div className="admin-card__head"><div><h2>{s.section}</h2><p className="admin-card__desc">{s.validity ? `적용 기간: ${s.validity} · ` : ""}1대 요금(엔) · 괄호는 4인 탑승 시 1인 원화 환산(환율 {rate})</p></div><a href={items[0]?.sourceUrl} target="_blank" rel="noopener" className="admin-btn admin-btn--light admin-btn--xs">원문 <i className="ri-external-link-line" /></a></div>
          <div className="admin-card__body admin-card__body--flush overflow-x-auto">
            <table className="admin-table">
              <thead><tr><th>노선 / 지역</th>{s.classes.map((c) => <th key={c} className="num">{c}</th>)}</tr></thead>
              <tbody>
                {s.routes.map((r) => (
                  <tr key={r}><td className="font-semibold text-[var(--admin-text-strong)]">{r}</td>
                    {s.classes.map((c) => { const f = s.cell(r, c); return <td key={c} className="num">{f ? <>{f.priceJpy.toLocaleString("ko-KR")}엔{f.unit === "30분당" ? <span className="text-[var(--admin-text-soft)]"> /30분</span> : <span className="block text-[11px] text-[var(--admin-text-soft)]">({Math.round(f.priceJpy / 4 * rate).toLocaleString("ko-KR")}원/인)</span>}</> : "-"}</td>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
