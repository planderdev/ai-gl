import Link from "next/link";
import PageHead from "@/components/PageHead";
import { BOOKING_STATUS, collectionById } from "@/lib/cms/schema";
import { listItems } from "@/lib/cms/service";
import { WEEKDAYS } from "@/lib/format";
import { todayKst } from "@/lib/crawler/airseoul";

export const dynamic = "force-dynamic";
export default async function BookingCalendar({ searchParams }: PageProps<"/cms/bookings/calendar">) {
  const sp = await searchParams;
  const ym = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : todayKst().slice(0, 7);
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)); const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7), next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const c = collectionById("bookings")!;
  const items = (await listItems(c)).filter((b) => String(b.date ?? "").startsWith(ym));
  const byDay = new Map<string, typeof items>();
  for (const b of items) { const d = String(b.date); byDay.set(d, [...(byDay.get(d) ?? []), b]); }
  const cells = [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];
  const lab = (s: unknown) => BOOKING_STATUS.find(([k]) => k === String(s))?.[1] ?? String(s);
  return (
    <>
      <PageHead crumb="예약 캘린더" title={`예약 캘린더 · ${y}년 ${m}월`} desc="날짜별 예약 현황입니다. 예약을 누르면 상세로 이동합니다." stats={[{ label: "이달 예약", value: items.length }, { label: "인원", value: items.reduce((a, b) => a + (Number(b.people) || 0), 0) }, { label: "금액", value: items.reduce((a, b) => a + (Number(b.total_price) || 0), 0).toLocaleString("ko-KR") }]}
        actions={<><Link href={`/cms/bookings/calendar?month=${prev}`} className="admin-btn admin-btn--light"><i className="ri-arrow-left-s-line" /> 이전 달</Link><Link href={`/cms/bookings/calendar?month=${next}`} className="admin-btn admin-btn--light">다음 달 <i className="ri-arrow-right-s-line" /></Link><Link href="/cms/bookings/new" className="admin-btn admin-btn--primary"><i className="ri-add-line" /> 예약 등록</Link></>} />
      <section className="admin-card"><div className="admin-card__body">
        <div className="grid grid-cols-7 gap-1 text-xs">
          {WEEKDAYS.map((w, i) => <div key={w} className={`py-1 text-center font-bold ${i === 0 ? "text-[var(--admin-danger)]" : i === 6 ? "text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]"}`}>{w}</div>)}
          {cells.map((d, i) => d ? (
            <div key={d} className="min-h-24 rounded-xl border border-[var(--admin-border-soft)] p-1.5">
              <div className="mb-1 text-[11px] font-bold text-[var(--admin-text-muted)]">{Number(d.slice(8))}</div>
              {(byDay.get(d) ?? []).map((b) => <Link key={b.id} href={`/cms/bookings/${b.id}`} className={`mb-1 block truncate rounded-lg px-1.5 py-0.5 text-[11px] ${String(b.status) === "cancelled" ? "bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] line-through" : String(b.status) === "confirmed" ? "bg-[var(--admin-success-soft)] text-[var(--admin-success)]" : "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"}`} title={`${b.customer_name} · ${b.product_title} · ${lab(b.status)}`}>{String(b.customer_name)} {String(b.people)}명</Link>)}
            </div>
          ) : <div key={`e${i}`} />)}
        </div>
      </div></section>
    </>
  );
}
