/**
 * 서명 쿠키 세션. 비밀번호는 APP_PASSWORD 가 설정된 경우에만 검사한다(미설정 = 이름만으로 로그인).
 * 서명 키: AUTH_SECRET → CRAWLER_API_KEY → 개발용 기본값. Web Crypto 만 사용해 proxy(엣지/노드 공용)에서도 검증 가능.
 */
export const SESSION_COOKIE = "aigl_session";
const enc = new TextEncoder();
const secret = () => process.env.AUTH_SECRET || process.env.CRAWLER_API_KEY || "aigl-dev-secret";
const b64url = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) => { const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
export interface Session { name: string; iat: number; exp: number }

export async function createSessionToken(name: string, days: number): Promise<string> {
  const now = Date.now();
  const payload = b64url(enc.encode(JSON.stringify({ name, iat: now, exp: now + days * 86400_000 } satisfies Session)));
  return `${payload}.${await hmac(payload)}`;
}
export async function verifySessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if ((await hmac(payload)) !== sig) return null;
  try {
    const s = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Session;
    return s.exp > Date.now() ? s : null;
  } catch { return null; }
}
export const passwordRequired = () => !!process.env.APP_PASSWORD;
/** 허용 계정 목록(LOGIN_ALLOWED_IDS, 콤마 구분). 비어 있으면 아무 이름이나 허용 */
export const allowedIds = () => (process.env.LOGIN_ALLOWED_IDS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
export const isAllowedId = (id: string) => { const list = allowedIds(); return !list.length || list.includes(id.trim().toLowerCase()); };
export const displayName = (id: string) => (id.includes("@") ? id.split("@")[0] : id);

/** 서버 컴포넌트에서 현재 사용자 */
export async function currentUser(): Promise<Session | null> {
  const { cookies } = await import("next/headers");
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
