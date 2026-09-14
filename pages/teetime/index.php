<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/teetime-main-data.php'; 

$pageTitle = '캐디스 AI │ 티타임';
$pageDescription = '일본 골프 티타임 메인 페이지';
$pageKeywords = '티타임, 일본 골프, 골프 여행, 특가 패키지';
$pageUrl = 'https://ai-gl.ai/pages/teetime/index.php';

$pageCss = [
    'assets/css/pages/teetime/main.css',
];

$pageJs = [
    'assets/js/pages/teetime/main.js',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="tm-page">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/includes/sections/hero.php'; ?>

    <?php
$golfPackageTabs = $teetimeMainData['productTabs'];
include $_SERVER['DOCUMENT_ROOT'] . '/includes/sections/section-product-tab.php';
?>

    <section class="tm-section tm-special">
        <div class="fullbreed">
            <div class="container section-head tm-section__head">
                <div>
                     <h2><?= htmlspecialchars($teetimeMainData['special']['title']) ?></h2>
                    <p><?= htmlspecialchars($teetimeMainData['special']['desc']) ?></p>
                </div>

                <div class="tm-slider-nav">
                    <button type="button" class="tm-slider-btn tm-special-prev" aria-label="특가 패키지 이전">
                    <span class="material-symbols-rounded">
chevron_backward
</span>
                    </button>
                    <button type="button" class="tm-slider-btn tm-special-next" aria-label="특가 패키지 다음">
                    <span class="material-symbols-rounded">
chevron_forward
</span>
                    </button>
                </div>
            </div>

            <div class="swiper tm-special-swiper">
                <div class="swiper-wrapper">
                    <?php foreach ($teetimeMainData['special']['items'] as $item): ?>
                        <div class="swiper-slide">
                            <a href="<?= htmlspecialchars($item['link']) ?>" class="tm-special-card">
                                <div class="tm-special-card__thumb">
                                    <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                                    <span class="tm-special-card__label"><?= htmlspecialchars($item['label']) ?></span>
                                </div>

                                <div class="tm-special-card__body">
                                    <p class="tm-special-card__location"><?= htmlspecialchars($item['location']) ?></p>
                                    <h3 class="tm-special-card__title"><?= htmlspecialchars($item['title']) ?></h3>
                                    <strong class="tm-special-card__price"><?= htmlspecialchars($item['price']) ?></strong>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="tm-slider-pagination tm-special-pagination"></div>
        </div>
    </section>

    <section class="tm-section tm-domestic">
        <div class="container">
            <div class="section-head tm-section__head">
                <div>
                     <h2><?= htmlspecialchars($teetimeMainData['domesticCards']['title']) ?></h2>
                    <p><?= htmlspecialchars($teetimeMainData['domesticCards']['desc']) ?></p>
                </div>
            </div>

            <div class="tm-domestic-grid">
                <?php foreach ($teetimeMainData['domesticCards']['items'] as $item): ?>
                    <a href="<?= htmlspecialchars($item['link']) ?>" class="tm-domestic-card">
                        <div class="tm-domestic-card__thumb">
                            <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                        </div>

                        <div class="tm-domestic-card__body">
                            <p class="tm-domestic-card__meta"><?= htmlspecialchars($item['meta']) ?></p>
                            <h3 class="tm-domestic-card__title"><?= htmlspecialchars($item['title']) ?></h3>
                            <strong class="tm-domestic-card__price"><?= htmlspecialchars($item['price']) ?></strong>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="tm-section tm-major">
        <div class="container">
            <a href="<?= htmlspecialchars($teetimeMainData['majorTour']['link']) ?>" class="tm-major-banner">
                <div class="tm-major-banner__image">
                    <img src="<?= htmlspecialchars($teetimeMainData['majorTour']['image']) ?>" alt="<?= htmlspecialchars($teetimeMainData['majorTour']['title']) ?>">
                </div>

                <div class="tm-major-banner__overlay"></div>

                <div class="tm-major-banner__content">
                    <span class="tm-major-banner__eyebrow"><?= htmlspecialchars($teetimeMainData['majorTour']['eyebrow']) ?></span>
                    <h2 class="tm-major-banner__title"><?= htmlspecialchars($teetimeMainData['majorTour']['title']) ?></h2>
                    <p class="tm-major-banner__desc"><?= htmlspecialchars($teetimeMainData['majorTour']['desc']) ?></p>
                    <span class="tm-major-banner__link">
                        <?= htmlspecialchars($teetimeMainData['majorTour']['link_text']) ?>
                        <span class="material-symbols-rounded">
chevron_forward
</span>
                    </span>
                </div>
            </a>
        </div>
    </section>

    <section class="tm-section tm-bucket">
        <div class="container">
            <div class="tm-bucket__head">
                <div class="tm-bucket__copy">
                    <div class="tm-bucket__badges">
                        <?php foreach ($teetimeMainData['bucket']['eyebrow'] as $badge): ?>
                            <span class="tm-bucket__badge"><?= htmlspecialchars($badge) ?></span>
                        <?php endforeach; ?>
                    </div>

                    <h2 class="tm-bucket__title"><?= nl2br(htmlspecialchars($teetimeMainData['bucket']['title'])) ?></h2>
                    <p class="tm-bucket__desc"><?= htmlspecialchars($teetimeMainData['bucket']['desc']) ?></p>
                </div>

                <div class="tm-slider-nav">
                    <button type="button" class="tm-slider-btn tm-bucket-prev" aria-label="버킷리스트 이전">
                    <span class="material-symbols-rounded">
chevron_backward
</span>
                    </button>
                    <button type="button" class="tm-slider-btn tm-bucket-next" aria-label="버킷리스트 다음">
                    <span class="material-symbols-rounded">
chevron_forward
</span>
                    </button>
                </div>
            </div>

            <div class="swiper tm-bucket-swiper">
                <div class="swiper-wrapper">
                    <?php foreach ($teetimeMainData['bucket']['items'] as $item): ?>
                        <div class="swiper-slide">
                            <a href="<?= htmlspecialchars($item['link']) ?>" class="tm-bucket-card">
                                <div class="tm-bucket-card__thumb">
                                    <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                                </div>

                                <div class="tm-bucket-card__body">
                                    <span class="tm-bucket-card__location">
                                        <?= htmlspecialchars($item['country']) ?> · <?= htmlspecialchars($item['city']) ?>
                                    </span>
                                    <h3 class="tm-bucket-card__title"><?= htmlspecialchars($item['title']) ?></h3>
                                    <strong class="tm-bucket-card__price"><?= htmlspecialchars($item['price']) ?></strong>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="tm-slider-pagination tm-bucket-pagination"></div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>