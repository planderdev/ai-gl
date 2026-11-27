import type { InquiryView } from "./parse";

/**
 * 문의 달력에서 쓰는 순수 함수들. 문의 한 건이 달력의 어느 날·어느 달에 놓이는지와 달력 칸을 만든다.
 * 기준은 둘: 문의일(접수일) · 출발일.
 */
export type CalendarBasis = "received" | "depart";
export const BASIS_LABEL: Record<CalendarBasis, string> = { received: "문의일", depart: "출발일" };

type Trip = Pick<InquiryView, "status" | "confirmDate" | "departIso" | "departMonth">;
/** 출발일: 출발이 확정된 문의는 확정 문구의 날짜(실제 출발일), 아니면 고객이 말한 희망 날짜. 일까지 모르면 "" */
export const tripDateOf = (q: Trip): string => (q.status === "confirmed" && q.confirmDate) || q.departIso;
/** 출발 달: 날짜를 알면 그 달, "10월하순"처럼 달만 적힌 문의는 그 달, 모르면 "" */
export const tripMonthOf = (q: Trip): string => tripDateOf(q).slice(0, 7) || q.departMonth;

/** 기준에 따라 문의가 놓이는 날(YYYY-MM-DD, 모르면 "") */
export const dayOf = (q: Trip & Pick<InquiryView, "receivedDate">, basis: CalendarBasis): string => (basis === "received" ? q.receivedDate : tripDateOf(q));
/** 기준에 따라 문의가 놓이는 달(YYYY-MM, 모르면 "") */
export const monthOf = (q: Trip & Pick<InquiryView, "receivedDate">, basis: CalendarBasis): string => (basis === "received" ? q.receivedDate.slice(0, 7) : tripMonthOf(q));

const pad = (n: number) => String(n).padStart(2, "0");
export const isMonth = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
/** YYYY-MM → "2026년 11월" */
export const ymFull = (ym: string) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`;

/** YYYY-MM 을 n 달 옮긴다(해를 넘긴다) */
export function shiftMonth(ym: string, n: number): string {
  const t = new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1 + n, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`;
}

/** 그 달의 달력 칸. 일요일부터 시작하는 주 단위이고, 그 달이 아닌 칸은 "" */
export function monthWeeks(ym: string): string[][] {
  const y = Number(ym.slice(0, 4)), m = Number(ym.slice(5, 7));
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(), days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: string[] = [...Array<string>(lead).fill(""), ...Array.from({ length: days }, (_, i) => `${ym}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push("");
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
/** YYYY-MM-DD → "일"~"토" */
export const weekdayOf = (iso: string) => WEEKDAYS[new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))).getUTCDay()];
export { WEEKDAYS };
