<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/setting/setting-storage.php';

if (!function_exists('setting_redirect')) {
    function setting_redirect(string $url): void
    {
        header('Location: ' . $url);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    setting_redirect(
        admin_url('pages/setting/general.php?status=error&message=' . urlencode('잘못된 요청입니다.'))
    );
}

$tab = trim((string) ($_POST['settings_tab'] ?? 'general'));

$redirectMap = [
    'general' => admin_url('pages/setting/general.php'),
    'payment' => admin_url('pages/setting/payment.php'),
    'cancellation' => admin_url('pages/setting/cancellation.php'),
    'api' => admin_url('pages/setting/api.php'),
];

$redirectUrl = $redirectMap[$tab] ?? $redirectMap['general'];

$settings = admin_get_settings();
if (!is_array($settings)) {
    $settings = [];
}

function setting_post_value(string $key, string $default = ''): string
{
    return isset($_POST[$key]) ? trim((string) $_POST[$key]) : $default;
}

$fields = [
    'site_name',
    'site_description',
    'default_currency',
    'admin_email',
    'contact_phone',
    'contact_kakao',
    'booking_notice',
    'footer_company',
    'footer_ceo',
    'footer_business_number',
    'footer_address',
    'seo_title',
    'seo_description',
    'seo_keywords',
    'site_status',

    'bank_name',
    'bank_holder',
    'bank_account',
    'deposit_policy_type',
    'deposit_amount',
    'deposit_percent',
    'payment_notice',

    'cancel_policy_type',
    'cancel_free_days',
    'cancel_fee_percent',
    'refund_notice',
    'noshow_policy',
    'weather_policy',
    'cancellation_extra_notice',

    'api_mode',
    'google_maps_api_key',
    'naver_map_client_id',
    'naver_map_client_secret',
    'kakao_javascript_key',
    'kakao_rest_api_key',
    'smtp_host',
    'smtp_port',
    'smtp_username',
    'smtp_password',
    'sms_provider',
    'sms_api_key',
    'sms_api_secret',
    'external_booking_token',
];

foreach ($fields as $field) {
    if (isset($_POST[$field])) {
        $settings[$field] = setting_post_value($field);
    }
}

$checkboxFields = [
    'payment_card_enabled',
    'payment_bank_enabled',
    'payment_onsite_enabled',
    'payment_partial_enabled',
];

foreach ($checkboxFields as $field) {
    $settings[$field] = isset($_POST[$field]) ? 1 : 0;
}

$settings['default_currency'] = in_array(($settings['default_currency'] ?? 'KRW'), ['KRW', 'JPY', 'USD'], true)
    ? $settings['default_currency']
    : 'KRW';

$settings['site_status'] = in_array(($settings['site_status'] ?? 'open'), ['open', 'maintenance', 'private'], true)
    ? $settings['site_status']
    : 'open';

$settings['deposit_policy_type'] = in_array(($settings['deposit_policy_type'] ?? 'fixed'), ['fixed', 'percent', 'none'], true)
    ? $settings['deposit_policy_type']
    : 'fixed';

$settings['cancel_policy_type'] = in_array(($settings['cancel_policy_type'] ?? 'standard'), ['flexible', 'standard', 'strict', 'non_refundable'], true)
    ? $settings['cancel_policy_type']
    : 'standard';

$settings['api_mode'] = in_array(($settings['api_mode'] ?? 'test'), ['test', 'live'], true)
    ? $settings['api_mode']
    : 'test';

$settings['sms_provider'] = in_array(($settings['sms_provider'] ?? 'none'), ['none', 'solapi', 'alimtalk'], true)
    ? $settings['sms_provider']
    : 'none';

$numericFields = [
    'deposit_amount',
    'deposit_percent',
    'cancel_free_days',
    'cancel_fee_percent',
    'smtp_port',
];

foreach ($numericFields as $field) {
    if (!isset($settings[$field])) {
        continue;
    }

    $rawValue = trim((string) $settings[$field]);

    if ($rawValue === '') {
        $settings[$field] = '';
        continue;
    }

    $sanitized = preg_replace('/[^0-9]/', '', $rawValue);
    $settings[$field] = $sanitized === '' ? '' : $sanitized;
}

if (($settings['deposit_policy_type'] ?? 'fixed') === 'none') {
    $settings['deposit_amount'] = '';
    $settings['deposit_percent'] = '';
}

if (($settings['deposit_policy_type'] ?? 'fixed') === 'fixed') {
    $settings['deposit_percent'] = '';
}

if (($settings['deposit_policy_type'] ?? 'fixed') === 'percent') {
    $settings['deposit_amount'] = '';
}

if (empty($settings['payment_bank_enabled'])) {
    $settings['bank_name'] = '';
    $settings['bank_holder'] = '';
    $settings['bank_account'] = '';
}

if (($settings['sms_provider'] ?? 'none') === 'none') {
    $settings['sms_api_key'] = '';
    $settings['sms_api_secret'] = '';
}

$saveResult = admin_save_settings($settings);

if ($saveResult) {
    setting_redirect(
        $redirectUrl . '?status=success&message=' . urlencode('설정이 저장되었습니다.')
    );
}

setting_redirect(
    $redirectUrl . '?status=error&message=' . urlencode('저장 중 문제가 발생했습니다. 다시 시도해 주세요.')
);