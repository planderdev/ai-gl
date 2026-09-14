<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$bookings = admin_get_bookings();

$status = trim((string) ($_POST['status'] ?? 'pending'));
$paymentStatus = trim((string) ($_POST['payment_status'] ?? 'pending'));
$refundStatus = trim((string) ($_POST['refund_status'] ?? 'none'));

$statusLabels = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

$refundLabels = [
    'none' => '환불 없음',
    'requested' => '환불 요청',
    'processing' => '환불 진행중',
    'completed' => '환불 완료',
];

foreach ($bookings as &$item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $previousStatus = (string) ($item['status'] ?? '');
        $previousRefundStatus = (string) ($item['refund_status'] ?? 'none');

        $item['product_id'] = (int) ($_POST['product_id'] ?? 0);
        $item['product_title'] = trim((string) ($_POST['product_title'] ?? ''));
        $item['date'] = trim((string) ($_POST['date'] ?? ''));
        $item['people'] = max(1, (int) ($_POST['people'] ?? 1));
        $item['total_price'] = max(0, (int) ($_POST['total_price'] ?? 0));
        $item['status'] = $status;

        $item['customer_name'] = trim((string) ($_POST['customer_name'] ?? ''));
        $item['customer_phone'] = trim((string) ($_POST['customer_phone'] ?? ''));

        $item['payment_method'] = trim((string) ($_POST['payment_method'] ?? 'card'));
        $item['payment_status'] = $paymentStatus;
        $item['payment_amount'] = max(0, (int) ($_POST['payment_amount'] ?? 0));
        $item['payment_date'] = trim((string) ($_POST['payment_date'] ?? ''));

        $item['cancel_reason'] = trim((string) ($_POST['cancel_reason'] ?? ''));
        $item['cancel_date'] = trim((string) ($_POST['cancel_date'] ?? ''));
        $item['admin_memo'] = trim((string) ($_POST['admin_memo'] ?? ''));

        $item['refund_status'] = $refundStatus;
        $item['refund_amount'] = max(0, (int) ($_POST['refund_amount'] ?? 0));
        $item['refund_date'] = trim((string) ($_POST['refund_date'] ?? ''));
        $item['refund_memo'] = trim((string) ($_POST['refund_memo'] ?? ''));

        if (!isset($item['status_logs']) || !is_array($item['status_logs'])) {
            $item['status_logs'] = [];
        }

        if ($previousStatus !== $status) {
            $item['status_logs'][] = [
                'status' => $status,
                'label' => $statusLabels[$status] ?? $status,
                'changed_at' => date('Y-m-d H:i'),
            ];
        }

        if ($previousRefundStatus !== $refundStatus && $refundStatus !== 'none') {
            $item['status_logs'][] = [
                'refund_status' => $refundStatus,
                'label' => $refundLabels[$refundStatus] ?? $refundStatus,
                'changed_at' => date('Y-m-d H:i'),
            ];
        }

        if ($status === 'cancelled' && empty($item['cancel_date'])) {
            $item['cancel_date'] = date('Y-m-d\TH:i');
        }

        if ($paymentStatus === 'refunded' && empty($item['refund_date'])) {
            $item['refund_date'] = date('Y-m-d\TH:i');
        }

        break;
    }
}
unset($item);

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/detail.php?id=' . $id));
exit;