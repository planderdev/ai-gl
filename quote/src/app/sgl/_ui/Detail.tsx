"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDaysIso, airportName, dateKo, depositOf, sized, won, type PublicPackage, type PublicSheet, type SglConfig } from "@/lib/sgl/config";
import Calendar from "./Calendar";
import { LandingPhoto } from "./Chrome";
import { Icon, type IconName } from "./icons";
import { useWish } from "./wish";

type Cfg = Pick<SglConfig, "minPax" | "maxPax" | "tel" | "deposit" | "partial" | "balanceDueDays" | "cancel" | "notice">;

/** 포함 사항 문구에 맞는 아이콘 */
const includeIcon = (text: string): IconName => (/항공/.test(text) ? "flight" : /숙박/.test(text) ? "bed" : /그린피/.test(text) ? "flag" : /차량/.test(text) ? "car" : /온천/.test(text) ? "hot" : "meal");

/** 원가표의 일자별 홀수·숙박·항공편을 일차별 일정으로 푼다 */
function itinerary(sheet: PublicSheet) {
  const nightsAt = sheet.stays.flatMap((s) => Array<string>(s.nights).fill(s.hotel));
  const air = sheet.saleType === "air";
  return Array.from({ length: sheet.nights + 1 }, (_, i) => {
    const lines: string[] = [];
    const leg = i === 0 ? sheet.outbound : i === sheet.nights ? sheet.inbound : null;
    const flight = leg ? `${airportName(leg.origin)} ${leg.dep} 출발 → ${airportName(leg.destination)} ${leg.arr} 도착 · ${leg.flightNo}` : "";
    if (i === 0) lines.push(air ? flight : `현지 합류 · 참고 항공편 ${flight}`);
    for (const r of sheet.rounds.filter((x) => x.day === i + 1)) lines.push(`${r.course} ${r.holes}홀 라운드${r.style ? ` · ${r.style}` : ""}`);
    if (i === sheet.nights) lines.push(air ? flight : `현지 해산 · 참고 항공편 ${flight}`);
    else lines.push(`숙박 · ${nightsAt[i] ?? "호텔"}`);
    return lines;
  });
}

