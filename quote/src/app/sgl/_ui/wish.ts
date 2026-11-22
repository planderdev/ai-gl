"use client";
import { useSyncExternalStore } from "react";

/** 찜 목록(브라우저에만 저장). 카드와 상세의 하트가 같은 값을 본다 */
const KEY = "sgl-wish";
const listeners = new Set<() => void>();
let memory: string | null = null; // 저장소를 쓸 수 없는 환경(사생활 보호 모드)에서는 화면에서만 유지
const snapshot = () => { if (memory != null) return memory; try { return window.localStorage.getItem(KEY) ?? "[]"; } catch { return "[]"; } };
const subscribe = (fn: () => void) => { listeners.add(fn); window.addEventListener("storage", fn); return () => { listeners.delete(fn); window.removeEventListener("storage", fn); }; };
const parse = (raw: string): string[] => { try { const v: unknown = JSON.parse(raw); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; } catch { return []; } };

export function useWish(id: string): [boolean, () => void] {
  const ids = parse(useSyncExternalStore(subscribe, snapshot, () => "[]"));
  const liked = ids.includes(id);
  const toggle = () => {
    const next = JSON.stringify(liked ? ids.filter((x) => x !== id) : [...ids, id]);
    try { window.localStorage.setItem(KEY, next); memory = null; } catch { memory = next; }
    listeners.forEach((fn) => fn());
  };
  return [liked, toggle];
}
