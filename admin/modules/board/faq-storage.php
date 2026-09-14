<?php

if (!function_exists('admin_faq_data_path')) {
    function admin_faq_data_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/faqs.json';
    }
}

if (!function_exists('admin_get_faqs')) {
    function admin_get_faqs(): array
    {
        $path = admin_faq_data_path();

        if (!is_file($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }
}

if (!function_exists('admin_get_faq_by_id')) {
    function admin_get_faq_by_id($id): ?array
    {
        foreach (admin_get_faqs() as $faq) {
            if ((string)($faq['id'] ?? '') === (string)$id) {
                return $faq;
            }
        }

        return null;
    }
}

if (!function_exists('admin_faq_category_options')) {
    function admin_faq_category_options(): array
    {
        return [
            'booking' => '예약/결제',
            'product' => '상품/일정',
            'account' => '회원/계정',
            'cancel' => '취소/환불',
            'service' => '서비스 이용',
            'etc' => '기타',
        ];
    }
}

if (!function_exists('admin_faq_visibility_options')) {
    function admin_faq_visibility_options(): array
    {
        return [
            'visible' => '노출',
            'hidden' => '비노출',
        ];
    }
}

if (!function_exists('admin_faq_category_label')) {
    function admin_faq_category_label(string $category): string
    {
        $options = admin_faq_category_options();
        return $options[$category] ?? '기타';
    }
}

if (!function_exists('admin_faq_visibility_label')) {
    function admin_faq_visibility_label(string $visibility): string
    {
        return match ($visibility) {
            'visible' => '노출',
            'hidden' => '비노출',
            default => '미정',
        };
    }
}

if (!function_exists('admin_faq_visibility_class')) {
    function admin_faq_visibility_class(string $visibility): string
    {
        return match ($visibility) {
            'visible' => 'admin-chip admin-chip--success',
            'hidden' => 'admin-chip admin-chip--gray',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_faq_category_class')) {
    function admin_faq_category_class(string $category): string
    {
        return match ($category) {
            'booking' => 'admin-chip',
            'product' => 'admin-chip admin-chip--success',
            'account' => 'admin-chip admin-chip--warning',
            'cancel' => 'admin-chip admin-chip--danger',
            'service' => 'admin-chip admin-chip--gray',
            'etc' => 'admin-chip admin-chip--gray',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_faq_summary_stats')) {
    function admin_faq_summary_stats(array $items): array
    {
        $total = count($items);
        $visible = 0;
        $hidden = 0;
        $popular = 0;
        $maxSort = 0;

        foreach ($items as $item) {
            $visibility = (string)($item['visibility'] ?? '');
            $sortOrder = (int)($item['sort_order'] ?? 0);

            if ($visibility === 'visible') {
                $visible++;
            } elseif ($visibility === 'hidden') {
                $hidden++;
            }

            if (!empty($item['is_popular'])) {
                $popular++;
            }

            if ($sortOrder > $maxSort) {
                $maxSort = $sortOrder;
            }
        }

        return [
            'total' => $total,
            'visible' => $visible,
            'hidden' => $hidden,
            'popular' => $popular,
            'max_sort' => $maxSort,
        ];
    }
}