import Link from "next/link";
import type { GolfCourse, Hotel, Product, QuoteContext } from "@/types";
import { golfRate, hotelNightRate, staysOf } from "@/lib/pricing/engine";
import { roundsOf } from "@/lib/products/describe";
import { WEEKDAYS, airlineName } from "@/lib/format";

const yen = (n: number | null | undefined) => (n == null ? "-" : `${n.toLocaleString("ko-KR")}엔`);
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/** 요일 단가를 "일~목 7,500 · 금·토 8,500" 처럼 묶어 쓴다 */
function weekdaySummary(h: Hotel) {
  const groups = new Map<number, number[]>();
  for (let w = 0; w < 7; w++) groups.set(h.nightlyRates[w as 0], [...(groups.get(h.nightlyRates[w as 0]) ?? []), w]);
  if (groups.size === 1) return `전 요일 ${yen(h.nightlyRates[0])}`;
  return [...groups].sort((a, b) => a[0] - b[0]).map(([rate, ws]) => `${ws.map((w) => WEEKDAYS[w]).join("·")} ${yen(rate)}`).join(" / ");
}
function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] gap-3 border-t border-[var(--admin-border-soft)] px-5 py-3 first:border-t-0">
      <div className="flex items-start gap-1.5 text-[13px] font-bold text-[var(--admin-text-muted)]"><i className={`${icon} text-base text-[var(--admin-primary)]`} />{label}</div>
      <div className="min-w-0 space-y-1 text-sm">{children}</div>
    </div>
  );
}

