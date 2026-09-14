<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/pr-data.php';

$pageTitle = '일본 골프 티타임';
$pageDescription = '원하는 지역과 날짜에 맞춰 실시간 티타임을 비교하고 예약해보세요.';
$pageKeywords = '일본 골프, 티타임, 골프 예약, 캐디스 AI';
$pageUrl = 'https://ai-gl.ai/pages/product/pr-list';

$pageCss = [
    'assets/css/pages/product/pr-list.css',
    'assets/css/pages/product/search.css',
    'assets/css/pages/product/filter.css',
    'assets/css/pages/product/card.css',
];

$pageJs = [
    'assets/js/pages/product/pr-list.js',
    'assets/js/pages/product/filter.js',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="tb-page">
    <div class="tb-container">

        <?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/product/pr-search-section.php'; ?>

        
<header class="tb-page-head">
    <div class="tb-page-head__main">
        <h1><?= htmlspecialchars($teetimePageData['page_title']) ?></h1>
        <p class="tb-page-head__desc"><?= htmlspecialchars($teetimePageData['page_subtitle']) ?></p>
    </div>

    <div class="tb-page-head__meta">
        <span class="tb-page-head__chip">
            총 <?= number_format($teetimePageData['summary']['total_courses']) ?>개 골프장
        </span>
        <span class="tb-page-head__chip">
            <?= htmlspecialchars($teetimePageData['summary']['reservable_label']) ?>
        </span>
    </div>
</header>

<?php if (!empty($teetimePageData['best_courses'])): ?>
<section class="tb-best-product" aria-label="베스트 상품">
    <div class="tb-best-product__head">
        <h2 class="tb-best-product__heading">베스트 상품</h2>

        <div class="tb-best-product__nav">
            <button type="button" class="tb-best-product__prev" aria-label="이전 베스트 상품">
                <span class="material-symbols-rounded">
chevron_backward
</span>
            </button>
            <button type="button" class="tb-best-product__next" aria-label="다음 베스트 상품">
                <span class="material-symbols-rounded">
chevron_forward
</span>
            </button>
        </div>
    </div>

    <div class="swiper tb-best-product-slider">
        <div class="swiper-wrapper">
            <?php foreach ($teetimePageData['best_courses'] as $best): ?>
                <div class="swiper-slide">
                    <a href="<?= htmlspecialchars($best['detail_url']) ?>" class="tb-best-product__card">
                        <div class="tb-best-product__thumb">
                            <img src="<?= htmlspecialchars($best['image']) ?>" alt="<?= htmlspecialchars($best['name']) ?>">
                            <span class="tb-best-product__best-badge"><?= htmlspecialchars($best['best_label']) ?></span>
                        </div>

                        <div class="tb-best-product__body">
                            <p class="tb-best-product__location"><?= htmlspecialchars($best['location']) ?></p>
                            <h3 class="tb-best-product__title"><?= htmlspecialchars($best['name']) ?></h3>

                            <div class="tb-best-product__specs">
                                <span class="tb-best-product__status"><?= htmlspecialchars($best['status_label']) ?></span>
                                <span><?= (int) $best['holes'] ?>홀</span>
                                <span><?= (int) $best['par'] ?>파</span>
                                <span><?= htmlspecialchars($best['yard']) ?></span>
                                <span>
                                    <?= htmlspecialchars($best['airport_name']) ?>에서
                                    <?= htmlspecialchars($best['airport_distance']) ?> ·
                                    <?= htmlspecialchars($best['airport_time']) ?>
                                </span>
                            </div>

                            <div class="tb-best-product__badge-row">
                                <span class="tb-best-product__badge"><?= htmlspecialchars($best['badge']) ?></span>
                            </div>

                            <div class="tb-best-product__footer">
                                <strong class="tb-best-product__price"><?= htmlspecialchars($best['price']) ?></strong>
                            </div>
                        </div>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="tb-best-product__pagination"></div>
</section>
<?php endif; ?>


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