<?php
if (!defined('ADMIN_BASE_PATH')) {
    define('ADMIN_BASE_PATH', '/admin');
}

if (!function_exists('admin_url')) {
    function admin_url(string $path = ''): string
    {
        $path = ltrim($path, '/');
        return ADMIN_BASE_PATH . ($path ? '/' . $path : '');
    }
}

if (!function_exists('asset_url')) {
    function asset_url(string $path = ''): string
    {
        $path = ltrim($path, '/');
        return ADMIN_BASE_PATH . '/assets/' . $path;
    }
}

if (!function_exists('e')) {
    function e($value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('is_current_admin_path')) {
    function is_current_admin_path(string $matchPath): bool
    {
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        return strpos($requestUri, $matchPath) !== false;
    }
}

if (!function_exists('array_get')) {
    function array_get(array $array, string $key, $default = null)
    {
        return $array[$key] ?? $default;
    }
}


function admin_booking_status_label($status)
{
    return match ($status) {
        'pending' => '결제대기',
        'paid' => '결제완료',
        'confirmed' => '예약확정',
        'cancelled' => '취소',
        default => '기타',
    };
}

function admin_booking_status_class($status)
{
    return match ($status) {
        'pending' => 'status--warning',
        'paid' => 'status--info',
        'confirmed' => 'status--success',
        'cancelled' => 'status--danger',
        default => '',
    };
}


if (!function_exists('admin_booking_status_label')) {
    function admin_booking_status_label($status)
    {
        return match ($status) {
            'pending' => '결제대기',
            'paid' => '결제완료',
            'confirmed' => '예약확정',
            'cancelled' => '취소',
            default => '기타',
        };
    }
}