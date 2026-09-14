import type { DayType, Weekday } from "@/types";

export const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** YYYY-MM-DD → 로컬 타임존 무관 UTC 자정 Date */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return formatDate(d);
}
export function weekdayOf(s: string): Weekday {
  return parseDate(s).getUTCDay() as Weekday;
}
export function weekdayLabel(s: string): string {
  return WEEKDAY_KO[weekdayOf(s)];
}
export function monthKey(s: string): string {
  return s.slice(0, 7);
}
export function* eachDate(from: string, to: string): Generator<string> {
  let cur = from;
  while (cur <= to) {
    yield cur;
    cur = addDays(cur, 1);
  }
}
export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}
export function dayTypeOf(date: string, holidays: Set<string>): DayType {
  if (holidays.has(date)) return "holiday";
  const w = weekdayOf(date);
  return w === 0 || w === 6 ? "weekend" : "weekday";
}
/** 엑셀 표기용 m/d */
export function shortDate(s: string): string {
  const [, m, d] = s.split("-");
  return `${Number(m)}/${Number(d)}`;
}
