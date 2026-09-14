<?php
$currentAdminTitle = $currentAdminTitle ?? '관리자';
?>
<header class="admin-header" id="adminHeader">
    <div class="admin-header__left">
        <button
            type="button"
            class="admin-header__menu-btn js-admin-sidebar-toggle"
            aria-label="사이드바 토글"
            aria-controls="adminSidebar"
            aria-expanded="false"
        >
            <i class="ri-menu-line"></i>
        </button>

        <a href="<?= e(admin_url('index.php')) ?>" class="admin-header__brand">
            <span class="admin-header__brand-mark">C</span>
            <span class="admin-header__brand-text">캐디스 Admin</span>
        </a>
    </div>

    <div class="admin-header__right">
        <div class="admin-header__page-title"><?= e($currentAdminTitle) ?></div>

        <div class="admin-header__user admin-user-menu js-admin-user-menu">
            <button
                type="button"
                class="admin-user-chip admin-user-chip--trigger js-admin-user-menu-trigger"
                aria-label="관리자 메뉴"
                aria-haspopup="menu"
                aria-expanded="false"
            >
                <span class="admin-user-chip__avatar">관</span>
                <span class="admin-user-chip__text">관리자</span>
                <i class="ri-arrow-down-s-line admin-user-chip__arrow"></i>
            </button>

            <div class="admin-user-dropdown js-admin-user-menu-dropdown" role="menu">
                <div class="admin-user-dropdown__head">
                    <strong class="admin-user-dropdown__name">관리자</strong>
                    <p class="admin-user-dropdown__role">Super Admin</p>
                </div>

                <div class="admin-user-dropdown__menu">
                    <a href="<?= e(admin_url('pages/setting/general.php')) ?>" class="admin-user-dropdown__item" role="menuitem">
                        <i class="ri-settings-3-line"></i>
                        <span>기본 설정</span>
                    </a>

                    <a href="<?= e(admin_url('pages/setting/payment.php')) ?>" class="admin-user-dropdown__item" role="menuitem">
                        <i class="ri-bank-card-line"></i>
                        <span>결제 설정</span>
                    </a>

                    <a href="<?= e(admin_url('pages/setting/api.php')) ?>" class="admin-user-dropdown__item" role="menuitem">
                        <i class="ri-key-2-line"></i>
                        <span>API 설정</span>
                    </a>

                    <a href="<?= e(admin_url('login.php')) ?>" class="admin-user-dropdown__item admin-user-dropdown__item--danger" role="menuitem">
                        <i class="ri-logout-box-r-line"></i>
                        <span>로그아웃</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>