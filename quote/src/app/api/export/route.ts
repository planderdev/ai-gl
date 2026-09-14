import { handle } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel/export";
import { golfCourses } from "@/lib/masters/service";
import { products, quoteProduct } from "@/lib/products/service";

/** 전체 상품을 시트별로 담은 원가표 통합 파일. ?ids=a,b 로 선택 */
export const GET = handle(async (req: Request) => {
  const ids = new URL(req.url).searchParams.get("ids")?.split(",").filter(Boolean);
  const all = (await products().list()).filter((p) => !ids || ids.includes(p.id));
  const sheets = [];
  for (const p of all) {
    const q = await quoteProduct(p.id);
    if (q) sheets.push({ product: q.product, rows: q.rows, hotel: q.ctx.hotel, courses: q.ctx.courses });
  }
  const courses = (await golfCourses().list()).filter((c) => !c.id.startsWith("golf-pkg-"));
  const buf = await buildWorkbook(sheets, courses);
  const name = `${new Date().toISOString().slice(5, 10).replace("-", "")} 골프 원가표(인디비,그룹).xlsx`;
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` } });
});
