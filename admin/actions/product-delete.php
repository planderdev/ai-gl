<?php
declare(strict_types=1);

require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/media/media-helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$product = admin_find_product($id);

if ($product) {
    $thumbnail = trim((string) ($product['thumbnail'] ?? ''));
    if ($thumbnail !== '') {
        admin_delete_uploaded_file_by_url($thumbnail);
    }

    $galleries = [
        is_array($product['gallery'] ?? null) ? $product['gallery'] : [],
        is_array($product['hotel_gallery'] ?? null) ? $product['hotel_gallery'] : [],
        is_array($product['golf_gallery'] ?? null) ? $product['golf_gallery'] : [],
    ];

    foreach ($galleries as $gallery) {
        foreach ($gallery as $image) {
            if (!is_array($image)) {
                continue;
            }

            $url = trim((string) ($image['url'] ?? ''));
            if ($url !== '') {
                admin_delete_uploaded_file_by_url($url);
            }
        }
    }
}

admin_delete_product($id);

header('Location: ' . admin_url('pages/product/list.php'));
exit;