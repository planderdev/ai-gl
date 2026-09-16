"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CmsRowActions({ collectionId, id, singular }: { collectionId: string; id: string; singular: string }) {
  const router = useRouter();
  return (
    <span className="inline-flex gap-1">
      <Link href={`/cms/${collectionId}/${encodeURIComponent(id)}`} className="admin-btn admin-btn--light admin-btn--xs">수정</Link>
      <button className="admin-btn admin-btn--light admin-btn--xs text-[var(--admin-danger)]" onClick={async () => { if (!confirm(`${singular} #${id} 삭제?`)) return; await fetch(`/api/cms/${collectionId}/${encodeURIComponent(id)}`, { method: "DELETE" }); router.refresh(); }}>삭제</button>
    </span>
  );
}
