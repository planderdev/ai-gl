import { handle } from "@/lib/api";
import { buildInquiryWorkbook } from "@/lib/inquiries/excel";
import { listInquiries } from "@/lib/inquiries/service";
import { todayKst } from "@/lib/crawler/airseoul";

/** 문의 전체를 '문의관리현황 목록' 과 같은 열 배치의 엑셀로 내려받는다 */
export const GET = handle(async () => {
  const today = todayKst();
  const buf = await buildInquiryWorkbook(await listInquiries(), today);
  const name = `${today.slice(5).replace("-", "")} 문의관리현황 목록.xlsx`;
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`, "Cache-Control": "no-store" } });
});
