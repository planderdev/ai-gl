"use client";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { dDayLabel, dDayOf } from "@/lib/sgl-vip/config";

let tick = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => { tick = Date.now(); listeners.forEach((l) => l()); }, 1000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { clearInterval(timer); timer = undefined; }
  };
}
/** 1초마다 갱신되는 현재 시각. 서버 렌더·하이드레이션 중에는 null → 캐시된 HTML 과 어긋나지 않는다 */
const useNow = () => useSyncExternalStore(subscribe, () => (tick ||= Date.now()), () => null);

export function DdayText({ initial }: { initial: string }) {
  const now = useNow();
  return <>{now == null ? initial : dDayLabel(dDayOf(now))}</>;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 다음 혜택 공개까지 남은 시간. 0 이 되면 새 혜택이 반영될 때까지 페이지 데이터를 다시 받는다(캐시 최대 1분) */
export function RevealCountdown({ target }: { target: number }) {
  const router = useRouter();
  const now = useNow();
  const left = now == null ? null : Math.max(0, Math.floor((target - now) / 1000));
  const expired = left === 0;
  useEffect(() => {
    if (!expired) return;
    let tries = 0;
    const id = setInterval(() => { router.refresh(); if (++tries >= 6) clearInterval(id); }, 20_000);
    return () => clearInterval(id);
  }, [expired, router]);
  if (expired) return <p className="vip-count__soon">새 혜택을 공개하고 있어요. 잠시만 기다려 주세요.</p>;
  const cells: [string, number | null][] = [
    ["일", left == null ? null : Math.floor(left / 86400)],
    ["시간", left == null ? null : Math.floor((left % 86400) / 3600)],
    ["분", left == null ? null : Math.floor((left % 3600) / 60)],
    ["초", left == null ? null : left % 60],
  ];
  return (
    <div className="vip-count" role="timer">
      {cells.map(([label, v]) => <div key={label} className="vip-count__cell"><b>{v == null ? "--" : pad(v)}</b><span>{label}</span></div>)}
    </div>
  );
}