/** 원가표 한 장의 원가 구조: 항공 · 숙박 · 골프 · 차량 · 기타 → 원가합 → 판매가 */
export default function ProductComposition({ product: p, ctx, courses }: { product: Product; ctx: QuoteContext; courses: GolfCourse[] }) {
  const land = p.saleType === "land";
  const coursesById = new Map(courses.map((c) => [c.id, c]));
  const stays = staysOf(p);
  const rounds = roundsOf(p, coursesById);
  const hotelOf = (id: string) => ctx.hotelsById?.get(id) ?? (ctx.hotel?.id === id ? ctx.hotel : null);
  // 숙박 구간마다 몇 박째부터인지 미리 계산
  const stayRows = stays.map((s, i) => ({ ...s, from: stays.slice(0, i).reduce((a, x) => a + x.nights, 0) + 1 }));
  const masters = `/masters?region=${encodeURIComponent(p.region)}`;
  // 요금표에서 평일·주말 단가가 다른 날을 하나씩 골라 대표 요금을 보여 준다
  const sample = (c: GolfCourse | undefined, style?: string) => {
    if (!c) return null;
    const none = new Set<string>();
    const wk = golfRate(c, firstOf(p.dateFrom, [2, 3]), none, style);
    const we = golfRate(c, firstOf(p.dateFrom, [6]), none, style);
    return { wk, we };
  };
  return (
    <section className="admin-card">
      <div className="admin-card__head">
        <div><h2>원가 구조</h2><p className="admin-card__desc">아래 구성 요소의 단가를 출발일마다 더해 원가를 만들고, 마진으로 나눠 판매가를 냅니다. 단가는 지역 단가 화면에서 고치면 모든 날짜에 반영됩니다.</p></div>
        <Link href={masters} className="admin-btn admin-btn--light admin-btn--xs"><i className="ri-price-tag-3-line" /> {p.region} 단가</Link>
      </div>
      <div className="admin-card__body admin-card__body--flush">
        <Row icon="ri-flight-takeoff-line" label="항공">
          <p>{airlineName(p.airline)} · {p.outbound.flightNo} {p.outbound.origin} {p.outbound.dep} → {p.outbound.destination} {p.outbound.arr} / {p.inbound.flightNo} {p.inbound.origin} {p.inbound.dep} → {p.inbound.destination} {p.inbound.arr}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">{land ? "현지착 — 항공료는 원가에 넣지 않습니다. 표의 운임은 참고용입니다." : "인디비 = 출발편(출발일) + 귀국편(귀국일) 운임 · 그룹 = 날짜별 그룹가 + 월별 유택"}</p>
        </Row>
        <Row icon="ri-hotel-bed-line" label={`숙박 ${p.nights}박`}>
          {stayRows.map((s, i) => {
            const h = hotelOf(s.hotelId);
            const from = s.from, night = s.from + s.nights - 1;
            const days = Object.keys(h?.dateRates ?? {}).sort();
            return (
              <p key={i}>
                <span className="admin-chip admin-chip--gray mr-1.5">{s.nights === 1 ? `${from}박째` : `${from}~${night}박째`}</span>
                <b>{h?.name ?? "호텔 미지정"}</b> {s.nights}박
                {h && <span className="ml-2 text-xs text-[var(--admin-text-muted)]">{days.length ? `일자별 요금 ${days[0].slice(2)}~${days.at(-1)!.slice(2)} (${days.length}일) · 그 밖의 날 ` : ""}{weekdaySummary(h)}{h.roomBasis ? ` · ${h.roomBasis}` : ""} · 출발일 {p.dateFrom.slice(5)} 기준 {yen(hotelNightRate(h, addDay(p.dateFrom, from - 1)))}</span>}
              </p>
            );
          })}
        </Row>
        <Row icon="ri-golf-ball-line" label={`골프 ${rounds.length}회`}>
          {rounds.map((r, i) => {
            const c = coursesById.get(r.courseId);
            const s = sample(c, r.style);
            return (
              <p key={i}>
                <span className="admin-chip admin-chip--gray mr-1.5">{i + 1}R · {r.day}일차</span>
                <b>{c?.name ?? "골프장 미지정"}</b> {r.holes}H{r.style ? <span className="ml-1 text-[var(--admin-text-muted)]">({r.style})</span> : null}
                {s && <span className="ml-2 text-xs text-[var(--admin-text-muted)]">주중 {yen(s.wk)} / 주말·연휴 {yen(s.we)}</span>}
              </p>
            );
          })}
          {!rounds.length && <p className="text-[var(--admin-text-muted)]">라운드 없음</p>}
        </Row>
        <Row icon="ri-taxi-line" label="차량">
          <p><b>{ctx.vehicle?.name ?? "차량 규칙 미지정"}</b>{ctx.vehicle && <span className="ml-2 text-xs text-[var(--admin-text-muted)]">출발 요일별 {[...new Set(Object.values(ctx.vehicle.feesByWeekday))].length === 1 ? won(ctx.vehicle.feesByWeekday[0]) : WEEKDAYS.map((w, i) => `${w} ${ctx.vehicle!.feesByWeekday[i as 0].toLocaleString()}`).join(" · ")}</span>}</p>
        </Row>
        {(p.extras?.length ?? 0) > 0 && (
          <Row icon="ri-restaurant-line" label="기타 원가">
            {p.extras!.map((e, i) => <p key={i}><b>{e.label}</b> <span className="text-[var(--admin-text-muted)]">{[e.krw ? won(e.krw) : "", e.jpy ? yen(e.jpy) : ""].filter(Boolean).join(" + ")}</span></p>)}
          </Row>
        )}
        <Row icon="ri-calculator-line" label="계산">
          <p>원가합 = {land ? "" : "항공 + "}호텔 + 골프 + 차량{p.extras?.length ? " + 기타 원가" : ""}{land ? "" : " + 항공추가금"} <span className="text-[var(--admin-text-muted)]">(엔화는 환율 {p.exchangeRate} 적용)</span></p>
          <p>판매가 = 원가합 ÷ (1 − 마진) <span className="text-[var(--admin-text-muted)]">· 마진 {p.margins.map((m) => `${Math.round(m * 100)}%`).join(" / ")}{p.paxBasis ? ` · ${p.paxBasis}인 기준 1인 금액` : " · 1인 금액"}</span></p>
          {p.note && <p className="text-xs text-[var(--admin-text-muted)]">비고: {p.note}</p>}
        </Row>
      </div>
    </section>
  );
}

const addDay = (s: string, n: number) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
/** from 이후 처음 오는 지정 요일(0=일 … 6=토) 날짜 */
function firstOf(from: string, weekdays: number[]) {
  for (let i = 0; i < 7; i++) { const d = addDay(from, i); if (weekdays.includes(new Date(`${d}T00:00:00Z`).getUTCDay())) return d; }
  return from;
}
