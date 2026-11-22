"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { sized, type SglConfig } from "@/lib/sgl/config";
import { Icon } from "./icons";

/* ---------- 커서: 포인터를 따라다니는 회색 원 ---------- */
const CLICKABLE = "a, button, [role='button'], label, summary, select, input[type='checkbox'], input[type='radio'], .sgl-card";
function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const root = el?.closest(".sgl");
    if (!el || !root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    root.classList.add("has-cursor");
    el.classList.toggle("is-rec", new URLSearchParams(window.location.search).has("rec"));
    const move = (e: PointerEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      el.classList.add("is-on");
      const t = e.target instanceof Element ? e.target : null;
      el.classList.toggle("is-hover", !!t?.closest(CLICKABLE));
      el.classList.toggle("is-text", !!t?.closest("input:not([type='checkbox']):not([type='radio']), textarea"));
    };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => el.classList.remove("is-on");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="sgl-cursor" aria-hidden />;
}

/* ---------- 공유 요소 비행: 카드 사진이 상세의 큰 사진 자리로 날아간다 ---------- */
type Rect = { left: number; top: number; width: number; height: number };
interface Flight { start: (el: Element, src: string, href: string) => void; land: (src: string, target: HTMLElement) => boolean }
const FlightContext = createContext<Flight>({ start: () => {}, land: () => false });
export const useFlight = () => useContext(FlightContext);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const FLIGHT_MS = 900;

function FlightProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const layer = useRef<HTMLDivElement>(null);
  const pending = useRef<{ src: string; from: Rect; timer: number } | null>(null);

  const clear = useCallback(() => {
    if (pending.current) window.clearTimeout(pending.current.timer);
    pending.current = null;
    if (layer.current) layer.current.style.display = "none";
  }, []);

  const start = useCallback((el: Element, src: string, href: string) => {
    const node = layer.current;
    if (node && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = el.getBoundingClientRect();
      const from = { left: r.left, top: r.top, width: r.width, height: r.height };
      Object.assign(node.style, { display: "block", left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: "12px", backgroundImage: `url("${sized(src, 700)}")`, opacity: "1" });
      clear();
      node.style.display = "block";
      pending.current = { src, from, timer: window.setTimeout(clear, 6000) }; // 상세가 끝내 뜨지 않으면 치운다
    }
    router.push(href);
  }, [clear, router]);

  const land = useCallback((src: string, target: HTMLElement) => {
    const p = pending.current, node = layer.current;
    if (!p || !node) return false; // 날아오는 사진이 없거나 이미 내려앉는 중(개발 모드는 효과를 두 번 실행한다)
    if (p.src !== src) { clear(); return false; }
    window.clearTimeout(p.timer);
    pending.current = null;
    target.classList.add("is-flying");
    const begin = () => {
      const r = target.getBoundingClientRect();
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / FLIGHT_MS), e = easeInOutCubic(t);
        const lerp = (a: number, b: number) => a + (b - a) * e;
        Object.assign(node.style, { left: `${lerp(p.from.left, r.left)}px`, top: `${lerp(p.from.top, r.top)}px`, width: `${lerp(p.from.width, r.width)}px`, height: `${lerp(p.from.height, r.height)}px`, borderRadius: `${lerp(12, 10)}px` });
        if (t < 1) requestAnimationFrame(step);
        else { target.classList.remove("is-flying"); node.style.display = "none"; }
      };
      requestAnimationFrame(step);
    };
    // 새 화면이 맨 위로 스크롤된 뒤의 위치를 재려고 두 프레임 기다린다
    requestAnimationFrame(() => requestAnimationFrame(begin));
    return true;
  }, [clear]);

  return (
    <FlightContext.Provider value={{ start, land }}>
      {children}
      <div ref={layer} className="sgl-flight" style={{ display: "none" }} aria-hidden />
    </FlightContext.Provider>
  );
}

/* ---------- 내비게이션 ---------- */
function Nav({ config }: { config: SglConfig }) {
  const path = usePathname();
  const onHero = path === "/sgl";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.3);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !menu.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <header className={`sgl-nav ${!onHero || scrolled ? "is-solid" : ""}`}>
      <div className="sgl-nav__left">
        <Link href="/sgl" className="sgl-logo" aria-label={`${config.brand} 홈`}><b>{config.brand}</b> Golf Travel</Link>
        <span className="sgl-nav__divider" aria-hidden />
        <span className="sgl-nav__tag">일본 골프여행 <Icon name="chevron" size={12} /></span>
      </div>
      <nav className="sgl-nav__links" aria-label="주요 메뉴">
        <Link href="/sgl#stays">골프여행 상품</Link>
        <Link href="/sgl#how">이용 방법</Link>
        <Link href="/sgl/consult">상담 문의</Link>
      </nav>
      <div className="sgl-nav__right">
        <Link href="/sgl/lookup" className="sgl-nav__host">예약 조회</Link>
        <a href={`tel:${config.tel}`} className="sgl-nav__icon" aria-label={`고객센터 ${config.tel}`}><Icon name="globe" size={21} stroke={1.3} /></a>
        <div className="sgl-nav__menu" ref={menu}>
          <button type="button" className="sgl-nav__pill" aria-expanded={open} aria-label="메뉴" onClick={() => setOpen(!open)}>
            <Icon name="menu" size={17} />
            <span className="sgl-nav__user"><Icon name="user" size={14} stroke={1.8} /></span>
          </button>
          {open && (
            <div className="sgl-menu" onClick={() => setOpen(false)}>
              <Link href="/sgl#stays"><Icon name="flag" /> 골프여행 상품</Link>
              <Link href="/sgl/consult"><Icon name="chat" /> 상담 문의</Link>
              <Link href="/sgl/lookup"><Icon name="search" /> 예약 조회 · 결제</Link>
              <hr />
              <a href={`tel:${config.tel}`}><Icon name="phone" /> {config.tel}</a>
              {config.kakaoUrl && <a href={config.kakaoUrl} target="_blank" rel="noreferrer"><Icon name="chat" /> 카카오톡 상담</a>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Chrome({ config, children }: { config: SglConfig; children: ReactNode }) {
  return (
    <FlightProvider>
      <Nav config={config} />
      {children}
      <Cursor />
    </FlightProvider>
  );
}

/** 상세의 큰 사진. 카드에서 날아온 사진이 내려앉은 뒤 선명한 사진으로 바뀐다 */
export function LandingPhoto({ src, children }: { src: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { land } = useFlight();
  useLayoutEffect(() => { if (ref.current) land(src, ref.current); }, [land, src]);
  return (
    <div ref={ref} className="sgl-main-photo">
      <i style={{ backgroundImage: `url("${sized(src, 700)}")` }} />
      <i style={{ backgroundImage: `url("${sized(src, 1400)}")` }} />
      {children}
    </div>
  );
}
