<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';
$id = (int) ($_POST['id'] ?? 0);
$hotels = array_values(array_filter(admin_get_hotels(), static fn($hotel) => (int) ($hotel['id'] ?? 0) !== $id));
admin_save_hotels($hotels);
header('Location: ' . admin_url('pages/hotel/list.php'));
exit;
