<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<?php
include __DIR__ . '/includes/data/site.php';
include __DIR__ . '/includes/data/menu.php';
include __DIR__ . '/includes/data/hero.php';
include __DIR__ . '/includes/data/themes.php';
include __DIR__ . '/includes/data/products.php';
include __DIR__ . '/includes/data/rankings.php';
include __DIR__ . '/includes/data/banners.php';
include __DIR__ . '/includes/data/footer.php';
?>

<?php include __DIR__ . '/includes/header.php'; ?>

<main class="main-page">
    <?php include __DIR__ . '/includes/sections/hero.php'; ?>
    <?php include __DIR__ . '/includes/sections/section-theme.php'; ?>
    <?php include __DIR__ . '/includes/sections/section-product-tab.php'; ?>
    <?php include __DIR__ . '/includes/sections/section-popular-regions.php'; ?>
    <?php include __DIR__ . '/includes/sections/section-season-picks.php'; ?>
    <?php include __DIR__ . '/includes/sections/section-bucket-list.php'; ?>    
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>