<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';
$id = (int) ($_GET['id'] ?? 0);
$formData = $id > 0 ? admin_find_hotel_by_id($id) : null;
if (!$formData) { header('Location: ' . admin_url('pages/hotel/list.php')); exit; }
$pageTitle = '호텔 수정';
$currentAdminTitle = '호텔 관리';
$pageCss = ['product-form.css', 'hotel.css'];
$pageJs = ['product-form.js'];
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>
<div class="admin-layout"><?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?><main class="admin-main"><div class="admin-content"><?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/pages/hotel/form.php'; ?></div></main></div>
<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>
