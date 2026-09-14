<?php

if (!function_exists('admin_status_chip_class')) {
    function admin_status_chip_class(string $status): string
    {
        return match ($status) {
            'publish' => 'admin-chip admin-chip--success',
            'draft'   => 'admin-chip admin-chip--gray',
            'hidden'  => 'admin-chip admin-chip--warning',
            'soldout' => 'admin-chip admin-chip--danger',
            default   => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_status_label')) {
    function admin_status_label(string $status): string
    {
        return match ($status) {
            'publish' => '공개',
            'draft'   => '임시저장',
            'hidden'  => '숨김',
            'soldout' => '판매중지',
            default   => '미정',
        };
    }
}

if (!function_exists('admin_product_type_label')) {
    function admin_product_type_label(string $type): string
    {
        return match ($type) {
            'golf_course'    => '골프장',
            'travel_package' => '여행 패키지',
            default          => '기타',
        };
    }
}