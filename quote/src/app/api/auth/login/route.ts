import { NextResponse } from "next/server";
import { allowedIds, checkPassword, createSessionToken, isAllowedId, passwordRequired, SESSION_COOKIE } from "@/lib/auth/session";

/** POST { name, password?, remember? } → 세션 쿠키. 개별 계정(LOGIN_ACCOUNTS)은 자기 비밀번호, 나머지는 APP_PASSWORD(미설정이면 이름만으로 로그인) */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; password?: string; remember?: boolean };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "아이디를 입력하세요" }, { status: 422 });
  if (!isAllowedId(name)) return NextResponse.json({ error: "허용되지 않은 계정입니다. 관리자에게 계정 등록을 요청하세요." }, { status: 403 });
  if (!(await checkPassword(name, typeof body.password === "string" ? body.password : ""))) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
  const days = body.remember ? 30 : 1;
  const token = await createSessionToken(name.slice(0, 40), days);
  const res = NextResponse.json({ ok: true, name });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: days * 86400 });
  return res;
}
export async function GET() { return NextResponse.json({ passwordRequired: passwordRequired(), restricted: allowedIds().length > 0 }); }
