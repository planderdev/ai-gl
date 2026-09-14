<?php

if (!function_exists('admin_taxonomy_json_path')) {
    function admin_taxonomy_json_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/taxonomy.json';
    }
}

if (!function_exists('admin_get_taxonomy_all')) {
    function admin_get_taxonomy_all(): array
    {
        $path = admin_taxonomy_json_path();

        if (!file_exists($path)) {
            return [
                'countries' => [],
                'regions' => [],
                'themes' => [],
                'badges' => [],
            ];
        }

        $contents = file_get_contents($path);
        if ($contents === false || trim($contents) === '') {
            return [
                'countries' => [],
                'regions' => [],
                'themes' => [],
                'badges' => [],
            ];
        }

        $decoded = json_decode($contents, true);

        return is_array($decoded) ? array_merge([
            'countries' => [],
            'regions' => [],
            'themes' => [],
            'badges' => [],
        ], $decoded) : [
            'countries' => [],
            'regions' => [],
            'themes' => [],
            'badges' => [],
        ];
    }
}

if (!function_exists('admin_save_taxonomy_all')) {
    function admin_save_taxonomy_all(array $data): bool
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            return false;
        }

        return file_put_contents(admin_taxonomy_json_path(), $json) !== false;
    }
}

if (!function_exists('admin_get_taxonomy_items')) {
    function admin_get_taxonomy_items(string $group): array
    {
        $all = admin_get_taxonomy_all();
        $items = $all[$group] ?? [];

        usort($items, function ($a, $b) {
            return (int) ($a['sort_order'] ?? 0) <=> (int) ($b['sort_order'] ?? 0);
        });

        return $items;
    }
}

if (!function_exists('admin_get_active_taxonomy_items')) {
    function admin_get_active_taxonomy_items(string $group): array
    {
        return array_values(array_filter(admin_get_taxonomy_items($group), function ($item) {
            return (int) ($item['is_active'] ?? 0) === 1;
        }));
    }
}

if (!function_exists('admin_next_taxonomy_id')) {
    function admin_next_taxonomy_id(array $items): int
    {
        $maxId = 0;

        foreach ($items as $item) {
            $currentId = (int) ($item['id'] ?? 0);
            if ($currentId > $maxId) {
                $maxId = $currentId;
            }
        }

        return $maxId + 1;
    }
}

if (!function_exists('admin_taxonomy_group_label')) {
    function admin_taxonomy_group_label(string $group): string
    {
        return match ($group) {
            'countries' => '국가',
            'regions'   => '지역',
            'themes'    => '테마',
            'badges'    => '배지',
            default     => '분류',
        };
    }
}