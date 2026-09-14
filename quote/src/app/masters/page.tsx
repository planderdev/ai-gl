import { GolfEditor, HotelEditor, SettingsEditor, VehicleEditor } from "@/components/MasterEditors";
import PageHead from "@/components/PageHead";
import { getSettings, golfCourses, hotels, vehicleRules } from "@/lib/masters/service";

export const dynamic = "force-dynamic";
export default async function MastersPage() {
  const [h, g, v, s] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list(), getSettings()]);
  const sort = <T extends { name: string }>(a: T[]) => [...a].sort((x, y) => x.name.localeCompare(y.name, "ko"));
  return (
    <>
      <PageHead crumb="마스터 데이터" title="마스터 데이터" desc="원가 계산에 쓰는 기준값입니다. 호텔 요일별 1박 단가, 골프장 평일/주말/연휴 그린피, 출발 요일별 차량+지원비, 환율·마진·일본 공휴일." stats={[{ label: "호텔", value: h.length }, { label: "골프장", value: g.length }, { label: "차량 규칙", value: v.length }, { label: "기본 환율", value: s.exchangeRate }]} />
      <div id="hotels"><HotelEditor items={sort(h)} /></div>
      <div id="golf"><GolfEditor items={sort(g)} /></div>
      <div id="vehicles"><VehicleEditor items={sort(v)} /></div>
      <div id="settings"><SettingsEditor settings={s} /></div>
    </>
  );
}
