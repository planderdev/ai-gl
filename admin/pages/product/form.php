<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/media/media-helper.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

$formData = $formData ?? [];
$hotelOptions = $hotelOptions ?? [];
$productType = $formData['product_type'] ?? $formData['type'] ?? 'golf_course';
$productType = in_array($productType, ['golf_course', 'travel_package'], true) ? $productType : 'golf_course';

$isEditMode = !empty($formData['id']);
$currentStatus = $formData['status'] ?? 'draft';

$statusOptions = [
    'draft'   => '임시저장',
    'publish' => '공개',
    'hidden'  => '숨김',
    'soldout' => '판매중지',
];

$thumbnail = $formData['thumbnail'] ?? '';
$basePrice = (int) ($formData['base_price'] ?? 0);
$salePrice = (int) ($formData['sale_price'] ?? 0);
$discountRate = ($basePrice > 0 && $salePrice > 0 && $salePrice < $basePrice)
    ? (int) round((($basePrice - $salePrice) / $basePrice) * 100)
    : 0;

$previewTypeLabel = $productType === 'travel_package' ? '여행 패키지' : '골프장';

$countries = function_exists('admin_get_active_taxonomy_items') ? admin_get_active_taxonomy_items('countries') : [];
$regions   = function_exists('admin_get_active_taxonomy_items') ? admin_get_active_taxonomy_items('regions') : [];
$themes    = function_exists('admin_get_active_taxonomy_items') ? admin_get_active_taxonomy_items('themes') : [];
$badgesTax = function_exists('admin_get_active_taxonomy_items') ? admin_get_active_taxonomy_items('badges') : [];

$themeVisualOptions = ['오션뷰', '링크스', '토너먼트', '리조트형', '사막형', '산악형'];

$frontRegionOptionsByCountry = [
    '일본' => ['이바라키', '도쿄', '오사카', '후쿠오카', '오키나와', '홋카이도', '교토'],
    '제주' => ['제주시', '서귀포시'],
    '한국' => ['서울', '경기', '강원', '충청', '전라', '경상', '제주'],
];

$frontThemeOptions = ['실시간티타임', '추천', '특가', '프리미엄', '베스트', '신규'];
$courseTagOptions = ['토너먼트', '세계 100대', '링크스', '사막', '산악', '오션', '리조트', '파크랜드', '트로피컬'];
$teeTimeBandOptions = [
    'before_9' => '9시 이전',
    'from_9_to_13' => '9시~13시',
    'after_14' => '14시 이후',
];

$selectedThemeFilters = is_array($formData['themes'] ?? null) ? $formData['themes'] : [];
$selectedCourseTags = is_array($formData['course_tags'] ?? null) ? $formData['course_tags'] : [];
$selectedTeeTimeBands = is_array($formData['tee_time_band'] ?? null) ? $formData['tee_time_band'] : [];

if (empty($selectedThemeFilters)) {
    if (($formData['booking_type'] ?? '') === 'instant') $selectedThemeFilters[] = '실시간티타임';
    if (!empty($formData['is_recommended'])) $selectedThemeFilters[] = '추천';
    if (!empty($formData['is_best'])) $selectedThemeFilters[] = '베스트';
    if (!empty($formData['is_new'])) $selectedThemeFilters[] = '신규';
    if (($formData['card_label'] ?? '') === '특가') $selectedThemeFilters[] = '특가';
}

if (empty($selectedCourseTags) && !empty($formData['course_type'])) {
    $selectedCourseTags[] = (string) $formData['course_type'];
}

$listPrice = (int) ($formData['list_price'] ?? ($formData['sale_price'] ?? 0));
$airportDistanceKm = (string) ($formData['airport_distance_km'] ?? '');
$airportTimeMin = (string) ($formData['airport_time_min'] ?? '');
$subRegion = (string) ($formData['sub_region'] ?? '');

$paymentMethodOptions = [
    'card'   => '카드결제',
    'bank'   => '무통장입금',
    'onsite' => '현장결제',
];
$weekdayOptions = [
    'mon' => '월요일',
    'tue' => '화요일',
    'wed' => '수요일',
    'thu' => '목요일',
    'fri' => '금요일',
    'sat' => '토요일',
    'sun' => '일요일',
];

