<?php
declare(strict_types=1);

if (!defined('ADMIN_PRODUCT_DATA_DIR')) {
    define('ADMIN_PRODUCT_DATA_DIR', $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/data');
}

if (!defined('ADMIN_PRODUCT_DATA_FILE')) {
    define('ADMIN_PRODUCT_DATA_FILE', ADMIN_PRODUCT_DATA_DIR . '/products.json');
}

function admin_product_ensure_storage(): void
{
    if (!is_dir(ADMIN_PRODUCT_DATA_DIR)) {
        @mkdir(ADMIN_PRODUCT_DATA_DIR, 0777, true);
    }

    if (!file_exists(ADMIN_PRODUCT_DATA_FILE)) {
        @file_put_contents(
            ADMIN_PRODUCT_DATA_FILE,
            json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }
}

function admin_get_products(): array
{
    admin_product_ensure_storage();

    $raw = @file_get_contents(ADMIN_PRODUCT_DATA_FILE);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? array_values($decoded) : [];
}

function admin_save_products(array $products): bool
{
    admin_product_ensure_storage();

    $json = json_encode(
        array_values($products),
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    if ($json === false) {
        return false;
    }

    return @file_put_contents(ADMIN_PRODUCT_DATA_FILE, $json, LOCK_EX) !== false;
}

function admin_find_product(int $id): ?array
{
    foreach (admin_get_products() as $item) {
        if ((int) ($item['id'] ?? 0) === $id) {
            return $item;
        }
    }

    return null;
}

function admin_product_next_id(array $products): int
{
    $maxId = 0;

    foreach ($products as $item) {
        $maxId = max($maxId, (int) ($item['id'] ?? 0));
    }

    return $maxId + 1;
}

function admin_product_allowed_type(string $type): string
{
    $allowed = ['golf_course', 'travel_package'];
    return in_array($type, $allowed, true) ? $type : 'golf_course';
}

function admin_product_allowed_status(string $status): string
{
    $allowed = ['publish', 'draft', 'hidden', 'soldout'];
    return in_array($status, $allowed, true) ? $status : 'draft';
}

function admin_product_trim_string($value, string $default = ''): string
{
    return trim((string) ($value ?? $default));
}

function admin_product_int($value, int $default = 0): int
{
    if ($value === null || $value === '') {
        return $default;
    }

    if (is_int($value)) {
        return $value;
    }

    $clean = preg_replace('/[^0-9\-]/', '', (string) $value);
    if ($clean === '' || $clean === '-') {
        return $default;
    }

    return (int) $clean;
}

function admin_product_float($value, float $default = 0): float
{
    if ($value === null || $value === '') {
        return $default;
    }

    return (float) $value;
}

function admin_product_bool_flag($value): int
{
    return !empty($value) ? 1 : 0;
}

function admin_product_string_array($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $items = array_map(static fn($item) => trim((string) $item), $value);
    $items = array_filter($items, static fn($item) => $item !== '');

    return array_values(array_unique($items));
}

function admin_product_assoc_list($value, array $fields): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $row) {
        if (!is_array($row)) {
            continue;
        }

        $clean = [];
        $hasValue = false;

        foreach ($fields as $field) {
            $clean[$field] = trim((string) ($row[$field] ?? ''));
            if ($clean[$field] !== '') {
                $hasValue = true;
            }
        }

        if ($hasValue) {
            $result[] = $clean;
        }
    }

    return array_values($result);
}

function admin_product_notice_list($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $item) {
        if (is_array($item)) {
            $text = trim((string) ($item['text'] ?? ''));
        } else {
            $text = trim((string) $item);
        }

        if ($text !== '') {
            $result[] = $text;
        }
    }

    return array_values($result);
}

function admin_product_calendar_data($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $date => $row) {
        $date = trim((string) $date);
        if ($date === '' || !is_array($row)) {
            continue;
        }

        $result[$date] = [
            'price'  => trim((string) ($row['price'] ?? '')),
            'stock'  => trim((string) ($row['stock'] ?? '')),
            'closed' => !empty($row['closed']) ? 1 : 0,
            'badge'  => trim((string) ($row['badge'] ?? '')),
            'note'   => trim((string) ($row['note'] ?? '')),
        ];
    }

    ksort($result);
    return $result;
}

