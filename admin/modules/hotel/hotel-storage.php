<?php

if (!function_exists('admin_hotels_json_path')) {
    function admin_hotels_json_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/hotels.json';
    }
}

if (!function_exists('admin_get_hotels')) {
    function admin_get_hotels(): array
    {
        $jsonPath = admin_hotels_json_path();
        if (!file_exists($jsonPath)) {
            return [];
        }

        $contents = file_get_contents($jsonPath);
        if ($contents === false || trim($contents) === '') {
            return [];
        }

        $decoded = json_decode($contents, true);
        $hotels = is_array($decoded) ? $decoded : [];

        usort($hotels, static function ($a, $b) {
            $sortA = (int) ($a['sort_order'] ?? 0);
            $sortB = (int) ($b['sort_order'] ?? 0);
            if ($sortA === $sortB) {
                return strcmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
            }
            return $sortA <=> $sortB;
        });

        return $hotels;
    }
}

if (!function_exists('admin_save_hotels')) {
    function admin_save_hotels(array $hotels): bool
    {
        $json = json_encode(array_values($hotels), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            return false;
        }

        return file_put_contents(admin_hotels_json_path(), $json) !== false;
    }
}

if (!function_exists('admin_find_hotel_by_id')) {
    function admin_find_hotel_by_id(int $id): ?array
    {
        foreach (admin_get_hotels() as $hotel) {
            if ((int) ($hotel['id'] ?? 0) === $id) {
                return $hotel;
            }
        }
        return null;
    }
}

if (!function_exists('admin_next_hotel_id')) {
    function admin_next_hotel_id(array $hotels): int
    {
        $maxId = 0;
        foreach ($hotels as $hotel) {
            $currentId = (int) ($hotel['id'] ?? 0);
            if ($currentId > $maxId) {
                $maxId = $currentId;
            }
        }
        return $maxId + 1;
    }
}

if (!function_exists('admin_hotel_trim')) {
    function admin_hotel_trim($value): string
    {
        return trim((string) $value);
    }
}

if (!function_exists('admin_hotel_gallery')) {
    function admin_hotel_gallery($items): array
    {
        if (!is_array($items)) {
            return [];
        }

        $normalized = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $url = admin_hotel_trim($item['url'] ?? '');
            $caption = admin_hotel_trim($item['caption'] ?? '');
            $alt = admin_hotel_trim($item['alt'] ?? '');
            $isCover = !empty($item['is_cover']) ? 1 : 0;
            if ($url === '' && $caption === '' && $alt === '') {
                continue;
            }
            $normalized[] = [
                'url' => $url,
                'caption' => $caption,
                'alt' => $alt,
                'is_cover' => $isCover,
            ];
        }

        if (!empty($normalized) && !array_filter($normalized, static fn($item) => !empty($item['is_cover']))) {
            $normalized[0]['is_cover'] = 1;
        }

        return array_values($normalized);
    }
}

if (!function_exists('admin_hotel_normalize_payload')) {
    function admin_hotel_normalize_payload(array $source, ?array $existing = null): array
    {
        $status = admin_hotel_trim($source['status'] ?? ($existing['status'] ?? 'publish'));
        if (!in_array($status, ['publish', 'draft', 'hidden'], true)) {
            $status = 'publish';
        }

        return [
            'id' => isset($source['id']) ? (int) $source['id'] : (int) ($existing['id'] ?? 0),
            'status' => $status,
            'sort_order' => (int) ($source['sort_order'] ?? ($existing['sort_order'] ?? 0)),
            'name' => admin_hotel_trim($source['name'] ?? ($existing['name'] ?? '')),
            'brand_label' => admin_hotel_trim($source['brand_label'] ?? ($existing['brand_label'] ?? 'HOTEL INFO')),
            'tag' => admin_hotel_trim($source['tag'] ?? ($existing['tag'] ?? '')),
            'website' => admin_hotel_trim($source['website'] ?? ($existing['website'] ?? '')),
            'phone' => admin_hotel_trim($source['phone'] ?? ($existing['phone'] ?? '')),
            'address' => admin_hotel_trim($source['address'] ?? ($existing['address'] ?? '')),
            'checkin_out' => admin_hotel_trim($source['checkin_out'] ?? ($existing['checkin_out'] ?? '')),
            'description' => admin_hotel_trim($source['description'] ?? ($existing['description'] ?? '')),
            'description_2' => admin_hotel_trim($source['description_2'] ?? ($existing['description_2'] ?? '')),
            'description_3' => admin_hotel_trim($source['description_3'] ?? ($existing['description_3'] ?? '')),
            'gallery' => admin_hotel_gallery($source['gallery'] ?? ($existing['gallery'] ?? [])),
            'updated_at' => date('Y-m-d H:i:s'),
            'created_at' => $existing['created_at'] ?? date('Y-m-d H:i:s'),
        ];
    }
}

if (!function_exists('admin_upsert_hotel')) {
    function admin_upsert_hotel(array $payload): array
    {
        $hotels = admin_get_hotels();
        $existing = null;
        $index = null;
        $id = (int) ($payload['id'] ?? 0);

        foreach ($hotels as $key => $hotel) {
            if ((int) ($hotel['id'] ?? 0) === $id && $id > 0) {
                $existing = $hotel;
                $index = $key;
                break;
            }
        }

        $normalized = admin_hotel_normalize_payload($payload, $existing);
        if ((int) ($normalized['id'] ?? 0) <= 0) {
            $normalized['id'] = admin_next_hotel_id($hotels);
        }

        if ($index !== null) {
            $hotels[$index] = $normalized;
        } else {
            $hotels[] = $normalized;
        }

        admin_save_hotels($hotels);
        return $normalized;
    }
}
