<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'coupons';

$pageTitle = '보유쿠폰';
$pageDescription = '캐디스 보유쿠폰';
$pageKeywords = '캐디스, 쿠폰, 할인쿠폰';
$pageUrl = 'https://ai-gl.ai/pages/mypage/coupons.php';

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
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['coupons']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= htmlspecialchars($myPageData['coupons']['hero']['title']) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['coupons']['hero']['desc']) ?></p>
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
                                <span class="mp-section__eyebrow">Coupons</span>
                                <h2 class="mp-section__title">쿠폰 내역</h2>
                                <p class="mp-section__desc">예약 시 사용할 수 있는 혜택과 만료 쿠폰을 확인해보세요.</p>
                            </div>
                        </div>

                        <div class="mp-coupon-list">
                            <?php foreach ($myPageData['coupons']['items'] as $index => $coupon): ?>
                                <article
                                    class="mp-coupon-card <?= $coupon['status'] === '만료' ? 'is-expired' : '' ?>"
                                    data-aos="fade-up"
                                    data-aos-delay="<?= $index * 90 ?>"
                                    data-aos-duration="700">
                                    <div class="mp-coupon-card__main">
                                        <span class="mp-chip"><?= htmlspecialchars($coupon['status']) ?></span>
                                        <h3><?= htmlspecialchars($coupon['name']) ?></h3>
                                        <p><?= htmlspecialchars($coupon['desc']) ?></p>
                                    </div>

                                    <div class="mp-coupon-card__side">
                                        <strong><?= htmlspecialchars($coupon['discount']) ?></strong>
                                        <span>유효기간 <?= htmlspecialchars($coupon['expire']) ?></span>
                                    </div>
                                </article>
                            <?php endforeach; ?>

                                     
                        <div class="mp-empty mp-empty--coupon mp-empty--soft" data-aos="fade-up" data-aos-duration="700">
                            <div class="mp-empty__icon">
                                <i class="ri-coupon-3-line" aria-hidden="true"></i>
                            </div>
                            <h3 class="mp-empty__title">사용 가능한 쿠폰이 없어요</h3>
                            <p class="mp-empty__desc">이벤트와 프로모션에 참여하면 새로운 할인 쿠폰을 받을 수 있어요.</p>
                            <div class="mp-empty__actions">
                                <a href="/pages/event/list.php" class="mp-btn mp-btn--dark">이벤트 보기</a>
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