$themeVisuals = is_array($formData['theme_visuals'] ?? null) ? $formData['theme_visuals'] : [];
$badges = is_array($formData['badges'] ?? null) ? $formData['badges'] : [];
$paymentMethods = is_array($formData['payment_methods'] ?? null) ? $formData['payment_methods'] : [];
$availableWeekdays = is_array($formData['available_weekdays'] ?? null) ? $formData['available_weekdays'] : [];

$gallery = is_array($formData['gallery'] ?? null) ? $formData['gallery'] : [];
$hotelGallery = is_array($formData['hotel_gallery'] ?? null) ? $formData['hotel_gallery'] : [];
$selectedHotelId = (int) ($formData['hotel_id'] ?? 0);
$golfGallery = is_array($formData['golf_gallery'] ?? null) ? $formData['golf_gallery'] : [];
$teeTimeSlots = is_array($formData['tee_time_slots'] ?? null) ? $formData['tee_time_slots'] : [];
$facilities = is_array($formData['facilities'] ?? null) ? $formData['facilities'] : [];
$relatedProductIds = is_array($formData['related_product_ids'] ?? null) ? $formData['related_product_ids'] : [];

$roundNoticeItems = is_array($formData['round_notice_items'] ?? null) ? $formData['round_notice_items'] : [''];
$weatherNoticeItems = is_array($formData['weather_notice_items'] ?? null) ? $formData['weather_notice_items'] : [''];
$importantNoticeItems = is_array($formData['important_notice_items'] ?? null) ? $formData['important_notice_items'] : [''];
$cancelRefundItems = is_array($formData['cancel_refund_items'] ?? null) ? $formData['cancel_refund_items'] : [''];

$itineraryDays = is_array($formData['itinerary_days'] ?? null) ? $formData['itinerary_days'] : [];

if (empty($gallery)) {
    $gallery = [['url' => '', 'caption' => '']];
}
if (empty($hotelGallery)) {
    $hotelGallery = [['url' => '', 'caption' => '']];
}
if (empty($golfGallery)) {
    $golfGallery = [['url' => '', 'caption' => '']];
}
if (empty($teeTimeSlots)) {
    $teeTimeSlots = [['label' => '', 'time' => '', 'status' => '', 'price' => '', 'stock' => '']];
}
if (empty($facilities)) {
    $facilities = [['label' => '']];
}
if (empty($itineraryDays)) {
    $itineraryDays = [];
}

$tabConfig = [
    'basic' => [
        'label' => '기본정보',
        'meta'  => '상품명 · 분류 · 상태',
    ],
    'general' => [
        'label' => '상품구성',
        'meta'  => $productType === 'travel_package' ? '호텔 · 공항 · 골프 구성' : '골프장 · 코스 · 부대정보',
    ],
    'price' => [
        'label' => '가격설정',
        'meta'  => '기본가 · 노출가 · 슬롯가격',
    ],
    'availability' => [
        'label' => '예약가능일',
        'meta'  => '판매기간 · 재고 · 예약조건',
    ],
    'payment' => [
        'label' => '결제설정',
        'meta'  => '결제수단 · 계좌 · 안내문구',
    ],
    'cancel' => [
        'label' => '취소규정',
        'meta'  => '환불기준 · 유의사항',
    ],
    'information' => [
        'label' => '상세콘텐츠',
        'meta'  => '설명 · 포함사항 · 일정표',
    ],
    'location' => [
        'label' => '위치/지도',
        'meta'  => '주소 · 좌표 · 지도링크',
    ],
];
?>

