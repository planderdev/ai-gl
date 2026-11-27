import InquiryBoard from "@/components/InquiryBoard";
import PageHead from "@/components/PageHead";
import { listInquiries } from "@/lib/inquiries/service";
import { viewOf } from "@/lib/inquiries/parse";
import { todayKst } from "@/lib/crawler/airseoul";

export const dynamic = "force-dynamic";

/** 문의관리: 인스타·카카오 채널·직판·홈페이지로 들어온 문의를 한곳에서 본다 */
export default async function InquiriesPage() {
  const today = todayKst();
  const items = (await listInquiries()).map((q) => viewOf(q, today));
  const month = today.slice(0, 7);
  const confirmed = items.filter((q) => q.status === "confirmed").length;
  return (
    <>
      <PageHead
        crumb="문의관리"
        title="문의관리"
        desc="인스타(플러그인)·카카오 채널·직판·홈페이지로 들어온 문의와 상담 경과를 한곳에서 관리합니다. 요약 표의 줄을 누르면 그 조건으로 좁혀지고, 상태는 목록에서 바로 바꿀 수 있습니다."
        stats={[
          { label: "전체 문의", value: items.length.toLocaleString() },
          { label: "이번 달 접수", value: items.filter((q) => q.receivedDate.startsWith(month)).length.toLocaleString() },
          { label: "신규 · 상담중", value: items.filter((q) => q.status === "new" || q.status === "in_progress").length.toLocaleString() },
          { label: "출발 확정", value: confirmed.toLocaleString() },
          { label: "확정률", value: items.length ? `${((confirmed / items.length) * 100).toFixed(1)}%` : "-" },
        ]}
      />
      <InquiryBoard items={items} today={today} />
    </>
  );
}
