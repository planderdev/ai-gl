import { createHmac, timingSafeEqual } from "node:crypto";
import { authSecret } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/cms/service";

/**
 * 사전예약 입장 코드(서버 전용 — 코드가 클라이언트 번들에 실리지 않게 config.ts 와 분리한다).
 * 코드를 통과하면 서명 쿠키를 주고, 입력 페이지와 신청 API 가 이 쿠키를 확인한다.
 * 서명 입력에 용도 접두사를 붙여 관리자 세션 토큰과 서로 바꿔 쓸 수 없게 한다.
 */
export const VIP_ACCESS_COOKIE = "sgl_vip_access";
export const VIP_ACCESS_MAX_AGE = 90 * 86400; // 초
const DEFAULT_CODE = "1226"; // 관리자 "VIP 입장 코드" 가 비어 있을 때

const sign = (exp: string) => createHmac("sha256", authSecret()).update(`sgl-vip-access:${exp}`).digest("base64url");
const normalize = (v: string) => v.replace(/\s/g, "").toUpperCase();

export async function isValidAccessCode(input: string) {
  const { vip_access_code: saved } = await getSiteSettings();
  return normalize(input) === (normalize(String(saved ?? "")) || DEFAULT_CODE);
}
export function createAccessToken() {
  const exp = String(Date.now() + VIP_ACCESS_MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}
export function hasVipAccess(token: string | undefined) {
  const [exp, sig] = (token ?? "").split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  const given = Buffer.from(sig);
  const expected = Buffer.from(sign(exp));
  return given.length === expected.length && timingSafeEqual(given, expected);
}
