import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

const clear = (req: Request) => { const res = NextResponse.redirect(new URL("/login", req.url), 303); res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 }); return res; };
export async function GET(req: Request) { return clear(req); }
export async function POST(req: Request) { return clear(req); }
