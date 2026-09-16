import Link from "next/link";
import { notFound } from "next/navigation";
import CmsForm from "@/components/CmsForm";
import PageHead from "@/components/PageHead";
import { decodeId } from "@/lib/api";
import { collectionById } from "@/lib/cms/schema";
import { cmsStore } from "@/lib/cms/service";

export const dynamic = "force-dynamic";
export default async function CmsEditPage({ params, searchParams }: PageProps<"/cms/[collection]/[id]">) {
  const p = await params; const sp = await searchParams;
  const c = collectionById(decodeId(p.collection));
  if (!c) notFound();
  const id = decodeId(p.id);
  const item = id === "new" ? null : await cmsStore(c).get(id);
  if (id !== "new" && !item) notFound();
  const initial = item ?? null;
  const defaults = { ...(c.defaults ?? {}), ...(typeof sp.type === "string" ? { type: sp.type, product_type: sp.type } : {}) };
  const title = item ? String(item[c.titleField] ?? id) : `새 ${c.singular}${typeof sp.type === "string" ? ` (${sp.type === "golf_course" ? "골프장" : "패키지"})` : ""}`;
  return (
    <>
      <PageHead crumb={c.label} title={title} desc={item ? `${c.singular} #${id} 수정` : `${c.singular} 등록`} actions={<Link href={`/cms/${c.id}`} className="admin-btn admin-btn--light"><i className="ri-arrow-left-line" /> 목록</Link>} />
      <CmsForm collection={c} item={initial ?? (Object.keys(defaults).length ? { ...defaults, __new: true } : null)} key={id} />
    </>
  );
}
