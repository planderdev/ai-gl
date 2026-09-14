<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/setting/setting-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-header.php';

$pageTitle = 'API 설정';
$currentAdminTitle = '설정';

$pageCss = [
    'setting.css',
];

$pageJs = [
    'setting.js',
];

$settings = admin_get_settings();

$apiMode = (string) ($settings['api_mode'] ?? 'test');

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content setting-page">
            <?php
            admin_render_setting_header([
                'title' => 'API 설정',
                'desc' => '지도, 카카오, 메일, 문자, 외부 연동 키를 한 화면 흐름 안에서 관리하도록 정리했습니다.',
                'chip' => 'INTEGRATION MANAGER',
                'active' => 'api',
                'meta_cards' => [
                    [
                        'label' => '현재 모드',
                        'value' => $apiMode === 'live' ? '운영' : '테스트',
                        'class' => $apiMode === 'live' ? 'is-danger' : 'is-warning',
                    ],
                ],
            ]);
            ?>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/setting-toast.php'; ?>

            <form action="<?= e(admin_url('actions/setting-save.php')) ?>" method="post" class="setting-form">
                <input type="hidden" name="settings_tab" value="api">

                <div class="setting-layout">
                    <div class="setting-main">
                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>운영 모드</h3>
                                    <p>테스트와 운영을 구분해서 키를 관리하세요.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-radar-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-mode-switch">
                                    <label class="setting-mode-option <?= $apiMode === 'test' ? 'is-active' : '' ?>">
                                        <input type="radio" name="api_mode" value="test" <?= $apiMode === 'test' ? 'checked' : '' ?>>
                                        <span>
                                            <strong>테스트</strong>
                                            <small>개발 및 검수용 환경</small>
                                        </span>
                                    </label>

                                    <label class="setting-mode-option <?= $apiMode === 'live' ? 'is-active' : '' ?>">
                                        <input type="radio" name="api_mode" value="live" <?= $apiMode === 'live' ? 'checked' : '' ?>>
                                        <span>
                                            <strong>운영</strong>
                                            <small>실서비스 연결 환경</small>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>지도 API</h3>
                                    <p>지도/위치 기반 기능에 사용하는 키입니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-map-pin-2-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">Google Maps API Key</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="google_maps_api_key" class="admin-input" value="<?= e($settings['google_maps_api_key'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">Naver Map Client ID</label>
                                        <input type="text" name="naver_map_client_id" class="admin-input" value="<?= e($settings['naver_map_client_id'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">Naver Map Client Secret</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="naver_map_client_secret" class="admin-input" value="<?= e($settings['naver_map_client_secret'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>카카오 API</h3>
                                    <p>공유, 로그인, 지도 연동 등에 사용할 수 있는 키입니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-chat-3-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">Kakao JavaScript Key</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="kakao_javascript_key" class="admin-input" value="<?= e($settings['kakao_javascript_key'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">Kakao REST API Key</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="kakao_rest_api_key" class="admin-input" value="<?= e($settings['kakao_rest_api_key'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>메일 발송 설정</h3>
                                    <p>SMTP 발송 연동에 필요한 정보입니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-mail-send-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">SMTP Host</label>
                                        <input type="text" name="smtp_host" class="admin-input" value="<?= e($settings['smtp_host'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">SMTP Port</label>
                                        <input type="text" name="smtp_port" class="admin-input" value="<?= e($settings['smtp_port'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">SMTP Username</label>
                                        <input type="text" name="smtp_username" class="admin-input" value="<?= e($settings['smtp_username'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">SMTP Password</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="smtp_password" class="admin-input" value="<?= e($settings['smtp_password'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card setting-section">
                            <div class="admin-card__head setting-section__head">
                                <div>
                                    <h3>문자 / 외부 연동</h3>
                                    <p>메시지 발송 및 외부 예약 시스템 연동값입니다.</p>
                                </div>
                                <div class="setting-section__icon">
                                    <i class="ri-links-line"></i>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="setting-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">SMS Provider</label>
                                        <select name="sms_provider" class="admin-select">
                                            <option value="none" <?= ($settings['sms_provider'] ?? '') === 'none' ? 'selected' : '' ?>>사용 안함</option>
                                            <option value="solapi" <?= ($settings['sms_provider'] ?? '') === 'solapi' ? 'selected' : '' ?>>Solapi</option>
                                            <option value="alimtalk" <?= ($settings['sms_provider'] ?? '') === 'alimtalk' ? 'selected' : '' ?>>알림톡</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">SMS API Key</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="sms_api_key" class="admin-input" value="<?= e($settings['sms_api_key'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">SMS API Secret</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="sms_api_secret" class="admin-input" value="<?= e($settings['sms_api_secret'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="admin-field admin-field--full">
                                        <label class="admin-label">외부 예약 연동 토큰</label>
                                        <div class="setting-secret-input">
                                            <input type="password" name="external_booking_token" class="admin-input" value="<?= e($settings['external_booking_token'] ?? '') ?>">
                                            <button type="button" class="setting-secret-toggle" data-toggle-secret>
                                                <i class="ri-eye-line"></i>
                                            </button>
                                        </div>
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
                                        <i class="ri-alarm-warning-line"></i>
                                        <p>운영 모드에서는 실제 발송/실제 결제가 연결될 수 있으니 키와 콜백 설정을 함께 점검하세요.</p>
                                    </div>

                                    <div class="setting-summary-item is-inline">
                                        <span class="setting-summary-item__label">연결 모드</span>
                                        <span class="setting-pill <?= $apiMode === 'live' ? 'is-danger' : '' ?>">
                                            <?= $apiMode === 'live' ? '운영' : '테스트' ?>
                                        </span>
                                    </div>

                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        API 설정 저장
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