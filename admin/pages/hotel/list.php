<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/hotel/hotel-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

$pageTitle = '호텔 관리';
$currentAdminTitle = '호텔 관리';
$pageCss = [
    'hotel.css',
    'product-list.css',
];
$pageJs = [
    'product-list.js',
];

$filters = [
    'keyword' => trim((string) ($_GET['keyword'] ?? '')),
    'status' => trim((string) ($_GET['status'] ?? '')),
];

$hotels = admin_get_hotels();
$hotels = is_array($hotels) ? $hotels : [];

$products = function_exists('admin_get_products') ? admin_get_products() : [];
$products = is_array($products) ? $products : [];

if (!function_exists('admin_hotel_status_label')) {
    function admin_hotel_status_label(string $status): string
    {
        return match ($status) {
            'publish' => '공개',
            'draft' => '임시저장',
            'hidden' => '숨김',
            default => '미정',
        };
    }
}

if (!function_exists('admin_hotel_updated_at')) {
    function admin_hotel_updated_at(array $item): string
    {
        return (string) ($item['updated_at'] ?? $item['created_at'] ?? '-');
    }
}

if (!function_exists('admin_hotel_updated_date')) {
    function admin_hotel_updated_date(array $item): string
    {
        $updated = admin_hotel_updated_at($item);
        if ($updated === '-' || trim($updated) === '') {
            return '-';
        }

        $timestamp = strtotime($updated);
        return $timestamp ? date('Y-m-d', $timestamp) : $updated;
    }
}

if (!function_exists('admin_hotel_updated_time')) {
    function admin_hotel_updated_time(array $item): string
    {
        $updated = admin_hotel_updated_at($item);
        if ($updated === '-' || trim($updated) === '') {
            return '';
        }

        $timestamp = strtotime($updated);
        return $timestamp ? date('H:i:s', $timestamp) : '';
    }
}

if (!function_exists('admin_hotel_cover_image')) {
    function admin_hotel_cover_image(array $hotel): string
    {
        $gallery = is_array($hotel['gallery'] ?? null) ? $hotel['gallery'] : [];

        foreach ($gallery as $image) {
            if (!empty($image['is_cover']) && !empty($image['url'])) {
                return (string) $image['url'];
            }
        }

        return !empty($gallery[0]['url']) ? (string) $gallery[0]['url'] : '';
    }
}

if (!function_exists('admin_hotel_meta_badges')) {
    function admin_hotel_meta_badges(array $hotel): array
    {
        $badges = [];
        $status = (string) ($hotel['status'] ?? 'publish');

        $statusClass = match ($status) {
            'publish' => 'admin-chip admin-chip--success',
            'draft' => 'admin-chip admin-chip--gray',
            'hidden' => 'admin-chip admin-chip--warning',
            default => 'admin-chip admin-chip--gray',
        };

        $badges[] = [
            'text' => admin_hotel_status_label($status),
            'class' => $statusClass,
        ];

        $tag = trim((string) ($hotel['tag'] ?? ''));
        if ($tag !== '') {
            $badges[] = [
                'text' => $tag,
                'class' => 'admin-chip admin-chip--primary',
            ];
        }

        return $badges;
    }
}

$packageCountMap = [];
foreach ($products as $product) {
    $productType = (string) ($product['type'] ?? $product['product_type'] ?? '');
    if ($productType !== 'travel_package') {
        continue;
    }

    $hotelId = (int) ($product['hotel_id'] ?? 0);
    $hotelName = trim((string) ($product['hotel_name'] ?? ''));

    if ($hotelId > 0) {
        $packageCountMap[$hotelId] = ($packageCountMap[$hotelId] ?? 0) + 1;
        continue;
    }

    if ($hotelName !== '') {
        foreach ($hotels as $hotel) {
            if (trim((string) ($hotel['name'] ?? '')) === $hotelName) {
                $matchedId = (int) ($hotel['id'] ?? 0);
                if ($matchedId > 0) {
                    $packageCountMap[$matchedId] = ($packageCountMap[$matchedId] ?? 0) + 1;
                }
                break;
            }
        }
    }
}

