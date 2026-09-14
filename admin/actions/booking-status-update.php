<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$status = $_POST['status'] ?? 'pending';

$statusLabels = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

$bookings = admin_get_bookings();

foreach ($bookings as &$item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $previousStatus = $item['status'] ?? '';

        $item['status'] = $status;

        if ($status === 'cancelled' && empty($item['cancel_date'])) {
            $item['cancel_date'] = date('Y-m-d H:i');
        }

        if ($previousStatus !== $status) {
            $item['status_logs'] = $item['status_logs'] ?? [];
            $item['status_logs'][] = [
                'status' => $status,
                'label' => $statusLabels[$status] ?? $status,
                'changed_at' => date('Y-m-d H:i'),
            ];
        }

        break;
    }
}
unset($item);

admin_save_bookings($bookings);

$redirectId = $id > 0 ? $id : 0;
header('Location: ' . admin_url('pages/booking/detail.php?id=' . $redirectId));
exit;