function admin_product_itinerary_days($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $days = [];

    foreach ($value as $day) {
        if (!is_array($day)) {
            continue;
        }

        $dayLabel = trim((string) ($day['day_label'] ?? ''));
        $items = $day['items'] ?? [];
        $cleanItems = [];

        if (is_array($items)) {
            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }

                $clean = [
                    'type' => trim((string) ($item['type'] ?? '')),
                    'title' => trim((string) ($item['title'] ?? '')),
                    'meta' => trim((string) ($item['meta'] ?? '')),
                    'description' => trim((string) ($item['description'] ?? '')),
                ];

                if (
                    $clean['type'] !== '' ||
                    $clean['title'] !== '' ||
                    $clean['meta'] !== '' ||
                    $clean['description'] !== ''
                ) {
                    $cleanItems[] = $clean;
                }
            }
        }

        if ($dayLabel !== '' || !empty($cleanItems)) {
            $days[] = [
                'day_label' => $dayLabel,
                'items' => array_values($cleanItems),
            ];
        }
    }

    return array_values($days);
}

function admin_product_related_ids($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $item) {
        if (is_array($item)) {
            $id = trim((string) ($item['id'] ?? ''));
        } else {
            $id = trim((string) $item);
        }

        if ($id !== '') {
            $result[] = $id;
        }
    }

    return array_values(array_unique($result));
}

function admin_product_has_sellable_stock(array $payload): bool
{
    if ((int) ($payload['default_stock'] ?? 0) > 0) {
        return true;
    }

    $slots = $payload['tee_time_slots'] ?? [];
    if (is_array($slots)) {
        foreach ($slots as $slot) {
            if (!is_array($slot)) {
                continue;
            }

            $stock = (int) preg_replace('/[^0-9\-]/', '', (string) ($slot['stock'] ?? '0'));
            $status = trim((string) ($slot['status'] ?? ''));

            if ($stock > 0 && !in_array($status, ['마감', '품절', 'soldout', 'closed'], true)) {
                return true;
            }
        }
    }

    $calendar = $payload['availability_calendar'] ?? [];
    if (is_array($calendar)) {
        foreach ($calendar as $row) {
            if (!is_array($row)) {
                continue;
            }

            $stock = (int) preg_replace('/[^0-9\-]/', '', (string) ($row['stock'] ?? '0'));
            $closed = !empty($row['closed']);

            if (!$closed && $stock > 0) {
                return true;
            }
        }
    }

    return false;
}

function admin_product_has_publish_requirements(array $payload): bool
{
    $title = trim((string) ($payload['title'] ?? ''));
    $country = trim((string) ($payload['country'] ?? ''));
    $region = trim((string) ($payload['region'] ?? ''));
    $thumbnail = trim((string) ($payload['thumbnail'] ?? ''));
    $description = trim((string) ($payload['description'] ?? ''));

    $price = (int) ($payload['sale_price'] ?? $payload['base_price'] ?? 0);

    if ($title === '' || $country === '' || $region === '' || $thumbnail === '' || $description === '' || $price <= 0) {
        return false;
    }

    $type = (string) ($payload['type'] ?? 'golf_course');

    if ($type === 'travel_package') {
        $itinerary = trim((string) ($payload['itinerary'] ?? ''));
        $itineraryDays = $payload['itinerary_days'] ?? [];
        $hotelName = trim((string) ($payload['hotel_name'] ?? ''));

        return $hotelName !== '' && ($itinerary !== '' || !empty($itineraryDays));
    }

    $golfIntro = trim((string) ($payload['golf_intro'] ?? ''));
    $golfName = trim((string) ($payload['golf_name'] ?? ''));
    $holes = trim((string) ($payload['holes'] ?? ''));

    return $golfIntro !== '' || $golfName !== '' || $holes !== '';
}

