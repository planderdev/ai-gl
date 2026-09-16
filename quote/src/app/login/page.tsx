import LoginForm from "@/components/LoginForm";
import { allowedIds, passwordRequired } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";
  return (
    <main className="admin-login">
      <div className="admin-login__bg" />
      <section className="admin-login__panel">
        <div className="admin-login__brand">
          <span className="admin-login__brand-link"><span className="admin-login__brand-mark">A</span><span className="admin-login__brand-text">AIGL 대시보드</span></span>
          <p className="admin-login__brand-desc">상품, 이벤트, 예약 운영과 골프투어 원가표 견적을 위한 관리자 페이지입니다.</p>
        </div>
        <div className="admin-login-card">
          <div className="admin-login-card__head"><h1 className="admin-login-card__title">로그인</h1><p className="admin-login-card__desc">{passwordRequired() ? "관리자 계정 정보를 입력해 주세요." : allowedIds().length ? "등록된 관리자 이메일을 입력하면 로그인됩니다." : "이름(아이디)만 입력하면 로그인됩니다."}</p></div>
          <LoginForm next={next} passwordRequired={passwordRequired()} />
          <div className="admin-login-card__foot"><p className="admin-login-card__help">{passwordRequired() ? "비밀번호는 서버 환경변수 APP_PASSWORD 로 관리됩니다." : allowedIds().length ? "허용 계정은 서버 환경변수 LOGIN_ALLOWED_IDS(콤마 구분)로 관리됩니다. 비밀번호 확인을 켜려면 APP_PASSWORD 를 설정하세요." : "비밀번호 확인을 켜려면 서버 환경변수 APP_PASSWORD 를 설정하세요. 입력한 이름은 작업 기록에 표시됩니다."}</p></div>
        </div>
      </section>
    </main>
  );
}
