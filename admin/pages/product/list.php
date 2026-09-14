<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/table-components.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

$pageTitle = '상품 목록';
$currentAdminTitle = '상품관리';

$pageCss = [
    'product.css',
    'product-list.css',
];

$pageJs = [
    'product-list.js',
];

$badgeOptions = admin_get_active_taxonomy_items('badges');

$filters = [
    'keyword'      => trim((string) ($_GET['keyword'] ?? '')),
    'type'         => trim((string) ($_GET['type'] ?? '')),
    'status'       => trim((string) ($_GET['status'] ?? '')),
    'country'      => trim((string) ($_GET['country'] ?? '')),
    'badge'        => trim((string) ($_GET['badge'] ?? '')),
    'featured'     => trim((string) ($_GET['featured'] ?? '')),
    'consult_only' => trim((string) ($_GET['consult_only'] ?? '')),
    'price_min'    => (int) ($_GET['price_min'] ?? 0),
    'price_max'    => (int) ($_GET['price_max'] ?? 0),
];

$products = admin_get_products();
$products = is_array($products) ? $products : [];

if (!function_exists('admin_product_type_label')) {
    function admin_product_type_label(string $type): string
    {
        return match ($type) {
            'golf_course' => '골프장',
            'travel_package' => '여행 패키지',
            default => '기타',
        };
    }
}

if (!function_exists('admin_status_label')) {
    function admin_status_label(string $status): string
    {
        return match ($status) {
            'publish' => '공개',
            'draft' => '임시저장',
            'hidden' => '숨김',
            'soldout' => '판매중지',
            default => '미정',
        };
    }
}

