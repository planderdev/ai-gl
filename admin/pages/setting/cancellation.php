<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/setting/setting-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-header.php';

$pageTitle = '취소/환불 설정';
$currentAdminTitle = '설정';

$pageCss = [
    'setting.css',
];

$pageJs = [
    'setting.js',
];

$settings = admin_get_settings();

$cancelPolicyType = (string) ($settings['cancel_policy_type'] ?? 'standard');

$cancelPolicyLabel = match ($cancelPolicyType) {
    'flexible' => '유연',
    'strict' => '엄격',
    'non_refundable' => '환불불가',
    default => '일반',
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
                'title' => '취소/환불 설정',
                'desc' => '무료 취소, 기본 수수료, 예외 규정을 나눠서 더 읽기 쉽게 관리할 수 있습니다.',
                'chip' => 'POLICY MANAGER',
                'active' => 'cancellation',
                'meta_cards' => [
                    ['label' => '현재 정책 유형', 'value' => $cancelPolicyLabel],
                ],
            ]);
            ?>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-toast.php'; ?>

            <form action="<?= e(admin_url('actions/setting-save.php')) ?>" method="post" class="setting-form">
                <input type="hidden" name="settings_tab" value="cancellation">

                <div class="setting-layout">
                    <div class="setting-main">
                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>기본 취소 정책</h3>
                                    <p>취소 정책 유형과 무료 취소 기준을 설정합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-file-warning-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">취소 정책 유형</label>
                                        <select name="cancel_policy_type" class="admin-select">
                                            <option value="flexible" <?= $cancelPolicyType === 'flexible' ? 'selected' : '' ?>>유연</option>
                                            <option value="standard" <?= $cancelPolicyType === 'standard' ? 'selected' : '' ?>>일반</option>
                                            <option value="strict" <?= $cancelPolicyType === 'strict' ? 'selected' : '' ?>>엄격</option>
                                            <option value="non_refundable" <?= $cancelPolicyType === 'non_refundable' ? 'selected' : '' ?>>환불불가</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">무료 취소 가능 일수</label>
                                        <input type="number" name="cancel_free_days" class="admin-input" value="<?= e((string) ($settings['cancel_free_days'] ?? '')) ?>" placeholder="예: 7">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">기본 취소 수수료율(%)</label>
                                        <input type="number" name="cancel_fee_percent" class="admin-input" value="<?= e((string) ($settings['cancel_fee_percent'] ?? '')) ?>" placeholder="예: 30">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">환불 기본 안내 문구</label>
                                        <textarea name="refund_notice" class="admin-textarea" rows="5" placeholder="환불 처리 기준과 안내 문구를 입력하세요."><?= e($settings['refund_notice'] ?? '') ?></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>예외 규정</h3>
                                    <p>노쇼, 기상 이슈, 추가 고지 문구를 분리해서 정리합니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-alert-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">노쇼 규정</label>
                                        <textarea name="noshow_policy" class="admin-textarea" rows="5" placeholder="노쇼 발생 시 취급 기준과 환불 여부를 입력하세요."><?= e($settings['noshow_policy'] ?? '') ?></textarea>
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">우천 / 기상 규정</label>
                                        <textarea name="weather_policy" class="admin-textarea" rows="5" placeholder="우천, 천재지변, 현지 사정 발생 시 규정을 입력하세요."><?= e($settings['weather_policy'] ?? '') ?></textarea>
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">추가 안내 문구</label>
                                        <textarea name="cancellation_extra_notice" class="admin-textarea" rows="5" placeholder="상품별 추가 고지에 쓰일 기본 문구를 입력하세요."><?= e($settings['cancellation_extra_notice'] ?? '') ?></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside class="setting-side">
                        <section class="admin-card setting-side-card">
                            <div class="admin-card__head">
                                <h3>저장 전 확인</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-summary-list">
                                    <div class="setting-side-note">
                                        <i class="ri-shield-check-line"></i>
                                        <p>취소 정책은 상품 상세와 예약 확정 안내에 함께 반영될 수 있으니 문구 일관성을 맞추는 게 좋습니다.</p>
                                    </div>

                                    <div class="setting-summary-item is-inline">
                                        <span class="setting-summary-item__label">정책 유형</span>
                                        <span class="setting-pill"><?= e($cancelPolicyLabel) ?></span>
                                    </div>

                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        취소/환불 설정 저장
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