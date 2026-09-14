<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/event/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$events = admin_get_events();

$events = array_values(array_filter($events, function ($event) use ($id) {
    return (int) ($event['id'] ?? 0) !== $id;
}));

admin_save_events($events);

header('Location: ' . admin_url('pages/event/list.php'));
exit;