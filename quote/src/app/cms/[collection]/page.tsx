import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import CmsRowActions from "@/components/CmsRowActions";
import { decodeId } from "@/lib/api";
import { collectionById, type ColumnDef } from "@/lib/cms/schema";
import { listItems } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

function Cell({ col, v, statusOptions }: { col: ColumnDef; v: unknown; statusOptions?: [string, string][] }) {
  if (v == null || v === "") return <span className="text-[var(--admin-text-soft)]">-</span>;
  switch (col.type) {
    case "status": { const lab = statusOptions?.find(([k]) => k === String(v))?.[1] ?? String(v); const s = String(v); const cls = /publish|active|confirmed|published|visible|paid|^1$/.test(s) ? "admin-chip--success" : /draft|pending|scheduled|lead/.test(s) ? "admin-chip--warning" : /hidden|cancel|inactive|soldout|^0$/.test(s) ? "admin-chip--danger" : "admin-chip--gray"; return <span className={`admin-chip ${cls}`}>{lab}</span>; }
    case "money": return <span className="num">{Number(v).toLocaleString("ko-KR")}</span>;
    case "number": return <span className="num">{String(v)}</span>;
    case "boolean": return v === true || v === 1 || v === "1" ? <i className="ri-checkbox-circle-fill text-[var(--admin-success)]" /> : <i className="ri-checkbox-blank-circle-line text-[var(--admin-text-soft)]" />;
    case "date": return <span className="text-[var(--admin-text-muted)]">{String(v).slice(0, 16)}</span>;
    default: return <span>{String(v).slice(0, 80)}</span>;
  }
}

export default async function CmsListPage({ params, searchParams }: PageProps<"/cms/[collection]">) {
  const c = collectionById(decodeId((await params).collection));
  if (!c) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : ""; const status = typeof sp.status === "string" ? sp.status : "";
  const items = await listItems(c, { search: q, status });
  const all = status || q ? await listItems(c) : items;
  const stats = c.statusOptions ? c.statusOptions.map(([k, lab]) => ({ label: lab, value: all.filter((it) => String(it[c.statusField!]) === k).length })) : [];
  return (
    <>
      <PageHead crumb={c.label} title={c.label} desc={`${c.singular} ${all.length}건. 캐디스 관리자(PHP)에서 관리하던 데이터를 같은 구조로 관리합니다.`} stats={[{ label: "전체", value: all.length }, ...stats]}
        actions={<Link href={`/cms/${c.id}/new${typeof sp.type === "string" ? `?type=${sp.type}` : ""}`} className="admin-btn admin-btn--primary"><i className="ri-add-line" /> {c.singular} 등록</Link>} />
      <section className="admin-card">
        <div className="admin-card__head">
          <form className="flex flex-wrap items-center gap-2 text-sm">
            <input name="q" defaultValue={q} placeholder={`${c.searchFields.slice(0, 3).join("/")} 검색`} className="w-56" />
            {c.statusOptions && <select name="status" defaultValue={status}><option value="">상태 전체</option>{c.statusOptions.map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}</select>}
            <button className="admin-btn admin-btn--light admin-btn--xs">조회</button>
            {(q || status) && <Link href={`/cms/${c.id}`} className="text-xs text-[var(--admin-text-muted)] underline">초기화</Link>}
          </form>
          <span className="text-xs text-[var(--admin-text-muted)]">{items.length}건</span>
        </div>
        <div className="admin-card__body admin-card__body--flush overflow-x-auto">
          <table className="admin-table">
            <thead><tr>{c.columns.map((col) => <th key={col.key} className={col.type === "number" || col.type === "money" ? "num" : ""} style={col.width ? { width: col.width } : undefined}>{col.label}</th>)}<th className="num">관리</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  {c.columns.map((col, i) => (
                    <td key={col.key} className={col.type === "number" || col.type === "money" ? "num" : ""}>
                      {i === 0 ? <Link href={`/cms/${c.id}/${encodeURIComponent(it.id)}`} className="font-bold text-[var(--admin-text-strong)] hover:text-[var(--admin-primary)]">{String(it[col.key] ?? it[c.titleField] ?? it.id)}</Link> : <Cell col={col} v={it[col.key]} statusOptions={c.statusOptions} />}
                    </td>
                  ))}
                  <td className="num"><CmsRowActions collectionId={c.id} id={it.id} singular={c.singular} /></td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={c.columns.length + 1} className="py-8 text-center text-[var(--admin-text-muted)]">데이터가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
