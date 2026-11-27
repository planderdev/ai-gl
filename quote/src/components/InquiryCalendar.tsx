"use client";
import { useMemo } from "react";
import { CHANNEL_LABEL, mdLabel, type InquiryView } from "@/lib/inquiries/parse";
import { WEEKDAYS, dayOf, monthOf, monthWeeks, shiftMonth, weekdayOf, ymFull, type CalendarBasis } from "@/lib/inquiries/calendar";

/** 달력에서 "날짜 없이 달만 적힌 문의"를 고른 상태 */
export const NO_DAY = "nodate";

/** 둘 중 하나를 고르는 나란한 단추(목록·달력, 문의일·출발일) */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [value: T, text: string, icon?: string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-0.5">
      {options.map(([v, text, icon]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className={`inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-[13px] font-bold ${value === v ? "bg-[var(--admin-surface)] text-[var(--admin-primary)] shadow-sm" : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-strong)]"}`}>
          {icon && <i className={icon} />}{text}
        </button>
      ))}
    </div>
  );
}

type DayStat = { count: number; confirmed: number; parts: Map<string, number> };
const CELL = "flex min-h-[88px] flex-col rounded-xl p-2 text-left";

/**
 * 문의 달력. 한 달을 펼쳐 날짜마다 문의 수·출발 확정 수를 보여 주고, 날짜를 누르면 그날 문의로 좁힌다.
 * items 는 화면의 다른 조건(채널·상태·검색 등)을 이미 거친 문의다 — 달력의 달·날은 여기서 센다.
 */