$filteredHotels = array_values(array_filter($hotels, static function ($hotel) use ($filters) {
    $name = (string) ($hotel['name'] ?? '');
    $tag = (string) ($hotel['tag'] ?? '');
    $phone = (string) ($hotel['phone'] ?? '');
    $website = (string) ($hotel['website'] ?? '');
    $address = (string) ($hotel['address'] ?? '');
    $description = (string) ($hotel['description'] ?? '');
    $status = (string) ($hotel['status'] ?? '');

    if ($filters['keyword'] !== '') {
        $haystack = mb_strtolower(trim($name . ' ' . $tag . ' ' . $phone . ' ' . $website . ' ' . $address . ' ' . $description));
        if (mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
            return false;
        }
    }

    if ($filters['status'] !== '' && $status !== $filters['status']) {
        return false;
    }

    return true;
}));

$totalCount = count($hotels);
$publishCount = count(array_filter($hotels, fn($item) => ($item['status'] ?? '') === 'publish'));
$draftCount = count(array_filter($hotels, fn($item) => ($item['status'] ?? '') === 'draft'));
$hiddenCount = count(array_filter($hotels, fn($item) => ($item['status'] ?? '') === 'hidden'));

$galleryCount = 0;
$linkedPackageCount = 0;
foreach ($hotels as $hotel) {
    $hotelId = (int) ($hotel['id'] ?? 0);
    $galleryCount += count(is_array($hotel['gallery'] ?? null) ? $hotel['gallery'] : []);
    $linkedPackageCount += (int) ($packageCountMap[$hotelId] ?? 0);
}

