import { handle, json } from "@/lib/api";
import { autoGroup } from "@/lib/products/service";

/** 미분류 원가표를 지역·호텔·항공편 기준으로 상품군에 묶는다 */
export const POST = handle(async () => {
  const r = await autoGroup();
  return json({ ok: true, created: r.groups.map((g) => ({ id: g.id, name: g.name })), assigned: r.assigned });
});
