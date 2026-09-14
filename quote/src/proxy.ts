import { NextResponse, type NextRequest } from "next/server";

/**
 * 간단한 접근 보호: APP_PASSWORD 가 설정되면 모든 화면·API 에 HTTP Basic 인증을 요구한다.
 * 크롤러는 x-api-key(=CRAWLER_API_KEY) 로 통과. 로컬(미설정)에서는 동작하지 않음.
 */
export function proxy(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();
  const apiKey = process.env.CRAWLER_API_KEY;
  const given = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (apiKey && given === apiKey) return NextResponse.next();
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Basic ")) {
    try {
      const [, pw] = atob(auth.slice(6)).split(":");
      if (pw === password) return NextResponse.next();
    } catch { /* fallthrough */ }
  }
  return new NextResponse("인증이 필요합니다", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="ai-gl", charset="UTF-8"' } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