<form action="<?= e(admin_url('actions/product-save.php')) ?>" method="post" enctype="multipart/form-data" class="product-form js-product-form">
    <input type="hidden" name="id" value="<?= e((string) ($formData['id'] ?? 0)) ?>">
    <input type="hidden" name="product_type" value="<?= e($productType) ?>">
    <input type="hidden" name="current_tab" value="basic" class="js-current-tab-input">

    <div class="product-form__topbar">
        <div class="product-form__topbar-left">
            <div class="product-form__type-chip"><?= e($previewTypeLabel) ?></div>
            <?php if ($isEditMode): ?>
                <div class="admin-chip admin-chip--gray">ID <?= e((string) ($formData['id'] ?? 0)) ?></div>
            <?php endif; ?>

            <div class="product-form__title-wrap">
                <h1 class="product-form__page-title"><?= $isEditMode ? '상품 수정' : '상품 등록' ?></h1>
                <p class="product-form__page-desc">
                    <?= $productType === 'travel_package'
                        ? '여행 패키지 상세페이지 구조에 맞춰 상품 정보, 일정, 숙소, 결제 정보를 등록합니다.'
                        : '골프장 상세페이지 구조에 맞춰 기본 정보, 요금, 예약 조건, 위치 정보를 등록합니다.' ?>
                </p>
            </div>
        </div>

        <div class="product-form__topbar-actions">
            <a href="<?= e(admin_url('pages/product/list.php')) ?>" class="admin-btn admin-btn--light">목록으로</a>
            <button type="submit" name="save_status" value="draft" class="admin-btn admin-btn--light">임시저장</button>
            <button type="submit" name="save_status" value="publish" class="admin-btn admin-btn--primary">
                <?= $isEditMode ? '수정 저장' : '저장하기' ?>
            </button>
        </div>
    </div>

    <div class="product-form__layout">
        <div class="product-form__main">
            <section class="admin-card product-hero-card">
                <div class="admin-card__body">
                    <div class="product-hero-card__grid">
                        <div class="admin-field">
                            <label class="admin-label">상품명</label>
                            <input
                                type="text"
                                name="title"
                                class="admin-input js-summary-title"
                                value="<?= e($formData['title'] ?? '') ?>"
                                placeholder="상품명을 입력하세요"
                                required
                            >
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">서브타이틀</label>
                            <input
                                type="text"
                                name="subtitle"
                                class="admin-input js-summary-subtitle"
                                value="<?= e($formData['subtitle'] ?? '') ?>"
                                placeholder="짧은 보조 설명"
                            >
                        </div>

                        <div class="admin-field admin-field--full">
                            <label class="admin-label">카드용 요약 설명</label>
                            <textarea
                                name="summary"
                                class="admin-textarea js-summary-text"
                                rows="4"
                                placeholder="상품 카드와 상세 상단에 노출될 요약 문구"
                            ><?= e($formData['summary'] ?? '') ?></textarea>
                        </div>
                    </div>

                    <div class="product-kpi-row">
                        <div class="product-kpi">
                            <span class="product-kpi__label">현재 상태</span>
                            <strong class="js-summary-status-text"><?= e($statusOptions[$currentStatus] ?? '임시저장') ?></strong>
                        </div>
                        <div class="product-kpi">
                            <span class="product-kpi__label">판매가</span>
                            <strong class="js-summary-price-text">
                                <?= $salePrice > 0 ? number_format($salePrice) . ' ' . e($formData['currency'] ?? 'KRW') : '미입력' ?>
                            </strong>
                        </div>
                        <div class="product-kpi">
                            <span class="product-kpi__label">할인율</span>
                            <strong class="js-summary-discount-text"><?= $discountRate > 0 ? $discountRate . '%' : '-' ?></strong>
                        </div>
                    </div>
                </div>
            </section>

            <div class="product-tabs js-product-tabs">
                <div class="product-tabs__nav">
                    <button type="button" class="product-tabs__btn is-active" data-tab-target="basic">
                        <span><?= e($tabConfig['basic']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="basic"><?= e($tabConfig['basic']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="general">
                        <span><?= e($tabConfig['general']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="general"><?= e($tabConfig['general']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="price">
                        <span><?= e($tabConfig['price']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="price"><?= e($tabConfig['price']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="availability">
                        <span><?= e($tabConfig['availability']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="availability"><?= e($tabConfig['availability']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="payment">
                        <span><?= e($tabConfig['payment']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="payment"><?= e($tabConfig['payment']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="cancel">
                        <span><?= e($tabConfig['cancel']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="cancel"><?= e($tabConfig['cancel']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="information">
                        <span><?= e($tabConfig['information']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="information"><?= e($tabConfig['information']['meta']) ?></em>
                    </button>

                    <button type="button" class="product-tabs__btn" data-tab-target="location">
                        <span><?= e($tabConfig['location']['label']) ?></span>
                        <em class="product-tabs__meta js-tab-meta" data-tab-meta="location"><?= e($tabConfig['location']['meta']) ?></em>
                    </button>
                </div>

                <div class="product-tabs__content">
                    <div class="product-tabs__panel is-active" data-tab-panel="basic">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-basic.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="general">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-general.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="price">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-price.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="availability">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-availability.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="payment">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-payment.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="cancel">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-cancel.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="information">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-information.php'; ?>
                    </div>

                    <div class="product-tabs__panel" data-tab-panel="location">
                        <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/partials/product/tabs-location.php'; ?>
                    </div>
                </div>
            </div>
        </div>

        <aside class="product-form__side">
            <section class="admin-card product-side-card">
                <div class="admin-card__head">
                    <h3>상태 / 정렬</h3>
                </div>
                <div class="admin-card__body">
                    <div class="admin-form-grid admin-form-grid--2">
                        <div class="admin-field">
                            <label class="admin-label">공개 상태</label>
                            <select name="status" class="admin-select js-summary-status-select">
                                <?php foreach ($statusOptions as $value => $label): ?>
                                    <option value="<?= e($value) ?>" <?= ($formData['status'] ?? '') === $value ? 'selected' : '' ?>>
                                        <?= e($label) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">정렬 우선순위</label>
                            <input type="number" name="sort_order" class="admin-input" value="<?= e((string) ($formData['sort_order'] ?? 0)) ?>">
                        </div>
                    </div>

                    <?php if ($isEditMode): ?>
                        <button
                            type="submit"
                            class="admin-btn admin-btn--danger admin-btn--block"
                            formaction="<?= e(admin_url('actions/product-delete.php')) ?>"
                            formmethod="post"
                            formnovalidate
                            onclick="return confirm('정말 삭제하시겠습니까?');"
                        >
                            상품 삭제
                        </button>
                    <?php endif; ?>
                </div>
            </section>

            <section class="admin-card product-side-card">
                <div class="admin-card__head">
                    <h3>대표 이미지</h3>
                </div>
                <div class="admin-card__body">
                    <div class="admin-media-box">
                        <div class="admin-media-box__preview js-thumbnail-preview product-thumb-preview <?= !empty($thumbnail) ? 'has-image' : '' ?>">
                            <?php if (!empty($thumbnail)): ?>
                                <img src="<?= e($thumbnail) ?>" alt="대표 이미지">
                            <?php else: ?>
                                <div class="product-thumb-preview__empty">
                                    <strong>대표 이미지 미리보기</strong>
                                    <span>목록 카드와 상세 상단에 사용하는 썸네일입니다.</span>
                                </div>
                            <?php endif; ?>
                        </div>

                        <input type="hidden" name="thumbnail" class="js-thumbnail-input" value="<?= e($thumbnail) ?>">

                        <div class="admin-upload-actions">
                            <label class="admin-btn admin-btn--light admin-btn--block">
                                <input type="file" class="u-hidden js-image-upload" data-upload-type="products" data-target="thumbnail" accept="image/*">
                                이미지 업로드
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            <section class="admin-card product-side-card">
                <div class="admin-card__head">
                    <h3>입력 체크</h3>
                </div>
                <div class="admin-card__body">
                    <ul class="product-checklist js-product-checklist">
                        <li class="js-check-item" data-check-target="title">상품명 입력</li>
                        <li class="js-check-item" data-check-target="country">국가 / 지역 입력</li>
                        <li class="js-check-item" data-check-target="sale_price">판매가 입력</li>
                        <li class="js-check-item" data-check-target="thumbnail">대표 이미지 등록</li>
                        <li class="js-check-item" data-check-target="description">상세 설명 입력</li>

                        <?php if ($productType === 'travel_package'): ?>
                            <li class="js-check-item" data-check-target="hotel_name">호텔 정보 입력</li>
                            <li class="js-check-item" data-check-target="airport_name">공항 / 이동 정보 입력</li>
                            <li class="js-check-item" data-check-target="itinerary_days">일정표 입력</li>
                        <?php else: ?>
                            <li class="js-check-item" data-check-target="golf_name">골프장명 입력</li>
                            <li class="js-check-item" data-check-target="golf_intro">골프 정보 입력</li>
                            <li class="js-check-item" data-check-target="tee_time_slots">티타임 슬롯 입력</li>
                        <?php endif; ?>
                    </ul>
                </div>
            </section>

            <section class="admin-card product-side-card">
                <div class="admin-card__head">
                    <h3>노출 미리보기</h3>
                </div>
                <div class="admin-card__body">
                    <div class="product-preview-card">
                        <div class="product-preview-card__image js-sidebar-preview-image <?= !empty($thumbnail) ? 'has-image' : '' ?>">
                            <?php if (!empty($thumbnail)): ?>
                                <img src="<?= e($thumbnail) ?>" alt="상품 대표 이미지">
                            <?php else: ?>
                                <span>IMAGE</span>
                            <?php endif; ?>
                        </div>

                        <div class="product-preview-card__body">
                            <span class="product-preview-card__badge js-sidebar-preview-badge"><?= e($formData['card_label'] ?? '라벨') ?></span>
                            <strong class="js-sidebar-preview-title"><?= e($formData['title'] ?? '상품명을 입력하세요') ?></strong>
                            <p class="js-sidebar-preview-summary"><?= e($formData['summary'] ?? '상품 요약 문구가 여기에 표시됩니다.') ?></p>
                            <div class="product-preview-card__meta">
                                <span class="js-sidebar-preview-region">
                                    <?= e(trim(($formData['country'] ?? '') . ' · ' . ($formData['region'] ?? '')) ?: '국가 · 지역') ?>
                                </span>
                                <span class="js-sidebar-preview-price">
                                    <?= $salePrice > 0 ? number_format($salePrice) . ' ' . e($formData['currency'] ?? 'KRW') : '가격 미입력' ?>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="product-detail-preview">
                        <div class="product-detail-preview__head">
                            <strong class="js-detail-preview-title"><?= e($formData['title'] ?? '상품명') ?></strong>
                            <span class="js-detail-preview-subtitle"><?= e($formData['subtitle'] ?? '서브타이틀') ?></span>
                        </div>

                        <ul class="product-detail-preview__list">
                            <?php if ($productType === 'travel_package'): ?>
                                <li><span>호텔</span><strong class="js-detail-preview-hotel"><?= e($formData['hotel_name'] ?? '-') ?></strong></li>
                                <li><span>골프장</span><strong class="js-detail-preview-golf"><?= e($formData['golf_name'] ?? '-') ?></strong></li>
                                <li><span>공항</span><strong class="js-detail-preview-airport"><?= e($formData['airport_name'] ?? '-') ?></strong></li>
                                <li><span>일정표</span><strong class="js-detail-preview-itinerary"><?= !empty($itineraryDays) ? count($itineraryDays) . '일차 구성' : '미입력' ?></strong></li>
                            <?php else: ?>
                                <li><span>골프장</span><strong class="js-detail-preview-golf"><?= e($formData['golf_name'] ?? ($formData['title'] ?? '-')) ?></strong></li>
                                <li><span>지역</span><strong class="js-detail-preview-region-text"><?= e(($formData['region'] ?? '-') ?: '-') ?></strong></li>
                                <li><span>공항</span><strong class="js-detail-preview-airport"><?= e($formData['airport_name'] ?? '-') ?></strong></li>
                                <li><span>티타임</span><strong class="js-detail-preview-itinerary"><?= !empty($teeTimeSlots) ? count($teeTimeSlots) . '개 슬롯' : '미입력' ?></strong></li>
                            <?php endif; ?>
                        </ul>
                    </div>
                </div>
            </section>
        </aside>
    </div>
</form>