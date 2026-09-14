<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$ids = $_POST['booking_ids'] ?? [];
$bulkAction = trim($_POST['bulk_action'] ?? '');

if (!is_array($ids) || empty($ids) || $bulkAction === '') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$ids = array_map('intval', $ids);
$ids = array_values(array_filter($ids, fn($id) => $id > 0));

$statusMap = [
    'mark_pending' => 'pending',
    'mark_paid' => 'paid',
    'mark_confirmed' => 'confirmed',
    'mark_cancelled' => 'cancelled',
];

$statusLabels = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

if (!isset($statusMap[$bulkAction])) {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$newStatus = $statusMap[$bulkAction];

$bookings = admin_get_bookings();

foreach ($bookings as &$item) {
    $bookingId = (int) ($item['id'] ?? 0);

    if (!in_array($bookingId, $ids, true)) {
        continue;
    }

    $previousStatus = $item['status'] ?? '';
    $item['status'] = $newStatus;

    if ($newStatus === 'cancelled' && empty($item['cancel_date'])) {
        $item['cancel_date'] = date('Y-m-d H:i');
    }

    if ($previousStatus !== $newStatus) {
        $item['status_logs'] = $item['status_logs'] ?? [];
        $item['status_logs'][] = [
            'status' => $newStatus,
            'label' => $statusLabels[$newStatus] ?? $newStatus,
            'changed_at' => date('Y-m-d H:i'),
        ];
    }

    if ($newStatus === 'paid' && empty($item['payment_date'])) {
        $item['payment_date'] = date('Y-m-d H:i');
    }

    if ($newStatus === 'paid') {
        $item['payment_status'] = 'paid';
    }

    if ($newStatus === 'cancelled' && empty($item['refund_status'])) {
        $item['refund_status'] = 'requested';
    }
}
unset($item);

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/list.php'));
exit;