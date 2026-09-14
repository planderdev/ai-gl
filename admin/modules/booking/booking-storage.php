<?php

if (!function_exists('admin_booking_json_path')) {
    function admin_booking_json_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/bookings.json';
    }
}

if (!function_exists('admin_get_bookings')) {
    function admin_get_bookings(): array
    {
        $path = admin_booking_json_path();

        if (!file_exists($path)) return [];

        $data = file_get_contents($path);
        $decoded = json_decode($data, true);

        return is_array($decoded) ? $decoded : [];
    }
}

if (!function_exists('admin_save_bookings')) {
    function admin_save_bookings(array $bookings): bool
    {
        $json = json_encode($bookings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents(admin_booking_json_path(), $json) !== false;
    }
}

if (!function_exists('admin_next_booking_id')) {
    function admin_next_booking_id(array $bookings): int
    {
        $max = 0;
        foreach ($bookings as $b) {
            $id = (int) ($b['id'] ?? 0);
            if ($id > $max) $max = $id;
        }
        return $max + 1;
    }
}