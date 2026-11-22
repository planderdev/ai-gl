import { fail, handle, decodeId } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel/export";
import { golfCourses } from "@/lib/masters/service";
import { productGroups, products, sheetInput, sortSheets } from "@/lib/products/service";

/** 상품군 한 개 = 엑셀 파일 한 개: 하위 원가표 시트들 + 지역 골프장 요금표 + 호텔 요금표 */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/product-groups/[id]/export">) => {
  const group = await productGroups().get(decodeId((await ctx.params).id));
  if (!group) return fail("not_found", 404);
  const children = sortSheets((await products().list()).filter((p) => p.groupId === group.id));
  if (!children.length) return fail("이 상품군에 원가표가 없습니다", 404);
  const sheets = (await Promise.all(children.map((p) => sheetInput(p.id)))).filter((s): s is NonNullable<typeof s> => !!s);
  const courses = (await golfCourses().list()).filter((c) => c.region === group.region && !c.id.startsWith("golf-pkg-"));
  const buf = await buildWorkbook(sheets, courses);
  const name = `${new Date().toISOString().slice(5, 10).replace("-", "")} ${group.name} 원가표.xlsx`;
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` } });
});