if (!function_exists('admin_status_chip_class')) {
    function admin_status_chip_class(string $status): string
    {
        return match ($status) {
            'publish' => 'admin-chip admin-chip--success',
            'draft' => 'admin-chip admin-chip--gray',
            'hidden' => 'admin-chip admin-chip--warning',
            'soldout' => 'admin-chip admin-chip--danger',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_product_display_price')) {
    function admin_product_display_price(array $item): int
    {
        $sale = (int) ($item['sale_price'] ?? 0);
        $base = (int) ($item['base_price'] ?? 0);
        $legacy = (int) ($item['price'] ?? 0);

        if ($sale > 0) return $sale;
        if ($base > 0) return $base;
        return $legacy;
    }
}

if (!function_exists('admin_product_display_region')) {
    function admin_product_display_region(array $item): string
    {
        $display = trim((string) ($item['display_region'] ?? ''));
        if ($display !== '') {
            return $display;
        }

        $country = trim((string) ($item['country'] ?? ''));
        $region = trim((string) ($item['region'] ?? ''));

        return trim($country . ($country && $region ? ' / ' : '') . $region);
    }
}

if (!function_exists('admin_product_updated_at')) {
    function admin_product_updated_at(array $item): string
    {
        return (string) ($item['updated_at'] ?? $item['created_at'] ?? '-');
    }
}

if (!function_exists('admin_product_updated_date')) {
    function admin_product_updated_date(array $item): string
    {
        $updated = admin_product_updated_at($item);
        if ($updated === '-' || trim($updated) === '') {
            return '-';
        }

        $timestamp = strtotime($updated);
        return $timestamp ? date('Y-m-d', $timestamp) : $updated;
    }
}

if (!function_exists('admin_product_updated_time')) {
    function admin_product_updated_time(array $item): string
    {
        $updated = admin_product_updated_at($item);
        if ($updated === '-' || trim($updated) === '') {
            return '';
        }

        $timestamp = strtotime($updated);
        return $timestamp ? date('H:i:s', $timestamp) : '';
    }
}

if (!function_exists('admin_product_meta_badges')) {
    function admin_product_meta_badges(array $item): array
    {
        $badges = [];

        if (!empty($item['card_label'])) {
            $badges[] = [
                'text' => (string) $item['card_label'],
                'class' => 'admin-chip admin-chip--primary',
            ];
        }

        $itemBadges = is_array($item['badges'] ?? null) ? $item['badges'] : [];
        foreach ($itemBadges as $badge) {
            $badge = trim((string) $badge);
            if ($badge === '') {
                continue;
            }

            $class = 'admin-chip admin-chip--gray';
            $lower = mb_strtolower($badge);

            if (in_array($lower, ['best', '인기'], true)) {
                $class = 'admin-chip admin-chip--danger';
            } elseif (in_array($lower, ['new', '신규'], true)) {
                $class = 'admin-chip admin-chip--primary';
            } elseif (in_array($lower, ['추천', '특가'], true)) {
                $class = 'admin-chip admin-chip--warning';
            }

            $badges[] = [
                'text' => $badge,
                'class' => $class,
            ];
        }

        if (!empty($item['is_featured'])) {
            $badges[] = [
                'text' => '메인노출',
                'class' => 'admin-chip admin-chip--success',
            ];
        }

        if (!empty($item['consult_only'])) {
            $badges[] = [
                'text' => '문의전용',
                'class' => 'admin-chip admin-chip--warning',
            ];
        }

        return $badges;
    }
}

$filteredProducts = array_values(array_filter($products, function ($item) use ($filters) {
    $title    = (string) ($item['title'] ?? '');
    $subtitle = (string) ($item['subtitle'] ?? '');
    $country  = (string) ($item['country'] ?? '');
    $region   = (string) ($item['region'] ?? '');
    $type     = (string) ($item['type'] ?? $item['product_type'] ?? '');
    $status   = (string) ($item['status'] ?? '');
    $hotel    = (string) ($item['hotel_name'] ?? '');
    $golf     = (string) ($item['golf_name'] ?? '');
    $airport  = (string) ($item['airport_name'] ?? $item['airport'] ?? '');
    $badges   = is_array($item['badges'] ?? null) ? $item['badges'] : [];
    $price    = admin_product_display_price($item);

    if ($filters['keyword'] !== '') {
        $haystack = mb_strtolower(trim($title . ' ' . $subtitle . ' ' . $country . ' ' . $region . ' ' . $hotel . ' ' . $golf . ' ' . $airport));
        if (mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
            return false;
        }
    }

    if ($filters['type'] !== '' && $type !== $filters['type']) {
        return false;
    }

    if ($filters['status'] !== '' && $status !== $filters['status']) {
        return false;
    }

    if ($filters['country'] !== '' && $country !== $filters['country']) {
        return false;
    }

    if ($filters['badge'] !== '' && !in_array($filters['badge'], $badges, true)) {
        return false;
    }

    if ($filters['featured'] === '1' && empty($item['is_featured'])) {
        return false;
    }

    if ($filters['featured'] === '0' && !empty($item['is_featured'])) {
        return false;
    }

    if ($filters['consult_only'] === '1' && empty($item['consult_only'])) {
        return false;
    }

    if ($filters['consult_only'] === '0' && !empty($item['consult_only'])) {
        return false;
    }

    if ($filters['price_min'] > 0 && $price < $filters['price_min']) {
        return false;
    }

    if ($filters['price_max'] > 0 && $price > $filters['price_max']) {
        return false;
    }

    return true;
}));

$totalCount   = count($products);
$publishCount = count(array_filter($products, fn($item) => ($item['status'] ?? '') === 'publish'));
$draftCount   = count(array_filter($products, fn($item) => ($item['status'] ?? '') === 'draft'));
$hiddenCount  = count(array_filter($products, fn($item) => ($item['status'] ?? '') === 'hidden'));
$soldoutCount = count(array_filter($products, fn($item) => ($item['status'] ?? '') === 'soldout'));

$typeGolfCount    = count(array_filter($products, fn($item) => (($item['type'] ?? $item['product_type'] ?? '') === 'golf_course')));
$typePackageCount = count(array_filter($products, fn($item) => (($item['type'] ?? $item['product_type'] ?? '') === 'travel_package')));

$featuredCount    = count(array_filter($products, fn($item) => !empty($item['is_featured'])));
$consultOnlyCount = count(array_filter($products, fn($item) => !empty($item['consult_only'])));

$hasAdvancedFilter = $filters['badge'] !== ''
    || $filters['featured'] !== ''
    || $filters['consult_only'] !== ''
    || $filters['price_min'] > 0
    || $filters['price_max'] > 0;

$activeFilterChips = [];
$filterLabelMaps = [
    'type' => [
        'golf_course' => '골프장',
        'travel_package' => '여행 패키지',
    ],
    'status' => [
        'publish' => '공개',
        'draft' => '임시저장',
        'hidden' => '숨김',
        'soldout' => '판매중지',
    ],
    'featured' => [
        '1' => '메인노출',
        '0' => '메인미노출',
    ],
    'consult_only' => [
        '1' => '문의전용',
        '0' => '일반판매',
    ],
];

if ($filters['keyword'] !== '') $activeFilterChips[] = '검색어: ' . $filters['keyword'];
if ($filters['type'] !== '') $activeFilterChips[] = '유형: ' . ($filterLabelMaps['type'][$filters['type']] ?? $filters['type']);
if ($filters['status'] !== '') $activeFilterChips[] = '상태: ' . ($filterLabelMaps['status'][$filters['status']] ?? $filters['status']);
if ($filters['country'] !== '') $activeFilterChips[] = '국가: ' . $filters['country'];
if ($filters['badge'] !== '') $activeFilterChips[] = '배지: ' . $filters['badge'];
if ($filters['featured'] !== '') $activeFilterChips[] = '메인노출: ' . ($filterLabelMaps['featured'][$filters['featured']] ?? $filters['featured']);
if ($filters['consult_only'] !== '') $activeFilterChips[] = '문의전용: ' . ($filterLabelMaps['consult_only'][$filters['consult_only']] ?? $filters['consult_only']);
if ($filters['price_min'] > 0) $activeFilterChips[] = '최소가: ' . number_format($filters['price_min']);
if ($filters['price_max'] > 0) $activeFilterChips[] = '최대가: ' . number_format($filters['price_max']);

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">

            <section class="product-hero">
                <div class="product-hero__content">
                    <span class="admin-chip admin-chip--primary">PRODUCT MANAGER</span>
                    <h1 class="product-hero__title">상품 목록</h1>
                    <p class="product-hero__desc">
                        골프장과 여행 패키지 상품을 통합 관리하고, 상세페이지와 연결되는 운영 데이터를 빠르게 찾을 수 있습니다.
                    </p>

                    <div class="product-hero__stats">
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">전체 상품</span>
                            <strong class="product-hero-stat__value"><?= number_format($totalCount) ?></strong>
                        </div>
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">골프장</span>
                            <strong class="product-hero-stat__value"><?= number_format($typeGolfCount) ?></strong>
                        </div>
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">패키지</span>
                            <strong class="product-hero-stat__value"><?= number_format($typePackageCount) ?></strong>
                        </div>
                    </div>
                </div>

                <div class="product-hero__actions">
                    <a href="<?= e(admin_url('pages/product/create.php?type=golf_course')) ?>" class="admin-btn admin-btn--light">
                        <i class="ri-golf-ball-line"></i>
                        <span>골프장 등록</span>
                    </a>
                    <a href="<?= e(admin_url('pages/product/create.php?type=travel_package')) ?>" class="admin-btn admin-btn--primary">
                        <i class="ri-suitcase-3-line"></i>
                        <span>패키지 등록</span>
                    </a>
                </div>
            </section>

           
            <section class="product-summary-inline-section">
    <div class="product-summary-inline">
        <div class="product-summary-inline__list">
            <span class="product-summary-inline__item"><strong>전체</strong><em><?= number_format($totalCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>공개</strong><em><?= number_format($publishCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>임시저장</strong><em><?= number_format($draftCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>숨김</strong><em><?= number_format($hiddenCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>판매중지</strong><em><?= number_format($soldoutCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>검색 결과</strong><em><?= number_format(count($filteredProducts)) ?></em></span>
            <span class="product-summary-inline__item"><strong>메인노출</strong><em><?= number_format($featuredCount) ?></em></span>
            <span class="product-summary-inline__item"><strong>문의전용</strong><em><?= number_format($consultOnlyCount) ?></em></span>
        </div>
    </div>
</section>
           

            <section class="admin-card product-filter-card">
                <div class="admin-card__head">
                    <div>
                        <h3>상품 검색 / 필터</h3>
                        <p class="product-section-desc">핵심 조건은 바로 보이고, 상세 조건은 펼쳐서 사용할 수 있게 정리했습니다.</p>
                    </div>
                    <div class="product-filter__toolbar">
                                <button
                                    type="button"
                                    class="admin-btn admin-btn--light product-filter__toggle js-filter-toggle <?= $hasAdvancedFilter ? 'is-active' : '' ?>"
                                    aria-expanded="<?= $hasAdvancedFilter ? 'true' : 'false' ?>"
                                >
                                    <i class="ri-equalizer-line"></i>
                                    <span>상세 필터</span>
                                </button>
                            </div>
                </div>

                <div class="admin-card__body">
                    <form method="get" class="product-filter">
                        <div class="product-filter__top">
                            <div class="product-filter__primary">
                                <div class="admin-field product-filter__keyword">
                                    <label class="admin-label">검색어</label>
                                    <input
                                        type="text"
                                        name="keyword"
                                        class="admin-input"
                                        value="<?= e($filters['keyword']) ?>"
                                        placeholder="상품명, 호텔명, 골프장명, 공항명 검색"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">상품 유형</label>
                                    <select name="type" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="golf_course" <?= $filters['type'] === 'golf_course' ? 'selected' : '' ?>>골프장</option>
                                        <option value="travel_package" <?= $filters['type'] === 'travel_package' ? 'selected' : '' ?>>여행 패키지</option>
                                    </select>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">상태</label>
                                    <select name="status" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="publish" <?= $filters['status'] === 'publish' ? 'selected' : '' ?>>공개</option>
                                        <option value="draft" <?= $filters['status'] === 'draft' ? 'selected' : '' ?>>임시저장</option>
                                        <option value="hidden" <?= $filters['status'] === 'hidden' ? 'selected' : '' ?>>숨김</option>
                                        <option value="soldout" <?= $filters['status'] === 'soldout' ? 'selected' : '' ?>>판매중지</option>
                                    </select>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">국가</label>
                                    <select name="country" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="한국" <?= $filters['country'] === '한국' ? 'selected' : '' ?>>한국</option>
                                        <option value="일본" <?= $filters['country'] === '일본' ? 'selected' : '' ?>>일본</option>
                                        <option value="미국" <?= $filters['country'] === '미국' ? 'selected' : '' ?>>미국</option>
                                    </select>
                                </div>
                            </div> 
                        </div>

                        <div class="product-filter__advanced js-filter-advanced <?= $hasAdvancedFilter ? 'is-open' : '' ?>">
                            <div class="product-filter__advanced-grid">
                                <div class="admin-field">
                                    <label class="admin-label">배지</label>
                                    <select name="badge" class="admin-select">
                                        <option value="">전체</option>
                                        <?php foreach ($badgeOptions as $badge): ?>
                                            <option value="<?= e((string) ($badge['name'] ?? '')) ?>" <?= $filters['badge'] === (string) ($badge['name'] ?? '') ? 'selected' : '' ?>>
                                                <?= e((string) ($badge['name'] ?? '')) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">메인 노출</label>
                                    <select name="featured" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="1" <?= $filters['featured'] === '1' ? 'selected' : '' ?>>노출</option>
                                        <option value="0" <?= $filters['featured'] === '0' ? 'selected' : '' ?>>미노출</option>
                                    </select>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">문의 전용</label>
                                    <select name="consult_only" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="1" <?= $filters['consult_only'] === '1' ? 'selected' : '' ?>>문의전용</option>
                                        <option value="0" <?= $filters['consult_only'] === '0' ? 'selected' : '' ?>>일반판매</option>
                                    </select>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">최소 가격</label>
                                    <input type="number" name="price_min" class="admin-input" value="<?= e((string) $filters['price_min']) ?>">
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">최대 가격</label>
                                    <input type="number" name="price_max" class="admin-input" value="<?= e((string) $filters['price_max']) ?>">
                                </div>
                            </div>
                        </div>

                        <?php if (!empty($activeFilterChips)): ?>
                            <div class="product-filter__chips">
                                <?php foreach ($activeFilterChips as $chip): ?>
                                    <span class="product-filter-chip"><?= e($chip) ?></span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>

                        <div class="product-filter__actions">
                            <button type="submit" class="admin-btn admin-btn--primary">
                                <i class="ri-search-line"></i>
                                <span>검색</span>
                            </button>
                            <a href="<?= e(admin_url('pages/product/list.php')) ?>" class="admin-btn admin-btn--light">
                                <i class="ri-refresh-line"></i>
                                <span>초기화</span>
                            </a>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card product-list-card u-mt-16">
                <div class="admin-card__head product-list-card__head">
                    <div>
                        <h3>상품 리스트</h3>
                        <p class="product-list-card__desc">검색 결과 <?= number_format(count($filteredProducts)) ?>건</p>
                    </div>

                    <div class="product-table-tools">
    <div class="product-bulkbar js-bulkbar" hidden>
        <div class="product-bulkbar__left">
            <span class="product-bulkbar__count"><strong class="js-bulk-count">0</strong>개 선택됨</span>
            <span class="product-bulkbar__hint">선택한 상품에 빠르게 일괄 작업할 수 있습니다.</span>
        </div>

        <div class="product-bulkbar__actions">
            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-bulk-action" data-bulk-action="publish" disabled>
                공개
            </button>
            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-bulk-action" data-bulk-action="hidden" disabled>
                숨김
            </button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--sm js-bulk-action" data-bulk-action="delete" disabled>
                삭제
            </button>
        </div>
    </div>
</div>
                </div>

                <div class="admin-card__body product-table-card">
                    <div class="product-table-wrap">
                        <table class="product-table">
                            <thead>
                                <tr>
                                    <th class="product-table__check">
                                        <input type="checkbox" class="js-check-all">
                                    </th>
                                    <th>상품정보</th>
                                    <th>연결 정보</th>
                                    <th>상태</th>
                                    <th>가격</th>
                                    <th>수정일</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($filteredProducts)): ?>
                                    <?php foreach ($filteredProducts as $item): ?>
                                        <?php
                                        $productId = (int) ($item['id'] ?? 0);
                                        $type = (string) ($item['type'] ?? $item['product_type'] ?? '');
                                        $price = admin_product_display_price($item);
                                        $displayRegion = admin_product_display_region($item);
                                        $airportName = (string) ($item['airport_name'] ?? $item['airport'] ?? '-');
                                        $airportTime = (string) ($item['airport_time'] ?? '-');
                                        $golfName = trim((string) ($item['golf_name'] ?? ''));
                                        $hotelName = trim((string) ($item['hotel_name'] ?? ''));
                                        $metaBadges = admin_product_meta_badges($item);
                                        ?>
                                        <tr>
                                            <td class="product-table__check">
                                                <input type="checkbox" class="js-row-check" value="<?= e((string) $productId) ?>">
                                            </td>

                                            <td>
                                                <div class="product-item">
                                                    <div class="product-item__thumb">
                                                        <?php if (!empty($item['thumbnail'])): ?>
                                                            <img src="<?= e((string) $item['thumbnail']) ?>" alt="<?= e((string) ($item['title'] ?? '')) ?>">
                                                        <?php else: ?>
                                                            <div class="product-item__thumb-placeholder">
                                                                <i class="ri-image-line"></i>
                                                            </div>
                                                        <?php endif; ?>
                                                    </div>

                                                    <div class="product-item__content">
                                                        <?php if (!empty($metaBadges)): ?>
                                                            <div class="product-item__badges">
                                                                <?php foreach ($metaBadges as $badge): ?>
                                                                    <span class="<?= e($badge['class']) ?>"><?= e($badge['text']) ?></span>
                                                                <?php endforeach; ?>
                                                            </div>
                                                        <?php endif; ?>

                                                        <a href="<?= e(admin_url('pages/product/edit.php?id=' . $productId)) ?>" class="product-item__title">
                                                            <?= e((string) ($item['title'] ?? '')) ?>
                                                        </a>

                                                        <?php if (!empty($item['subtitle'])): ?>
                                                            <p class="product-item__subtitle"><?= e((string) $item['subtitle']) ?></p>
                                                        <?php endif; ?>

                                                        <div class="product-item__meta">
                                                            <span><?= e(admin_product_type_label($type)) ?></span>
                                                            <span><?= e($displayRegion !== '' ? $displayRegion : '-') ?></span>
                                                            <span><?= e($airportName) ?></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-table__meta">
                                                    <strong><?= e($golfName !== '' ? $golfName : '-') ?></strong>
                                                    <span><?= e($hotelName !== '' ? $hotelName : '-') ?></span>
                                                </div>
                                            </td>

                                            <td>
    <div class="product-status-card product-status-card--<?= e((string) ($item['status'] ?? 'draft')) ?>">
        <span class="product-status-card__dot"></span>
        <div class="product-status-card__content">
            <strong><?= e(admin_status_label((string) ($item['status'] ?? ''))) ?></strong>
            <span>
                <?php
                echo e(match ((string) ($item['status'] ?? '')) {
                    'publish' => '노출 중',
                    'draft' => '수정 후 게시 가능',
                    'hidden' => '사용자에게 비노출',
                    'soldout' => '판매 일시 중단',
                    default => '상태 확인 필요',
                });
                ?>
            </span>
        </div>
    </div>
</td>

<td>
    <div class="product-price product-price--emphasis">
        <strong class="product-table__price">
            <?= $price > 0 ? number_format($price) . ' ' . e((string) ($item['currency'] ?? 'KRW')) : '-' ?>
        </strong>

        <?php
        $priceSub = (string) ($item['price_label'] ?? ($item['card_price_from'] ?? ''));
        ?>

        <span><?= e($priceSub !== '' ? $priceSub : '기준가 정보 없음') ?></span>
    </div>
</td>

                                            <td>
                                                <div class="product-date">
                                                    <strong><?= e(admin_product_updated_date($item)) ?></strong>
                                                    <?php if (admin_product_updated_time($item) !== ''): ?>
                                                        <span><?= e(admin_product_updated_time($item)) ?></span>
                                                    <?php endif; ?>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-row-actions">
                                                    <a href="<?= e(admin_url('pages/product/edit.php?id=' . $productId)) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>

                                                    <div class="product-row-actions__menu js-row-menu">
                                                        <button type="button" class="product-row-actions__toggle js-row-menu-toggle" aria-expanded="false">
                                                            <i class="ri-more-2-fill"></i>
                                                        </button>

                                                        <div class="product-row-actions__dropdown js-row-menu-dropdown">
                                                            <form action="<?= e(admin_url('actions/product-duplicate.php')) ?>" method="post">
                                                                <input type="hidden" name="id" value="<?= e((string) $productId) ?>">
                                                                <button type="submit" class="product-row-actions__dropdown-button">복제</button>
                                                            </form>

                                                            <form action="<?= e(admin_url('actions/product-delete.php')) ?>" method="post" onsubmit="return confirm('정말 삭제하시겠습니까?');">
                                                                <input type="hidden" name="id" value="<?= e((string) $productId) ?>">
                                                                <button type="submit" class="product-row-actions__dropdown-button is-danger">삭제</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
    <td colspan="7">
        <div class="product-empty">
            <div class="product-empty__icon">
                <i class="ri-search-eye-line"></i>
            </div>
            <strong>조건에 맞는 상품이 없습니다.</strong>
            <p>
                현재 검색 조건과 필터 조합으로는 결과를 찾지 못했습니다.
                필터를 초기화하거나 새 상품을 등록해보세요.
            </p>
            <div class="product-empty__actions">
                <a href="<?= e(admin_url('pages/product/list.php')) ?>" class="admin-btn admin-btn--light admin-btn--sm">
                    필터 초기화
                </a>
                <a href="<?= e(admin_url('pages/product/create.php?type=golf_course')) ?>" class="admin-btn admin-btn--primary admin-btn--sm">
                    골프장 등록
                </a>
                <a href="<?= e(admin_url('pages/product/create.php?type=travel_package')) ?>" class="admin-btn admin-btn--light admin-btn--sm">
                    패키지 등록
                </a>
            </div>
        </div>
    </td>
</tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="product-mobile-list">
                        <?php if (!empty($filteredProducts)): ?>
                            <?php foreach ($filteredProducts as $item): ?>
                                <?php
                                $productId = (int) ($item['id'] ?? 0);
                                $type = (string) ($item['type'] ?? $item['product_type'] ?? '');
                                $price = admin_product_display_price($item);
                                $displayRegion = admin_product_display_region($item);
                                $airportName = (string) ($item['airport_name'] ?? $item['airport'] ?? '-');
                                $metaBadges = admin_product_meta_badges($item);
                                ?>
                                <article class="product-mobile-card">
                                    <div class="product-mobile-card__top">
                                        <div class="product-mobile-card__check">
                                            <input type="checkbox" class="js-row-check-mobile" value="<?= e((string) $productId) ?>">
                                        </div>

                                        <div class="product-mobile-card__thumb">
                                            <?php if (!empty($item['thumbnail'])): ?>
                                                <img src="<?= e((string) $item['thumbnail']) ?>" alt="<?= e((string) ($item['title'] ?? '')) ?>">
                                            <?php else: ?>
                                                <div class="product-item__thumb-placeholder">
                                                    <i class="ri-image-line"></i>
                                                </div>
                                            <?php endif; ?>
                                        </div>

                                        <div class="product-mobile-card__body">
                                            <?php if (!empty($metaBadges)): ?>
                                                <div class="product-mobile-card__chips">
                                                    <?php foreach ($metaBadges as $badge): ?>
                                                        <span class="<?= e($badge['class']) ?>"><?= e($badge['text']) ?></span>
                                                    <?php endforeach; ?>
                                                </div>
                                            <?php endif; ?>

                                            <a href="<?= e(admin_url('pages/product/edit.php?id=' . $productId)) ?>" class="product-item__title">
                                                <?= e((string) ($item['title'] ?? '')) ?>
                                            </a>

                                            <?php if (!empty($item['subtitle'])): ?>
                                                <p class="product-item__subtitle"><?= e((string) $item['subtitle']) ?></p>
                                            <?php endif; ?>

                                            <div class="product-mobile-card__meta-grid">
                                                <div class="product-mobile-card__meta-item">
                                                    <span>유형 / 지역</span>
                                                    <strong><?= e(admin_product_type_label($type) . ' · ' . ($displayRegion !== '' ? $displayRegion : '-')) ?></strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item">
                                                    <span>가격</span>
                                                    <strong><?= $price > 0 ? number_format($price) . ' ' . e((string) ($item['currency'] ?? 'KRW')) : '-' ?></strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item">
                                                    <span>공항</span>
                                                    <strong><?= e($airportName) ?></strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item">
                                                    <span>상태</span>
                                                    <strong><?= e(admin_status_label((string) ($item['status'] ?? ''))) ?></strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="product-mobile-card__actions">
                                        <a href="<?= e(admin_url('pages/product/edit.php?id=' . $productId)) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>

                                        <form action="<?= e(admin_url('actions/product-duplicate.php')) ?>" method="post" class="product-mobile-card__delete-form">
                                            <input type="hidden" name="id" value="<?= e((string) $productId) ?>">
                                            <button type="submit" class="admin-btn admin-btn--light admin-btn--sm">복제</button>
                                        </form>

                                        <form action="<?= e(admin_url('actions/product-delete.php')) ?>" method="post" class="product-mobile-card__delete-form" onsubmit="return confirm('정말 삭제하시겠습니까?');">
                                            <input type="hidden" name="id" value="<?= e((string) $productId) ?>">
                                            <button type="submit" class="admin-btn admin-btn--danger admin-btn--sm">삭제</button>
                                        </form>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="product-empty">
    <div class="product-empty__icon">
        <i class="ri-search-eye-line"></i>
    </div>
    <strong>조건에 맞는 상품이 없습니다.</strong>
    <p>검색 조건을 다시 선택하거나 필터를 초기화해보세요.</p>
    <div class="product-empty__actions">
        <a href="<?= e(admin_url('pages/product/list.php')) ?>" class="admin-btn admin-btn--light admin-btn--sm">필터 초기화</a>
    </div>
</div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>