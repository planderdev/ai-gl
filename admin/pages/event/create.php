<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

$regionOptions = admin_get_active_taxonomy_items('regions');

$pageTitle = '이벤트 등록';
$currentAdminTitle = '이벤트관리';

$pageCss = [
    'event.css',
];

$pageJs = [
    'event-form.js',
];

$products = admin_get_products();
$products = is_array($products) ? $products : [];

$formData = [
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

    'featured_product_id' => 0,
'featured_label' => '',
'featured_discount_rate' => '',
'featured_price_text' => '',
'featured_points' => [],

'recommended_for_items' => [],
'key_points' => [],
'before_booking_items' => [],
'booking_guide_items' => [],
'change_cancel_items' => [],

'venue_sections' => [],

];

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip">event MANAGER</span>
                    <h1 class="admin-page-head__title">이벤트 등록</h1>
                    <p class="admin-page-head__desc">이벤트 상세 페이지용 정보를 입력합니다.</p>
                </div>
            </div>

            <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/pages/event/form.php'; ?>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>