"use client";
import { useState } from "react";
import { manwon } from "@/lib/sgl/config";

const WD = ["월", "화", "수", "목", "금", "토", "일"];
const pad = (n: number) => String(n).padStart(2, "0");
const shift = (ym: string, n: number) => { const [y, m] = ym.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`; };

export interface DayInfo { price?: number | null; disabled?: boolean; mark?: boolean; low?: boolean }

/**
 * 월 달력(월요일 시작). from~to 를 주면 양 끝은 검은 칸, 사이는 살구색 띠로 칠한다.
 * day 가 날짜별 정보를 돌려주면 가격·출발 가능 표시를 그린다.
 */
export default function Calendar({ start, min, max, from, to, onPick, day, priced, foot }: {
  start: string; min: string; max?: string; from?: string; to?: string;
  onPick: (date: string) => void; day?: (date: string) => DayInfo | undefined; priced?: boolean; foot?: string;
}) {
  const [ym, setYm] = useState(start.slice(0, 7));
  const [y, m] = ym.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${pad(i + 1)}`)];
  return (
    <div className={`sgl-cal ${priced ? "sgl-cal--price" : ""}`}>
      <div className="sgl-cal__head">
        <button type="button" className="sgl-cal__nav" aria-label="이전 달" disabled={ym <= min.slice(0, 7)} onClick={() => setYm(shift(ym, -1))}>‹</button>
        <span aria-live="polite">{y}년 {m}월</span>
        <button type="button" className="sgl-cal__nav" aria-label="다음 달" disabled={!!max && ym >= max.slice(0, 7)} onClick={() => setYm(shift(ym, 1))}>›</button>
      </div>
      <div className="sgl-cal__grid">
        {WD.map((w) => <span key={w} className="sgl-cal__wd">{w}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const info = day?.(d);
          const end = d === from || d === to;
          const between = !!from && !!to && d > from && d < to;
          const disabled = d < min || (!!max && d > max) || !!info?.disabled;
          return (
            <button key={d} type="button" disabled={disabled} aria-pressed={end} aria-label={`${m}월 ${Number(d.slice(8))}일${info?.price ? ` ${manwon(info.price)}원` : ""}`}
              className={`sgl-day ${end ? "is-end" : ""} ${between ? "is-between" : ""} ${info?.mark && !priced ? "has-dep" : ""} ${info?.low ? "is-low" : ""}`} onClick={() => onPick(d)}>
              <span>{Number(d.slice(8))}</span>
              {priced && <span className="sgl-day__price">{info?.price ? manwon(info.price) : info?.mark ? "문의" : ""}</span>}
            </button>
          );
        })}
      </div>
      {foot && <p className="sgl-cal__foot">{!priced && <i />}{foot}</p>}
    </div>
  );
}
