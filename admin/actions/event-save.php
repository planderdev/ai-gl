<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/event/list.php'));
    exit;
}

function admin_event_clean_string($value): string
{
    return trim((string) $value);
}

function admin_event_clean_int_array($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];
    foreach ($value as $item) {
        $int = (int) $item;
        if ($int > 0) {
            $result[] = $int;
        }
    }

    return array_values(array_unique($result));
}

function admin_event_clean_string_array($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $item) {
        if (is_array($item)) {
            $item = $item['text'] ?? '';
        }
        $item = trim((string) $item);
        if ($item !== '') {
            $result[] = $item;
        }
    }

    return array_values($result);
}

function admin_event_clean_assoc_array_list($value, array $fields): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $row) {
        if (!is_array($row)) {
            continue;
        }

        $cleaned = [];
        $hasValue = false;

        foreach ($fields as $field) {
            $cleaned[$field] = trim((string) ($row[$field] ?? ''));
            if ($cleaned[$field] !== '') {
                $hasValue = true;
            }
        }

        if ($hasValue) {
            $result[] = $cleaned;
        }
    }

    return array_values($result);
}

function admin_event_clean_venue_sections($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $result = [];

    foreach ($value as $row) {
        if (!is_array($row)) {
            continue;
        }

        $clean = [
            'type' => trim((string) ($row['type'] ?? '')),
            'title' => trim((string) ($row['title'] ?? '')),
            'subtitle' => trim((string) ($row['subtitle'] ?? '')),
            'description' => trim((string) ($row['description'] ?? '')),
            'image' => trim((string) ($row['image'] ?? '')),
            'specs' => admin_event_clean_string_array($row['specs'] ?? []),
        ];

        if (
            $clean['type'] !== '' ||
            $clean['title'] !== '' ||
            $clean['subtitle'] !== '' ||
            $clean['description'] !== '' ||
            $clean['image'] !== '' ||
            !empty($clean['specs'])
        ) {
            $result[] = $clean;
        }
    }

    return array_values($result);
}

$events = admin_get_events();
$events = is_array($events) ? $events : [];

$id = (int) ($_POST['id'] ?? 0);

$payload = [
    'id' => $id,
    'title' => admin_event_clean_string($_POST['title'] ?? ''),
    'status' => admin_event_clean_string($_POST['status'] ?? 'draft'),
    'event_type' => admin_event_clean_string($_POST['event_type'] ?? 'promotion'),
    'summary' => admin_event_clean_string($_POST['summary'] ?? ''),
    'start_date' => admin_event_clean_string($_POST['start_date'] ?? ''),
    'end_date' => admin_event_clean_string($_POST['end_date'] ?? ''),
    'region' => admin_event_clean_string($_POST['region'] ?? ''),

    'status_label' => admin_event_clean_string($_POST['status_label'] ?? ''),
    'badge_text' => admin_event_clean_string($_POST['badge_text'] ?? ''),
    'booking_method' => admin_event_clean_string($_POST['booking_method'] ?? ''),
    'target_text' => admin_event_clean_string($_POST['target_text'] ?? ''),

    'content' => admin_event_clean_string($_POST['content'] ?? ''),
    'benefit' => admin_event_clean_string($_POST['benefit'] ?? ''),

    'cta_primary_text' => admin_event_clean_string($_POST['cta_primary_text'] ?? ''),
    'cta_primary_url' => admin_event_clean_string($_POST['cta_primary_url'] ?? ''),
    'cta_secondary_text' => admin_event_clean_string($_POST['cta_secondary_text'] ?? ''),
    'cta_secondary_url' => admin_event_clean_string($_POST['cta_secondary_url'] ?? ''),

    'banner_image' => admin_event_clean_string($_POST['banner_image'] ?? ''),
    'hero_gallery' => admin_event_clean_assoc_array_list($_POST['hero_gallery'] ?? [], ['url', 'alt', 'caption']),

    'target_tags' => admin_event_clean_string_array($_POST['target_tags'] ?? []),
    'feature_tags' => admin_event_clean_string_array($_POST['feature_tags'] ?? []),

    'featured_product_id' => (int) ($_POST['featured_product_id'] ?? 0),
    'featured_label' => admin_event_clean_string($_POST['featured_label'] ?? ''),
    'featured_discount_rate' => admin_event_clean_string($_POST['featured_discount_rate'] ?? ''),
    'featured_price_text' => admin_event_clean_string($_POST['featured_price_text'] ?? ''),
    'featured_points' => admin_event_clean_assoc_array_list($_POST['featured_points'] ?? [], ['category', 'title', 'description']),

    'recommended_for_items' => admin_event_clean_string_array($_POST['recommended_for_items'] ?? []),
    'key_points' => admin_event_clean_string_array($_POST['key_points'] ?? []),
    'before_booking_items' => admin_event_clean_string_array($_POST['before_booking_items'] ?? []),
    'booking_guide_items' => admin_event_clean_string_array($_POST['booking_guide_items'] ?? []),
    'change_cancel_items' => admin_event_clean_string_array($_POST['change_cancel_items'] ?? []),

    'sections' => admin_event_clean_assoc_array_list($_POST['sections'] ?? [], ['title', 'subtitle', 'description', 'image']),
    'venue_sections' => admin_event_clean_venue_sections($_POST['venue_sections'] ?? []),

    'related_product_ids' => admin_event_clean_int_array($_POST['related_product_ids'] ?? []),
    'updated_at' => date('Y-m-d H:i'),
];

if ($id > 0) {
    foreach ($events as $index => $event) {
        if ((int) ($event['id'] ?? 0) === $id) {
            $payload['created_at'] = $event['created_at'] ?? date('Y-m-d H:i');
            $events[$index] = array_merge($event, $payload);
            break;
        }
    }
} else {
    $payload['id'] = admin_next_event_id($events);
    $payload['created_at'] = date('Y-m-d H:i');
    $events[] = $payload;
    $id = $payload['id'];
}

admin_save_events($events);

header('Location: ' . admin_url('pages/event/edit.php?id=' . $id));
exit;