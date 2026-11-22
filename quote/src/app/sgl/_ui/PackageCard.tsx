"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { dateShort, sized, won, type PublicPackage } from "@/lib/sgl/config";
import { useFlight } from "./Chrome";
import { Icon } from "./icons";
import { useWish } from "./wish";

export interface CardPick { sheetId?: string; date?: string; price?: number | null; pax?: number }

/** 상품 카드. 누르면 사진이 상세 화면의 큰 사진 자리로 날아간다 */
export default function PackageCard({ pkg, pick, col = 0 }: { pkg: PublicPackage; pick?: CardPick; col?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [liked, toggle] = useWish(pkg.id);
  const { start } = useFlight();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const q = new URLSearchParams();
  if (pick?.sheetId) q.set("sheet", pick.sheetId);
  if (pick?.date) q.set("date", pick.date);
  if (pick?.pax) q.set("pax", String(pick.pax));
  const href = `/sgl/p/${encodeURIComponent(pkg.id)}${q.size ? `?${q}` : ""}`;
  const price = pick?.date ? pick.price ?? null : pkg.minPrice;
  const sheet = pkg.sheets.find((s) => s.id === pick?.sheetId);
  const tags = sheet ? [sheet.label] : [...new Set(pkg.sheets.map((s) => `${s.nights}박 ${s.holes}홀`))].slice(0, 2);

  return (
    <article ref={ref} className={`sgl-card ${seen ? "is-seen" : ""}`} style={{ "--d": `${col * 90}ms` } as React.CSSProperties}>
      <div className="sgl-card__photo" style={{ backgroundImage: `url("${sized(pkg.image, 700)}")` }} />
      <div className="sgl-card__shade" />
      <Link href={href} className="sgl-card__link" aria-label={`${pkg.title} 자세히 보기`}
        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !ref.current) return; e.preventDefault(); start(ref.current, pkg.image, href); }} />
      <span className="sgl-card__price">{price != null ? <>{won(price)}{pick?.date ? "" : "~"} <em>/1인</em></> : "가격 문의"}</span>
      <button type="button" className={`sgl-heart ${liked ? "is-on" : ""}`} aria-pressed={liked} aria-label={liked ? "찜 해제" : "찜하기"} onClick={toggle}><Icon name="heart" size={16} stroke={1.7} /></button>
      <div className="sgl-card__body">
        <h3 className="sgl-card__name">{pkg.title}</h3>
        <p className="sgl-card__meta"><Icon name="pin" size={12} /> {pkg.region}, {pkg.country}{pkg.airline ? ` · ${pkg.airline}` : ""}</p>
        <p className="sgl-card__tags">
          {pick?.date && <span className="is-date">{dateShort(pick.date)} 출발</span>}
          {tags.map((t) => <span key={t}>{t}</span>)}
          <span>{pkg.saleTypes.includes("air") ? "항공 포함" : "현지 합류"}</span>
        </p>
      </div>
    </article>
  );
}
