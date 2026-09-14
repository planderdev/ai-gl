<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/event-detail-data.php';

$eventId = isset($_GET['id']) ? (int) $_GET['id'] : 1;
$eventDetailData = getEventDetailData($eventId);

if (empty($eventDetailData)) {
    $eventDetailData = [
        'page_title' => '프로모션 상세',
        'page_description' => '프로모션 상세 페이지',
        'page_url' => 'https://ai-gl.ai/pages/event/detail.php?id=' . $eventId,
        'breadcrumbs' => ['홈', '프로모션', '상세'],
        'hero' => [
            'category' => 'PROMOTION',
            'title' => '프로모션 상세',
            'description' => '지금 진행 중인 프로모션의 혜택과 예약 포인트를 확인해보세요.',
            'gallery' => [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
            ],
        ],
        'summary' => [
            'status' => '진행중',
            'badge' => '한정 혜택',
            'highlights' => ['특가', '한정 수량', '상담 가능'],
            'period' => '2026.04.01 ~ 2026.04.30',
            'region' => '일본 · 제주',
            'target' => '커플 / 가족 / 소규모 모임',
            'reservation' => '상담 후 예약 확정',
            'primary_cta' => ['label' => '프로모션 예약하기', 'url' => '#'],
            'secondary_cta' => ['label' => '상담문의', 'url' => '#'],
        ],
       'benefits' => [
    ['icon' => '01', 'title' => '인기 코스 중심 구성', 'description' => '후기가 좋은 주요 골프장을 중심으로 선택 폭을 넓혔습니다.'],
    ['icon' => '02', 'title' => '숙박 연계 편의성', 'description' => '라운드와 숙소를 함께 맞춰 일정 정리가 훨씬 수월합니다.'],
    ['icon' => '03', 'title' => '맞춤 상담 가능', 'description' => '인원수와 희망 일정에 따라 다른 조합으로도 제안 가능합니다.'],
    ['icon' => '04', 'title' => '여행 확장성', 'description' => '골프 외에도 미식, 휴식, 관광 일정까지 함께 구성하기 좋습니다.'],
],
        'package_overview' => [
            'eyebrow' => 'PROMOTION PACKAGE',
            'title' => '대표 프로모션 구성',
            'discount' => '최대 15%',
            'price' => '₩1,290,000~',
            'image' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
            'items' => [
                ['label' => '포함사항', 'icon' => 'ri-check-line', 'lines' => ['숙박', '그린피', '기본 조식', '현지 이동 안내']],
                ['label' => '추천대상', 'icon' => 'ri-user-heart-line', 'lines' => ['휴양과 라운드를 함께 즐기고 싶은 고객', '가성비 좋은 일정이 필요한 고객']],
                ['label' => '예약안내', 'icon' => 'ri-information-2-line', 'lines' => ['상담 후 일정 확정', '좌석/객실 상황에 따라 변동 가능']],
            ],
            'cta' => ['label' => '예약하러 가기', 'url' => '#'],
        ],
        'content' => [
            'tabs' => [
                'overview' => [
                    'title' => '프로모션 소개',
                    'content' => [
                        '이번 프로모션은 상품 상세페이지처럼 핵심 정보를 빠르게 파악할 수 있도록 재구성된 이벤트 상세 화면입니다.',
                        '혜택, 구성, 유의사항, 추천 상품까지 하나의 흐름 안에서 확인할 수 있도록 설계되었습니다.',
                    ],
                    'cards' => [
                        [
                            'icon' => 'ri-user-star-line',
                            'title' => '이런 분께 추천해요',
                            'items' => [
                                '여행과 골프를 함께 즐기고 싶은 고객',
                                '프로모션 혜택을 비교하며 선택하고 싶은 고객',
                                '상담 기반으로 편하게 예약하고 싶은 고객',
                            ],
                        ],
                        [
                            'icon' => 'ri-bookmark-3-line',
                            'title' => '예약 포인트',
                            'items' => [
                                '원하는 지역과 일정 중심으로 상담 가능',
                                '인원 구성에 맞춘 유연한 제안 가능',
                                '특가 혜택은 기간 내 선착순 적용',
                            ],
                        ],
                        [
                            'icon' => 'ri-error-warning-line',
                            'title' => '체크 포인트',
                            'items' => [
                                '실시간 잔여 상황에 따라 조건 변동 가능',
                                '항공/객실/티타임은 상담 시 확정',
                                '프로모션별 포함사항이 다를 수 있음',
                            ],
                        ],
                    ],
                ],
                'notice' => [
                    'title' => '유의사항',
                    'groups' => [
                        [
                            'title' => '예약 전 확인',
                            'items' => [
                                '프로모션 가격은 선택 일정에 따라 달라질 수 있습니다.',
                                '상담 후 확정 단계에서 실제 가능 여부가 안내됩니다.',
                                '노출된 이미지는 이해를 돕기 위한 예시일 수 있습니다.',
                            ],
                        ],
                        [
                            'title' => '취소 / 변경',
                            'items' => [
                                '예약 확정 후 취소 규정이 별도로 적용될 수 있습니다.',
                                '일정 변경 시 추가 요금 또는 차액이 발생할 수 있습니다.',
                                '세부 조건은 상담 시 개별 안내됩니다.',
                            ],
                        ],
                    ],
                ],
            ],
        ],
        'event_schedule' => [
            [
                'day' => 'STEP 1',
                'items' => [
                    ['icon' => 'ri-search-eye-line', 'title' => '프로모션 확인', 'lines' => ['혜택, 포함사항, 대상 확인']],
                    ['icon' => 'ri-customer-service-2-line', 'title' => '상담 문의', 'lines' => ['희망 일정 / 지역 / 인원 전달']],
                ],
            ],
            [
                'day' => 'STEP 2',
                'items' => [
                    ['icon' => 'ri-calendar-check-line', 'title' => '가능 일정 제안', 'lines' => ['조건에 맞는 추천 상품 안내']],
                    ['icon' => 'ri-check-double-line', 'title' => '예약 확정', 'lines' => ['상담 후 예약 진행']],
                ],
            ],
        ],
        'location' => [
            'name' => '프로모션 상담센터',
            'address' => '서울특별시 강남구 테헤란로 123',
            'map_url' => '#',
            'embed_url' => 'https://maps.google.com/maps?q=Seoul&t=&z=13&ie=UTF8&iwloc=&output=embed',
        ],
        'related_products' => [
            [
                'url' => '#',
                'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
                'location' => '제주',
                'title' => '제주 프리미엄 골프 패키지',
                'description' => '라운드와 휴양을 함께 즐길 수 있는 인기 구성',
                'tags' => ['추천', '휴양'],
                'discount' => '10%',
                'original_price' => '₩1,490,000',
                'price' => '₩1,290,000',
            ],
            [
                'url' => '#',
                'image' => 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80',
                'location' => '일본',
                'title' => '일본 인기 골프 여행',
                'description' => '이동과 일정 밸런스가 좋은 추천 상품',
                'tags' => ['특가', '베스트'],
                'discount' => '12%',
                'original_price' => '₩1,690,000',
                'price' => '₩1,490,000',
            ],
        ],
    ];
}

