<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$bookings = admin_get_bookings();
$bookings = is_array($bookings) ? $bookings : [];

$bookings = array_values(array_filter($bookings, function ($item) use ($id) {
    return (int) ($item['id'] ?? 0) !== $id;
}));

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/list.php'));
exit;