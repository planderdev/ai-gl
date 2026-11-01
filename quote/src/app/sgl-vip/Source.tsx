"use client";
import { useEffect } from "react";

const KEY = "sgl-vip-source";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** 처음 들어온 페이지의 유입 경로를 기억한다. 입장 페이지 → 입력 페이지로 넘어가면 주소·referrer 가 바뀌기 때문 */
export function CaptureSource() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;
      const q = new URLSearchParams(window.location.search);
      const external = document.referrer && !document.referrer.startsWith(window.location.origin);
      sessionStorage.setItem(KEY, JSON.stringify({ ...Object.fromEntries(UTM.map((k) => [k, q.get(k) ?? ""])), referrer: external ? document.referrer : "" }));
    } catch { /* 저장소를 막은 브라우저: 유입 경로 없이 접수한다 */ }
  }, []);
  return null;
}

export function readSource(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Record<string, string>; }
  catch { return {}; }
}
