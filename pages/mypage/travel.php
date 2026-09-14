<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'travel';

$pageTitle = '나의 여행';
$pageDescription = '캐디스 나의 여행';
$pageKeywords = '캐디스, 나의여행, 여행내역';
$pageUrl = 'https://ai-gl.ai/pages/mypage/travel.php';

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
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['travel']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= htmlspecialchars($myPageData['travel']['hero']['title']) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['travel']['hero']['desc']) ?></p>
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
                    <section class="mp-surface" data-aos="fade-up" data-aos-duration="700">
                        <div class="mp-section__head">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Travel History</span>
                                <h2 class="mp-section__title">여행 내역</h2>
                                <p class="mp-section__desc">진행 예정 여행과 완료된 여행을 한눈에 확인할 수 있습니다.</p>
                            </div>
                        </div>

                        <div class="mp-trip-list">
                            <?php foreach ($myPageData['travel']['items'] as $index => $trip): ?>
                                <article
                                    class="mp-trip-card"
                                    data-aos="fade-up"
                                    data-aos-delay="<?= $index * 100 ?>"
                                    data-aos-duration="750">
                                    <div class="mp-trip-card__thumb">
                                        <img src="<?= htmlspecialchars($trip['thumb']) ?>" alt="<?= htmlspecialchars($trip['title']) ?>">
                                    </div>

                                    <div class="mp-trip-card__body">
                                        <div class="mp-trip-card__top">
                                            <div class="mp-trip-card__status">
                                                <span class="mp-chip"><?= htmlspecialchars($trip['status']) ?></span>
                                                <span class="mp-badge"><?= htmlspecialchars($trip['badge']) ?></span>
                                            </div>
                                        </div>

                                        <h3 class="mp-trip-card__title"><?= htmlspecialchars($trip['title']) ?></h3>

                                        <ul class="mp-meta-list">
                                            <li>
                                                <strong>여행일정</strong>
                                                <span><?= htmlspecialchars($trip['period']) ?></span>
                                            </li>
                                            <li>
                                                <strong>인원</strong>
                                                <span><?= htmlspecialchars($trip['people']) ?></span>
                                            </li>
                                            <li>
                                                <strong>골프장</strong>
                                                <span><?= htmlspecialchars($trip['course']) ?></span>
                                            </li>
                                            <li>
                                                <strong>호텔</strong>
                                                <span><?= htmlspecialchars($trip['hotel']) ?></span>
                                            </li>
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
                            <?php endforeach; ?>

                            <div class="mp-empty mp-empty--travel" data-aos="fade-up" data-aos-duration="700">
                            <div class="mp-empty__icon">
                                <i class="ri-luggage-cart-line" aria-hidden="true"></i>
                            </div>
                            <h3 class="mp-empty__title">아직 예약한 여행이 없어요</h3>
                            <p class="mp-empty__desc">원하는 지역과 일정에 맞는 골프 여행을 찾아보고 첫 예약을 시작해보세요.</p>
                            <div class="mp-empty__actions">
                                <a href="/pages/product/pr-list.php" class="mp-btn mp-btn--dark">상품 보러가기</a>
                                <a href="/pages/contact.php" class="mp-btn mp-btn--line">상담 문의</a>
                            </div>
                        </div>

                        </div> 

                    </section>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>