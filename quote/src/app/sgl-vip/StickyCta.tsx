"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Brand";
import { DdayText } from "./Timers";

/** 히어로 버튼이 지나간 뒤부터, 신청 영역이 보이기 전까지 떠 있는 신청 버튼 */
export default function StickyCta({ dday, fee }: { dday: string; fee: string }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("vip-hero-cta");
    const form = document.getElementById("apply");
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
      <a className="vip-btn vip-btn--small" href="#apply">사전신청 <Icon name="arrow" /></a>
    </div>
  );
}