$activeFilterChips = [];
if ($filters['keyword'] !== '') $activeFilterChips[] = '검색어: ' . $filters['keyword'];
if ($filters['status'] !== '') $activeFilterChips[] = '상태: ' . admin_hotel_status_label($filters['status']);

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>
<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <section class="product-hero">
                <div class="product-hero__content">
                    <span class="admin-chip admin-chip--primary">HOTEL MANAGER</span>
                    <h1 class="product-hero__title">호텔 관리</h1>
                    <p class="product-hero__desc">
                        패키지 등록에서 불러오는 호텔 정보를 상품 목록과 같은 구조로 빠르게 검색하고 관리할 수 있습니다.
                    </p>

                    <div class="product-hero__stats">
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">전체 호텔</span>
                            <strong class="product-hero-stat__value"><?= number_format($totalCount) ?></strong>
                        </div>
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">연결 패키지</span>
                            <strong class="product-hero-stat__value"><?= number_format($linkedPackageCount) ?></strong>
                        </div>
                        <div class="product-hero-stat">
                            <span class="product-hero-stat__label">갤러리 이미지</span>
                            <strong class="product-hero-stat__value"><?= number_format($galleryCount) ?></strong>
                        </div>
                    </div>
                </div>

                <div class="product-hero__actions">
                    <a href="<?= e(admin_url('pages/product/create.php?type=travel_package')) ?>" class="admin-btn admin-btn--light">
                        <i class="ri-suitcase-3-line"></i>
                        <span>패키지 등록</span>
                    </a>
                    <a href="<?= e(admin_url('pages/hotel/create.php')) ?>" class="admin-btn admin-btn--primary">
                        <i class="ri-hotel-line"></i>
                        <span>호텔 등록</span>
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
                        <span class="product-summary-inline__item"><strong>검색 결과</strong><em><?= number_format(count($filteredHotels)) ?></em></span>
                    </div>
                </div>
            </section>

            <section class="admin-card product-filter-card">
                <div class="admin-card__head">
                    <div>
                        <h3>호텔 검색 / 필터</h3>
                        <p class="product-section-desc">상품 목록과 동일한 흐름으로 검색하고 상태별로 빠르게 걸러볼 수 있습니다.</p>
                    </div>
                </div>

                <div class="admin-card__body">
                    <form method="get" class="product-filter">
                        <div class="product-filter__top">
                            <div class="product-filter__primary hotel-filter__primary">
                                <div class="admin-field product-filter__keyword">
                                    <label class="admin-label">검색어</label>
                                    <input
                                        type="text"
                                        name="keyword"
                                        class="admin-input"
                                        value="<?= e($filters['keyword']) ?>"
                                        placeholder="호텔명, 태그, 주소, 전화번호 검색"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">상태</label>
                                    <select name="status" class="admin-select">
                                        <option value="">전체</option>
                                        <option value="publish" <?= $filters['status'] === 'publish' ? 'selected' : '' ?>>공개</option>
                                        <option value="draft" <?= $filters['status'] === 'draft' ? 'selected' : '' ?>>임시저장</option>
                                        <option value="hidden" <?= $filters['status'] === 'hidden' ? 'selected' : '' ?>>숨김</option>
                                    </select>
                                </div>

                                <div class="product-filter__actions">
                            <button type="submit" class="admin-btn admin-btn--primary">
                                <i class="ri-search-line"></i>
                                <span>검색</span>
                            </button>
                            <a href="<?= e(admin_url('pages/hotel/list.php')) ?>" class="admin-btn admin-btn--light">
                                <i class="ri-refresh-line"></i>
                                <span>초기화</span>
                            </a>
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

                        
                    </form>
                </div>
            </section>

            <section class="admin-card product-list-card u-mt-16">
                <div class="admin-card__head product-list-card__head">
                    <div>
                        <h3>호텔 리스트</h3>
                        <p class="product-list-card__desc">검색 결과 <?= number_format(count($filteredHotels)) ?>건</p>
                    </div>
                </div>

                <div class="admin-card__body product-table-card">
                    <div class="product-table-wrap">
                        <table class="product-table hotel-table">
                            <thead>
                                <tr>
                                    <th>호텔정보</th>
                                    <th>연결 정보</th>
                                    <th>상태</th>
                                    <th>갤러리</th>
                                    <th>수정일</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($filteredHotels)): ?>
                                    <?php foreach ($filteredHotels as $hotel): ?>
                                        <?php
                                        $hotelId = (int) ($hotel['id'] ?? 0);
                                        $cover = admin_hotel_cover_image($hotel);
                                        $gallery = is_array($hotel['gallery'] ?? null) ? $hotel['gallery'] : [];
                                        $linkedPackages = (int) ($packageCountMap[$hotelId] ?? 0);
                                        $metaBadges = admin_hotel_meta_badges($hotel);
                                        $websiteHost = trim((string) parse_url((string) ($hotel['website'] ?? ''), PHP_URL_HOST));
                                        ?>
                                        <tr>
                                            <td>
                                                <div class="product-item">
                                                    <div class="product-item__thumb">
                                                        <?php if ($cover !== ''): ?>
                                                            <img src="<?= e($cover) ?>" alt="<?= e((string) ($hotel['name'] ?? '')) ?>">
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

                                                        <a href="<?= e(admin_url('pages/hotel/edit.php?id=' . $hotelId)) ?>" class="product-item__title">
                                                            <?= e((string) ($hotel['name'] ?? '')) ?>
                                                        </a>

                                                        <?php if (!empty($hotel['description'])): ?>
                                                            <p class="product-item__subtitle hotel-item__subtitle"><?= e((string) $hotel['description']) ?></p>
                                                        <?php endif; ?>

                                                        <div class="product-item__meta">
                                                            <span><?= e((string) ($hotel['phone'] ?? '-')) ?></span>
                                                            <span><?= e($websiteHost !== '' ? $websiteHost : ((string) ($hotel['website'] ?? '-'))) ?></span>
                                                            <span><?= e((string) ($hotel['address'] ?? '-')) ?></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-table__meta">
                                                    <strong>연결 패키지 <?= number_format($linkedPackages) ?>개</strong>
                                                    <span>체크인/아웃: <?= e((string) (($hotel['checkin_out'] ?? '') ?: '-')) ?></span>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-status-card product-status-card--<?= e((string) ($hotel['status'] ?? 'draft')) ?>">
                                                    <span class="product-status-card__dot"></span>
                                                    <div class="product-status-card__content">
                                                        <strong><?= e(admin_hotel_status_label((string) ($hotel['status'] ?? ''))) ?></strong>
                                                        <span>
                                                            <?= e(match ((string) ($hotel['status'] ?? '')) {
                                                                'publish' => '패키지에서 선택 가능',
                                                                'draft' => '검수 후 공개 가능',
                                                                'hidden' => '선택 목록에서 제외',
                                                                default => '상태 확인 필요',
                                                            }) ?>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-price">
                                                    <strong><?= number_format(count($gallery)) ?>장</strong>
                                                    <span><?= $cover !== '' ? '대표 이미지 설정됨' : '대표 이미지 없음' ?></span>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-date">
                                                    <strong><?= e(admin_hotel_updated_date($hotel)) ?></strong>
                                                    <?php if (admin_hotel_updated_time($hotel) !== ''): ?>
                                                        <span><?= e(admin_hotel_updated_time($hotel)) ?></span>
                                                    <?php endif; ?>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="product-row-actions hotel-row-actions">
                                                    <a href="<?= e(admin_url('pages/hotel/edit.php?id=' . $hotelId)) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>
                                                    <form action="<?= e(admin_url('actions/hotel-delete.php')) ?>" method="post" onsubmit="return confirm('이 호텔 정보를 삭제하시겠습니까?');">
                                                        <input type="hidden" name="id" value="<?= e((string) $hotelId) ?>">
                                                        <button type="submit" class="admin-btn admin-btn--danger admin-btn--sm">삭제</button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="6">
                                            <div class="product-empty">
                                                <div class="product-empty__icon">
                                                    <i class="ri-search-eye-line"></i>
                                                </div>
                                                <strong>조건에 맞는 호텔이 없습니다.</strong>
                                                <p>검색 조건을 다시 선택하거나 새 호텔을 등록해보세요.</p>
                                                <div class="product-empty__actions">
                                                    <a href="<?= e(admin_url('pages/hotel/list.php')) ?>" class="admin-btn admin-btn--light admin-btn--sm">필터 초기화</a>
                                                    <a href="<?= e(admin_url('pages/hotel/create.php')) ?>" class="admin-btn admin-btn--primary admin-btn--sm">호텔 등록</a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="product-mobile-list">
                        <?php if (!empty($filteredHotels)): ?>
                            <?php foreach ($filteredHotels as $hotel): ?>
                                <?php
                                $hotelId = (int) ($hotel['id'] ?? 0);
                                $cover = admin_hotel_cover_image($hotel);
                                $gallery = is_array($hotel['gallery'] ?? null) ? $hotel['gallery'] : [];
                                $linkedPackages = (int) ($packageCountMap[$hotelId] ?? 0);
                                $metaBadges = admin_hotel_meta_badges($hotel);
                                ?>
                                <article class="product-mobile-card">
                                    <div class="product-mobile-card__top hotel-mobile-card__top">
                                        <div class="product-mobile-card__thumb">
                                            <?php if ($cover !== ''): ?>
                                                <img src="<?= e($cover) ?>" alt="<?= e((string) ($hotel['name'] ?? '')) ?>">
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

                                            <a href="<?= e(admin_url('pages/hotel/edit.php?id=' . $hotelId)) ?>" class="product-item__title">
                                                <?= e((string) ($hotel['name'] ?? '')) ?>
                                            </a>

                                            <?php if (!empty($hotel['description'])): ?>
                                                <p class="product-item__subtitle hotel-item__subtitle"><?= e((string) $hotel['description']) ?></p>
                                            <?php endif; ?>

                                            <div class="product-mobile-card__meta-grid">
                                                <div class="product-mobile-card__meta-item">
                                                    <span>연결 패키지</span>
                                                    <strong><?= number_format($linkedPackages) ?>개</strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item">
                                                    <span>체크인/아웃</span>
                                                    <strong><?= e((string) (($hotel['checkin_out'] ?? '') ?: '-')) ?></strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item hotel-mobile-card__meta-item--full">
                                                    <span>주소</span>
                                                    <strong><?= e((string) ($hotel['address'] ?? '-')) ?></strong>
                                                </div>
                                                <div class="product-mobile-card__meta-item">
                                                    <span>갤러리</span>
                                                    <strong><?= number_format(count($gallery)) ?>장</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="product-mobile-card__actions">
                                        <a href="<?= e(admin_url('pages/hotel/edit.php?id=' . $hotelId)) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>
                                        <form action="<?= e(admin_url('actions/hotel-delete.php')) ?>" method="post" class="product-mobile-card__delete-form" onsubmit="return confirm('이 호텔 정보를 삭제하시겠습니까?');">
                                            <input type="hidden" name="id" value="<?= e((string) $hotelId) ?>">
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
                                <strong>조건에 맞는 호텔이 없습니다.</strong>
                                <p>검색 조건을 다시 선택하거나 필터를 초기화해보세요.</p>
                                <div class="product-empty__actions">
                                    <a href="<?= e(admin_url('pages/hotel/list.php')) ?>" class="admin-btn admin-btn--light admin-btn--sm">필터 초기화</a>
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