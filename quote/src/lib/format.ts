export const krw = (v: unknown, digits = 0) => (typeof v === "number" ? Math.round(v).toLocaleString("ko-KR", { maximumFractionDigits: digits }) : v == null ? "-" : String(v));
export const jpy = (v: unknown) => (typeof v === "number" ? `¥${Math.round(v).toLocaleString("ko-KR")}` : v == null ? "-" : String(v));
export const pct = (m: number) => `${Math.round(m * 100)}%`;
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const AIRLINES: Record<string, string> = { RS: "에어서울", "7C": "제주항공", LJ: "진에어", TI: "타이거에어", TW: "티웨이항공", KE: "대한항공", OZ: "아시아나항공", BX: "에어부산", ZE: "이스타항공" };
export const airlineName = (code: string) => AIRLINES[code?.toUpperCase()] ?? code;
