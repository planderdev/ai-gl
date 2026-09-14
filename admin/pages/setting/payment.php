<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/setting/setting-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-header.php';

$pageTitle = '결제 설정';
$currentAdminTitle = '설정';

$pageCss = [
    'setting.css',
];

$pageJs = [
    'setting.js',
];

$settings = admin_get_settings();

$enabledMethods = 0;
$enabledMethods += !empty($settings['payment_card_enabled']) ? 1 : 0;
$enabledMethods += !empty($settings['payment_bank_enabled']) ? 1 : 0;
$enabledMethods += !empty($settings['payment_onsite_enabled']) ? 1 : 0;
$enabledMethods += !empty($settings['payment_partial_enabled']) ? 1 : 0;

$depositType = (string) ($settings['deposit_policy_type'] ?? 'fixed');

$depositTypeLabel = match ($depositType) {
    'percent' => '비율',
    'none' => '사용 안함',
    default => '고정 금액',
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
                'title' => '결제 설정',
                'desc' => '결제 수단, 계좌 정보, 예약금 정책을 더 명확하게 관리할 수 있도록 구성했습니다.',
                'chip' => 'PAYMENT MANAGER',
                'active' => 'payment',
                'meta_cards' => [
                    ['label' => '활성 수단', 'value' => number_format($enabledMethods) . '개'],
                    ['label' => '예약금 방식', 'value' => $depositTypeLabel],
                ],
            ]);
            ?>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-toast.php'; ?>

            <form action="<?= e(admin_url('actions/setting-save.php')) ?>" method="post" class="setting-form">
                <input type="hidden" name="settings_tab" value="payment">

                <div class="setting-layout">
                    <div class="setting-main">
                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>결제 수단 사용 여부</h3>
                                    <p>예약 화면에 노출할 결제 방식을 켜고 끕니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-bank-card-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-toggle-grid">
                                    <label class="setting-toggle-card">
                                        <input type="checkbox" name="payment_card_enabled" value="1" <?= !empty($settings['payment_card_enabled']) ? 'checked' : '' ?>>
                                        <span class="setting-toggle-card__box">
                                            <span class="setting-toggle-card__icon"><i class="ri-bank-card-line"></i></span>
                                            <span class="setting-toggle-card__content">
                                                <strong>카드결제</strong>
                                                <small>일반 온라인 카드 결제</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label class="setting-toggle-card">
                                        <input type="checkbox" name="payment_bank_enabled" value="1" <?= !empty($settings['payment_bank_enabled']) ? 'checked' : '' ?> data-setting-toggle="bank">
                                        <span class="setting-toggle-card__box">
                                            <span class="setting-toggle-card__icon"><i class="ri-bank-line"></i></span>
                                            <span class="setting-toggle-card__content">
                                                <strong>무통장입금</strong>
                                                <small>계좌 정보 입력 후 입금 유도</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label class="setting-toggle-card">
                                        <input type="checkbox" name="payment_onsite_enabled" value="1" <?= !empty($settings['payment_onsite_enabled']) ? 'checked' : '' ?>>
                                        <span class="setting-toggle-card__box">
                                            <span class="setting-toggle-card__icon"><i class="ri-cash-line"></i></span>
                                            <span class="setting-toggle-card__content">
                                                <strong>현장결제</strong>
                                                <small>체크인/현장 접수 시 결제</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label class="setting-toggle-card">
                                        <input type="checkbox" name="payment_partial_enabled" value="1" <?= !empty($settings['payment_partial_enabled']) ? 'checked' : '' ?>>
                                        <span class="setting-toggle-card__box">
                                            <span class="setting-toggle-card__icon"><i class="ri-wallet-3-line"></i></span>
                                            <span class="setting-toggle-card__content">
                                                <strong>부분결제</strong>
                                                <small>예약금/잔금 분리 결제</small>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section" data-setting-panel="bank">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>무통장입금 계좌 정보</h3>
                                    <p>무통장입금을 사용하는 경우에만 실제로 노출되는 정보입니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-secure-payment-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">은행명</label>
                                        <input type="text" name="bank_name" class="admin-input" value="<?= e($settings['bank_name'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">예금주</label>
                                        <input type="text" name="bank_holder" class="admin-input" value="<?= e($settings['bank_holder'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">계좌번호</label>
                                        <input type="text" name="bank_account" class="admin-input" value="<?= e($settings['bank_account'] ?? '') ?>">
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>예약금 정책</h3>
                                    <p>예약금 방식에 따라 필요한 입력값만 보이도록 구성했습니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-hand-coin-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">예약금 정책</label>
                                        <select name="deposit_policy_type" class="admin-select" data-setting-deposit-select>
                                            <option value="fixed" <?= $depositType === 'fixed' ? 'selected' : '' ?>>고정 금액</option>
                                            <option value="percent" <?= $depositType === 'percent' ? 'selected' : '' ?>>비율</option>
                                            <option value="none" <?= $depositType === 'none' ? 'selected' : '' ?>>사용 안함</option>
                                        </select>
                                    </div>

                                    <div class="admin-field" data-deposit-field="fixed">
                                        <label class="admin-label">예약금 금액</label>
                                        <input type="number" name="deposit_amount" class="admin-input" value="<?= e((string) ($settings['deposit_amount'] ?? '')) ?>" placeholder="예: 50000">
                                    </div>

                                    <div class="admin-field" data-deposit-field="percent">
                                        <label class="admin-label">예약금 비율(%)</label>
                                        <input type="number" name="deposit_percent" class="admin-input" value="<?= e((string) ($settings['deposit_percent'] ?? '')) ?>" placeholder="예: 10">
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">결제 안내 문구</label>
                                        <textarea name="payment_notice" class="admin-textarea" rows="5" placeholder="예약금/잔금/입금기한 등 기본 안내 문구를 입력하세요."><?= e($settings['payment_notice'] ?? '') ?></textarea>
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
                                        <i class="ri-lightbulb-flash-line"></i>
                                        <p>결제 수단이 많을수록 전환율은 좋아지지만, 운영 플로우도 함께 정리하는 것이 좋습니다.</p>
                                    </div>

                                    <div class="setting-summary-item is-inline">
                                        <span class="setting-summary-item__label">현재 예약금 방식</span>
                                        <span class="setting-pill"><?= e($depositTypeLabel) ?></span>
                                    </div>

                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        결제 설정 저장
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