$pageTitle = ($eventDetailData['page_title'] ?? '프로모션 상세') . ' | 캐디스';
$pageDescription = $eventDetailData['page_description'] ?? '프로모션 상세 페이지';
$pageKeywords = '프로모션 상세, 이벤트 상세, 골프 프로모션, 캐디스';
$pageUrl = $eventDetailData['page_url'] ?? 'https://ai-gl.ai/pages/event/detail.php?id=' . $eventId;

$pageCss = [
    'assets/css/pages/event/detail.css',
];

$pageJs = [
    'assets/js/pages/event/detail.js',
];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';

$breadcrumbs = $eventDetailData['breadcrumbs'] ?? [];
$hero = $eventDetailData['hero'] ?? [];
$summary = $eventDetailData['summary'] ?? [];
$benefits = $eventDetailData['benefits'] ?? [];
$content = $eventDetailData['content'] ?? [];
$packageOverview = $eventDetailData['package_overview'] ?? [];
$eventSchedule = $eventDetailData['event_schedule'] ?? [];
$location = $eventDetailData['location'] ?? [];
$relatedProducts = $eventDetailData['related_products'] ?? [];

$gallery = $hero['gallery'] ?? [];
$overviewTab = $content['tabs']['overview'] ?? [];
$noticeTab = $content['tabs']['notice'] ?? [];
$primaryCta = $summary['primary_cta'] ?? [];
$secondaryCta = $summary['secondary_cta'] ?? [];

