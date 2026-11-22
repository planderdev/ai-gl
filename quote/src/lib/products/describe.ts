import type { GolfCourse, Hotel, Product } from "@/types";
import { staysOf } from "@/lib/pricing/engine";

/** 상품 구성을 한 줄로 풀어 쓴다(목록·상세 공용, 순수 함수) */
export const SALE_TYPE_LABEL = { air: "항공 포함", land: "현지착" } as const;
export const saleTypeOf = (p: Pick<Product, "saleType">) => p.saleType ?? "air";
const short = (name: string) => name.replace(/\(.*?\)/g, "").replace(/컨트리클럽|골프클럽/g, "CC").replace(/\s+/g, " ").trim();

export interface RoundInfo { day: number; holes: number; courseId: string; courseName: string; style?: string }
/** 일자별 홀수와 골프장 배정을 라운드 목록으로 */
export function roundsOf(p: Pick<Product, "golfPlan" | "golfCourseIds" | "golfStyles">, coursesById: Map<string, GolfCourse>): RoundInfo[] {
  const ids = p.golfCourseIds;
  const out: RoundInfo[] = [];
  p.golfPlan.forEach((holes, i) => {
    if (!holes) return;
    const slot = ids.length ? out.length % ids.length : 0;
    const c = coursesById.get(ids[slot] ?? "");
    out.push({ day: i + 1, holes, courseId: ids[slot] ?? "", courseName: c ? short(c.name) : "-", style: p.golfStyles?.[slot] || undefined });
  });
  return out;
}
export const stayText = (p: Pick<Product, "stays" | "hotelId" | "nights">, hotelsById: Map<string, Hotel>) => staysOf(p).map((s) => `${short(hotelsById.get(s.hotelId)?.name ?? "호텔")} ${s.nights}박`).join(" + ");
export function golfText(p: Pick<Product, "golfPlan" | "golfCourseIds" | "golfStyles">, coursesById: Map<string, GolfCourse>) {
  const rounds = roundsOf(p, coursesById);
  const names = rounds.map((r) => r.courseName);
  const total = p.golfPlan.reduce((a, b) => a + b, 0);
  const uniq = [...new Set(names)];
  return `${uniq.length === 1 ? `${uniq[0]} ${rounds.length}회` : names.join(" → ")} · ${total}홀`;
}
