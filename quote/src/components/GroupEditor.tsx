"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductGroup } from "@/types";

type Draft = { name: string; country: string; region: string; airline: string; summary: string; sortOrder: string; publicStatus: "publish" | "hidden"; publicTitle: string; publicImage: string; publicGallery: string; publicDescription: string; publicHighlights: string };
const toDraft = (g?: ProductGroup, region = ""): Draft => ({
  name: g?.name ?? "", country: g?.country ?? "일본", region: g?.region ?? region, airline: g?.airline ?? "", summary: g?.summary ?? "", sortOrder: g?.sortOrder != null ? String(g.sortOrder) : "",
  publicStatus: g?.publicStatus ?? "publish", publicTitle: g?.publicTitle ?? "", publicImage: g?.publicImage ?? "", publicGallery: (g?.publicGallery ?? []).join("\n"), publicDescription: g?.publicDescription ?? "", publicHighlights: (g?.publicHighlights ?? []).join("\n"),
});
const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

/** 상품군(상위 상품) 추가·수정. group 이 없으면 새로 만든다 */
export default function GroupEditor({ group, regions, childCount = 0 }: { group?: ProductGroup; regions: string[]; childCount?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [d, setD] = useState<Draft>(() => toDraft(group, regions[0]));
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });

  async function call(method: "POST" | "PATCH" | "DELETE") {
    setBusy(true); setErr("");
    const body = method === "DELETE" ? undefined : JSON.stringify({ name: d.name.trim(), country: d.country.trim() || "일본", region: d.region.trim(), airline: d.airline.trim() || undefined, summary: d.summary.trim() || undefined, sortOrder: d.sortOrder ? Number(d.sortOrder) : undefined,
      // 고객 사이트 항목은 비우면 기본값으로 돌아가도록 빈 값도 그대로 보낸다
      publicStatus: d.publicStatus, publicTitle: d.publicTitle.trim(), publicImage: d.publicImage.trim(), publicGallery: lines(d.publicGallery), publicDescription: d.publicDescription.trim(), publicHighlights: lines(d.publicHighlights) });
    const res = await fetch(group ? `/api/product-groups/${encodeURIComponent(group.id)}` : "/api/product-groups", { method, headers: { "Content-Type": "application/json" }, body });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); setErr(j.error === "validation_error" ? "이름과 지역을 입력하세요" : j.error ?? res.statusText); return; }
    setOpen(false);
    if (!group) setD(toDraft(undefined, regions[0]));
    router.refresh();
  }

  if (!open) return group
    ? <button type="button" className="admin-btn admin-btn--light admin-btn--xs" onClick={() => setOpen(true)}><i className="ri-pencil-line" /> 상품군 수정</button>
    : <button type="button" className="admin-btn admin-btn--light" onClick={() => setOpen(true)}><i className="ri-folder-add-line" /> 상품군 추가</button>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpen(false)}>
      <form className="card max-h-[90vh] w-full max-w-2xl space-y-3 overflow-y-auto text-left" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); call(group ? "PATCH" : "POST"); }}>
        <div className="flex items-center justify-between"><h3 className="text-base font-bold">{group ? "상품군 수정" : "상품군 추가"}</h3><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>닫기</button></div>
        <p className="text-xs text-[var(--admin-text-muted)]">상품군은 원가표 엑셀 파일 한 개에 해당합니다. 같은 지역·항공·호텔 조합의 원가표(시트)들을 묶습니다.</p>
        <label className="block text-sm"><span className="admin-label mb-1 block">상품군 이름</span><input required value={d.name} onChange={set("name")} className="w-full" placeholder="마쓰야마 3대 명문골프 (제주항공 조조)" /></label>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block text-sm"><span className="admin-label mb-1 block">국가</span><input value={d.country} onChange={set("country")} className="w-full" /></label>
          <label className="block text-sm"><span className="admin-label mb-1 block">지역</span><input required value={d.region} onChange={set("region")} list="group-regions" className="w-full" /><datalist id="group-regions">{regions.map((r) => <option key={r} value={r} />)}</datalist></label>
          <label className="block text-sm"><span className="admin-label mb-1 block">항공사 코드</span><input value={d.airline} onChange={set("airline")} className="w-full" placeholder="7C" /></label>
          <label className="block text-sm"><span className="admin-label mb-1 block">정렬 순서</span><input type="number" value={d.sortOrder} onChange={set("sortOrder")} className="w-full" /></label>
        </div>
        <label className="block text-sm"><span className="admin-label mb-1 block">한 줄 설명</span><input value={d.summary} onChange={set("summary")} className="w-full" placeholder="쥬라쿠 1박 + 넘버원 2박 · 썬셋힐 + 오쿠도고 + 에리에루" /></label>
        <fieldset className="min-w-0 space-y-3 rounded-xl border border-[var(--admin-border)] p-3">
          <legend className="admin-label px-1">고객 사이트(/sgl) 노출</legend>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.publicStatus === "publish"} onChange={(e) => setD({ ...d, publicStatus: e.target.checked ? "publish" : "hidden" })} /> <span>{d.publicStatus === "publish" ? "공개 — 출발일이 남은 원가표가 고객 사이트에 상품으로 보입니다" : "숨김 — 고객 사이트에 보이지 않습니다"}</span></label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm"><span className="admin-label mb-1 block">고객용 상품명</span><input value={d.publicTitle} onChange={set("publicTitle")} className="w-full" placeholder="비우면 상품군 이름에서 괄호를 뺀 이름" /></label>
            <label className="block text-sm"><span className="admin-label mb-1 block">대표 사진 URL</span><input value={d.publicImage} onChange={set("publicImage")} className="w-full" placeholder="비우면 기본 예시 사진" /></label>
          </div>
          <label className="block text-sm"><span className="admin-label mb-1 block">상세 소개</span><textarea rows={3} value={d.publicDescription} onChange={set("publicDescription")} className="w-full" placeholder="비우면 한 줄 설명으로 자동 작성" /></label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm"><span className="admin-label mb-1 block">핵심 포인트 <span className="admin-help">한 줄에 하나</span></span><textarea rows={3} value={d.publicHighlights} onChange={set("publicHighlights")} className="w-full" placeholder={"도고 온천 도보 5분\n3대 명문 코스 54홀"} /></label>
            <label className="block text-sm"><span className="admin-label mb-1 block">상세 사진 URL <span className="admin-help">한 줄에 하나</span></span><textarea rows={3} value={d.publicGallery} onChange={set("publicGallery")} className="w-full" placeholder="비우면 기본 예시 사진" /></label>
          </div>
          <p className="admin-help">요금은 하위 원가표의 출발일별 판매가를 그대로 씁니다(실제 판매가를 적은 날은 그 값, 아니면 마진 판매가). 기준은 설정 › 고객 사이트에서 바꿉니다.</p>
        </fieldset>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex items-center gap-2">
          <button className="btn" disabled={busy}>{group ? "저장" : "추가"}</button>
          {group && <button type="button" className="btn-ghost ml-auto" disabled={busy} onClick={() => confirm(childCount ? `상품군 '${group.name}' 을 지웁니다. 하위 원가표 ${childCount}개는 지워지지 않고 미분류로 이동합니다.` : `상품군 '${group.name}' 을 지울까요?`) && call("DELETE")}>상품군 삭제</button>}
        </div>
      </form>
    </div>
  );
}
