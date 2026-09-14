<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';

$pageTitle = '관리자 로그인';
$bodyClass = 'admin-login-body';

$pageCss = [
    'login.css',
];

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
?>

<main class="admin-login">
    <div class="admin-login__bg"></div>

    <section class="admin-login__panel">
        <div class="admin-login__brand">
            <a href="/" class="admin-login__brand-link">
                <span class="admin-login__brand-mark">C</span>
                <span class="admin-login__brand-text">캐디스 ADMIN</span>
            </a>
            <p class="admin-login__brand-desc">
                상품, 이벤트, 예약 운영을 위한 관리자 페이지입니다.
            </p>
        </div>

        <div class="admin-login-card">
            <div class="admin-login-card__head">
                <h1 class="admin-login-card__title">로그인</h1>
                <p class="admin-login-card__desc">관리자 계정 정보를 입력해 주세요.</p>
            </div>

            <form action="<?= e(admin_url('index.php')) ?>" method="get" class="admin-login-form">
                <div class="admin-field">
                    <label class="admin-label" for="adminId">아이디</label>
                    <input
                        type="text"
                        id="adminId"
                        name="admin_id"
                        class="admin-input admin-input--lg"
                        placeholder="아이디를 입력하세요"
                    >
                </div>

                <div class="admin-field">
                    <label class="admin-label" for="adminPassword">비밀번호</label>
                    <input
                        type="password"
                        id="adminPassword"
                        name="admin_password"
                        class="admin-input admin-input--lg"
                        placeholder="비밀번호를 입력하세요"
                    >
                </div>

                <label class="admin-login-form__check">
                    <input type="checkbox" name="remember" value="1">
                    <span>로그인 상태 유지</span>
                </label>

                <button type="submit" class="admin-btn admin-btn--primary admin-btn--xl admin-btn--block">
                    로그인
                </button>
            </form>

            <div class="admin-login-card__foot">
                <p class="admin-login-card__help">
                    데모 단계에서는 로그인 버튼 클릭 시 대시보드로 이동합니다.
                </p>
            </div>
        </div>
    </section>
</main>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>