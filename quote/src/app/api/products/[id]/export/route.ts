import { fail, handle, decodeId } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel/export";
import { golfCourses } from "@/lib/masters/service";
import { sheetInput } from "@/lib/products/service";

/** 원가표 .xlsx 다운로드 (상품 시트 + 골프장 요금표 시트 + 필요하면 호텔 요금표 시트) */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/products/[id]/export">) => {
  const s = await sheetInput(decodeId((await ctx.params).id));
  if (!s) return fail("not_found", 404);
  const courses = (await golfCourses().list()).filter((c) => c.region === s.product.region && !c.id.startsWith("golf-pkg-"));
  const buf = await buildWorkbook([s], courses);
  const name = `${new Date().toISOString().slice(5, 10).replace("-", "")} ${s.product.name} 원가표.xlsx`;
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
});
