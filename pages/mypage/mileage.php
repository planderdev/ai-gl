<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'mileage';

$pageTitle = '마일리지';
$pageDescription = '캐디스 마일리지';
$pageKeywords = '캐디스, 마일리지, 적립금';
$pageUrl = 'https://ai-gl.ai/pages/mypage/mileage.php';

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
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['mileage']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= htmlspecialchars($myPageData['mileage']['hero']['title']) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['mileage']['hero']['desc']) ?></p>
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
                        <div class="mp-point-box" data-aos="fade-up" data-aos-duration="700">
                            <span>현재 보유 마일리지</span>
                            <strong><?= htmlspecialchars($myPageData['mileage']['current']) ?></strong>
                            <p>패키지 예약 시 현금처럼 사용할 수 있습니다.</p>
                        </div>

                        <div class="mp-section__head" data-aos="fade-up" data-aos-duration="700">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Mileage History</span>
                                <h2 class="mp-section__title">적립 / 사용 내역</h2>
                                <p class="mp-section__desc">최근 마일리지 적립 및 사용 내역을 확인하세요.</p>
                            </div>
                        </div>

                        <div class="mp-history-table">
                            <div class="mp-history-table__head">
                                <span>구분</span>
                                <span>내용</span>
                                <span>일자</span>
                                <span>금액</span>
                            </div>

                            <?php foreach ($myPageData['mileage']['history'] as $index => $item): ?>
                                <div
                                    class="mp-history-table__row"
                                    data-aos="fade-up"
                                    data-aos-delay="<?= $index * 80 ?>"
                                    data-aos-duration="650">
                                    <span><?= htmlspecialchars($item['type']) ?></span>
                                    <span><?= htmlspecialchars($item['title']) ?></span>
                                    <span><?= htmlspecialchars($item['date']) ?></span>
                                    <strong class="<?= str_contains($item['amount'], '+') ? 'is-plus' : 'is-minus' ?>">
                                        <?= htmlspecialchars($item['amount']) ?>
                                    </strong>
                                </div>
                            <?php endforeach; ?>

                            
                        <div class="mp-empty mp-empty--mileage mp-empty--compact" data-aos="fade-up" data-aos-duration="700">
                            <div class="mp-empty__icon">
                                <i class="ri-coin-line" aria-hidden="true"></i>
                            </div>
                            <h3 class="mp-empty__title">마일리지 내역이 아직 없어요</h3>
                            <p class="mp-empty__desc">예약과 이벤트 참여를 통해 마일리지를 적립하고 결제 시 사용할 수 있어요.</p>
                        </div>
                        
                        </div> 
                    </section>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>