export default function Detail({ pkg, config, initial }: { pkg: PublicPackage; config: Cfg; initial: { sheet?: string; date?: string; pax?: number } }) {
  const [sheetId, setSheetId] = useState(() => pkg.sheets.find((s) => s.id === initial.sheet)?.id ?? pkg.sheets[0].id);
  const sheet = pkg.sheets.find((s) => s.id === sheetId) ?? pkg.sheets[0];
  const byDate = useMemo(() => new Map(sheet.departures.map((d) => [d.d, d])), [sheet]);
  const [date, setDate] = useState(() => (initial.date && pkg.sheets.find((s) => s.id === sheetId)?.departures.some((d) => d.d === initial.date && d.s !== "c") ? initial.date : ""));
  const [pax, setPax] = useState(() => Math.min(config.maxPax, Math.max(config.minPax, initial.pax || sheet.paxBasis || config.minPax)));
  const [calOpen, setCalOpen] = useState(false);
  const [liked, toggleLike] = useWish(pkg.id);
  const photos = [pkg.image, ...pkg.gallery];
  const [main, setMain] = useState(0);
  const dates = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calOpen) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === "Escape" : !dates.current?.contains(e.target as Node)) setCalOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", close); };
  }, [calOpen]);

  function chooseSheet(id: string) {
    setSheetId(id);
    const next = pkg.sheets.find((s) => s.id === id);
    if (date && !next?.departures.some((d) => d.d === date && d.s !== "c")) setDate(""); // 그 일정에 없는 출발일이면 다시 고르게 한다
  }

  const dep = date ? byDate.get(date) : undefined;
  const open = sheet.departures.filter((d) => d.s === "o" && d.p != null);
  const lowest = sheet.minPrice != null ? open.filter((d) => d.p === sheet.minPrice).map((d) => d.d) : [];
  const bookable = dep?.s === "o" && dep.p != null;
  const total = bookable ? (dep.p as number) * pax : null;
  const deposit = total != null ? depositOf(total, pax, config) : null;
  const first = sheet.departures.find((d) => d.s !== "c")?.d ?? "";
  const last = sheet.departures.at(-1)?.d;
  const consultHref = `/sgl/consult?package=${encodeURIComponent(pkg.id)}&sheet=${encodeURIComponent(sheet.id)}${date ? `&date=${date}` : ""}&pax=${pax}`;
  const days = itinerary(sheet);
  const policy = [config.cancel.freeDays > 0 ? `출발 ${config.cancel.freeDays}일 전까지는 수수료 없이 취소할 수 있습니다.` : "", config.cancel.feePercent > 0 ? `그 이후 취소는 결제 금액의 ${config.cancel.feePercent}%가 수수료로 부과됩니다.` : "", config.notice.refund, config.notice.noshow, config.notice.weather, config.notice.extra].filter(Boolean);

  return (
    <>
      <div className="sgl-detail">
        <div>
          <LandingPhoto src={photos[main]}>
            <button type="button" className={`sgl-heart ${liked ? "is-on" : ""}`} aria-pressed={liked} aria-label={liked ? "찜 해제" : "찜하기"} onClick={toggleLike}><Icon name="heart" size={16} stroke={1.7} /></button>
          </LandingPhoto>
          <div className="sgl-thumbs sgl-rise" style={{ "--i": 1 } as React.CSSProperties}>
            {photos.slice(1, 4).map((src, k) => (
              <button key={src} type="button" aria-label={`사진 ${k + 2} 크게 보기`} className={main === k + 1 ? "is-on" : ""} style={{ backgroundImage: `url("${sized(src, 500)}")` }} onClick={() => setMain(main === k + 1 ? 0 : k + 1)}>
                {k === 2 && photos.length > 4 && <em>+{photos.length - 4}</em>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="sgl-h1 sgl-rise" style={{ "--i": 0 } as React.CSSProperties}>{pkg.title}</h1>
          <p className="sgl-host sgl-rise" style={{ "--i": 1 } as React.CSSProperties}><i>SGL</i> SGL 골프여행팀 운영 · {pkg.region}, {pkg.area}{pkg.airline ? ` · ${pkg.airline}` : ""}</p>

          <div className="sgl-about sgl-rise" style={{ "--i": 2 } as React.CSSProperties}>
            <h2 className="sgl-h3">상품 소개</h2>
            <p>{pkg.description || `${pkg.area}의 ${pkg.region}에서 즐기는 ${pkg.sheets.map((s) => `${s.nights}박 ${s.holes}홀`).filter((v, i, a) => a.indexOf(v) === i).join(" · ")} 골프여행입니다. ${pkg.summary}`}</p>
            {pkg.highlights.length > 0 && <ul>{pkg.highlights.map((h) => <li key={h}><Icon name="check" size={15} stroke={2} />{h}</li>)}</ul>}
          </div>

          <div className="sgl-panel sgl-book sgl-rise" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="sgl-book__price">
              {dep?.p != null ? <>{won(dep.p)} <small>/1인 · {dateKo(dep.d)} 출발</small></> : sheet.minPrice != null ? <>{won(sheet.minPrice)}~ <small>/1인</small></> : <>가격 문의 <small>상담으로 안내해 드려요</small></>}
            </p>
            {pkg.sheets.length > 1 && (
              <div className="sgl-seg" role="group" aria-label="일정 선택">
                {pkg.sheets.map((s) => <button key={s.id} type="button" aria-pressed={s.id === sheet.id} className={s.id === sheet.id ? "is-on" : ""} onClick={() => chooseSheet(s.id)}>{s.label}<small>{s.minPrice != null ? `${won(s.minPrice)}~` : "가격 문의"}</small></button>)}
              </div>
            )}
            <div className="sgl-dates" ref={dates}>
              <button type="button" aria-expanded={calOpen} onClick={() => setCalOpen(!calOpen)}><small>가는 날</small><b>{date ? dateKo(date) : "출발일 선택"}</b></button>
              <div><small>오는 날</small><b>{date ? dateKo(addDaysIso(date, sheet.nights)) : `${sheet.nights}박 ${sheet.nights + 1}일`}</b></div>
              {calOpen && first && (
                <div className="sgl-pop">
                  <Calendar key={sheet.id} priced start={date || open[0]?.d || first} min={first} max={last} from={date || undefined} onPick={(d) => { setDate(d); setCalOpen(false); }}
                    day={(d) => { const x = byDate.get(d); return x && x.s !== "c" ? { price: x.s === "o" ? x.p : null, mark: true, low: x.s === "o" && x.p === sheet.minPrice } : { disabled: true }; }}
                    foot="1인 요금(만원) · '문의'는 상담으로 요금을 안내해 드리는 날입니다" />
                </div>
              )}
            </div>
            <div className="sgl-row">
              <div><b>인원</b> <span className="sgl-small">{sheet.paxBasis ? `${sheet.paxBasis}인 기준 요금` : `${config.minPax}~${config.maxPax}명`}</span></div>
              <div className="sgl-stepper__ctl">
                <button type="button" aria-label="인원 줄이기" disabled={pax <= config.minPax} onClick={() => setPax(pax - 1)}>−</button>
                <span>{pax}</span>
                <button type="button" aria-label="인원 늘리기" disabled={pax >= config.maxPax} onClick={() => setPax(pax + 1)}>+</button>
              </div>
            </div>
            {total != null && (
              <div className="sgl-total">
                <span>총 결제 금액 <span className="sgl-small">{won(dep!.p as number)} × {pax}명</span></span>
                <b>{won(total)}</b>
              </div>
            )}
            {deposit != null && <p className="sgl-small" style={{ margin: "-8px 0 14px" }}>예약금 {won(deposit)}만 먼저 결제하고, 잔금은 출발 {config.balanceDueDays}일 전까지 내실 수 있어요.</p>}
            {total == null && <div style={{ height: 16 }} />}
            {bookable
              ? <Link className="sgl-btn sgl-btn--full" href={`/sgl/book?sheet=${encodeURIComponent(sheet.id)}&date=${date}&pax=${pax}`}>예약하기 <Icon name="arrow" size={18} /></Link>
              : date
                ? <Link className="sgl-btn sgl-btn--full" href={consultHref}>이 날짜로 상담 신청 <Icon name="arrow" size={18} /></Link>
                : <button type="button" className="sgl-btn sgl-btn--full" onClick={() => setCalOpen(true)}>출발일 선택하기</button>}
            {sheet.paxBasis && pax !== sheet.paxBasis && <p className="sgl-note">{sheet.paxBasis}인 기준 요금입니다. 인원이 다르면 골프장·차량 조건에 따라 요금이 달라질 수 있으며, 예약 후 담당자가 확정 금액을 안내해 드립니다.</p>}
            {sheet.note && <p className="sgl-note">{sheet.note}</p>}
          </div>

          <div className="sgl-facts sgl-rise" style={{ "--i": 4 } as React.CSSProperties}>
            <span><b>{open.length}</b>일 출발 가능</span>
            {lowest[0] && <span>최저가 출발 <b style={{ fontSize: 15 }}>{dateKo(lowest[0])}</b></span>}
            <Link href={consultHref} className="sgl-pill">상담하기</Link>
          </div>

          <div className="sgl-rise" style={{ "--i": 5 } as React.CSSProperties}>
            <h2 className="sgl-h3">포함 사항</h2>
            <ul className="sgl-amen">{sheet.includes.map((t) => <li key={t}><Icon name={includeIcon(t)} size={22} stroke={1.3} />{t}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="sgl-cols">
        <section className="sgl-rise" style={{ "--i": 6 } as React.CSSProperties}>
          <h2 className="sgl-h3">일정 · {sheet.label}</h2>
          <ol className="sgl-days">{days.map((lines, i) => <li key={i}><b>DAY {i + 1}</b><div>{lines.map((l) => <p key={l}>{l}</p>)}</div></li>)}</ol>
          <p className="sgl-small">항공 스케줄과 골프장 배정은 현지 사정에 따라 바뀔 수 있으며, 변경 시 미리 안내해 드립니다.</p>
        </section>
        <section className="sgl-rise" style={{ "--i": 7 } as React.CSSProperties}>
          <h2 className="sgl-h3">불포함 사항</h2>
          <ul className="sgl-list sgl-list--no">{sheet.excludes.map((t) => <li key={t}><Icon name="x" size={14} stroke={2} />{t}</li>)}</ul>
          {policy.length > 0 && <div className="sgl-policy" style={{ marginTop: 30 }}><h2 className="sgl-h3">취소 · 환불 규정</h2>{policy.map((t) => <p key={t}>{t}</p>)}</div>}
        </section>
      </div>
    </>
  );
}
