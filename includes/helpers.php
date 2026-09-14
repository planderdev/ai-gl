<?php

if (!defined('BASE_URL')) {
    define('BASE_URL', '');
}

if (!function_exists('asset')) {
    function asset(string $path): string
    {
        return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
    }
}

if (!function_exists('url')) {
    function url(string $path = ''): string
    {
        return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
    }
}

if (!function_exists('is_logged_in')) {
    function is_logged_in(): bool
    {
        return isset($_SESSION['user']) && is_array($_SESSION['user']) && !empty($_SESSION['user']);
    }
}

if (!function_exists('get_current_user_info')) {
    function get_current_user_info(): array
    {
        if (is_logged_in()) {
            return array_merge([
                'name' => '회원',
                'grade' => 'Cadys Member',
                'email' => '',
                'phone' => '',
                'couponCount' => 0,
                'mileage' => '0P',
            ], $_SESSION['user']);
        }

        return [
            'name' => '게스트',
            'grade' => 'Cadys Guest',
            'email' => '',
            'phone' => '',
            'couponCount' => 0,
            'mileage' => '0P',
        ];
    }
}

if (!function_exists('current_path')) {
    function current_path(): string
    {
        return parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    }
}

if (!function_exists('is_current_path')) {
    function is_current_path(string $path): bool
    {
        return current_path() === $path;
    }
}

if (!function_exists('path_starts_with')) {
    function path_starts_with(string $path): bool
    {
        return str_starts_with(current_path(), $path);
    }
}