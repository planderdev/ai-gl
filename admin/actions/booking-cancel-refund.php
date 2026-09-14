<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$cancelReason = trim($_POST['cancel_reason'] ?? '');
$refundStatus = trim($_POST['refund_status'] ?? 'none');
$refundAmount = (int) ($_POST['refund_amount'] ?? 0);
$refundMemo = trim($_POST['refund_memo'] ?? '');

$bookings = admin_get_bookings();

foreach ($bookings as &$item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $previousStatus = $item['status'] ?? '';

        $item['cancel_reason'] = $cancelReason;
        $item['refund_status'] = $refundStatus;
        $item['refund_amount'] = $refundAmount;
        $item['refund_memo'] = $refundMemo;

        if (($item['status'] ?? '') !== 'cancelled') {
            $item['status'] = 'cancelled';
            $item['cancel_date'] = date('Y-m-d H:i');

            $item['status_logs'] = $item['status_logs'] ?? [];
            if ($previousStatus !== 'cancelled') {
                $item['status_logs'][] = [
                    'status' => 'cancelled',
                    'label' => '취소',
                    'changed_at' => date('Y-m-d H:i'),
                ];
            }
        }

        if ($refundStatus === 'refunded') {
            $item['payment_status'] = 'refunded';
            $item['refund_date'] = date('Y-m-d H:i');
        } elseif ($refundStatus === 'requested') {
            $item['refund_date'] = '';
        } else {
            $item['refund_date'] = '';
        }

        break;
    }
}
unset($item);

admin_save_bookings($bookings);

header('Location: ' . admin_url('pages/booking/detail.php?id=' . $id));
exit;