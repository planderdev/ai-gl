import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * 접근 보호: 로그인 세션 쿠키가 있어야 화면·API 를 쓸 수 있다. 크롤러는 x-api-key(=CRAWLER_API_KEY).
 * 로그인 페이지(/login)와 인증 API 는 열려 있다. 세션이 없으면 화면은 /login 으로, API 는 401.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) return NextResponse.next();
  const apiKey = process.env.CRAWLER_API_KEY;
  const given = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (given && (apiKey ? given === apiKey : process.env.NODE_ENV !== "production")) return NextResponse.next(); // 로컬(키 미설정)은 헤더만 있으면 통과
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) { const res = NextResponse.next(); res.headers.set("x-user", encodeURIComponent(session.name)); return res; }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/login"; url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
