<?php

if (!function_exists('admin_notice_data_path')) {
    function admin_notice_data_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/notices.json';
    }
}

if (!function_exists('admin_get_notices')) {
    function admin_get_notices(): array
    {
        $path = admin_notice_data_path();

        if (!is_file($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }
}

if (!function_exists('admin_get_notice_by_id')) {
    function admin_get_notice_by_id($id): ?array
    {
        foreach (admin_get_notices() as $notice) {
            if ((string)($notice['id'] ?? '') === (string)$id) {
                return $notice;
            }
        }

        return null;
    }
}

if (!function_exists('admin_notice_category_options')) {
    function admin_notice_category_options(): array
    {
        return [
            'general' => '일반공지',
            'service' => '서비스 안내',
            'booking' => '예약 안내',
            'event' => '이벤트',
            'system' => '시스템',
        ];
    }
}

if (!function_exists('admin_notice_status_options')) {
    function admin_notice_status_options(): array
    {
        return [
            'published' => '게시중',
            'draft' => '임시저장',
            'scheduled' => '예약발행',
        ];
    }
}

if (!function_exists('admin_notice_category_label')) {
    function admin_notice_category_label(string $category): string
    {
        $options = admin_notice_category_options();
        return $options[$category] ?? '기타';
    }
}

if (!function_exists('admin_notice_status_label')) {
    function admin_notice_status_label(string $status): string
    {
        $options = admin_notice_status_options();
        return $options[$status] ?? '미정';
    }
}

if (!function_exists('admin_notice_status_class')) {
    function admin_notice_status_class(string $status): string
    {
        return match ($status) {
            'published' => 'admin-chip admin-chip--success',
            'draft' => 'admin-chip admin-chip--gray',
            'scheduled' => 'admin-chip admin-chip--warning',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_notice_category_class')) {
    function admin_notice_category_class(string $category): string
    {
        return match ($category) {
            'general' => 'admin-chip',
            'service' => 'admin-chip admin-chip--success',
            'booking' => 'admin-chip admin-chip--warning',
            'event' => 'admin-chip admin-chip--danger',
            'system' => 'admin-chip admin-chip--gray',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_notice_summary_stats')) {
    function admin_notice_summary_stats(array $items): array
    {
        $total = count($items);
        $published = 0;
        $draft = 0;
        $scheduled = 0;
        $pinned = 0;

        foreach ($items as $item) {
            $status = (string)($item['status'] ?? '');
            $isPinned = !empty($item['is_pinned']);

            if ($status === 'published') {
                $published++;
            } elseif ($status === 'draft') {
                $draft++;
            } elseif ($status === 'scheduled') {
                $scheduled++;
            }

            if ($isPinned) {
                $pinned++;
            }
        }

        return [
            'total' => $total,
            'published' => $published,
            'draft' => $draft,
            'scheduled' => $scheduled,
            'pinned' => $pinned,
        ];
    }
}