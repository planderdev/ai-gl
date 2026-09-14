<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';

$pageTitle = '상품 등록';
$currentAdminTitle = '상품관리';

$pageCss = [
    'product.css',
    'product-form.css',
];

$pageJs = [
    'product-form.js',
];

$hotelOptions = admin_get_hotels();

$productType = $_GET['type'] ?? 'golf_course';
$productType = in_array($productType, ['golf_course', 'travel_package'], true) ? $productType : 'golf_course';

$formData = [
    'id' => 0,
    'product_type' => $productType,
    'status' => 'draft',
    'currency' => 'KRW',
    'price_type' => 'per_person',
    'booking_type' => 'instant',
    'availability_mode' => 'always_open',
    'payment_timing' => 'prepaid',
];

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