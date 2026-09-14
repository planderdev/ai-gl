<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

$pageTitle = '상품 수정';
$currentAdminTitle = '상품관리';

$pageCss = [
    'product.css',
    'product-form.css',
];

$pageJs = [
    'product-form.js',
];

$hotelOptions = admin_get_hotels();

$id = (int) ($_GET['id'] ?? 0);
$products = admin_get_products();
$products = is_array($products) ? $products : [];

$formData = null;
foreach ($products as $item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $formData = $item;
        break;
    }
}

if (!$formData) {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$formData['product_type'] = $formData['product_type'] ?? $formData['type'] ?? 'golf_course';

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>
    <main class="admin-main">
        <div class="admin-content">
            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/pages/product/form.php'; ?>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>