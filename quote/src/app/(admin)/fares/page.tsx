import FareManualForm from "@/components/FareManualForm";
import CrawlButton from "@/components/CrawlButton";
import PageHead from "@/components/PageHead";
import { fareRequests, listFares } from "@/lib/fares/service";
import { krw } from "@/lib/format";
import { weekdayLabel } from "@/lib/pricing/date";

export const dynamic = "force-dynamic";
const STATUS: Record<string, string> = { ok: "확인", no_flight: "운항없음", sold_out: "마감", unknown: "미정" };

export default async function FaresPage({ searchParams }: PageProps<"/fares">) {
  const sp = await searchParams;
  const flightNo = typeof sp.flightNo === "string" ? sp.flightNo : undefined;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  const [items, reqs] = await Promise.all([listFares({ flightNo, from, to }), fareRequests().list()]);
  const flights = [...new Set(items.map((f) => f.flightNo))].sort();
  const byDate = new Map<string, Record<string, (typeof items)[number]>>();
  for (const f of items) { if (!byDate.has(f.date)) byDate.set(f.date, {}); byDate.get(f.date)![f.flightNo] = f; }
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const paxOf = (f: { meta?: Record<string, unknown> }) => (typeof f.meta?.pax === "number" ? `${f.meta.pax}인` : f.meta?.provider ? "1인" : "");
  const paxSet = [...new Set(items.filter((f) => f.source === "crawler").map((f) => `${f.flightNo} ${paxOf(f)}`).filter(Boolean))].sort();
  return (
    <>
    <PageHead crumb="항공 운임" title="항공 운임 (인디비)" desc={`편명·날짜별 1인 총액(세금 포함) 운임입니다. 크롤러는 지정한 인원(기본 4명)이 함께 탈 수 있는 좌석의 최저가를 가져오므로, 인원이 많을수록 값이 높아질 수 있습니다.${paxSet.length ? ` 현재 조회 기준: ${paxSet.join(", ")}` : ""}`} stats={[{ label: "조회 결과", value: items.length }, { label: "대기 요청", value: reqs.filter((r) => r.status === "pending").length }]} />
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        <div className="card space-y-3">
          <h2 className="font-bold">조회 · 수동 입력</h2>
          <form className="flex flex-wrap items-end gap-2 text-sm">
            <label>편명<input name="flightNo" defaultValue={flightNo} className="ml-1 w-24" placeholder="전체" /></label>
            <label>부터<input type="date" name="from" defaultValue={from} className="ml-1" /></label>
            <label>까지<input type="date" name="to" defaultValue={to} className="ml-1" /></label>
            <button className="btn-ghost">조회</button><span className="text-xs text-neutral-500">{items.length}건</span>
          </form>
          <FareManualForm />
        </div>
        <div className="card max-h-[65vh] overflow-auto p-0">
          <table className="w-full text-sm">
            <thead><tr><th className="th">날짜</th><th className="th">요일</th>{flights.map((f) => <th key={f} className="th">{f}</th>)}<th className="th">수집</th></tr></thead>
            <tbody>
              {[...byDate.entries()].sort().map(([d, m]) => (
                <tr key={d} className="hover:bg-neutral-50">
                  <td className="td text-center">{d}</td><td className="td text-center">{weekdayLabel(d)}</td>
                  {flights.map((f) => { const x = m[f]; return <td key={f} className={`td ${x?.status === "ok" ? "" : "text-neutral-400"}`}>{x ? (x.status === "ok" ? krw(x.fareKrw) : STATUS[x.status]) : "·"}</td>; })}
                  <td className="td text-center text-[11px] text-neutral-400">{Object.values(m).map((x) => `${x.source}${paxOf(x) ? `(${paxOf(x)})` : ""}`).filter((v, i, a) => a.indexOf(v) === i).join(",")}</td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={flights.length + 3} className="py-6 text-center text-neutral-500">운임이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="card space-y-2">
          <h2 className="font-bold">항공 운임 크롤러</h2>
          <p className="text-xs text-neutral-500">에어서울(RS741/742 다카마쓰)과 제주항공(7C1704/1703 마쓰야마)의 최저가 달력에서 날짜별 편도 총액을 수집합니다. 봇 차단 때문에 Chrome 창이 잠깐 열립니다. CLI: <code>npm run crawl -- --all</code></p>
          <CrawlButton pendingCount={reqs.filter((r) => r.status === "pending").length} />
        </div>
        <div className="card" id="requests">
          <h2 className="mb-2 font-bold">크롤링 요청</h2>
          <ul className="max-h-64 space-y-1 overflow-auto text-xs">
            {reqs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => (
              <li key={r.id} className="rounded border border-neutral-100 p-1.5">
                <span className={`mr-1 rounded px-1 ${r.status === "done" ? "bg-emerald-100 text-emerald-800" : r.status === "failed" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
                {r.flights.map((f) => f.flightNo).join(",")} {r.from}~{r.to}
                <div className="text-neutral-500">{r.note} · {r.createdAt.slice(0, 16).replace("T", " ")} {r.resultCount != null && `· ${r.resultCount}건`} {r.error && `· ${r.error}`}</div>
                <div className="font-mono text-[10px] text-neutral-400">{r.id}</div>
              </li>
            ))}
            {!reqs.length && <li className="text-neutral-500">요청 없음</li>}
          </ul>
        </div>
        <div className="card text-xs">
          <h2 className="mb-2 text-sm font-semibold">크롤러 연동 API</h2>
          <p className="mb-2 text-neutral-600">인증: 헤더 <code>x-api-key: $CRAWLER_API_KEY</code> (.env 의 CRAWLER_API_KEY, 로컬 미설정 시 생략 가능)</p>
          <ol className="list-decimal space-y-2 pl-4">
            <li>할 일 가져오기 (가장 오래된 대기 요청을 in_progress 로 전환)
              <pre className="mt-1 overflow-auto rounded bg-neutral-900 p-2 text-[10px] text-neutral-100">{`curl -X POST ${base}/api/fares/requests/next \\\n  -H "x-api-key: $KEY"\n# → { request: {id,...}, tasks: [{flightNo,origin,destination,date}, ...] }`}</pre></li>
            <li>운임 업로드 (편명+날짜 단위 upsert, requestId 주면 done 처리)
              <pre className="mt-1 overflow-auto rounded bg-neutral-900 p-2 text-[10px] text-neutral-100">{`curl -X POST ${base}/api/fares \\\n  -H "x-api-key: $KEY" -H "Content-Type: application/json" \\\n  -d '{"requestId":"freq_…","fares":[\n    {"flightNo":"RS741","origin":"ICN","destination":"TAK","date":"2026-10-01","fareKrw":126700},\n    {"flightNo":"RS742","origin":"TAK","destination":"ICN","date":"2026-10-04","fareKrw":null,"status":"no_flight"}\n  ]}'`}</pre></li>
            <li>실패 보고 <pre className="mt-1 overflow-auto rounded bg-neutral-900 p-2 text-[10px] text-neutral-100">{`curl -X PATCH ${base}/api/fares/requests/freq_… \\\n  -H "x-api-key: $KEY" -H "Content-Type: application/json" \\\n  -d '{"status":"failed","error":"captcha"}'`}</pre></li>
            <li>조회 <code>GET /api/fares?flightNo=RS741&from=2026-10-01&to=2026-10-31</code></li>
          </ol>
          <p className="mt-2 text-neutral-500">status: ok(운임 확인) · no_flight(운항없음) · sold_out(마감) · unknown(미정). fareKrw 는 세금 포함 1인 총액(원).</p>
        </div>
      </aside>
    </div>
    </>
  );
}