function admin_product_apply_automation(array $payload): array
{
    if (!empty($payload['consult_only'])) {
        $payload['hide_price'] = 1;
    }

    $endDate = trim((string) ($payload['booking_open_end'] ?? ''));
    if ($endDate !== '' && strtotime($endDate) !== false) {
        $today = strtotime(date('Y-m-d'));
        $end = strtotime($endDate);

        if ($end < $today) {
            $payload['status'] = 'hidden';
        }
    }

    if (($payload['status'] ?? 'draft') === 'publish' && !admin_product_has_publish_requirements($payload)) {
        $payload['status'] = 'draft';
    }

    if (($payload['status'] ?? 'draft') === 'publish' && !admin_product_has_sellable_stock($payload)) {
        $payload['status'] = 'soldout';
    }

    return $payload;
}

function admin_product_normalize_payload(array $source, ?array $existing = null): array
{
    $now = date('Y-m-d H:i:s');

    $type = admin_product_allowed_type(
        admin_product_trim_string($source['product_type'] ?? $source['type'] ?? ($existing['type'] ?? 'golf_course'))
    );

    $status = admin_product_allowed_status(
        admin_product_trim_string($source['status'] ?? ($existing['status'] ?? 'draft'))
    );

    $basePrice = admin_product_int($source['base_price'] ?? ($existing['base_price'] ?? 0), 0);
    $salePrice = admin_product_int($source['sale_price'] ?? ($existing['sale_price'] ?? 0), 0);
    $price = $salePrice > 0 ? $salePrice : $basePrice;

    $airportName = admin_product_trim_string($source['airport_name'] ?? ($existing['airport_name'] ?? ''));
    $country = admin_product_trim_string($source['country'] ?? ($existing['country'] ?? ''));
    $region = admin_product_trim_string($source['region'] ?? ($existing['region'] ?? ''));

    $payload = [
        'id' => isset($source['id']) ? (int) $source['id'] : (int) ($existing['id'] ?? 0),
        'type' => $type,
        'product_type' => $type,

        'status' => $status,
        'sort_order' => admin_product_int($source['sort_order'] ?? ($existing['sort_order'] ?? 0), 0),

        'title' => admin_product_trim_string($source['title'] ?? ($existing['title'] ?? '')),
        'subtitle' => admin_product_trim_string($source['subtitle'] ?? ($existing['subtitle'] ?? '')),
        'summary' => admin_product_trim_string($source['summary'] ?? ($existing['summary'] ?? '')),
        'description' => admin_product_trim_string($source['description'] ?? ($existing['description'] ?? '')),
        'highlight' => admin_product_trim_string($source['highlight'] ?? ($existing['highlight'] ?? '')),

        'sku' => admin_product_trim_string($source['sku'] ?? ($existing['sku'] ?? '')),
        'country' => $country,
        'region' => $region,
        'sub_region' => admin_product_trim_string($source['sub_region'] ?? ($existing['sub_region'] ?? '')),
        'display_region' => admin_product_trim_string($source['display_region'] ?? ($existing['display_region'] ?? '')),
        'breadcrumb_country' => admin_product_trim_string($source['breadcrumb_country'] ?? ($existing['breadcrumb_country'] ?? '')),
        'breadcrumb_region' => admin_product_trim_string($source['breadcrumb_region'] ?? ($existing['breadcrumb_region'] ?? '')),

        'theme' => admin_product_trim_string($source['theme'] ?? ($existing['theme'] ?? '')),
        'theme_visuals' => [],
        'themes' => admin_product_string_array($source['themes'] ?? ($existing['themes'] ?? [])),
        'course_tags' => admin_product_string_array($source['course_tags'] ?? ($existing['course_tags'] ?? [])),
        'tee_time_band' => admin_product_string_array($source['tee_time_band'] ?? ($existing['tee_time_band'] ?? [])),

        'badges' => admin_product_string_array($source['badges'] ?? ($existing['badges'] ?? [])),
        'card_label' => admin_product_trim_string($source['card_label'] ?? ($existing['card_label'] ?? '')),
        'card_price_from' => admin_product_trim_string($source['card_price_from'] ?? ($existing['card_price_from'] ?? '')),
        'card_discount_rate' => admin_product_trim_string($source['card_discount_rate'] ?? ($existing['card_discount_rate'] ?? '')),

        'booking_type' => admin_product_trim_string($source['booking_type'] ?? ($existing['booking_type'] ?? 'instant')),
        'price_type' => admin_product_trim_string($source['price_type'] ?? ($existing['price_type'] ?? 'per_person')),
        'currency' => admin_product_trim_string($source['currency'] ?? ($existing['currency'] ?? 'KRW')),
        'price_label' => admin_product_trim_string($source['price_label'] ?? ($existing['price_label'] ?? '')),
        'list_price' => admin_product_int($source['list_price'] ?? ($existing['list_price'] ?? $price), 0),
        'base_price' => $basePrice,
        'sale_price' => $salePrice,
        'deposit_price' => admin_product_int($source['deposit_price'] ?? ($existing['deposit_price'] ?? 0), 0),
        'remaining_price' => admin_product_int($source['remaining_price'] ?? ($existing['remaining_price'] ?? 0), 0),
        'adult_price' => admin_product_int($source['adult_price'] ?? ($existing['adult_price'] ?? 0), 0),
        'child_price' => admin_product_int($source['child_price'] ?? ($existing['child_price'] ?? 0), 0),
        'infant_price' => admin_product_int($source['infant_price'] ?? ($existing['infant_price'] ?? 0), 0),
        'default_price' => admin_product_int($source['default_price'] ?? ($existing['default_price'] ?? 0), 0),
        'default_stock' => admin_product_int($source['default_stock'] ?? ($existing['default_stock'] ?? 0), 0),
        'default_closed' => admin_product_bool_flag($source['default_closed'] ?? ($existing['default_closed'] ?? 0)),
        'price_policy_note' => admin_product_trim_string($source['price_policy_note'] ?? ($existing['price_policy_note'] ?? '')),

        'min_people' => admin_product_int($source['min_people'] ?? ($existing['min_people'] ?? 1), 1),
        'max_people' => admin_product_int($source['max_people'] ?? ($existing['max_people'] ?? 4), 4),
        'tee_time_text' => admin_product_trim_string($source['tee_time_text'] ?? ($existing['tee_time_text'] ?? '')),
        'tee_time_slots' => admin_product_assoc_list(
            $source['tee_time_slots'] ?? ($existing['tee_time_slots'] ?? []),
            ['label', 'time', 'status', 'price', 'stock']
        ),

        'thumbnail' => admin_product_trim_string($source['thumbnail'] ?? ($existing['thumbnail'] ?? '')),
        'gallery' => admin_product_assoc_list($source['gallery'] ?? ($existing['gallery'] ?? []), ['url', 'caption', 'alt', 'is_cover']),
        'hotel_gallery' => admin_product_assoc_list($source['hotel_gallery'] ?? ($existing['hotel_gallery'] ?? []), ['url', 'caption', 'alt', 'is_cover']),
        'golf_gallery' => admin_product_assoc_list($source['golf_gallery'] ?? ($existing['golf_gallery'] ?? []), ['url', 'caption', 'alt', 'is_cover']),

        'location_name' => admin_product_trim_string($source['location_name'] ?? ($existing['location_name'] ?? '')),
        'address' => admin_product_trim_string($source['address'] ?? ($existing['address'] ?? '')),
        'latitude' => admin_product_trim_string($source['latitude'] ?? ($existing['latitude'] ?? '')),
        'longitude' => admin_product_trim_string($source['longitude'] ?? ($existing['longitude'] ?? '')),
        'map_embed' => admin_product_trim_string($source['map_embed'] ?? ($existing['map_embed'] ?? '')),
        'google_map_url' => admin_product_trim_string($source['google_map_url'] ?? ($existing['google_map_url'] ?? '')),
        'naver_map_url' => admin_product_trim_string($source['naver_map_url'] ?? ($existing['naver_map_url'] ?? '')),

        'airport_name' => $airportName,
        'airport_distance_km' => admin_product_float($source['airport_distance_km'] ?? ($existing['airport_distance_km'] ?? 0), 0),
        'airport_time_min' => admin_product_int($source['airport_time_min'] ?? ($existing['airport_time_min'] ?? 0), 0),
        'airport_text' => admin_product_trim_string($source['airport_text'] ?? ($existing['airport_text'] ?? '')),
        'airport_distance' => admin_product_trim_string($source['airport_distance'] ?? ($existing['airport_distance'] ?? '')),
        'airport_time' => admin_product_trim_string($source['airport_time'] ?? ($existing['airport_time'] ?? '')),
        'transport_type' => admin_product_trim_string($source['transport_type'] ?? ($existing['transport_type'] ?? '')),

        'hotel_id' => isset($source['hotel_id']) ? (int) $source['hotel_id'] : (int) ($existing['hotel_id'] ?? 0),
        'hotel_name' => admin_product_trim_string($source['hotel_name'] ?? ($existing['hotel_name'] ?? '')),
        'hotel_checkin_out' => admin_product_trim_string($source['hotel_checkin_out'] ?? ($existing['hotel_checkin_out'] ?? '')),
        'hotel_phone' => admin_product_trim_string($source['hotel_phone'] ?? ($existing['hotel_phone'] ?? '')),
        'hotel_website' => admin_product_trim_string($source['hotel_website'] ?? ($existing['hotel_website'] ?? '')),
        'hotel_address' => admin_product_trim_string($source['hotel_address'] ?? ($existing['hotel_address'] ?? '')),
        'hotel_description' => admin_product_trim_string($source['hotel_description'] ?? ($existing['hotel_description'] ?? '')),

        'golf_name' => admin_product_trim_string($source['golf_name'] ?? ($existing['golf_name'] ?? '')),
        'golf_phone' => admin_product_trim_string($source['golf_phone'] ?? ($existing['golf_phone'] ?? '')),
        'golf_address' => admin_product_trim_string($source['golf_address'] ?? ($existing['golf_address'] ?? '')),
        'course_type' => admin_product_trim_string($source['course_type'] ?? ($existing['course_type'] ?? '')),
        'holes' => admin_product_trim_string($source['holes'] ?? ($existing['holes'] ?? '')),
        'par' => admin_product_trim_string($source['par'] ?? ($existing['par'] ?? '')),
        'yard' => admin_product_trim_string($source['yard'] ?? ($existing['yard'] ?? '')),
        'course_summary' => admin_product_trim_string($source['course_summary'] ?? ($existing['course_summary'] ?? '')),
        'golf_intro' => admin_product_trim_string($source['golf_intro'] ?? ($existing['golf_intro'] ?? '')),
        'facilities' => admin_product_assoc_list($source['facilities'] ?? ($existing['facilities'] ?? []), ['label']),

        'included' => admin_product_trim_string($source['included'] ?? ($existing['included'] ?? '')),
        'excluded' => admin_product_trim_string($source['excluded'] ?? ($existing['excluded'] ?? '')),
        'notice' => admin_product_trim_string($source['notice'] ?? ($existing['notice'] ?? '')),
        'itinerary' => admin_product_trim_string($source['itinerary'] ?? ($existing['itinerary'] ?? '')),
        'itinerary_items' => admin_product_assoc_list(
            $source['itinerary_items'] ?? ($existing['itinerary_items'] ?? []),
            ['day', 'time', 'title', 'description']
        ),
        'itinerary_days' => admin_product_itinerary_days($source['itinerary_days'] ?? ($existing['itinerary_days'] ?? [])),

        'availability_mode' => admin_product_trim_string($source['availability_mode'] ?? ($existing['availability_mode'] ?? 'always_open')),
        'booking_open_start' => admin_product_trim_string($source['booking_open_start'] ?? ($existing['booking_open_start'] ?? '')),
        'booking_open_end' => admin_product_trim_string($source['booking_open_end'] ?? ($existing['booking_open_end'] ?? '')),
        'available_weekdays' => admin_product_string_array($source['available_weekdays'] ?? ($existing['available_weekdays'] ?? [])),
        'availability_calendar' => admin_product_calendar_data($source['availability_calendar'] ?? ($existing['availability_calendar'] ?? [])),
        'availability_notes' => admin_product_trim_string($source['availability_notes'] ?? ($existing['availability_notes'] ?? '')),
        'auto_soldout' => admin_product_bool_flag($source['auto_soldout'] ?? ($existing['auto_soldout'] ?? 0)),

        'cancel_policy_type' => admin_product_trim_string($source['cancel_policy_type'] ?? ($existing['cancel_policy_type'] ?? 'flexible')),
        'cancel_free_days' => admin_product_trim_string($source['cancel_free_days'] ?? ($existing['cancel_free_days'] ?? '')),
        'cancel_fee_percent' => admin_product_trim_string($source['cancel_fee_percent'] ?? ($existing['cancel_fee_percent'] ?? '')),
        'cancel_notes' => admin_product_trim_string($source['cancel_notes'] ?? ($existing['cancel_notes'] ?? '')),
        'weather_policy' => admin_product_trim_string($source['weather_policy'] ?? ($existing['weather_policy'] ?? '')),
        'noshow_policy' => admin_product_trim_string($source['noshow_policy'] ?? ($existing['noshow_policy'] ?? '')),
        'round_notice_items' => admin_product_notice_list($source['round_notice_items'] ?? ($existing['round_notice_items'] ?? [])),
        'weather_notice_items' => admin_product_notice_list($source['weather_notice_items'] ?? ($existing['weather_notice_items'] ?? [])),
        'important_notice_items' => admin_product_notice_list($source['important_notice_items'] ?? ($existing['important_notice_items'] ?? [])),
        'cancel_refund_items' => admin_product_notice_list($source['cancel_refund_items'] ?? ($existing['cancel_refund_items'] ?? [])),

        'payment_methods' => admin_product_string_array($source['payment_methods'] ?? ($existing['payment_methods'] ?? [])),
        'payment_timing' => admin_product_trim_string($source['payment_timing'] ?? ($existing['payment_timing'] ?? 'prepaid')),
        'payment_notes' => admin_product_trim_string($source['payment_notes'] ?? ($existing['payment_notes'] ?? '')),
        'bank_name' => admin_product_trim_string($source['bank_name'] ?? ($existing['bank_name'] ?? '')),
        'bank_account' => admin_product_trim_string($source['bank_account'] ?? ($existing['bank_account'] ?? '')),
        'bank_holder' => admin_product_trim_string($source['bank_holder'] ?? ($existing['bank_holder'] ?? '')),

        'consult_only' => admin_product_bool_flag($source['consult_only'] ?? ($existing['consult_only'] ?? 0)),
        'hide_price' => admin_product_bool_flag($source['hide_price'] ?? ($existing['hide_price'] ?? 0)),
        'is_recommended' => admin_product_bool_flag($source['is_recommended'] ?? ($existing['is_recommended'] ?? 0)),
        'is_best' => admin_product_bool_flag($source['is_best'] ?? ($existing['is_best'] ?? 0)),
        'is_new' => admin_product_bool_flag($source['is_new'] ?? ($existing['is_new'] ?? 0)),
        'is_featured' => admin_product_bool_flag($source['is_featured'] ?? ($existing['is_featured'] ?? 0)),
        'expose_country' => admin_product_bool_flag($source['expose_country'] ?? ($existing['expose_country'] ?? 0)),
        'expose_theme' => admin_product_bool_flag($source['expose_theme'] ?? ($existing['expose_theme'] ?? 0)),

        'related_product_ids' => admin_product_related_ids($source['related_product_ids'] ?? ($existing['related_product_ids'] ?? [])),

        'price' => $price,
        'airport' => $airportName,

        'created_at' => (string) ($existing['created_at'] ?? $now),
        'updated_at' => $now,
    ];

    if (empty($payload['display_region'])) {
        $payload['display_region'] = implode(' / ', array_filter([$payload['country'], $payload['region']]));
    }

    if (empty($payload['breadcrumb_country'])) {
        $payload['breadcrumb_country'] = $payload['country'];
    }

    if (empty($payload['breadcrumb_region'])) {
        $payload['breadcrumb_region'] = $payload['region'];
    }

    if (empty($payload['theme']) && !empty($payload['themes'])) {
        $payload['theme'] = $payload['themes'][0];
    }

    if (empty($payload['course_type']) && !empty($payload['course_tags'])) {
        $payload['course_type'] = $payload['course_tags'][0];
    }

    if ($payload['booking_type'] === 'instant' && !in_array('실시간티타임', $payload['themes'], true)) {
        $payload['themes'][] = '실시간티타임';
    }

    if (empty($payload['card_label'])) {
        foreach (['특가', '프리미엄', '베스트', '추천', '신규'] as $priorityLabel) {
            if (in_array($priorityLabel, $payload['themes'], true)) {
                $payload['card_label'] = $priorityLabel;
                break;
            }
        }
    }

    if (
        empty($payload['airport_text']) &&
        !empty($payload['airport_name']) &&
        !empty($payload['airport_distance_km']) &&
        !empty($payload['airport_time_min'])
    ) {
        $payload['airport_text'] = $payload['airport_name'] . '에서 ' .
            rtrim(rtrim(number_format((float) $payload['airport_distance_km'], 1, '.', ''), '0'), '.') .
            'km · ' . (int) $payload['airport_time_min'] . '분';
    }

    if (empty($payload['airport_distance']) && !empty($payload['airport_distance_km'])) {
        $payload['airport_distance'] = rtrim(rtrim(number_format((float) $payload['airport_distance_km'], 1, '.', ''), '0'), '.') . 'km';
    }

    if (empty($payload['airport_time']) && !empty($payload['airport_time_min'])) {
        $payload['airport_time'] = '차량 ' . (int) $payload['airport_time_min'] . '분';
    }

    if (empty($payload['list_price'])) {
        $payload['list_price'] = $payload['sale_price'] > 0 ? $payload['sale_price'] : $payload['base_price'];
    }

    return admin_product_apply_automation($payload);
}

