<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';
$payload = [
    'id' => (int) ($_POST['id'] ?? 0),
    'status' => $_POST['status'] ?? 'publish',
    'sort_order' => $_POST['sort_order'] ?? 0,
    'name' => $_POST['name'] ?? '',
    'brand_label' => $_POST['brand_label'] ?? 'HOTEL INFO',
    'tag' => $_POST['tag'] ?? '',
    'website' => $_POST['website'] ?? '',
    'phone' => $_POST['phone'] ?? '',
    'address' => $_POST['address'] ?? '',
    'checkin_out' => $_POST['checkin_out'] ?? '',
    'description' => $_POST['description'] ?? '',
    'description_2' => $_POST['description_2'] ?? '',
    'description_3' => $_POST['description_3'] ?? '',
    'gallery' => $_POST['gallery'] ?? [],
];
$hotel = admin_upsert_hotel($payload);
header('Location: ' . admin_url('pages/hotel/edit.php?id=' . (int) ($hotel['id'] ?? 0)));
exit;
