import ExcelJS from "exceljs";
import { decodeId, fail, handle } from "@/lib/api";
import { collectionById, type CollectionDef, type ColumnDef } from "@/lib/cms/schema";
import { listItems } from "@/lib/cms/service";

function cell(c: CollectionDef, col: ColumnDef, v: unknown) {
  if (Array.isArray(v)) return v.join(", ");
  if (col.type === "boolean") return v ? "예" : "";
  if (col.type === "status") return c.statusOptions?.find(([k]) => k === String(v))?.[1] ?? String(v ?? "");
  return v == null ? "" : String(v);
}

/** 목록 컬럼 그대로 엑셀로 내려받기(CollectionDef.exportable 인 컬렉션만). /api/cms 아래라 로그인 세션이 필요하다 */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/cms/[collection]/export">) => {
  const c = collectionById(decodeId((await ctx.params).collection));
  if (!c?.exportable) return fail("not_found", 404);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(c.label);
  ws.columns = c.columns.map((col) => ({ header: col.label, key: col.key, width: 20 }));
  ws.getRow(1).font = { bold: true };
  for (const it of await listItems(c)) ws.addRow(Object.fromEntries(c.columns.map((col) => [col.key, cell(c, col, it[col.key])])));
  const filename = encodeURIComponent(`${c.label}_${new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)}.xlsx`);
  return new Response(await wb.xlsx.writeBuffer(), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${filename}` } });
});
