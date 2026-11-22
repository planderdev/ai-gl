import Link from "next/link";
import { GolfEditor, HotelEditor, SettingsEditor, VehicleEditor } from "@/components/MasterEditors";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";

export const dynamic = "force-dynamic";
/** 지역별 단가(호텔·골프장·차량). ?region= 으로 한 지역만 본다 */
export default async function MastersPage({ searchParams }: PageProps<"/masters">) {
  const sp = await searchParams;
  const region = typeof sp?.region === "string" ? sp.region : "";
  const [h, g, v, s] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings()]);
  const regions = [...new Set([...h, ...g, ...v].map((x) => x.region))].sort((a, b) => a.localeCompare(b, "ko"));
  const pick = <T extends { name: string; region: string }>(a: T[]) => a.filter((x) => !region || x.region === region).sort((x, y) => x.region.localeCompare(y.region, "ko") || x.name.localeCompare(y.name, "ko"));
  const fh = pick(h), fg = pick(g), fv = pick(v);
  return (
    <>
      <PageHead crumb={region ? `상품관리 › ${region} › 단가` : "상품관리 › 단가"} title={region ? `${region} 단가` : "호텔 · 골프장 · 차량 단가"} desc="원가 계산에 쓰는 지역별 기준값입니다. 호텔 1박 단가(일자별 요금 → 요일 단가), 골프장 기간·스타일별 평일/주말/연휴 그린피, 출발 요일별 차량+지원비, 환율·마진·일본 공휴일. 여기서 고치면 이 단가를 쓰는 모든 원가표에 반영됩니다." stats={[{ label: "호텔", value: fh.length }, { label: "골프장", value: fg.length }, { label: "차량 규칙", value: fv.length }, { label: "기본 환율", value: s.exchangeRate }]} />
      <nav className="flex flex-wrap items-center gap-1.5 text-sm" aria-label="지역">
        <span className="mr-1 font-bold text-[var(--admin-text-muted)]"><i className="ri-map-pin-2-fill text-[var(--admin-primary)]" /> 지역</span>
        {["", ...regions].map((r) => (
          <Link key={r || "all"} href={r ? `/masters?region=${encodeURIComponent(r)}` : "/masters"} className={`rounded-xl border px-3 py-1.5 font-semibold ${r === region ? "border-[var(--admin-primary)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]" : "border-[var(--admin-border)] bg-white text-[var(--admin-text-muted)] hover:border-[var(--admin-border-strong)]"}`}>{r || "전체"}</Link>
        ))}
      </nav>
      <div id="hotels" key={`h-${region}`}><HotelEditor items={fh} region={region || undefined} /></div>
      <div id="golf" key={`g-${region}`}><GolfEditor items={fg} region={region || undefined} /></div>
      <div id="vehicles" key={`v-${region}`}><VehicleEditor items={fv} region={region || undefined} /></div>
      <div id="settings"><SettingsEditor settings={s} /></div>
    </>
  );
}
