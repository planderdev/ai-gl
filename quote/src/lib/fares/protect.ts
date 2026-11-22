/**
 * 편을 구분하지 못한 수집값(노선 하루 최저가·그날 전체 마감, meta.basis = "day-lowest")은
 * 사람이 넣은 편별 운임(source import·manual)을 덮어쓰지 않는다.
 * 서버 저장(upsertFares)과 크롤러 CLI(업로드 전)가 같이 쓴다 — 저장소 의존이 없는 순수 함수.
 */
export const isApproxFare = (f: { meta?: Record<string, unknown> }) => f.meta?.basis === "day-lowest";
const isHuman = (source?: string) => source === "import" || source === "manual";

export function keepHumanFares<T extends { flightNo: string; date: string; meta?: Record<string, unknown> }>(incoming: T[], existing: Iterable<{ flightNo: string; date: string; source?: string }>): { keep: T[]; skipped: T[] } {
  if (!incoming.some(isApproxFare)) return { keep: incoming, skipped: [] };
  const human = new Set<string>();
  for (const e of existing) if (isHuman(e.source)) human.add(`${e.flightNo}_${e.date}`);
  const keep: T[] = [], skipped: T[] = [];
  for (const f of incoming) (isApproxFare(f) && human.has(`${f.flightNo}_${f.date}`) ? skipped : keep).push(f);
  return { keep, skipped };
}
