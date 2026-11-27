import { fail, handle, json } from "@/lib/api";
import { readInquiryWorkbook } from "@/lib/inquiries/excel";
import { mergeInquiries } from "@/lib/inquiries/service";
import { todayKst } from "@/lib/crawler/airseoul";

/**
 * POST multipart/form-data { file: .xlsx, overwrite? } — '문의관리현황 목록' 엑셀을 문의로 가져온다.
 * 이름·채널·접수일이 같은 문의는 이미 있는 것으로 보고 건너뛴다. overwrite=1 이면 엑셀 내용으로 고친다.
 */
export const POST = handle(async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("file 필드(.xlsx)가 필요합니다");
  let read: Awaited<ReturnType<typeof readInquiryWorkbook>>;
  try { read = await readInquiryWorkbook(Buffer.from(await file.arrayBuffer()), todayKst()); }
  catch (e) { return fail(e instanceof Error ? e.message : "엑셀을 읽지 못했습니다", 422); }
  const sum = await mergeInquiries(read.rows, !!form.get("overwrite"));
  return json({ ok: true, ...sum, log: [...read.log, `새로 넣은 문의 ${sum.added}건 · 엑셀 내용으로 고친 문의 ${sum.updated}건 · 이미 있어 건너뛴 문의 ${sum.skipped}건`] });
});
