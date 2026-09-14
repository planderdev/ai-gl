export const krw = (v: unknown, digits = 0) => (typeof v === "number" ? Math.round(v).toLocaleString("ko-KR", { maximumFractionDigits: digits }) : v == null ? "-" : String(v));
export const jpy = (v: unknown) => (typeof v === "number" ? `¥${Math.round(v).toLocaleString("ko-KR")}` : v == null ? "-" : String(v));
export const pct = (m: number) => `${Math.round(m * 100)}%`;
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
