<?php

if (!function_exists('admin_settings_json_path')) {
    function admin_settings_json_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/settings.json';
    }
}

if (!function_exists('admin_get_settings')) {
    function admin_get_settings(): array
    {
        $path = admin_settings_json_path();

        $defaults = [
            'site_name' => 'AI GOLF',
            'site_description' => '',
            'admin_email' => '',
            'contact_phone' => '',
            'contact_kakao' => '',
            'default_currency' => 'KRW',
            'site_status' => 'open',
            'booking_notice' => '',
            'footer_company' => '',
            'footer_ceo' => '',
            'footer_business_number' => '',
            'footer_address' => '',
            'seo_title' => '',
            'seo_description' => '',
            'seo_keywords' => '',
            'payment_card_enabled' => 1,
'payment_bank_enabled' => 1,
'payment_onsite_enabled' => 1,
'payment_partial_enabled' => 0,
'bank_name' => '',
'bank_account' => '',
'bank_holder' => '',
'deposit_policy_type' => 'fixed',
'deposit_amount' => '',
'deposit_percent' => '',
'payment_notice' => '',
'cancel_free_days' => '',
'cancel_fee_percent' => '',
'cancel_policy_type' => 'standard',
'refund_notice' => '',
'noshow_policy' => '',
'weather_policy' => '',
'cancellation_extra_notice' => '',
'api_mode' => 'test',
'google_maps_api_key' => '',
'naver_map_client_id' => '',
'naver_map_client_secret' => '',
'kakao_javascript_key' => '',
'kakao_rest_api_key' => '',
'smtp_host' => '',
'smtp_port' => '587',
'smtp_username' => '',
'smtp_password' => '',
'sms_provider' => 'none',
'sms_api_key' => '',
'sms_api_secret' => '',
'external_booking_token' => '',
        ];

        if (!file_exists($path)) {
            return $defaults;
        }

        $contents = file_get_contents($path);
        if ($contents === false || trim($contents) === '') {
            return $defaults;
        }

        $decoded = json_decode($contents, true);
        if (!is_array($decoded)) {
            return $defaults;
        }

        return array_merge($defaults, $decoded);
    }
}

if (!function_exists('admin_save_settings')) {
    function admin_save_settings(array $settings): bool
    {
        $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            return false;
        }

        return file_put_contents(admin_settings_json_path(), $json) !== false;
    }
}