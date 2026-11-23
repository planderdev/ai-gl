import { fail, handle } from "@/lib/api";
import { buildInputWorkbook } from "@/lib/excel/input-export";
import { golfCourses, hotels, vehicleRules } from "@/lib/masters/service";
import { productGroups, products, sortSheets } from "@/lib/products/service";

/**
 * 원가표 입력표(.xlsx) 내려받기.
 * - 그냥 부르면 빈 양식(참고 시트에 등록된 단가 전체)
 * - ?group=<상품군 id> 면 그 상품군의 현재 값으로 채운 양식(고쳐서 다시 올리는 용도, 참고 시트는 그 지역 단가)
 */
export const GET = handle(async (req: Request) => {
  const groupId = new URL(req.url).searchParams.get("group");
  const [h, g, v] = await Promise.all([hotels().list(), golfCourses().list(), vehicleRules().list()]);
  let name = "원가표 입력표 (빈 양식).xlsx";
  let data: Parameters<typeof buildInputWorkbook>[0] = { products: [], hotels: h, courses: g, vehicles: v };
  if (groupId) {
    const group = await productGroups().get(groupId);
    if (!group) return fail("not_found", 404);
    const children = sortSheets((await products().list()).filter((p) => p.groupId === group.id));
    const inRegion = <T extends { region: string }>(a: T[]) => a.filter((x) => x.region === group.region);
    // 다른 지역 단가를 쓰는 원가표가 있어도 빠지지 않도록, 원가표가 참조하는 것은 지역과 상관없이 넣는다
    const used = new Set(children.flatMap((p) => [p.hotelId, ...(p.stays ?? []).map((s) => s.hotelId), ...p.golfCourseIds, p.vehicleRuleId]));
    const pick = <T extends { id: string; region: string }>(a: T[]) => [...new Set([...inRegion(a), ...a.filter((x) => used.has(x.id))])];
    data = { group, products: children, hotels: pick(h), courses: pick(g), vehicles: pick(v) };
    name = `${new Date().toISOString().slice(5, 10).replace("-", "")} ${group.name} 입력표.xlsx`;
  }
  const buf = await buildInputWorkbook(data);
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}` } });
});
