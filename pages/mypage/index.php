<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'dashboard';

$pageTitle = '마이페이지';
$pageDescription = '캐디스 마이페이지 대시보드';
$pageKeywords = '캐디스, 마이페이지, 나의여행, 쿠폰, 마일리지';
$pageUrl = 'https://ai-gl.ai/pages/mypage/index.php';

$pageCss = [
    'assets/css/pages/mypage/main.css',
];

$pageJs = [
    'assets/js/pages/mypage/main.js',
];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="mp-page">
    <section class="mp-hero">
        <div class="container">
            <div class="mp-hero__content" data-aos="fade-up" data-aos-duration="700">
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['dashboard']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= nl2br(htmlspecialchars($myPageData['dashboard']['hero']['title'])) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['dashboard']['hero']['desc']) ?></p>

                <?php if (!empty($myPageData['dashboard']['hero_stats'])): ?>
                    <div class="mp-hero-stats">
                        <?php foreach ($myPageData['dashboard']['hero_stats'] as $index => $stat): ?>
                            <div
                                class="mp-hero-stat"
                                data-aos="fade-up"
                                data-aos-delay="<?= $index * 100 ?>"
                                data-aos-duration="700"
                            >
                                <span class="mp-hero-stat__icon">
                                    <i class="<?= htmlspecialchars($stat['icon']) ?>" aria-hidden="true"></i>
                                </span>
                                <div class="mp-hero-stat__text">
                                    <span class="mp-hero-stat__label"><?= htmlspecialchars($stat['label']) ?></span>
                                    <strong class="mp-hero-stat__value"><?= htmlspecialchars($stat['value']) ?></strong>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <section class="mp-section">
        <div class="container">
            <div class="mp-layout">
                <div data-aos="fade-right" data-aos-duration="700">
                    <?php include $_SERVER['DOCUMENT_ROOT'] . '/pages/mypage/sidebar.php'; ?>
                </div>

                <div class="mp-content">
                    <section class="mp-dashboard-quick mp-surface" data-aos="fade-up" data-aos-duration="700">
                        <div class="mp-section__head">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Overview</span>
                                <h2 class="mp-section__title">한눈에 보는 마이페이지</h2>
                                <p class="mp-section__desc">현재 예약 현황과 혜택 정보를 빠르게 확인할 수 있습니다.</p>
                            </div>
                        </div>

                        <div class="mp-quick-grid">
                            <?php foreach ($myPageData['dashboard']['quickLinks'] as $index => $item): ?>
                                <a
                                    href="<?= htmlspecialchars($item['url']) ?>"
                                    class="mp-quick-card mp-quick-card--<?= htmlspecialchars($item['tone'] ?? 'default') ?>"
                                    data-aos="fade-up"
                                    data-aos-delay="<?= $index * 100 ?>"
                                    data-aos-duration="700"
                                >
                                    <div class="mp-quick-card__icon">
                                        <i class="<?= htmlspecialchars($item['icon'] ?? 'ri-arrow-right-up-line') ?>" aria-hidden="true"></i>
                                    </div>

                                    <div class="mp-quick-card__top">
                                        <h3 class="mp-quick-card__title"><?= htmlspecialchars($item['title']) ?></h3>
                                        <span class="mp-quick-card__value"><?= htmlspecialchars($item['value']) ?></span>
                                    </div>

                                    <p class="mp-quick-card__desc"><?= htmlspecialchars($item['desc']) ?></p>

                                    <span class="mp-quick-card__arrow" aria-hidden="true">
                                        <i class="ri-arrow-right-up-line"></i>
                                    </span>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </section>

                    <section class="mp-dashboard-feature mp-surface" data-aos="fade-up" data-aos-duration="800">
                        <div class="mp-section__head">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Upcoming Trip</span>
                                <h2 class="mp-section__title">다가오는 여행</h2>
                                <p class="mp-section__desc">가장 가까운 여행 일정과 예약 정보를 확인하세요.</p>
                            </div>
                        </div>

                        <?php $trip = $myPageData['dashboard']['recentTrip']; ?>
                        <article class="mp-trip-card">
                            <div class="mp-trip-card__thumb">
                                <img src="<?= htmlspecialchars($trip['thumb']) ?>" alt="<?= htmlspecialchars($trip['title']) ?>">
                            </div>

                            <div class="mp-trip-card__body">
                                <div class="mp-trip-card__top">
                                    <div class="mp-trip-card__status">
                                        <span class="mp-chip"><?= htmlspecialchars($trip['status']) ?></span>
                                        <span class="mp-badge"><?= htmlspecialchars($trip['badge']) ?></span>
                                    </div>

                                    <?php if (!empty($trip['booking_no'])): ?>
                                        <span class="mp-trip-card__booking">
                                            예약번호 <?= htmlspecialchars($trip['booking_no']) ?>
                                        </span>
                                    <?php endif; ?>
                                </div>

                                <h3 class="mp-trip-card__title"><?= htmlspecialchars($trip['title']) ?></h3>

                                <ul class="mp-meta-list">
                                    <li><strong>여행일정</strong><span><?= htmlspecialchars($trip['period']) ?></span></li>
                                    <li><strong>인원</strong><span><?= htmlspecialchars($trip['people']) ?></span></li>
                                    <li><strong>골프장</strong><span><?= htmlspecialchars($trip['course']) ?></span></li>
                                    <li><strong>호텔</strong><span><?= htmlspecialchars($trip['hotel']) ?></span></li>
                                </ul>

                                <div class="mp-trip-card__bottom">
                                    <div class="mp-trip-card__price-wrap">
                                        <span class="mp-trip-card__price-label">총 결제금액</span>
                                        <strong class="mp-trip-card__price"><?= htmlspecialchars($trip['price']) ?></strong>
                                    </div>

                                    <div class="mp-btn-group">
                                        <a href="<?= htmlspecialchars($trip['url']) ?>" class="mp-btn mp-btn--line">예약 상세</a>
                                        <a href="#;" class="mp-btn mp-btn--dark">문의하기</a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>

                    <section class="mp-dashboard-notice mp-surface" data-aos="fade-up" data-aos-duration="700">
                        <div class="mp-section__head">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Notifications</span>
                                <h2 class="mp-section__title">최근 알림</h2>
                                <p class="mp-section__desc">예약, 혜택, 시스템 안내를 빠르게 확인할 수 있습니다.</p>
                            </div>
                            <a href="/pages/mypage/notifications.php" class="mp-section__more">설정 보기</a>
                        </div>

                        <div class="mp-notice-list">
                            <?php foreach ($myPageData['dashboard']['noticeItems'] as $index => $item): ?>
                                <article
                                    class="mp-notice-card <?= !empty($item['is_new']) ? 'is-new' : '' ?>"
                                    data-aos="fade-up"
                                    data-aos-delay="<?= $index * 80 ?>"
                                    data-aos-duration="650"
                                >
                                    <div class="mp-notice-card__meta">
                                        <?php if (!empty($item['type'])): ?>
                                            <span class="mp-notice-card__type"><?= htmlspecialchars($item['type']) ?></span>
                                        <?php endif; ?>

                                        <?php if (!empty($item['is_new'])): ?>
                                            <span class="mp-notice-card__new">NEW</span>
                                        <?php endif; ?>

                                        <span class="mp-notice-card__date"><?= htmlspecialchars($item['date']) ?></span>
                                    </div>

                                    <div class="mp-notice-card__content">
                                        <h3><?= htmlspecialchars($item['title']) ?></h3>
                                        <p><?= htmlspecialchars($item['desc']) ?></p>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>