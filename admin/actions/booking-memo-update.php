<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$adminMemo = trim($_POST['admin_memo'] ?? '');

$bookings = admin_get_bookings();

foreach ($bookings as &$item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $item['admin_memo'] = $adminMemo;
        break;
    }
}
unset($item);

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/detail.php?id=' . $id));
exit;