/** 사용: npx tsx scripts/export-costsheet.ts <출력.xlsx> [productId ...] — 지정 없으면 전체 상품 */
import { writeFileSync } from "node:fs";
import { buildWorkbook } from "../src/lib/excel/export";
import { quoteProduct, products } from "../src/lib/products/service";
import { golfCourses } from "../src/lib/masters/service";

async function main() {
  const [out, ...ids] = process.argv.slice(2);
  if (!out) throw new Error("출력 경로를 지정하세요");
  const all = await products().list();
  const targets = ids.length ? all.filter((p) => ids.includes(p.id)) : all;
  const sheets = [];
  for (const p of targets) {
    const q = await quoteProduct(p.id);
    if (q) sheets.push({ product: q.product, rows: q.rows, hotel: q.ctx.hotel, courses: q.ctx.courses });
  }
  const courses = (await golfCourses().list()).filter((c) => !c.id.startsWith("golf-pkg-"));
  writeFileSync(out, await buildWorkbook(sheets, courses));
  console.log(`${out} ← ${sheets.length} sheets, ${sheets.reduce((a, s) => a + s.rows.length, 0)} rows`);
}
main().catch((e) => { console.error(e); process.exit(1); });
