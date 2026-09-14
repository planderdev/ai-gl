<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/customer/customer-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/customer/list.php'));
    exit;
}

$customers = admin_get_customers();

$name = trim((string) ($_POST['name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));

if ($name === '' || $phone === '') {
    header('Location: ' . admin_url('pages/customer/create.php'));
    exit;
}

$bookingCount = max(0, (int) ($_POST['booking_count'] ?? 0));
$totalAmount = max(0, (int) ($_POST['total_amount'] ?? 0));
$avgAmountInput = max(0, (int) ($_POST['avg_amount'] ?? 0));

$avgAmount = $avgAmountInput;
if ($avgAmount <= 0 && $bookingCount > 0 && $totalAmount > 0) {
    $avgAmount = (int) floor($totalAmount / max(1, $bookingCount));
}

$tags = array_values(array_filter(array_map('trim', explode(',', (string) ($_POST['tags'] ?? '')))));
$preferredDestinations = array_values(array_filter(array_map('trim', explode(',', (string) ($_POST['preferred_destinations'] ?? '')))));

$newCustomer = [
    'id' => admin_next_customer_id($customers),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'grade' => trim((string) ($_POST['grade'] ?? 'silver')),
    'segment' => trim((string) ($_POST['segment'] ?? 'new')),
    'region' => trim((string) ($_POST['region'] ?? '')),
    'status' => trim((string) ($_POST['status'] ?? 'active')),
    'marketing' => ((string) ($_POST['marketing'] ?? '1')) === '1',
    'booking_count' => $bookingCount,
    'cancel_count' => max(0, (int) ($_POST['cancel_count'] ?? 0)),
    'total_amount' => $totalAmount,
    'avg_amount' => $avgAmount,
    'last_booking_date' => trim((string) ($_POST['last_booking_date'] ?? '')),
    'last_product' => trim((string) ($_POST['last_product'] ?? '')),
    'joined_at' => trim((string) ($_POST['joined_at'] ?? date('Y-m-d'))),
    'memo' => trim((string) ($_POST['memo'] ?? '')),
    'tags' => $tags,
    'preferred_destinations' => $preferredDestinations,
    'recent_bookings' => [],
];

$customers[] = $newCustomer;
admin_save_customers($customers);

header('Location: ' . admin_url('pages/customer/detail.php?id=' . $newCustomer['id']));
exit;