<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'status' => trim($_GET['status'] ?? ''),
    'date_from' => trim($_GET['date_from'] ?? ''),
    'date_to' => trim($_GET['date_to'] ?? ''),
];

$bookings = admin_get_bookings();
$bookings = is_array($bookings) ? $bookings : [];

$filteredBookings = array_values(array_filter($bookings, function ($item) use ($filters) {
    $customerName = (string) ($item['customer_name'] ?? '');
    $customerPhone = (string) ($item['customer_phone'] ?? '');
    $productTitle = (string) ($item['product_title'] ?? '');
    $status = (string) ($item['status'] ?? '');
    $date = (string) ($item['date'] ?? '');

    if ($filters['keyword'] !== '') {
        $haystack = mb_strtolower($customerName . ' ' . $customerPhone . ' ' . $productTitle);
        if (mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
            return false;
        }
    }

    if ($filters['status'] !== '' && $status !== $filters['status']) {
        return false;
    }

    if ($filters['date_from'] !== '' && $date < $filters['date_from']) {
        return false;
    }

    if ($filters['date_to'] !== '' && $date > $filters['date_to']) {
        return false;
    }

    return true;
}));

$statusLabelMap = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

$paymentMethodLabelMap = [
    'card' => '카드결제',
    'bank' => '무통장입금',
    'onsite' => '현장결제',
    'partial' => '부분결제',
];

$paymentStatusLabelMap = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'refunded' => '환불완료',
];

$refundStatusLabelMap = [
    'none' => '없음',
    'requested' => '환불요청',
    'refunded' => '환불완료',
];

$filename = 'bookings_' . date('Ymd_His') . '.csv';

header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');

fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

fputcsv($output, [
    '예약 ID',
    '상품명',
    '예약일',
    '인원',
    '총 금액',
    '예약 상태',
    '고객명',
    '연락처',
    '결제 수단',
    '결제 상태',
    '결제 금액',
    '결제 일시',
    '취소 사유',
    '취소 일시',
    '환불 상태',
    '환불 금액',
    '환불 일시',
    '환불 메모',
    '운영 메모',
]);

foreach ($filteredBookings as $item) {
    fputcsv($output, [
        (string) ($item['id'] ?? ''),
        (string) ($item['product_title'] ?? ''),
        (string) ($item['date'] ?? ''),
        (string) ($item['people'] ?? ''),
        (string) ($item['total_price'] ?? 0),
        (string) ($statusLabelMap[$item['status'] ?? ''] ?? ($item['status'] ?? '')),
        (string) ($item['customer_name'] ?? ''),
        (string) ($item['customer_phone'] ?? ''),
        (string) ($paymentMethodLabelMap[$item['payment_method'] ?? ''] ?? ($item['payment_method'] ?? '')),
        (string) ($paymentStatusLabelMap[$item['payment_status'] ?? ''] ?? ($item['payment_status'] ?? '')),
        (string) ($item['payment_amount'] ?? 0),
        (string) ($item['payment_date'] ?? ''),
        (string) ($item['cancel_reason'] ?? ''),
        (string) ($item['cancel_date'] ?? ''),
        (string) ($refundStatusLabelMap[$item['refund_status'] ?? 'none'] ?? ($item['refund_status'] ?? '')),
        (string) ($item['refund_amount'] ?? 0),
        (string) ($item['refund_date'] ?? ''),
        (string) ($item['refund_memo'] ?? ''),
        (string) ($item['admin_memo'] ?? ''),
    ]);
}

fclose($output);
exit;