"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./Brand";
import { DdayText } from "./Timers";

/** 혜택 페이지: 히어로 버튼이 지나간 뒤부터 마지막 안내가 보이기 전까지 떠 있는 입장 버튼 */
export default function StickyCta({ dday, fee }: { dday: string; fee: string }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("vip-hero-cta");
    const form = document.getElementById("vip-endcta");
    if (!hero || !form) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target === hero ? setHeroVisible : setFormVisible)(e.isIntersecting);
    });
    io.observe(hero);
    io.observe(form);
    return () => io.disconnect();
  }, []);
  const show = !heroVisible && !formVisible;
  return (
    <div className={`vip-sticky${show ? " is-visible" : ""}`} inert={!show}>
      <p className="vip-sticky__text"><strong>SGL VIP · <DdayText initial={dday} /></strong><span>12월 26일 오픈 · 연회비 {fee}</span></p>
      <Link className="vip-btn vip-btn--small" href="/sgl-vip">코드 입력 <Icon name="arrow" /></Link>
    </div>
  );
}