function admin_upsert_product(array $payload): array
{
    $products = admin_get_products();
    $id = isset($payload['id']) ? (int) $payload['id'] : 0;

    if ($id > 0) {
        foreach ($products as $index => $item) {
            if ((int) ($item['id'] ?? 0) === $id) {
                $normalized = admin_product_normalize_payload($payload, $item);
                $products[$index] = $normalized;
                admin_save_products($products);
                return $normalized;
            }
        }
    }

    $normalized = admin_product_normalize_payload($payload, null);
    $normalized['id'] = admin_product_next_id($products);
    $products[] = $normalized;

    admin_save_products($products);

    return $normalized;
}

function admin_delete_product(int $id): bool
{
    $products = admin_get_products();

    $filtered = array_values(array_filter($products, static function ($item) use ($id) {
        return (int) ($item['id'] ?? 0) !== $id;
    }));

    if (count($filtered) === count($products)) {
        return false;
    }

    return admin_save_products($filtered);
}

function admin_duplicate_product(int $id): ?array
{
    $products = admin_get_products();
    $original = null;

    foreach ($products as $item) {
        if ((int) ($item['id'] ?? 0) === $id) {
            $original = $item;
            break;
        }
    }

    if (!$original) {
        return null;
    }

    $copy = $original;
    $copy['id'] = admin_product_next_id($products);
    $copy['title'] = trim((string) ($copy['title'] ?? '상품')) . ' (복사본)';
    $copy['status'] = 'draft';
    $copy['created_at'] = date('Y-m-d H:i:s');
    $copy['updated_at'] = date('Y-m-d H:i:s');

    $products[] = $copy;
    admin_save_products($products);

    return $copy;
}