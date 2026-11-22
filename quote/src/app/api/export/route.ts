import { handle } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel/export";
import { golfCourses } from "@/lib/masters/service";
import { productGroups, products, sheetInput, sortSheets } from "@/lib/products/service";

/** 전체 상품을 시트별로 담은 원가표 통합 파일. ?ids=a,b 로 선택 */
export const GET = handle(async (req: Request) => {
  const ids = new URL(req.url).searchParams.get("ids")?.split(",").filter(Boolean);
  // 상품군 순서대로, 그 안에서는 박수·홀수 순으로 시트를 늘어놓는다
  const order = new Map((await productGroups().list()).sort((a, b) => a.region.localeCompare(b.region, "ko") || (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.name.localeCompare(b.name, "ko")).map((g, i) => [g.id, i]));
  const all = sortSheets((await products().list()).filter((p) => !ids || ids.includes(p.id))).sort((a, b) => (order.get(a.groupId ?? "") ?? 999) - (order.get(b.groupId ?? "") ?? 999));
  const sheets = (await Promise.all(all.map((p) => sheetInput(p.id)))).filter((s): s is NonNullable<typeof s> => !!s);
  const courses = (await golfCourses().list()).filter((c) => !c.id.startsWith("golf-pkg-"));
  const buf = await buildWorkbook(sheets, courses);
  const name = `${new Date().toISOString().slice(5, 10).replace("-", "")} 골프 원가표(인디비,그룹).xlsx`;
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` } });
});
