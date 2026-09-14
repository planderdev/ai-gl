import { fail, handle, decodeId } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel/export";
import { golfCourses } from "@/lib/masters/service";
import { quoteProduct } from "@/lib/products/service";

/** 원가표 .xlsx 다운로드 (상품 시트 + 골프장 요금표 시트) */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/products/[id]/export">) => {
  const q = await quoteProduct(decodeId((await ctx.params).id));
  if (!q) return fail("not_found", 404);
  const courses = (await golfCourses().list()).filter((c) => c.region === q.product.region);
  const buf = await buildWorkbook([{ product: q.product, rows: q.rows, hotel: q.ctx.hotel, courses: q.ctx.courses }], courses);
  const name = `${new Date().toISOString().slice(5, 10).replace("-", "")} ${q.product.name} 원가표.xlsx`;
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
});
