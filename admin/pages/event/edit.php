<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

$regionOptions = admin_get_active_taxonomy_items('regions');

$id = (int) ($_GET['id'] ?? 0);
$event = $id > 0 ? admin_find_event_by_id($id) : null;

if (!$event) {
    header('Location: ' . admin_url('pages/event/list.php'));
    exit;
}

$pageTitle = '이벤트 수정';
$currentAdminTitle = '이벤트관리';

$pageCss = [
    'event.css',
];

$pageJs = [
    'event-form.js',
];

$products = admin_get_products();
$products = is_array($products) ? $products : [];

$formData = array_merge([
    'id' => 0,
    'title' => '',
    'status' => 'draft',
    'event_type' => 'promotion',
    'summary' => '',
    'start_date' => '',
    'end_date' => '',
    'region' => '',

    'status_label' => '',
    'badge_text' => '',
    'booking_method' => '',
    'target_text' => '',

    'content' => '',
    'benefit' => '',

    'cta_primary_text' => '',
    'cta_primary_url' => '',
    'cta_secondary_text' => '',
    'cta_secondary_url' => '',

    'related_product_ids' => [],
    'banner_image' => '',
    'hero_gallery' => [],
    'target_tags' => [],
    'feature_tags' => [],
    'sections' => [],
], $event);

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                    <h1 class="admin-page-head__title">이벤트 수정</h1>
                    <p class="admin-page-head__desc">이벤트 정보를 수정합니다.</p>
                </div>
            </div>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/pages/event/form.php'; ?>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>