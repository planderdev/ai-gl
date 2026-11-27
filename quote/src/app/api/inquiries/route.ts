import { handle, json, parseBody } from "@/lib/api";
import { createInquiry, listInquiries } from "@/lib/inquiries/service";
import { inquiryCreateSchema } from "@/lib/schemas";
import { todayKst } from "@/lib/crawler/airseoul";

/** 문의 목록(최근 접수순) / 문의 등록. 외부 자동화가 x-api-key 로 넣은 문의는 source 가 api 로 남는다 */
export const GET = handle(async () => json({ items: await listInquiries() }));
export const POST = handle(async (req: Request) => {
  const viaKey = !!(req.headers.get("x-api-key") ?? req.headers.get("authorization"));
  const r = await parseBody(req, inquiryCreateSchema);
  if ("error" in r) return r.error;
  const d = r.data;
  const item = await createInquiry({
    name: d.name, channel: d.channel, receivedDate: d.receivedDate ?? todayKst(), departText: d.departText, productText: d.productText, route: d.route, status: d.status, memo: d.memo,
    phone: d.phone ?? undefined, departDate: d.departDate || undefined, people: d.people ?? undefined, confirmText: d.confirmText ?? undefined, revisit: d.revisit ?? undefined, source: viaKey ? "api" : "manual",
  });
  return json(item, { status: 201 });
});
