"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { addDaysIso, CLOUD_IMAGE, dateShort, diffDays, sized, type HeroSlide, type PublicPackage } from "@/lib/sgl/config";
import Calendar from "./Calendar";
import { Icon } from "./icons";
import PackageCard, { type CardPick } from "./PackageCard";

const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const WIPE_MS = 1250;
const AUTO_MS = 5200;

/* ---------- 히어로: 슬라이드 3장 · 구름 · 오른쪽 레일 ---------- */
function Hero({ slides, children }: { slides: HeroSlide[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState(0);
  const go = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const top = root.current;
    const hero = top?.querySelector<HTMLElement>(".sgl-hero");
    if (!top || !hero) return;
    const $ = <T extends HTMLElement>(sel: string) => hero.querySelector<T>(sel)!;
    const all = <T extends HTMLElement>(sel: string) => [...hero.querySelectorAll<T>(sel)];
    const stack = $(".sgl-hero__stack"), mist = $(".sgl-mist"), clouds = $(".sgl-clouds"), cloudsTop = $(".sgl-clouds-top"), rail = $(".sgl-rail"), conn = $(".sgl-conn"), capEl = $(".sgl-cap");
    const slideEls = all(".sgl-slide"), photos = all(".sgl-slide__photo"), thumbs = all(".sgl-thumb"), rings = all(".sgl-ring");
    const n = slideEls.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0, previous = -1, wiping = false, t0 = 0, settledAt = performance.now();
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0, visible = true, alive = true;
    const timers: number[] = [];
    let autoTimer = 0, capTimer = 0;

    const setMask = (el: HTMLElement, v: string) => { el.style.setProperty("-webkit-mask-image", v); el.style.setProperty("mask-image", v); };
    const place = (el: HTMLElement, left: number, topPx: number, w: number, h: number) => Object.assign(el.style, { left: `${left}px`, top: `${topPx}px`, width: `${w}px`, height: `${h}px` });

    /** 켜진 썸네일은 제자리에서 커지고 나머지는 줄어든다. 동심원·연결선·설명은 켜진 썸네일을 따라간다 */
    function layout(animate: boolean) {
      const W = hero!.clientWidth, H = hero!.clientHeight;
      const A = clamp(96, W * 0.113, 190), I = clamp(46, W * 0.054, 92), gap = Math.max(8, W * 0.009);
      const cx = W * 0.855;
      let y = 74 + H * 0.085, cy = y;
      if (!animate) rail.classList.add("no-anim");
      for (let v = 0; v < n; v++) {
        const i = n - 1 - v, size = i === current ? A : I; // 위에서부터 3 → 2 → 1번 슬라이드
        place(thumbs[i], cx - size / 2, y, size, size);
        thumbs[i].classList.toggle("is-active", i === current);
        thumbs[i].setAttribute("aria-pressed", String(i === current));
        if (i === current) cy = y + size / 2;
        y += size + gap;
      }
      [W * 0.05, W * 0.108].forEach((extra, k) => { const r = A / 2 + extra; place(rings[k], cx - r, cy - r, r * 2, r * 2); });
      const connW = Math.max(40, W * 0.047), connLeft = cx - A / 2 - W * 0.008 - connW;
      Object.assign(conn.style, { left: `${connLeft}px`, top: `${cy - 1.5}px`, width: `${connW}px` });
      Object.assign(capEl.style, { right: `${W - connLeft + 16}px`, top: `${cy}px` });
      if (!animate) { void rail.offsetWidth; rail.classList.remove("no-anim"); }
    }

    function finish() {
      wiping = false;
      settledAt = performance.now();
      setMask(slideEls[current], "");
      if (previous >= 0) { slideEls[previous].classList.remove("is-prev"); photos[previous].style.transform = ""; }
      previous = -1;
      mist.style.opacity = "0";
    }

    function schedule() {
      window.clearTimeout(autoTimer);
      if (reduce) return;
      autoTimer = window.setTimeout(() => { if (document.hidden || !visible || window.scrollY > hero!.offsetHeight * 0.6) schedule(); else change((current + 1) % n); }, AUTO_MS);
    }

    function change(i: number) {
      if (i === current || wiping) return;
      if (previous >= 0) slideEls[previous].classList.remove("is-prev");
      previous = current;
      current = i;
      slideEls.forEach((el, k) => { el.classList.toggle("is-cur", k === current); el.classList.toggle("is-prev", k === previous); });
      rail.classList.remove("show-cap");
      layout(true);
      window.clearTimeout(capTimer);
      capTimer = window.setTimeout(() => { setCap(i); rail.classList.add("show-cap"); }, 650);
      if (reduce) finish(); else { wiping = true; t0 = performance.now(); setMask(slideEls[current], "linear-gradient(to left, transparent, transparent)"); }
      schedule();
    }
    go.current = change;

    function tick(now: number) {
      if (!alive) return;
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      if (wiping) {
        const t = Math.min(1, (now - t0) / WIPE_MS), e = easeInOutCubic(t);
        const a = e * 135 - 35, b = e * 135; // 오른쪽 끝에서 a% 까지 불투명, b% 에서 투명
        setMask(slideEls[current], `linear-gradient(to left, #000 ${a}%, rgba(0,0,0,.6) ${(a + b) / 2}%, transparent ${b}%)`);
        photos[current].style.transform = `translate3d(${(1 - e) * 2 + px * 0.6 * e}%, ${py * 0.5 * e}%, 0) scale(${1.12 - 0.08 * e})`;
        if (previous >= 0) photos[previous].style.transform = `translate3d(${-2 * e}%, 0, 0) scale(${1.04 + 0.05 * e})`;
        const W = hero!.clientWidth, band = mist.offsetWidth;
        mist.style.opacity = String(Math.sin(Math.PI * t) * 0.95);
        mist.style.transform = `translate3d(${W * (1 - (e * 135 - 17.5) / 100) - band / 2}px, 0, 0)`;
        if (t >= 1) finish();
      } else if (visible && !reduce) {
        const k = Math.min(12, (now - settledAt) / 1000); // 와이프가 끝나면 아주 느린 켄 번스
        photos[current].style.transform = `translate3d(${px * 0.6}%, ${py * 0.5}%, 0) scale(${1.04 + 0.0035 * k})`;
      }
      raf = requestAnimationFrame(tick);
    }

    function onScroll() {
      const sy = window.scrollY, vh = window.innerHeight;
      if (sy > hero!.offsetHeight * 1.3) return;
      stack.style.transform = `translate3d(0, ${sy * 0.42}px, 0)`;
      clouds.style.transform = `translate3d(0, ${-sy * 0.38}px, 0) scale(${1 + (0.35 * sy) / vh})`;
      cloudsTop.style.opacity = String(Math.min(1, sy / (0.45 * vh)));
      cloudsTop.style.transform = `translate3d(0, ${-sy * 0.22}px, 0) scaleY(-1)`;
      rail.style.transform = `translate3d(0, ${sy * 0.2}px, 0)`;
      rail.style.opacity = String(Math.max(0, 1 - sy / (0.5 * vh)));
    }
    const onMove = (e: PointerEvent) => { if (e.pointerType === "mouse") { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; } };
    const onResize = () => { layout(false); onScroll(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);

    layout(false);
    onScroll();
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    hero.addEventListener("pointermove", onMove, { passive: true });
    timers.push(window.setTimeout(() => { top.classList.add("is-in"); hero.classList.add("is-in"); }, 250));
    timers.push(window.setTimeout(() => rail.classList.add("show-cap"), 250 + 900));
    timers.push(window.setTimeout(() => thumbs.forEach((el) => el.style.setProperty("--d", "0s")), 2200));
    schedule();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      [...timers, autoTimer, capTimer].forEach((t) => window.clearTimeout(t));
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      hero.removeEventListener("pointermove", onMove);
    };
  }, []);

  const cloud = `url("${CLOUD_IMAGE}")`;
  return (
    <div ref={root} className="sgl-top">
      <section className="sgl-hero sgl-on-photo" aria-roledescription="carousel" aria-label="SGL 일본 골프여행">
        <div className="sgl-hero__stack">
          {slides.map((s, i) => {
            const Tag = i === 0 ? "h1" : "p";
            const lines = s.title.map((line) => line.split(" "));
            const before = (li: number) => lines.slice(0, li).reduce((a, l) => a + l.length, 0);
            return (
              <div key={s.heading} className={`sgl-slide ${i === 0 ? "is-cur" : ""}`}>
                <div className="sgl-slide__photo" style={{ backgroundImage: `url("${sized(s.photo, 2400)}")`, backgroundPosition: s.position }} />
                <div className="sgl-slide__tint" />
                <Tag className={`sgl-title ${s.title.length > 1 ? "sgl-title--two" : ""}`}>
                  {lines.map((words, li) => (
                    <span key={li} className="sgl-title__line">
                      {words.map((w, wi) => <span key={wi} className="sgl-word"><span style={{ "--d": `${(before(li) + wi) * 90}ms` } as React.CSSProperties}>{w}</span></span>)}
                    </span>
                  ))}
                </Tag>
              </div>
            );
          })}
          <div className="sgl-mist" />
        </div>
        <div className="sgl-clouds-top" style={{ backgroundImage: cloud }} />
        <div className="sgl-clouds" aria-hidden><i style={{ backgroundImage: cloud }} /><i style={{ backgroundImage: cloud }} /></div>
        <div className="sgl-hero__fade" />
        <div className="sgl-rail">
          <span className="sgl-ring" /><span className="sgl-ring" />
          <span className="sgl-conn" />
          <div className="sgl-cap" aria-live="polite">
            <span className="sgl-cap__bar" />
            <div className="sgl-cap__text"><h2>{slides[cap].heading}</h2><p>{slides[cap].desc}</p></div>
          </div>
          {slides.map((s, i) => (
            <button key={s.heading} type="button" className="sgl-thumb" aria-label={`${s.heading} 보기`} style={{ backgroundImage: `url("${sized(s.thumb, 400)}")`, "--d": `${0.35 + (slides.length - 1 - i) * 0.14}s` } as React.CSSProperties} onClick={() => go.current(i)} />
          ))}
        </div>
      </section>
      {children}
    </div>
  );
}

