<?php
declare(strict_types=1);

require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$duplicated = admin_duplicate_product($id);

if (!$duplicated) {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

header('Location: ' . admin_url('pages/product/edit.php?id=' . (int) $duplicated['id']));
exit;