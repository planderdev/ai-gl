<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/detail-data.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/helpers/amenity-icons.php';

$pageTitle = $DetailData['page_title'] . ' | 상품 상세';
$pageDescription = '일본 골프 상세 페이지';
$pageKeywords = '일본 골프, 상세, 골프 예약';
$pageUrl = $DetailData['page_url'];

$pageCss = [
    'assets/css/pages/product/detail.css',
];

$pageJs = [
    'assets/js/pages/product/detail.js',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';

$course = $DetailData['course'] ?? [];
$content = $DetailData['content'] ?? [];
$booking = $DetailData['booking'] ?? [];
$recommendProducts = $DetailData['recommend_products'] ?? [];
$banner = $DetailData['banner'] ?? [];
$breadcrumbs = $DetailData['breadcrumbs'] ?? [];
$courseYardage = $DetailData['course_yardage'] ?? [];

$heroImage = $course['hero_image'] ?? '';
$galleryImages = $course['gallery'] ?? [];
if (empty($galleryImages) && $heroImage) {
    $galleryImages = [$heroImage];
}

$courseName = $course['name'] ?? '';
$courseLocation = $course['location'] ?? '';
$courseAddress = $course['address'] ?? '';
$coursePhone = $course['phone'] ?? '';
$courseDistanceAirport = $course['distance_airport'] ?? '';
$courseDistanceCity = $course['distance_city'] ?? '';
$courseSummary = $course['summary'] ?? '';
$courseChip = $course['chip'] ?? $courseName;
$courseInfoTop = $course['info_top'] ?? '';
$courseAmenities = $course['amenities'] ?? [];
$courseMapEmbed = $course['map_embed'] ?? '';
$courseMapLink = $course['map_link'] ?? '';

$hotel = $content['hotel'] ?? [];
$hotelName = $hotel['name'] ?? '';
$hotelChip = $hotel['chip'] ?? $hotelName;
$hotelGallery = $hotel['gallery'] ?? [];
$hotelDescription = $hotel['description'] ?? [];
$hotelInfo = $hotel['info'] ?? [];
$hotelUrl = $hotelInfo['url'] ?? '';
$hotelPhone = $hotelInfo['phone'] ?? '';
$hotelAddress = $hotelInfo['address'] ?? '';

$productTabs = $content['product_tabs'] ?? [];
$scheduleTab = $productTabs['schedule'] ?? [];
$descriptionTab = $productTabs['description'] ?? [];
$noticeTab = $productTabs['notice'] ?? [];

$scheduleDays = $scheduleTab['days'] ?? [];
$descriptionContent = $descriptionTab['content'] ?? [];
$descriptionNoticeCards = $descriptionTab['notice_cards'] ?? [];
$noticeGroups = $noticeTab['groups'] ?? [];

$courseDescription = $content['course_description'] ?? [];
$noticeSections = $content['notice_sections'] ?? [];

$heroTags = array_slice($courseAmenities, 0, 4);

$bookingDates = $booking['dates'] ?? [];
$availableDateCount = count($bookingDates);

$startingPrice = null;
foreach ($bookingDates as $dateRows) {
    foreach ($dateRows as $courseTypeRows) {
        foreach ($courseTypeRows as $tee) {
            foreach (($tee['price_by_person'] ?? []) as $price) {
                $price = (int) $price;
                if ($price > 0 && ($startingPrice === null || $price < $startingPrice)) {
                    $startingPrice = $price;
                }
            }
        }
    }
}

$summaryCards = array_values(array_filter([
    [
        'label' => '지역',
        'value' => $courseLocation ?: '-',
        'sub'   => $courseAddress ?: '',
        'icon'  => 'ri-map-pin-2-line',
    ],
    [
        'label' => '숙소',
        'value' => $hotelName ?: '연계 호텔',
        'sub'   => $hotelAddress ?: '',
        'icon'  => 'ri-hotel-line',
    ],
    [
        'label' => '공항 이동',
        'value' => $courseDistanceAirport ? '약 ' . $courseDistanceAirport : '-',
        'sub'   => '현지 이동 기준',
        'icon'  => 'ri-flight-takeoff-line',
    ],
    [
        'label' => '도심 이동',
        'value' => $courseDistanceCity ? '약 ' . $courseDistanceCity : '-',
        'sub'   => '차량 이동 기준',
        'icon'  => 'ri-road-map-line',
    ],
], fn($item) => !empty($item['value'])));

$anchorTabs = [
    ['key' => 'overview', 'label' => '핵심 정보'],
    ['key' => 'schedule', 'label' => '일정표'],
    ['key' => 'hotel', 'label' => '호텔'],
    ['key' => 'course', 'label' => '골프장'],
    ['key' => 'location', 'label' => '위치'],
];

function e($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
<main class="ttd-page">
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

        <section class="ttd-hero">
            <div class="ttd-hero__main">
                <div class="ttd-hero__media-card">
                    <div class="ttd-hero-slider slider" data-slider>
                        <button type="button" class="slider-btn slider-btn--prev" data-slider-prev aria-label="이전 이미지">‹</button>

                        <div class="slider-track" data-slider-track>
                            <?php foreach ($galleryImages as $image): ?>
                                <div class="slider-slide slider-slide--hero">
                                    <img src="<?= e($image) ?>" alt="<?= e($courseName) ?>">
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <button type="button" class="slider-btn slider-btn--next" data-slider-next aria-label="다음 이미지">›</button>

                        <div class="slider-dots" data-slider-dots></div>
                    </div>
                </div>

                <div class="ttd-hero__content">
                    <div class="ttd-hero__head">
                        <div class="ttd-hero__eyebrow">
                            <span class="ttd-chip ttd-chip--brand"><?= e($courseLocation ?: '골프여행') ?></span>
                            <?php if ($availableDateCount > 0): ?>
                                <span class="ttd-chip ttd-chip--accent">예약 가능일 <?= e($availableDateCount) ?>일</span>
                            <?php endif; ?>
                            <?php if ($courseChip): ?>
                                <span class="ttd-chip ttd-chip--ghost"><?= e($courseChip) ?></span>
                            <?php endif; ?>
                        </div>

                        <h1 class="ttd-course-title"><?= e($courseName) ?></h1>

                        <?php if ($courseSummary): ?>
                            <p class="ttd-course-summary"><?= e($courseSummary) ?></p>
                        <?php endif; ?>

                        <?php if (!empty($heroTags)): ?>
                            <div class="ttd-tag-list" aria-label="편의시설 요약">
                                <?php foreach ($heroTags as $tag): ?>
                                    <span class="ttd-tag-pill">
                                        <span class="ttd-tag-pill__icon"><?= getAmenityIcon($tag) ?></span>
                                        <span class="ttd-tag-pill__text"><?= e($tag) ?></span>
                                    </span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="ttd-hero__stats">
                        <div class="ttd-stat-card">
                            <span class="ttd-stat-card__label">시작가</span>
                            <strong class="ttd-stat-card__value"><?= $startingPrice !== null ? '₩' . number_format($startingPrice) : '문의' ?></strong>
                            <small class="ttd-stat-card__sub">1인 기준 / 날짜별 상이</small>
                        </div>

                        <div class="ttd-stat-card">
                            <span class="ttd-stat-card__label">호텔</span>
                            <strong class="ttd-stat-card__value"><?= e($hotelName ?: '연계 숙소') ?></strong>
                            <small class="ttd-stat-card__sub"><?= e($hotelAddress ?: '숙박 정보 제공') ?></small>
                        </div>

                        <div class="ttd-stat-card">
                            <span class="ttd-stat-card__label">이동 정보</span>
                            <strong class="ttd-stat-card__value"><?= e($courseDistanceAirport ? '공항 약 ' . $courseDistanceAirport : '이동 정보 제공') ?></strong>
                            <small class="ttd-stat-card__sub"><?= e($courseDistanceCity ? '도심 약 ' . $courseDistanceCity : '현지 기준 안내') ?></small>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="ttd-hero__aside">
                <div class="ttd-booking-panel">
                    <div class="ttd-booking-panel__top">
                        <span class="ttd-booking-panel__label">빠른 예약 선택</span>
                        <h2 class="ttd-booking-panel__title">날짜 / 티타임 선택</h2>
                        <p class="ttd-booking-panel__desc">원하는 날짜와 코스를 선택하면 실시간 금액이 바로 반영됩니다.</p>
                    </div>

                    <div class="ttd-booking-box">
                        <button type="button" class="ttd-select-card ttd-select-card--full" id="ttdOpenBookingModal">
                            <span class="ttd-select-card__label">날짜</span>
                            <strong class="ttd-select-card__value is-placeholder" id="ttdSelectedDate">-</strong>
                        </button>

                        <button type="button" class="ttd-select-card" id="ttdOpenBookingModalFromCourse">
                            <span class="ttd-select-card__label">티타임</span>
                            <strong class="ttd-select-card__value is-placeholder" id="ttdSelectedCourse">-</strong>
                        </button>

                        <button type="button" class="ttd-select-card" id="ttdOpenBookingModalFromPerson">
                            <span class="ttd-select-card__label">인원</span>
                            <strong class="ttd-select-card__value is-placeholder" id="ttdSelectedPerson">1인</strong>
                        </button>
                    </div>

                    <section class="ttd-pricing is-empty" id="ttdPricingSection" data-ready="false">
                        <div class="ttd-pricing__head">
                            <h3>요금 세부정보</h3>
                            <button type="button" class="ttd-pricing__reset" id="ttdPricingResetBtn" aria-label="선택 초기화" hidden>×</button>
                        </div>

                        <div class="ttd-pricing__empty" id="ttdPricingEmpty">
                            <div class="ttd-pricing__empty-card">
                                <i class="ri-calendar-check-line"></i>
                                <strong>예약 정보를 선택해 주세요</strong>
                                <p>날짜, 티타임, 인원을 선택하면 총액과 상세 금액이 표시됩니다.</p>
                            </div>
                        </div>

                        <div class="ttd-pricing__content" id="ttdPricingContent" hidden>
                            <p class="ttd-pricing__summary">
                                <span id="ttdSummaryDate"></span>
                                <span class="ttd-pricing__slash">/</span>
                                <span id="ttdSummaryTime"></span>
                                <span class="ttd-pricing__slash">/</span>
                                <span id="ttdSummaryCourseType"></span>
                                <span class="ttd-pricing__slash">/</span>
                                <span id="ttdSummaryPerson"></span>
                            </p>

                            <div class="ttd-pricing__badges" id="ttdPricingBadges"></div>
                            <div class="ttd-pricing__list" id="ttdPricingPlayers"></div>

                            <p class="ttd-pricing__note">* 세금 및 수수료 포함</p>

                            <div class="ttd-pricing__total">
                                <span>총액</span>
                                <strong id="ttdTotalPrice">₩0</strong>
                            </div>
                        </div>

                        <div class="ttd-pricing__actions">
                            <button type="button" class="ttd-btn ttd-btn--dark">상담문의</button>
                            <button type="button" class="ttd-btn ttd-btn--primary" id="ttdReserveBtn" disabled>예약하기</button>
                        </div>
                    </section>

                    <?php if (!empty($banner['image'])): ?>
                        <div class="ttd-side-banner">
                            <img src="<?= e($banner['image']) ?>" alt="<?= e($banner['alt'] ?? $courseName) ?>">
                        </div>
                    <?php endif; ?>
                </div>
            </aside>
        </section>

        <nav class="ttd-anchor-nav" aria-label="상품 상세 내비게이션">
            <div class="ttd-anchor-nav__inner">
                <?php foreach ($anchorTabs as $index => $tab): ?>
                    <a
                        href="#<?= e($tab['key']) ?>"
                        class="ttd-anchor-nav__link<?= $index === 0 ? ' is-active' : '' ?>"
                        data-ttd-anchor-link>
                        <?= e($tab['label']) ?>
                    </a>
                <?php endforeach; ?>
            </div>
        </nav>

        <section class="ttd-section" id="overview">
            <div class="ttd-section-heading">
                <div>
                    <p class="ttd-section-heading__eyebrow">OVERVIEW</p>
                    <h2 class="ttd-section__title">핵심 정보</h2>
                </div>
             </div>

            <div class="ttd-summary-grid">
                <?php foreach ($summaryCards as $card): ?>
                    <article class="ttd-summary-card">
                        <div class="ttd-summary-card__icon">
                            <i class="<?= e($card['icon']) ?>"></i>
                        </div>
                        <div class="ttd-summary-card__body">
                            <span class="ttd-summary-card__label"><?= e($card['label']) ?></span>
                            <strong class="ttd-summary-card__value"><?= e($card['value']) ?></strong>
                            <?php if (!empty($card['sub'])): ?>
                                <p class="ttd-summary-card__sub"><?= e($card['sub']) ?></p>
                            <?php endif; ?>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="ttd-section" id="schedule">
            <div class="ttd-section-heading">
                <div>
                    <p class="ttd-section-heading__eyebrow">DETAIL</p>
                    <h2 class="ttd-section__title">상품 설명</h2>
                </div>
            </div>

            <div class="desc-tabs" data-detail-tabs>
                <div class="desc-tab-buttons" role="tablist" aria-label="상품 설명 탭">
                    <button
                        type="button"
                        class="desc-tab-btn is-active"
                        data-tab-target="schedule"
                        role="tab"
                        aria-selected="true">
                        <?= e($scheduleTab['title'] ?? '일정표') ?>
                    </button>

                    <button
                        type="button"
                        class="desc-tab-btn"
                        data-tab-target="description"
                        role="tab"
                        aria-selected="false">
                        <?= e($descriptionTab['title'] ?? '상품 설명') ?>
                    </button>

                    <button
                        type="button"
                        class="desc-tab-btn"
                        data-tab-target="notice"
                        role="tab"
                        aria-selected="false">
                        <?= e($noticeTab['title'] ?? '중요 안내') ?>
                    </button>
                </div>

                <div class="desc-tab-panels">
                    <div class="desc-panel is-active" data-tab-panel="schedule" role="tabpanel">
                        <div class="ttd-schedule-list">
                            <?php foreach ($scheduleDays as $day): ?>
                                <article class="ttd-schedule-card">
                                    <div class="ttd-schedule-card__head">
                                        <span class="ttd-schedule-card__day"><?= e($day['day'] ?? '') ?></span>
                                    </div>

                                    <div class="ttd-schedule-card__body">
                                        <?php foreach (($day['items'] ?? []) as $item): ?>
                                            <div class="ttd-schedule-item">
                                                <div class="ttd-schedule-item__title">
                                                    <span class="ttd-schedule-item__icon"><i class="ri-route-line"></i></span>
                                                    <strong><?= e($item['type'] ?? '') ?></strong>
                                                </div>
                                                <div class="ttd-schedule-item__lines">
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
                    </div>

                    <div class="desc-panel" data-tab-panel="description" role="tabpanel" hidden>
                        <div class="ttd-copy-card">
                            <div class="ttd-copy">
                                <?php foreach ($descriptionContent as $paragraph): ?>
                                    <p><?= nl2br(e($paragraph)) ?></p>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <?php if (!empty($descriptionNoticeCards)): ?>
                            <div class="ttd-notice-card-grid">
                                <?php foreach ($descriptionNoticeCards as $card): ?>
                                    <article class="ttd-notice-card">
                                        <h3><?= e($card['title'] ?? '') ?></h3>
                                        <ul>
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
                        <div class="ttd-notice-card-grid">
                            <?php foreach ($noticeGroups as $group): ?>
                                <article class="ttd-notice-card">
                                    <h3><?= e($group['title'] ?? '') ?></h3>
                                    <ul>
                                        <?php foreach (($group['items'] ?? []) as $item): ?>
                                            <li><?= e($item) ?></li>
                                        <?php endforeach; ?>
                                    </ul>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <?php if (!empty($hotelName)): ?>
            <section class="ttd-section" id="hotel">
                <div class="ttd-section-heading">
                    <div>
                        <p class="ttd-section-heading__eyebrow">HOTEL</p>
                        <h2 class="ttd-section__title">숙소 안내</h2>
                    </div>
                </div>

                <div class="ttd-info-split">
                    <div class="ttd-info-card">
                        <div class="ttd-info-card__head">
                            <span class="ttd-chip ttd-chip--ghost"><?= e($hotelChip ?: '호텔') ?></span>
                            <h3><?= e($hotelName) ?></h3>
                        </div>

                        <div class="ttd-copy">
                            <?php foreach ($hotelDescription as $paragraph): ?>
                                <p><?= nl2br(e($paragraph)) ?></p>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="ttd-info-card">
                        <div class="ttd-info-card__head">
                            <span class="ttd-chip ttd-chip--soft">HOTEL INFO</span>
                            <h3>숙소 정보</h3>
                        </div>

                        <ul class="ttd-info-list">
                            <?php if ($hotelUrl): ?>
                                <li>
                                    <span>웹사이트</span>
                                    <a href="<?= e($hotelUrl) ?>" target="_blank" rel="noopener noreferrer"><?= e($hotelUrl) ?></a>
                                </li>
                            <?php endif; ?>
                            <?php if ($hotelPhone): ?>
                                <li>
                                    <span>전화번호</span>
                                    <strong><?= e($hotelPhone) ?></strong>
                                </li>
                            <?php endif; ?>
                            <?php if ($hotelAddress): ?>
                                <li>
                                    <span>주소</span>
                                    <strong><?= e($hotelAddress) ?></strong>
                                </li>
                            <?php endif; ?>
                        </ul>
                    </div>
                </div>

                <?php if (!empty($hotelGallery)): ?>
                    <div class="ttd-gallery-block">
                        <div class="ttd-course-gallery-slider slider" data-slider>
                            <button type="button" class="slider-btn slider-btn--prev" data-slider-prev aria-label="이전 이미지">‹</button>

                            <div class="slider-track" data-slider-track>
                                <?php foreach ($hotelGallery as $image): ?>
                                    <div class="slider-slide slider-slide--third">
                                        <img src="<?= e($image) ?>" alt="<?= e($hotelName) ?>">
                                    </div>
                                <?php endforeach; ?>
                            </div>

                            <button type="button" class="slider-btn slider-btn--next" data-slider-next aria-label="다음 이미지">›</button>
                        </div>
                    </div>
                <?php endif; ?>
            </section>
        <?php endif; ?>

        <section class="ttd-section" id="course">
            <div class="ttd-section-heading">
                <div>
                    <p class="ttd-section-heading__eyebrow">COURSE</p>
                    <h2 class="ttd-section__title">골프장 소개</h2>
                </div>
            </div>

            <div class="ttd-info-split">
                <div class="ttd-info-card">
                    <div class="ttd-info-card__head">
                        <span class="ttd-chip ttd-chip--brand"><?= e($courseChip) ?></span>
                        <h3>체크 포인트</h3>
                    </div>

                    <div class="ttd-copy">
                        <?php foreach ($courseDescription as $paragraph): ?>
                            <p><?= nl2br(e($paragraph)) ?></p>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="ttd-info-card">
                    <div class="ttd-info-card__head ttd-info-card__head--between">
                        <div>
                            <span class="ttd-chip ttd-chip--soft">COURSE INFO</span>
                            <h3>골프장 정보</h3>
                        </div>
                        <button type="button" class="ttd-outline-btn" id="ttdOpenCourseModal">코스보기</button>
                    </div>

                    <?php if ($courseInfoTop): ?>
                        <p class="ttd-info-top"><?= e($courseInfoTop) ?></p>
                    <?php endif; ?>

                    <ul class="ttd-info-list">
                        <?php if ($courseAddress): ?>
                            <li>
                                <span>주소</span>
                                <strong><?= e($courseAddress) ?></strong>
                            </li>
                        <?php endif; ?>
                        <?php if ($coursePhone): ?>
                            <li>
                                <span>전화번호</span>
                                <strong><?= e($coursePhone) ?></strong>
                            </li>
                        <?php endif; ?>
                        <?php if ($courseDistanceAirport): ?>
                            <li>
                                <span>공항 이동</span>
                                <strong>약 <?= e($courseDistanceAirport) ?></strong>
                            </li>
                        <?php endif; ?>
                        <?php if ($courseDistanceCity): ?>
                            <li>
                                <span>도심 이동</span>
                                <strong>약 <?= e($courseDistanceCity) ?></strong>
                            </li>
                        <?php endif; ?>
                    </ul>
                </div>
            </div>

            <?php if (!empty($courseAmenities)): ?>
                <div class="ttd-amenities-wrap">
                    <div class="ttd-section-heading ttd-section-heading--compact">
                        <div>
                            <p class="ttd-section-heading__eyebrow">AMENITIES</p>
                            <h3 class="ttd-section__subtitle">서비스 및 편의시설</h3>
                        </div>
                    </div>

                    <div class="amenity-grid">
                        <?php foreach ($courseAmenities as $amenity): ?>
                            <div class="amenity-card">
                                <span class="amenity-icon">
                                    <?= getAmenityIcon($amenity) ?>
                                </span>
                                <span class="amenity-label"><?= e($amenity) ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

            <?php if (!empty($galleryImages)): ?>
                <div class="ttd-gallery-block">
                    <div class="ttd-course-gallery-slider slider" data-slider>
                        <button type="button" class="slider-btn slider-btn--prev" data-slider-prev aria-label="이전 이미지">‹</button>

                        <div class="slider-track" data-slider-track>
                            <?php foreach ($galleryImages as $image): ?>
                                <div class="slider-slide slider-slide--third">
                                    <img src="<?= e($image) ?>" alt="<?= e($courseName) ?>">
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <button type="button" class="slider-btn slider-btn--next" data-slider-next aria-label="다음 이미지">‹</button>
                    </div>
                </div>
            <?php endif; ?>

            <?php if (!empty($noticeSections)): ?>
                <div class="ttd-notice-card-grid ttd-notice-card-grid--course">
                    <?php foreach ($noticeSections as $section): ?>
                        <article class="ttd-notice-card">
                            <h3><?= e($section['title'] ?? '') ?></h3>
                            <ul>
                                <?php foreach (($section['items'] ?? []) as $item): ?>
                                    <li><?= e($item) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

        <section class="ttd-section" id="location">
            <div class="ttd-section-heading">
                <div>
                    <p class="ttd-section-heading__eyebrow">LOCATION</p>
                    <h2 class="ttd-section__title">위치</h2>
                </div>
            </div>

            <div class="ttd-location-box">
                <div class="ttd-location-box__head">
                    <div>
                        <strong class="ttd-location-name"><?= e($courseName) ?></strong>
                        <p class="ttd-location-address"><?= e($courseAddress) ?></p>
                    </div>

                    <?php if (!empty($courseMapLink)): ?>
                        <a href="<?= e($courseMapLink) ?>" target="_blank" rel="noopener noreferrer" class="ttd-map-link">지도 크게 보기</a>
                    <?php endif; ?>
                </div>

                <?php if (!empty($courseMapEmbed)): ?>
                    <div class="ttd-map">
                        <?= $courseMapEmbed ?>
                    </div>
                <?php endif; ?>
            </div>
        </section>

        <?php if (!empty($recommendProducts)): ?>
            <section class="ttd-section">
                <div class="ttd-section-heading">
                    <div>
                        <p class="ttd-section-heading__eyebrow">RECOMMEND</p>
                        <h2 class="ttd-section__title">추천 상품</h2>
                    </div>
                </div>

                <div class="ttd-recommend-grid">
                    <?php foreach ($recommendProducts as $item): ?>
                        <a href="<?= e($item['url'] ?? '#') ?>" class="ttd-product-card">
                            <div class="ttd-product-card__thumb">
                                <img src="<?= e($item['image'] ?? '') ?>" alt="<?= e($item['title'] ?? '') ?>">
                            </div>

                            <div class="ttd-product-card__body">
                                <p class="ttd-product-card__region"><?= e($item['location'] ?? '') ?></p>
                                <h3 class="ttd-product-card__title"><?= e($item['title'] ?? '') ?></h3>
                                <p class="ttd-product-card__meta"><?= e($item['meta'] ?? '') ?></p>

                                <?php if (!empty($item['tags'])): ?>
                                    <div class="ttd-product-card__tags">
                                        <?php foreach ($item['tags'] as $tag): ?>
                                            <span class="ttd-tag ttd-tag--<?= e($tag['type'] ?? 'green') ?>">
                                                <?= e($tag['label'] ?? '') ?>
                                            </span>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>

                                <div class="ttd-product-card__price-row">
                                    <?php if (!empty($item['discount'])): ?>
                                        <span class="ttd-product-card__discount"><?= e($item['discount']) ?></span>
                                    <?php endif; ?>

                                    <?php if (!empty($item['original_price'])): ?>
                                        <del class="ttd-product-card__original"><?= e($item['original_price']) ?></del>
                                    <?php endif; ?>
                                </div>

                                <strong class="ttd-product-card__price"><?= e($item['price'] ?? '') ?></strong>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

    </div>
</main>

<script>
window.DetailBookingData = <?= json_encode($booking, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
window.CourseYardageData = <?= json_encode($courseYardage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
</script>

<div class="booking-modal" id="ttdBookingModal" aria-hidden="true">
    <div class="booking-modal-dim"></div>

    <div class="booking-modal-dialog ttd-modal-dialog">
        <div class="booking-modal-header">
            <strong>날짜 / 티타임 선택</strong>
            <button type="button" class="ttd-modal-close" id="ttdModalClose" aria-label="닫기">×</button>
        </div>

        <div class="ttd-modal-grid">
            <div class="ttd-modal-calendar">
                <div class="ttd-modal-calendar__head">
                    <button type="button" class="calendar-nav-btn" id="ttdPrevMonthBtn">‹</button>
                    <strong id="ttdCalendarTitle">2026년 4월</strong>
                    <button type="button" class="calendar-nav-btn" id="ttdNextMonthBtn">›</button>
                </div>

                <div class="calendar-weekdays">
                    <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                </div>

                <div class="calendar-grid" id="ttdCalendarGrid"></div>
            </div>

            <div class="ttd-modal-side">
                <div class="ttd-toggle-group">
                    <button type="button" class="ttd-toggle-btn is-active" data-course-type="OUT">OUT</button>
                    <button type="button" class="ttd-toggle-btn" data-course-type="IN">IN</button>
                </div>

                <div class="ttd-person-select" id="ttdPersonSelectList">
                    <?php foreach (($booking['persons'] ?? []) as $person): ?>
                        <button type="button" class="ttd-person-option<?= (int) $person === 1 ? ' is-active' : '' ?>" data-person="<?= (int) $person ?>">
                            <?= (int) $person ?>인
                        </button>
                    <?php endforeach; ?>
                </div>

                <div class="ttd-tee-list" id="ttdTeeList"></div>
            </div>
        </div>

        <div class="ttd-modal-summary">
            <div class="ttd-modal-summary__label">총액</div>
            <div class="ttd-modal-summary__price" id="ttdModalTotalPrice">₩0</div>
        </div>

        <div class="booking-modal-footer">
            <button type="button" class="calendar-action-btn" id="ttdBookingCancelBtn">취소</button>
            <button type="button" class="calendar-action-btn confirm" id="ttdBookingConfirmBtn">확인</button>
        </div>
    </div>
</div>

<div class="course-modal" id="ttdCourseModal" aria-hidden="true">
    <div class="course-modal-dim"></div>

    <div class="course-modal-dialog">
        <div class="course-modal-header">
            <strong>코스정보 (yard)</strong>
            <button type="button" class="ttd-modal-close" id="ttdCourseModalClose" aria-label="닫기">×</button>
        </div>

        <div class="course-modal-tabs" id="ttdCourseModalTabs"></div>
        <div class="course-modal-subtabs" id="ttdCourseModalSubTabs"></div>
        <div class="course-modal-table-wrap" id="ttdCourseModalTableWrap"></div>
    </div>
</div>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>