/* ---------- 검색바 + 상품 목록 ---------- */
type Pop = "region" | "dates" | "pax" | null;
interface Filter { region: string; from: string; to: string; pax: number }
const EMPTY: Filter = { region: "", from: "", to: "", pax: 0 };

/** 조건에 맞는 출발(상품별로 가장 싼 원가표 하나) */
function match(pkg: PublicPackage, f: Filter): CardPick | null {
  if (f.region && pkg.region !== f.region) return null;
  if (!f.from) return { pax: f.pax || undefined };
  const nights = f.to ? diffDays(f.from, f.to) : 0;
  const hits = pkg.sheets
    .filter((s) => !nights || s.nights === nights)
    .map((s) => ({ s, d: s.departures.find((d) => d.d === f.from && d.s !== "c") }))
    .filter((x): x is { s: PublicPackage["sheets"][number]; d: NonNullable<typeof x.d> } => !!x.d)
    .sort((a, b) => (a.d.p ?? Infinity) - (b.d.p ?? Infinity));
  return hits.length ? { sheetId: hits[0].s.id, date: f.from, price: hits[0].d.p, pax: f.pax || undefined } : null;
}

export default function Landing({ packages, slides, today, minPax, maxPax }: { packages: PublicPackage[]; slides: HeroSlide[]; today: string; minPax: number; maxPax: number }) {
  const [draft, setDraft] = useState<Filter>(EMPTY);
  const [applied, setApplied] = useState<Filter>(EMPTY);
  const [pop, setPop] = useState<Pop>(null);
  const bar = useRef<HTMLDivElement>(null);

  const regions = useMemo(() => [...new Set(packages.map((p) => p.region))], [packages]);
  /** 달력에 점으로 표시할 출발일(고른 지역 기준) */
  const marks = useMemo(() => new Set(packages.filter((p) => !draft.region || p.region === draft.region).flatMap((p) => p.sheets.flatMap((s) => s.departures.filter((d) => d.s !== "c").map((d) => d.d)))), [packages, draft.region]);
  const lastDate = useMemo(() => [...marks].sort().at(-1), [marks]);

  useEffect(() => {
    if (!pop) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !bar.current?.contains(e.target as Node)) setPop(null); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [pop]);

  function pickDate(d: string) {
    if (!draft.from || draft.to || d <= draft.from) setDraft({ ...draft, from: d, to: "" }); // 첫 번째 누름 = 출발일
    else { setDraft({ ...draft, to: d }); setPop("pax"); } // 두 번째 누름 = 귀국일 → 인원으로 넘어간다
  }
  function search() {
    setPop(null);
    setApplied(draft);
    document.getElementById("stays")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const reset = () => { setDraft(EMPTY); setApplied(EMPTY); };

  const filtered = applied.region || applied.from;
  const results = packages.map((pkg) => ({ pkg, pick: match(pkg, applied) })).filter((x): x is { pkg: PublicPackage; pick: CardPick } => !!x.pick);
  const others = filtered && !results.length ? packages.filter((p) => !applied.region || p.region === applied.region) : [];
  const fallback = others.length ? others : filtered && !results.length ? packages : [];

  return (
    <>
      <Hero slides={slides}>
        <div ref={bar} className="sgl-search" role="search" aria-label="골프여행 검색">
          <div className="sgl-search__cell">
            <button type="button" className={`sgl-field ${pop === "region" ? "is-active" : ""}`} aria-expanded={pop === "region"} onClick={() => setPop(pop === "region" ? null : "region")}>
              <span className="sgl-field__label"><Icon name="pin" /> {draft.region || "일본"}</span>
              <span className={`sgl-field__sub ${draft.region ? "is-set" : ""}`}>{draft.region ? "여행지 선택됨" : "여행지를 골라 주세요"}</span>
            </button>
            {pop === "region" && (
              <div className="sgl-pop">
                <p className="sgl-pop__title">어디로 떠나시나요?</p>
                <button type="button" className={`sgl-opt ${!draft.region ? "is-on" : ""}`} onClick={() => { setDraft({ ...draft, region: "" }); setPop("dates"); }}>전체 지역 <small>상품 {packages.length}개</small></button>
                {regions.map((r) => <button key={r} type="button" className={`sgl-opt ${draft.region === r ? "is-on" : ""}`} onClick={() => { setDraft({ ...draft, region: r }); setPop("dates"); }}>{r} <small>상품 {packages.filter((p) => p.region === r).length}개</small></button>)}
              </div>
            )}
          </div>
          <div className="sgl-search__cell">
            <button type="button" className={`sgl-field ${pop === "dates" || (!pop && !draft.from) ? "is-active" : ""}`} aria-expanded={pop === "dates"} onClick={() => setPop(pop === "dates" ? null : "dates")}>
              <span className="sgl-field__label"><Icon name="calendar" /> 가는 날</span>
              <span className={`sgl-field__sub ${draft.from ? "is-set" : ""}`}>{draft.from ? dateShort(draft.from) : "날짜 선택"}</span>
            </button>
            {pop === "dates" && (
              <div className="sgl-pop">
                <Calendar start={draft.from || [...marks].sort()[0] || today} min={addDaysIso(today, 1)} max={lastDate ? addDaysIso(lastDate, 14) : undefined} from={draft.from} to={draft.to} onPick={pickDate}
                  day={(d) => ({ mark: marks.has(d) })} foot={draft.from && !draft.to ? "오는 날을 골라 주세요" : "점이 있는 날에 출발 상품이 있어요"} />
              </div>
            )}
          </div>
          <div className="sgl-search__cell">
            <button type="button" className="sgl-field" aria-expanded={pop === "dates"} onClick={() => setPop(pop === "dates" ? null : "dates")}>
              <span className="sgl-field__label"><Icon name="calendar" /> 오는 날</span>
              <span className={`sgl-field__sub ${draft.to ? "is-set" : ""}`}>{draft.to ? `${dateShort(draft.to)} · ${diffDays(draft.from, draft.to)}박` : "날짜 선택"}</span>
            </button>
          </div>
          <div className="sgl-search__cell">
            <button type="button" className={`sgl-field ${pop === "pax" ? "is-active" : ""}`} aria-expanded={pop === "pax"} onClick={() => setPop(pop === "pax" ? null : "pax")}>
              <span className="sgl-field__label"><Icon name="people" /> 인원</span>
              <span className={`sgl-field__sub ${draft.pax ? "is-set" : ""}`}>{draft.pax ? `${draft.pax}명` : "인원 선택"}</span>
            </button>
            {pop === "pax" && (
              <div className="sgl-pop sgl-pop--right">
                <div className="sgl-stepper">
                  <div><b>여행 인원</b><small>{minPax}명부터 예약할 수 있어요</small></div>
                  <div className="sgl-stepper__ctl">
                    <button type="button" aria-label="인원 줄이기" disabled={draft.pax <= minPax} onClick={() => setDraft({ ...draft, pax: Math.max(minPax, draft.pax - 1) })}>−</button>
                    <span>{draft.pax || 0}</span>
                    <button type="button" aria-label="인원 늘리기" disabled={draft.pax >= maxPax} onClick={() => setDraft({ ...draft, pax: draft.pax ? Math.min(maxPax, draft.pax + 1) : minPax })}>+</button>
                  </div>
                </div>
                <p className="sgl-help">{maxPax + 1}명 이상 단체는 상담으로 문의해 주세요.</p>
              </div>
            )}
          </div>
          <button type="button" className="sgl-send" aria-label="상품 찾기" onClick={search}><Icon name="plane" size={18} stroke={1.7} /><span>상품 찾기</span></button>
        </div>
      </Hero>

      <section className="sgl-stays" id="stays">
        <div className="sgl-sec__head">
          <h2 className="sgl-h2">{filtered ? "조건에 맞는 골프여행" : "추천 골프여행"}</h2>
          {filtered ? <button type="button" className="sgl-pill" onClick={reset}>전체 보기</button> : <a className="sgl-pill" href="/sgl/consult">맞춤 상담</a>}
        </div>
        {filtered && (
          <p className="sgl-filter">
            {applied.region && <span className="sgl-chip"><Icon name="pin" size={12} /> {applied.region}</span>}
            {applied.from && <span className="sgl-chip"><Icon name="calendar" size={12} /> {dateShort(applied.from)}{applied.to ? ` → ${dateShort(applied.to)} (${diffDays(applied.from, applied.to)}박)` : " 출발"}</span>}
            {applied.pax > 0 && <span className="sgl-chip"><Icon name="people" size={12} /> {applied.pax}명</span>}
            <span><b>{results.length}</b>개 상품</span>
          </p>
        )}
        {results.length > 0 && <div className="sgl-grid">{results.map(({ pkg, pick }, i) => <PackageCard key={pkg.id} pkg={pkg} pick={pick} col={i % 4} />)}</div>}
        {!packages.length && <div className="sgl-empty"><b>지금 예약할 수 있는 상품을 준비하고 있어요</b>원하시는 일정이 있다면 상담으로 먼저 알려 주세요.</div>}
        {filtered && !results.length && packages.length > 0 && (
          <>
            <div className="sgl-empty" style={{ marginBottom: 28 }}><b>고르신 날짜에 출발하는 상품이 없어요</b>아래 상품에서 다른 출발일을 확인하거나, 원하시는 일정을 상담으로 알려 주세요.</div>
            <div className="sgl-grid">{fallback.map((pkg, i) => <PackageCard key={pkg.id} pkg={pkg} pick={{ pax: applied.pax || undefined }} col={i % 4} />)}</div>
          </>
        )}
      </section>
    </>
  );
}
