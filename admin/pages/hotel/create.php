<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
$pageTitle = '호텔 등록';
$currentAdminTitle = '호텔 관리';
$pageCss = ['product-form.css', 'hotel.css'];
$pageJs = ['product-form.js'];
$formData = [
    'id' => 0,
    'status' => 'publish',
    'sort_order' => 0,
    'name' => '',
    'brand_label' => 'HOTEL INFO',
    'tag' => '',
    'website' => '',
    'phone' => '',
    'address' => '',
    'checkin_out' => '',
    'description' => '',
    'description_2' => '',
    'description_3' => '',
    'gallery' => [['url' => '', 'caption' => '', 'alt' => '', 'is_cover' => 1]],
];
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>
<div class="admin-layout"><?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?><main class="admin-main"><div class="admin-content"><?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/pages/hotel/form.php'; ?></div></main></div>
<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>
