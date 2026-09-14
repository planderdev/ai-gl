<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/setting/setting-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-header.php';

$pageTitle = '기본 설정';
$currentAdminTitle = '설정';

$pageCss = [
    'setting.css',
];

$pageJs = [
    'setting.js',
];

$settings = admin_get_settings();

$siteStatus = (string) ($settings['site_status'] ?? 'open');
$currency = (string) ($settings['default_currency'] ?? 'KRW');

$statusLabel = match ($siteStatus) {
    'maintenance' => '점검중',
    'private' => '비공개',
    default => '정상 운영',
};

$statusClass = match ($siteStatus) {
    'maintenance' => 'is-warning',
    'private' => 'is-danger',
    default => 'is-success',
};

$currencyLabel = match ($currency) {
    'JPY' => '엔화',
    'USD' => '달러',
    default => '원화',
};

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content setting-page">
            <?php
            admin_render_setting_header([
                'title' => '기본 설정',
                'desc' => '사이트 운영에 필요한 기본 정보, 연락처, 푸터, SEO 기본값을 정리합니다.',
                'chip' => 'SETTINGS MANAGER',
                'active' => 'general',
                'meta_cards' => [
                    ['label' => '사이트 상태', 'value' => $statusLabel, 'class' => $statusClass],
                    ['label' => '기본 통화', 'value' => $currencyLabel],
                ],
            ]);
            ?>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-toast.php'; ?>

            <form action="<?= e(admin_url('actions/setting-save.php')) ?>" method="post" class="setting-form">
                <input type="hidden" name="settings_tab" value="general">

                <div class="setting-layout">
                    <div class="setting-main">
                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>사이트 기본 정보</h3>
                                    <p>브랜드명, 기본 통화, 소개 문구를 설정합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-global-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">사이트명</label>
                                        <input type="text" name="site_name" class="admin-input" value="<?= e($settings['site_name'] ?? '') ?>" placeholder="예: CADDIS GOLF">
                                        <p class="setting-help">헤더, 브라우저 제목, 일부 공통 영역에 사용됩니다.</p>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">기본 통화</label>
                                        <select name="default_currency" class="admin-select">
                                            <option value="KRW" <?= $currency === 'KRW' ? 'selected' : '' ?>>KRW</option>
                                            <option value="JPY" <?= $currency === 'JPY' ? 'selected' : '' ?>>JPY</option>
                                            <option value="USD" <?= $currency === 'USD' ? 'selected' : '' ?>>USD</option>
                                        </select>
                                        <p class="setting-help">상품 가격/예약 기준 표시 통화의 기본값입니다.</p>
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">사이트 설명</label>
                                        <textarea name="site_description" class="admin-textarea" rows="4" placeholder="브랜드 소개나 서비스 핵심 설명을 입력하세요."><?= e($settings['site_description'] ?? '') ?></textarea>
                                        <p class="setting-help">사이트 소개, 공유 설명, 운영자 내부 기준 문구로 활용하기 좋습니다.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>운영 연락처</h3>
                                    <p>고객 문의 및 예약 안내에 노출할 연락 수단을 관리합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-customer-service-2-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">관리자 이메일</label>
                                        <input type="email" name="admin_email" class="admin-input" value="<?= e($settings['admin_email'] ?? '') ?>" placeholder="admin@example.com">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">대표 연락처</label>
                                        <input type="text" name="contact_phone" class="admin-input" value="<?= e($settings['contact_phone'] ?? '') ?>" placeholder="예: 02-1234-5678">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">카카오 채널</label>
                                        <input type="text" name="contact_kakao" class="admin-input" value="<?= e($settings['contact_kakao'] ?? '') ?>" placeholder="@채널명 또는 링크">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">예약 안내 문구</label>
                                        <textarea name="booking_notice" class="admin-textarea" rows="4" placeholder="예약 접수/상담/확정 관련 기본 안내 문구를 입력하세요."><?= e($settings['booking_notice'] ?? '') ?></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>푸터 정보</h3>
                                    <p>회사 정보와 사업자 관련 기본값을 관리합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-building-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">회사명</label>
                                        <input type="text" name="footer_company" class="admin-input" value="<?= e($settings['footer_company'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">대표자명</label>
                                        <input type="text" name="footer_ceo" class="admin-input" value="<?= e($settings['footer_ceo'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">사업자번호</label>
                                        <input type="text" name="footer_business_number" class="admin-input" value="<?= e($settings['footer_business_number'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">주소</label>
                                        <input type="text" name="footer_address" class="admin-input" value="<?= e($settings['footer_address'] ?? '') ?>">
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>기본 SEO</h3>
                                    <p>공통 메타 제목과 설명의 기본값을 세팅합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-search-eye-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">기본 SEO 제목</label>
                                        <input type="text" name="seo_title" class="admin-input" value="<?= e($settings['seo_title'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">기본 SEO 설명</label>
                                        <textarea name="seo_description" class="admin-textarea" rows="4"><?= e($settings['seo_description'] ?? '') ?></textarea>
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">기본 SEO 키워드</label>
                                        <input type="text" name="seo_keywords" class="admin-input" value="<?= e($settings['seo_keywords'] ?? '') ?>" placeholder="쉼표로 구분">
                                        <p class="setting-help">예: 일본골프, 해외골프투어, 골프패키지</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside class="setting-side">
                        <section class="admin-card setting-side-card">
                            <div class="admin-card__head">
                                <h3>운영 상태</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-summary-list">
                                    <div class="setting-summary-item">
                                        <span class="setting-summary-item__label">사이트 상태</span>
                                        <select name="site_status" class="admin-select">
                                            <option value="open" <?= $siteStatus === 'open' ? 'selected' : '' ?>>정상 운영</option>
                                            <option value="maintenance" <?= $siteStatus === 'maintenance' ? 'selected' : '' ?>>점검중</option>
                                            <option value="private" <?= $siteStatus === 'private' ? 'selected' : '' ?>>비공개</option>
                                        </select>
                                    </div>

                                    <div class="setting-side-note">
                                        <i class="ri-information-line"></i>
                                        <p>기본 설정은 사이트 전반에 영향을 줍니다. 상태 변경 전 노출 영역을 함께 확인하세요.</p>
                                    </div>

                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        기본 설정 저장
                                    </button>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>