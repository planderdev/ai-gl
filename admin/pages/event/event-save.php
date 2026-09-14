<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/event/list.php'));
    exit;
}

$events = admin_get_events();
$id = (int) ($_POST['id'] ?? 0);

$payload = [
    'id' => $id,
    'title' => trim($_POST['title'] ?? ''),
    'status' => trim($_POST['status'] ?? 'draft'),
    'event_type' => trim($_POST['event_type'] ?? 'promotion'),
    'summary' => trim($_POST['summary'] ?? ''),
    'start_date' => trim($_POST['start_date'] ?? ''),
    'end_date' => trim($_POST['end_date'] ?? ''),
    'region' => trim($_POST['region'] ?? ''),
    'content' => trim($_POST['content'] ?? ''),
    'benefit' => trim($_POST['benefit'] ?? ''),
    'related_product_ids' => array_map('intval', $_POST['related_product_ids'] ?? []),
    'updated_at' => date('Y-m-d H:i'),
    'banner_image' => trim($_POST['banner_image'] ?? ''),
];

if ($id > 0) {
    foreach ($events as $index => $event) {
        if ((int) ($event['id'] ?? 0) === $id) {
            $events[$index] = $payload;
            break;
        }
    }
} else {
    $payload['id'] = admin_next_event_id($events);
    $events[] = $payload;
    $id = $payload['id'];
}

admin_save_events($events);

header('Location: ' . admin_url('pages/event/edit.php?id=' . $id));
exit;