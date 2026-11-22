import { handle, json, parseBody } from "@/lib/api";
import { productGroups, upsertGroup } from "@/lib/products/service";
import { productGroupSchema } from "@/lib/schemas";

/** 상품군(상위 상품) 목록 / 생성·수정(id 포함 시) */
export const GET = handle(async () => json({ items: (await productGroups().list()).sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.name.localeCompare(b.name, "ko")) }));
export const POST = handle(async (req: Request) => {
  const r = await parseBody(req, productGroupSchema);
  if ("error" in r) return r.error;
  return json(await upsertGroup(r.data), { status: 201 });
});
