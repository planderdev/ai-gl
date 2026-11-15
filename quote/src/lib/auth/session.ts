/**
 * 서명 쿠키 세션. 비밀번호는 LOGIN_ACCOUNTS 의 개별 계정이거나 APP_PASSWORD 가 설정된 경우에만 검사한다(둘 다 없으면 이름만으로 로그인).
 * 서명 키: AUTH_SECRET → CRAWLER_API_KEY → 개발용 기본값. Web Crypto 만 사용해 proxy(엣지/노드 공용)에서도 검증 가능.
 */
export const SESSION_COOKIE = "aigl_session";
const enc = new TextEncoder();
const secret = () => process.env.AUTH_SECRET || process.env.CRAWLER_API_KEY || "aigl-dev-secret";
const b64url = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string): Uint8Array<ArrayBuffer> => { const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };

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
/**
 * 개별 비밀번호 계정(LOGIN_ACCOUNTS, "아이디:해시" 콤마 구분). 이 계정은 APP_PASSWORD 대신 자기 비밀번호로 로그인한다.
 * 해시는 `npm run -s hash-password -- <아이디>` 로 만든다(평문 비밀번호는 환경변수에 넣지 않는다)
 */
const accounts = () => new Map(
  (process.env.LOGIN_ACCOUNTS ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    .map((s) => { const i = s.indexOf(":"); return [s.slice(0, i).trim().toLowerCase(), s.slice(i + 1).trim()] as const; })
    .filter(([id, hash]) => id && hash),
);
/** 로그인 화면에 비밀번호 칸을 보여줄지 */
export const passwordRequired = () => !!process.env.APP_PASSWORD || accounts().size > 0;
/** 허용 계정 목록(LOGIN_ALLOWED_IDS + LOGIN_ACCOUNTS 의 아이디). 비어 있으면 아무 이름이나 허용 */
export const allowedIds = () => [...new Set([...(process.env.LOGIN_ALLOWED_IDS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean), ...accounts().keys()])];
export const isAllowedId = (id: string) => { const list = allowedIds(); return !list.length || list.includes(id.trim().toLowerCase()); };

const PBKDF2_ITERATIONS = 210_000;
async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}
/** "pbkdf2$반복횟수$솔트$해시"(base64url) */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64url(salt)}$${b64url(await pbkdf2(password, salt, PBKDF2_ITERATIONS))}`;
}
async function verifyPassword(password: string, stored: string) {
  const [alg, it, salt, hash] = stored.split("$");
  const iterations = Number(it);
  if (alg !== "pbkdf2" || !salt || !hash || !Number.isInteger(iterations) || iterations < 1) return false;
  const got = b64url(await pbkdf2(password, fromB64url(salt), iterations));
  let diff = got.length ^ hash.length;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i % hash.length);
  return diff === 0;
}
/** 비밀번호 확인. 개별 계정은 자기 해시로, 나머지는 APP_PASSWORD(미설정이면 통과)로 검사한다 */
export async function checkPassword(id: string, password: string): Promise<boolean> {
  const stored = accounts().get(id.trim().toLowerCase());
  if (stored) return verifyPassword(password, stored);
  return !process.env.APP_PASSWORD || password === process.env.APP_PASSWORD;
}
export const displayName = (id: string) => (id.includes("@") ? id.split("@")[0] : id);

/** 서버 컴포넌트에서 현재 사용자 */
export async function currentUser(): Promise<Session | null> {
  const { cookies } = await import("next/headers");
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
