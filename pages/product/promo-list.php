<?php
$pageType = 'special';
$pageBreadcrumbs = ['홈', '특가 상품'];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/pr-data.php';

$pageTitle = '캐디스 AI │ 특가 상품';
$pageDescription = '원하는 지역과 날짜에 맞춰 실시간 티타임을 비교하고 예약해보세요.';
$pageKeywords = '일본 골프, 티타임, 골프 예약, 캐디스 AI';
$pageUrl = 'https://ai-gl.ai/pages/product/pr-list';

$pageCss = [
    'assets/css/pages/product/pr-list.css',
    'assets/css/pages/product/search.css',
    'assets/css/pages/product/filter.css',
    'assets/css/pages/product/card.css',
    'assets/css/pages/product/theme-filter.css',
];

$pageJs = [
    'assets/js/pages/product/pr-list.js',
    'assets/js/pages/product/filter.js',
    'assets/js/pages/product/search.js', 
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="tb-page">
    <div class="tb-container">

    <nav class="breadcrumb" aria-label="breadcrumb">
    <?php foreach ($teetimePageData['breadcrumbs'] as $index => $crumb): ?>
        <span><?= htmlspecialchars($crumb) ?></span>
        <?php if ($index !== array_key_last($teetimePageData['breadcrumbs'])): ?>
            <span class="breadcrumb__sep">/</span>
        <?php endif; ?>
    <?php endforeach; ?>
</nav>

        <?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/product/pr-search-section.php'; ?>

        <?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/product/promo-filter-section.php'; ?>

        <?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/product/pr-list-section.php'; ?>

    </div>
</main>

<div class="booking-modal" id="dateModal" aria-hidden="true">
    <div class="booking-modal-dim"></div>

    <div class="booking-modal-dialog">
        <div class="booking-modal-header">
            <button type="button" class="calendar-nav-btn" id="prevMonthBtn">
            <span class="material-symbols-rounded">
chevron_backward
</span>
            </button>

            <strong id="calendarTitle">2026 3월</strong>

            <button type="button" class="calendar-nav-btn" id="nextMonthBtn">
            <span class="material-symbols-rounded">
chevron_forward
</span>
            </button>
        </div>

        <div class="calendar-weekdays">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>

        <div class="booking-modal-footer">
            <button type="button" class="calendar-action-btn cancel" id="calendarCancelBtn">취소</button>
            <button type="button" class="calendar-action-btn confirm" id="calendarConfirmBtn">확인</button>
        </div>
    </div>
</div>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>