$anchorTabs = [
    ['key' => 'overview', 'label' => '핵심 혜택'],
    ['key' => 'package', 'label' => '프로모션 구성'],
    ['key' => 'detail', 'label' => '상세 안내'],
    ['key' => 'schedule', 'label' => '진행 흐름'],
    ['key' => 'location', 'label' => '안내 / 위치'],
    ['key' => 'related', 'label' => '추천 상품'],
];

function e($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>

<main class="evd-page">
    <div class="container">

        <?php if (!empty($breadcrumbs)): ?>
            <nav class="breadcrumb" aria-label="breadcrumb">
                <?php foreach ($breadcrumbs as $index => $crumb): ?>
                    <span><?= e($crumb) ?></span>
                    <?php if ($index !== array_key_last($breadcrumbs)): ?>
                        <span class="breadcrumb__sep">/</span>
                    <?php endif; ?>
                <?php endforeach; ?>
            </nav>
        <?php endif; ?>

        <section class="evd-hero">
            <div class="evd-hero__main">
                <div class="evd-hero__media-card">
                    <div class="slider" data-slider>
                        <button type="button" class="slider-btn slider-btn--prev" data-slider-prev aria-label="이전 이미지">
                            ‹
                        </button>

                        <div class="slider-track" data-slider-track>
                            <?php foreach ($gallery as $image): ?>
                                <div class="slider-slide slider-slide--hero">
                                    <img src="<?= e($image) ?>" alt="<?= e($hero['title'] ?? '') ?>">
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <button type="button" class="slider-btn slider-btn--next" data-slider-next aria-label="다음 이미지">
                            ›
                        </button>

                        <div class="slider-dots" data-slider-dots></div>
                    </div>
                </div>

                <div class="evd-hero__content">
                    <div class="evd-hero__head">
                        <div class="evd-hero__eyebrow">
                            <?php if (!empty($hero['category'])): ?>
                                <span class="evd-chip evd-chip--brand"><?= e($hero['category']) ?></span>
                            <?php endif; ?>

                            <?php if (!empty($summary['status'])): ?>
                                <span class="evd-chip evd-chip--accent"><?= e($summary['status']) ?></span>
                            <?php endif; ?>

                            <?php if (!empty($summary['badge'])): ?>
                                <span class="evd-chip evd-chip--ghost"><?= e($summary['badge']) ?></span>
                            <?php endif; ?>
                        </div>

                        <h1 class="evd-title"><?= e($hero['title'] ?? '') ?></h1>

                        <?php if (!empty($hero['description'])): ?>
                            <p class="evd-summary"><?= e($hero['description']) ?></p>
                        <?php endif; ?>

                        <?php if (!empty($summary['highlights'])): ?>
                            <div class="evd-tag-list">
                                <?php foreach ($summary['highlights'] as $highlight): ?>
                                    <span class="evd-tag-pill">
                                        <span class="evd-tag-pill__icon"><i class="ri-check-line"></i></span>
                                        <span class="evd-tag-pill__text"><?= e($highlight) ?></span>
                                    </span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="evd-hero__stats">
                        <?php if (!empty($summary['period'])): ?>
                            <div class="evd-stat-card">
                                <span class="evd-stat-card__icon"><i class="ri-calendar-event-line"></i></span>
                                <span class="evd-stat-card__label">프로모션 기간</span>
                                <strong class="evd-stat-card__value"><?= e($summary['period']) ?></strong>
                                <small class="evd-stat-card__sub">기간 내 예약/상담 가능</small>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($summary['region'])): ?>
                            <div class="evd-stat-card">
                                <span class="evd-stat-card__icon"><i class="ri-map-pin-2-line"></i></span>
                                <span class="evd-stat-card__label">추천 지역</span>
                                <strong class="evd-stat-card__value"><?= e($summary['region']) ?></strong>
                                <small class="evd-stat-card__sub">인기 지역 기준 추천</small>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($summary['target'])): ?>
                            <div class="evd-stat-card">
                                <span class="evd-stat-card__icon"><i class="ri-user-heart-line"></i></span>
                                <span class="evd-stat-card__label">추천 대상</span>
                                <strong class="evd-stat-card__value"><?= e($summary['target']) ?></strong>
                                <small class="evd-stat-card__sub">여행 스타일에 따라 상담 가능</small>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <aside class="evd-hero__aside">
                <div class="evd-booking-panel">
                    <span class="evd-booking-panel__label">빠른 안내</span>
                    <h2 class="evd-booking-panel__title">프로모션 상담 / 예약</h2>

                    <div class="evd-booking-box">
                        <?php if (!empty($packageOverview['title'])): ?>
                            <div class="evd-select-card evd-select-card--full">
                                <span class="evd-select-card__label">대표 구성</span>
                                <strong class="evd-select-card__value"><?= e($packageOverview['title']) ?></strong>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($packageOverview['price'])): ?>
                            <div class="evd-select-card">
                                <span class="evd-select-card__label">시작가</span>
                                <strong class="evd-select-card__value"><?= e($packageOverview['price']) ?></strong>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($summary['reservation'])): ?>
                            <div class="evd-select-card">
                                <span class="evd-select-card__label">예약 방식</span>
                                <strong class="evd-select-card__value"><?= e($summary['reservation']) ?></strong>
                            </div>
                        <?php endif; ?>
                    </div>

                    <section class="evd-pricing">
                        <div class="evd-pricing__head">
                            <h3>핵심 정보</h3>
                        </div>

                        <div class="evd-pricing__list">
                            <?php if (!empty($summary['period'])): ?>
                                <div class="evd-pricing__row">
                                    <span><i class="ri-calendar-event-line"></i> 기간</span>
                                    <strong><?= e($summary['period']) ?></strong>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($summary['region'])): ?>
                                <div class="evd-pricing__row">
                                    <span><i class="ri-map-pin-2-line"></i> 지역</span>
                                    <strong><?= e($summary['region']) ?></strong>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($summary['target'])): ?>
                                <div class="evd-pricing__row">
                                    <span><i class="ri-group-line"></i> 대상</span>
                                    <strong><?= e($summary['target']) ?></strong>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($packageOverview['discount'])): ?>
                                <div class="evd-pricing__row">
                                    <span><i class="ri-price-tag-3-line"></i> 혜택</span>
                                    <strong><?= e($packageOverview['discount']) ?> 할인</strong>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="evd-pricing__actions">
                            <a href="<?= e($secondaryCta['url'] ?? '#') ?>" class="evd-btn evd-btn--dark">
                                <?= e($secondaryCta['label'] ?? '상담문의') ?>
                            </a>
                            <a href="<?= e($primaryCta['url'] ?? '#') ?>" class="evd-btn evd-btn--primary">
                                <?= e($primaryCta['label'] ?? '프로모션 예약하기') ?>
                            </a>
                        </div>
                    </section>
                </div>
            </aside>
        </section>

        <nav class="evd-anchor-nav" aria-label="이벤트 상세 내비게이션">
            <div class="evd-anchor-nav__inner">
                <?php foreach ($anchorTabs as $index => $tab): ?>
                    <a
                        href="#<?= e($tab['key']) ?>"
                        class="evd-anchor-nav__link<?= $index === 0 ? ' is-active' : '' ?>"
                        data-evd-anchor-link>
                         <span class="evd-anchor-nav__text"><?= e($tab['label']) ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </nav>

        <section class="evd-section" id="overview">
            <div class="evd-section-heading">
                <div>
                    <p class="evd-section-heading__eyebrow">OVERVIEW</p>
                    <h2 class="evd-section__title">핵심 혜택</h2>
                </div>
            </div>

            <?php if (!empty($benefits)): ?>
    <div class="evd-summary-grid">
        <?php foreach ($benefits as $benefit): ?>
            <article class="evd-summary-card">
                <div class="evd-summary-card__icon evd-summary-card__icon--number">
                    <?= e($benefit['icon'] ?? '01') ?>
                </div>
                <div class="evd-summary-card__body">
                    <span class="evd-summary-card__label">혜택 포인트</span>
                    <strong class="evd-summary-card__value"><?= e($benefit['title'] ?? '') ?></strong>
                    <p class="evd-summary-card__sub"><?= e($benefit['description'] ?? '') ?></p>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
        </section>

        <?php if (!empty($packageOverview)): ?>
            <section class="evd-section" id="package">
                <div class="evd-section-heading">
                    <div>
                        <p class="evd-section-heading__eyebrow">PACKAGE</p>
                        <h2 class="evd-section__title">프로모션 구성</h2>
                    </div>
                </div>

                <div class="evd-package-card">
                    <div class="evd-package-card__media">
                        <img src="<?= e($packageOverview['image'] ?? '') ?>" alt="<?= e($packageOverview['title'] ?? '') ?>">
                    </div>

                    <div class="evd-package-card__content">
                        <?php if (!empty($packageOverview['eyebrow'])): ?>
                            <span class="evd-chip evd-chip--soft"><?= e($packageOverview['eyebrow']) ?></span>
                        <?php endif; ?>

                        <h3 class="evd-package-card__title"><?= e($packageOverview['title'] ?? '') ?></h3>

                        <div class="evd-package-card__price-row">
                            <?php if (!empty($packageOverview['discount'])): ?>
                                <span class="evd-package-card__discount"><?= e($packageOverview['discount']) ?></span>
                            <?php endif; ?>

                            <?php if (!empty($packageOverview['price'])): ?>
                                <strong class="evd-package-card__price"><?= e($packageOverview['price']) ?></strong>
                            <?php endif; ?>
                        </div>

                        <?php if (!empty($packageOverview['items'])): ?>
                            <div class="evd-info-list-wrap">
                                <ul class="evd-info-list">
                                    <?php foreach ($packageOverview['items'] as $item): ?>
                                        <li>
                                            <span class="evd-info-list__label">
                                                <?php if (!empty($item['icon'])): ?>
                                                    <i class="<?= e($item['icon']) ?>"></i>
                                                <?php endif; ?>
                                                <?= e($item['label'] ?? '') ?>
                                            </span>
                                            <strong>
                                                <?php
                                                $lines = $item['lines'] ?? [];
                                                echo e(implode(' / ', $lines));
                                                ?>
                                            </strong>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($packageOverview['cta'])): ?>
                            <div class="evd-package-card__actions">
                                <a href="<?= e($packageOverview['cta']['url'] ?? '#') ?>" class="evd-outline-btn">
                                    <?= e($packageOverview['cta']['label'] ?? '예약하러 가기') ?>
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>
        <?php endif; ?>

        <section class="evd-section" id="detail">
            <div class="evd-section-heading">
                <div>
                    <p class="evd-section-heading__eyebrow">DETAIL</p>
                    <h2 class="evd-section__title">상세 안내</h2>
                </div>
            </div>

            <div class="desc-tabs" data-detail-tabs>
                <div class="desc-tab-buttons" role="tablist" aria-label="이벤트 상세 탭">
                    <button
                        type="button"
                        class="desc-tab-btn is-active"
                        data-tab-target="overview"
                        role="tab"
                        aria-selected="true">
                        <?= e($overviewTab['title'] ?? '프로모션 소개') ?>
                    </button>

                    <button
                        type="button"
                        class="desc-tab-btn"
                        data-tab-target="notice"
                        role="tab"
                        aria-selected="false">
                        <?= e($noticeTab['title'] ?? '유의사항') ?>
                    </button>
                </div>

                <div class="desc-tab-panels">
                    <div class="desc-panel is-active" data-tab-panel="overview" role="tabpanel">
                        <?php if (!empty($overviewTab['content'])): ?>
                            <div class="evd-copy-card">
                                <div class="evd-copy">
                                    <?php foreach (($overviewTab['content'] ?? []) as $text): ?>
                                        <p><?= nl2br(e($text)) ?></p>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($overviewTab['cards'])): ?>
                            <div class="evd-info-grid">
                                <?php foreach ($overviewTab['cards'] as $card): ?>
                                    <article class="evd-info-card">
                                        <div class="evd-info-card__head evd-info-card__head--icon">
                                            <span class="evd-info-card__icon">
                                                <i class="<?= e($card['icon'] ?? 'ri-information-line') ?>"></i>
                                            </span>
                                            <div>
                                                <h3><?= e($card['title'] ?? '') ?></h3>
                                            </div>
                                        </div>

                                        <ul class="evd-notice-list">
                                            <?php foreach (($card['items'] ?? []) as $item): ?>
                                                <li><?= e($item) ?></li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="desc-panel" data-tab-panel="notice" role="tabpanel" hidden>
                        <?php if (!empty($noticeTab['groups'])): ?>
                            <div class="evd-notice-card-grid">
                                <?php foreach ($noticeTab['groups'] as $group): ?>
                                    <article class="evd-notice-card">
                                        <h3><?= e($group['title'] ?? '') ?></h3>
                                        <ul>
                                            <?php foreach (($group['items'] ?? []) as $item): ?>
                                                <li><?= e($item) ?></li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>

        <?php if (!empty($eventSchedule)): ?>
            <section class="evd-section" id="schedule">
                <div class="evd-section-heading">
                    <div>
                        <p class="evd-section-heading__eyebrow">FLOW</p>
                        <h2 class="evd-section__title">진행 흐름</h2>
                    </div>
                </div>

                <div class="evd-schedule-list">
                    <?php foreach ($eventSchedule as $schedule): ?>
                        <article class="evd-schedule-card">
                            <span class="evd-schedule-card__day"><?= e($schedule['day'] ?? '') ?></span>

                            <div class="evd-schedule-card__body">
                                <?php foreach (($schedule['items'] ?? []) as $item): ?>
                                    <div class="evd-schedule-item">
                                        <div class="evd-schedule-item__title">
                                            <span class="evd-schedule-item__icon">
                                                <i class="<?= e($item['icon'] ?? 'ri-arrow-right-up-line') ?>"></i>
                                            </span>
                                            <strong><?= e($item['title'] ?? '') ?></strong>
                                        </div>

                                        <div class="evd-schedule-item__lines">
                                            <?php foreach (($item['lines'] ?? []) as $line): ?>
                                                <p><?= e($line) ?></p>
                                            <?php endforeach; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

        <section class="evd-section" id="location">
            <div class="evd-section-heading">
                <div>
                    <p class="evd-section-heading__eyebrow">LOCATION</p>
                    <h2 class="evd-section__title">안내 / 위치</h2>
                </div>
            </div>

            <div class="evd-info-split">
                <?php if (!empty($location)): ?>
                    <article class="evd-location-box">
                        <div class="evd-location-box__head">
                            <div>
                                <strong class="evd-location-name"><?= e($location['name'] ?? '') ?></strong>
                                <p class="evd-location-address"><?= e($location['address'] ?? '') ?></p>
                            </div>

                            <?php if (!empty($location['map_url'])): ?>
                                <a href="<?= e($location['map_url']) ?>" class="evd-map-link" target="_blank" rel="noopener">
                                    <i class="ri-external-link-line"></i>
                                    <span>지도 보기</span>
                                </a>
                            <?php endif; ?>
                        </div>

                        <?php if (!empty($location['embed_url'])): ?>
                            <div class="evd-map">
                                <iframe
                                    src="<?= e($location['embed_url']) ?>"
                                    loading="lazy"
                                    allowfullscreen
                                    referrerpolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        <?php endif; ?>
                    </article>
                <?php endif; ?>

                <article class="evd-info-card">
                    <div class="evd-info-card__head evd-info-card__head--between">
                        <div>
                            <span class="evd-chip evd-chip--soft">GUIDE</span>
                            <h3>예약 안내</h3>
                        </div>
                    </div>

                    <ul class="evd-info-list">
                        <li>
                            <span class="evd-info-list__label"><i class="ri-time-line"></i> 상담 가능 시간</span>
                            <strong>평일 09:00 ~ 18:00</strong>
                        </li>
                        <li>
                            <span class="evd-info-list__label"><i class="ri-message-2-line"></i> 안내 방식</span>
                            <strong>전화 / 메시지 / 예약 문의</strong>
                        </li>
                        <li>
                            <span class="evd-info-list__label"><i class="ri-file-list-3-line"></i> 확인 사항</span>
                            <strong>일정, 인원, 희망 지역, 예산</strong>
                        </li>
                    </ul>
                </article>
            </div>
        </section>

        <?php if (!empty($relatedProducts)): ?>
            <section class="evd-section" id="related">
                <div class="evd-section-heading">
                    <div>
                        <p class="evd-section-heading__eyebrow">RELATED</p>
                        <h2 class="evd-section__title">추천 상품</h2>
                    </div>
                </div>

                <div class="evd-recommend-grid">
                    <?php foreach ($relatedProducts as $item): ?>
                        <a href="<?= e($item['url'] ?? '#') ?>" class="evd-product-card">
                            <div class="evd-product-card__thumb">
                                <img src="<?= e($item['image'] ?? '') ?>" alt="<?= e($item['title'] ?? '') ?>">
                            </div>

                            <div class="evd-product-card__body">
                                <?php if (!empty($item['location'])): ?>
                                    <p class="evd-product-card__region"><?= e($item['location']) ?></p>
                                <?php endif; ?>

                                <h3 class="evd-product-card__title"><?= e($item['title'] ?? '') ?></h3>

                                <?php if (!empty($item['description'])): ?>
                                    <p class="evd-product-card__meta"><?= e($item['description']) ?></p>
                                <?php endif; ?>

                                <?php if (!empty($item['tags'])): ?>
                                    <div class="evd-product-card__tags">
                                        <?php foreach ($item['tags'] as $tag): ?>
                                            <?php
                                            $tagLabel = is_array($tag) ? ($tag['label'] ?? '') : $tag;
                                            $tagType = is_array($tag) ? ($tag['type'] ?? 'blue') : 'blue';
                                            ?>
                                            <span class="evd-tag evd-tag--<?= e($tagType) ?>">
                                                <?= e($tagLabel) ?>
                                            </span>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>

                                <div class="evd-product-card__price-row">
                                    <?php if (!empty($item['discount'])): ?>
                                        <span class="evd-product-card__discount"><?= e($item['discount']) ?></span>
                                    <?php endif; ?>

                                    <?php if (!empty($item['original_price'])): ?>
                                        <span class="evd-product-card__original"><?= e($item['original_price']) ?></span>
                                    <?php endif; ?>
                                </div>

                                <?php if (!empty($item['price'])): ?>
                                    <strong class="evd-product-card__price"><?= e($item['price']) ?></strong>
                                <?php endif; ?>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

    </div>

    <div class="evd-mobile-cta">
        <div class="evd-mobile-cta__inner">
            <a href="<?= e($secondaryCta['url'] ?? '#') ?>" class="evd-btn evd-btn--dark">
                <?= e($secondaryCta['label'] ?? '상담문의') ?>
            </a>
            <a href="<?= e($primaryCta['url'] ?? '#') ?>" class="evd-btn evd-btn--primary">
                <?= e($primaryCta['label'] ?? '프로모션 예약하기') ?>
            </a>
        </div>
    </div>
</main>

<?php echo '<!-- event before footer -->'; ?>
<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>
<?php echo '<!-- event after footer -->'; ?>