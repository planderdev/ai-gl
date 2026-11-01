"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Brand";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 히어로 스윙 클립: 한 번 재생하고 피니시 자세에서 멈춘다. 모션 줄이기 설정이면 포스터만 보여준다 */
export function HeroSwing() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion()) return;
    const id = setTimeout(() => void v.play().catch(() => {}), 500);
    return () => clearTimeout(id);
  }, []);
  return <video ref={ref} className="vip-hero__video" src="/sgl-vip/hero-swing.mp4" poster="/sgl-vip/hero-poster.jpg" muted playsInline preload="auto" aria-hidden tabIndex={-1} />;
}

/** 광고 원본 영상: 화면에 들어올 때 처음 내려받고, 화면에 있는 동안만 재생한다 */
export function AdReel() {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setLoaded(true); }, { threshold: 0.35 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const v = video.current;
    if (!v || !loaded) return;
    if (!inView) v.pause();
    else if (!reducedMotion()) void v.play().catch(() => {});
  }, [loaded, inView]);

  const togglePlay = () => { const v = video.current; if (!v) return; if (v.paused) void v.play().catch(() => {}); else v.pause(); };
  const toggleSound = () => { const v = video.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); if (v.paused) void v.play().catch(() => {}); };

  return (
    <div ref={box} className="vip-reel">
      <video ref={video} className="vip-reel__video" src={loaded ? "/sgl-vip/ad.mp4" : undefined} poster="/sgl-vip/ad-poster.jpg" muted={muted} loop playsInline preload="metadata" aria-label="SGL VIP 광고 영상" onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      {!playing && <button type="button" className="vip-reel__play" onClick={togglePlay} aria-label="영상 재생"><Icon name="play" /></button>}
      <button type="button" className="vip-reel__sound" onClick={toggleSound} aria-pressed={!muted}>
        <Icon name={muted ? "soundOff" : "soundOn"} /> {muted ? "소리 켜기" : "소리 끄기"}
      </button>
    </div>
  );
}