export default function InquiryCalendar({ items, basis, month, day, today, onBasis, onMonth, onDay }: {
  items: InquiryView[]; basis: CalendarBasis; month: string; day: string; today: string;
  onBasis: (b: CalendarBasis) => void; onMonth: (ym: string) => void; onDay: (d: string) => void;
}) {
  const stat = useMemo(() => {
    const days = new Map<string, DayStat>(), months = new Map<string, number>();
    let total = 0, confirmed = 0, monthOnly = 0, unknown = 0;
    for (const q of items) {
      const m = monthOf(q, basis);
      if (!m) { unknown++; continue; }
      months.set(m, (months.get(m) ?? 0) + 1);
      if (m !== month) continue;
      total++; if (q.status === "confirmed") confirmed++;
      const d = dayOf(q, basis);
      if (!d) { monthOnly++; continue; }
      const cell = days.get(d) ?? { count: 0, confirmed: 0, parts: new Map<string, number>() };
      cell.count++; if (q.status === "confirmed") cell.confirmed++;
      // 칸 안의 내역: 문의일 기준이면 접수 채널, 출발일 기준이면 목적지
      for (const k of basis === "received" ? [CHANNEL_LABEL[q.channel]] : q.destinations) cell.parts.set(k, (cell.parts.get(k) ?? 0) + 1);
      days.set(d, cell);
    }
    return { days, months, total, confirmed, monthOnly, unknown };
  }, [items, basis, month]);
  const weeks = useMemo(() => monthWeeks(month), [month]);
  const max = Math.max(1, ...[...stat.days.values()].map((d) => d.count));
  const thisMonth = today.slice(0, 7);
  const monthOptions = [...new Set([...stat.months.keys(), month, thisMonth])].sort();
  const noun = basis === "received" ? "접수" : "출발";

  return (
    <section className="admin-card">
      <div className="admin-card__head flex-wrap">
        <div className="flex flex-wrap items-center gap-3">
          <h2>문의 달력</h2>
          <Segmented label="달력 기준" value={basis} onChange={onBasis} options={[["received", "문의일 기준"], ["depart", "출발일 기준"]]} />
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="admin-btn admin-btn--light admin-btn--xs" aria-label="이전 달" onClick={() => onMonth(shiftMonth(month, -1))}><i className="ri-arrow-left-s-line" /></button>
          <select value={month} onChange={(e) => onMonth(e.target.value)} aria-label="달 선택" className="!h-[30px] !text-[13px] font-bold">
            {monthOptions.map((m) => <option key={m} value={m}>{ymFull(m)}{stat.months.get(m) ? ` · ${stat.months.get(m)}건` : ""}</option>)}
          </select>
          <button type="button" className="admin-btn admin-btn--light admin-btn--xs" aria-label="다음 달" onClick={() => onMonth(shiftMonth(month, 1))}><i className="ri-arrow-right-s-line" /></button>
          <button type="button" className="admin-btn admin-btn--light admin-btn--xs" disabled={month === thisMonth} onClick={() => onMonth(thisMonth)}>이번 달</button>
        </div>
      </div>
      <div className="admin-card__body space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-[var(--admin-text-muted)]">
          <p><b className="text-[var(--admin-text-strong)]">{ymFull(month)}</b> {noun} 문의 <b className="text-[var(--admin-text-strong)]">{stat.total.toLocaleString()}</b>건 · 출발 확정 <b className="text-[var(--admin-text-strong)]">{stat.confirmed}</b>건{stat.total ? ` (${Math.round((stat.confirmed / stat.total) * 100)}%)` : ""}</p>
          <p className="text-xs text-[var(--admin-text-soft)]">{basis === "depart" ? "출발이 확정된 문의는 확정된 출발일에, 나머지는 고객이 말한 희망 출발일에 놓입니다. " : ""}날짜를 누르면 아래 목록이 그날 문의로 좁혀집니다.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[680px] grid-cols-7 gap-1.5">
            {WEEKDAYS.map((w, i) => <div key={w} className={`pb-0.5 text-center text-xs font-bold ${i === 0 ? "text-[var(--admin-danger)]" : i === 6 ? "text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]"}`}>{w}</div>)}
            {weeks.flat().map((d, i) => {
              if (!d) return <div key={`blank-${i}`} className={`${CELL} bg-[var(--admin-surface-muted)] opacity-60`} />;
              const s = stat.days.get(d), dow = i % 7;
              const numCls = d === today ? "bg-[var(--admin-primary)] text-[var(--admin-text-inverse)]" : dow === 0 ? "text-[var(--admin-danger)]" : dow === 6 ? "text-[var(--admin-primary)]" : "text-[var(--admin-text-muted)]";
              const head = (
                <span className="flex items-center justify-between">
                  <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[13px] font-bold tabular-nums ${numCls}`}>{Number(d.slice(8))}</span>
                  {s && <b className="text-[15px] tabular-nums text-[var(--admin-text-strong)]">{s.count}<span className="ml-px text-[11px] font-semibold text-[var(--admin-text-muted)]">건</span></b>}
                </span>
              );
              if (!s) return <div key={d} className={`${CELL} border border-[var(--admin-border-soft)]`}>{head}</div>;
              // 채널은 많아야 다섯 가지라 다 적고, 목적지는 많은 순으로 셋까지
              const parts = [...s.parts].sort((a, b) => b[1] - a[1]), keep = basis === "received" ? parts.length : 3;
              return (
                <button key={d} type="button" aria-pressed={day === d} onClick={() => onDay(day === d ? "" : d)}
                  title={`${mdLabel(d)}(${weekdayOf(d)}) ${noun} 문의 ${s.count}건${s.confirmed ? ` · 출발 확정 ${s.confirmed}건` : ""}`}
                  className={`${CELL} border hover:shadow-md ${day === d ? "border-[var(--admin-primary)] ring-2 ring-[var(--admin-primary)]" : "border-[var(--admin-border)]"}`}
                  style={{ background: `color-mix(in srgb, var(--admin-primary) ${Math.round(4 + 18 * (s.count / max))}%, var(--admin-surface))` }}>
                  {head}
                  {parts.length > 0 && <span className="mt-1 block text-[11px] leading-snug text-[var(--admin-text-muted)]">{parts.slice(0, keep).map(([k, c]) => `${k} ${c}`).join(" · ")}{parts.length > keep ? ` · 외 ${parts.length - keep}곳` : ""}</span>}
                  {s.confirmed > 0 && <span className="admin-chip admin-chip--success mt-1 !min-h-5 self-start !px-1.5 !text-[11px]">확정 {s.confirmed}</span>}
                </button>
              );
            })}
          </div>
        </div>
        {(stat.monthOnly > 0 || stat.unknown > 0) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--admin-text-muted)]">
            {stat.monthOnly > 0 && (
              <button type="button" aria-pressed={day === NO_DAY} onClick={() => onDay(day === NO_DAY ? "" : NO_DAY)} className={`admin-chip ${day === NO_DAY ? "" : "admin-chip--gray"}`}>
                날짜 없이 {Number(month.slice(5, 7))}월로만 적힌 문의 {stat.monthOnly}건
              </button>
            )}
            {stat.unknown > 0 && <span>{basis === "received" ? "접수일이 없는" : "출발일을 모르는"} 문의 {stat.unknown}건은 달력에 나오지 않습니다.</span>}
          </div>
        )}
      </div>
    </section>
  );
}
