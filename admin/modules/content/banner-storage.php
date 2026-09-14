<?php

if (!function_exists('admin_banner_data_path')) {
    function admin_banner_data_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/banners.json';
    }
}

if (!function_exists('admin_get_banners')) {
    function admin_get_banners(): array
    {
        $path = admin_banner_data_path();

        if (!is_file($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }
}

if (!function_exists('admin_get_banner_by_id')) {
    function admin_get_banner_by_id($id): ?array
    {
        foreach (admin_get_banners() as $banner) {
            if ((string) ($banner['id'] ?? '') === (string) $id) {
                return $banner;
            }
        }

        return null;
    }
}

if (!function_exists('admin_banner_position_options')) {
    function admin_banner_position_options(): array
    {
        return [
            'main_hero' => '메인 히어로',
            'main_middle' => '메인 중간 배너',
            'sub_top' => '서브 상단 배너',
            'promo' => '프로모션 배너',
        ];
    }
}

if (!function_exists('admin_banner_status_options')) {
    function admin_banner_status_options(): array
    {
        return [
            'active' => '노출중',
            'scheduled' => '예약 노출',
            'inactive' => '비활성',
        ];
    }
}

if (!function_exists('admin_banner_position_label')) {
    function admin_banner_position_label(string $position): string
    {
        $options = admin_banner_position_options();
        return $options[$position] ?? '기타';
    }
}

if (!function_exists('admin_banner_status_label')) {
    function admin_banner_status_label(string $status): string
    {
        $options = admin_banner_status_options();
        return $options[$status] ?? '미정';
    }
}

if (!function_exists('admin_banner_status_class')) {
    function admin_banner_status_class(string $status): string
    {
        return match ($status) {
            'active' => 'admin-chip admin-chip--success',
            'scheduled' => 'admin-chip admin-chip--warning',
            'inactive' => 'admin-chip admin-chip--gray',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_banner_position_class')) {
    function admin_banner_position_class(string $position): string
    {
        return match ($position) {
            'main_hero' => 'admin-chip admin-chip--danger',
            'main_middle' => 'admin-chip',
            'sub_top' => 'admin-chip admin-chip--success',
            'promo' => 'admin-chip admin-chip--warning',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_banner_summary_stats')) {
    function admin_banner_summary_stats(array $items): array
    {
        $total = count($items);
        $active = 0;
        $scheduled = 0;
        $inactive = 0;
        $newWindow = 0;

        foreach ($items as $item) {
            $status = (string) ($item['status'] ?? '');

            if ($status === 'active') {
                $active++;
            } elseif ($status === 'scheduled') {
                $scheduled++;
            } elseif ($status === 'inactive') {
                $inactive++;
            }

            if (!empty($item['open_in_new_tab'])) {
                $newWindow++;
            }
        }

        return [
            'total' => $total,
            'active' => $active,
            'scheduled' => $scheduled,
            'inactive' => $inactive,
            'new_window' => $newWindow,
        ];
    }
}