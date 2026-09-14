<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$bookings = admin_get_bookings();
$bookings = is_array($bookings) ? $bookings : [];

$id = admin_next_booking_id($bookings);

$status = trim($_POST['status'] ?? 'pending');
$statusLabels = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

$paymentStatus = trim($_POST['payment_status'] ?? 'pending');
$cancelDate = '';
$cancelReason = '';

if ($status === 'cancelled') {
    $cancelDate = date('Y-m-d H:i');
}

$payload = [
    'id' => $id,
    'product_id' => (int) ($_POST['product_id'] ?? 0),
    'product_title' => trim($_POST['product_title'] ?? ''),
    'date' => trim($_POST['date'] ?? ''),
    'people' => (int) ($_POST['people'] ?? 1),
    'total_price' => (int) ($_POST['total_price'] ?? 0),
    'status' => $status,

    'customer_name' => trim($_POST['customer_name'] ?? ''),
    'customer_phone' => trim($_POST['customer_phone'] ?? ''),

    'payment_method' => trim($_POST['payment_method'] ?? 'card'),
    'payment_status' => $paymentStatus,
    'payment_amount' => (int) ($_POST['payment_amount'] ?? 0),
    'payment_date' => trim($_POST['payment_date'] ?? ''),

    'cancel_reason' => $cancelReason,
    'cancel_date' => $cancelDate,
    'admin_memo' => trim($_POST['admin_memo'] ?? ''),

    'status_logs' => [
        [
            'status' => $status,
            'label' => $statusLabels[$status] ?? $status,
            'changed_at' => date('Y-m-d H:i'),
        ]
    ],
];

$bookings[] = $payload;

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/detail.php?id=' . $id));
exit;