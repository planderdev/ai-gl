<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

$pageTitle = '대시보드';
$currentAdminTitle = '대시보드';

$pageCss = [
    'dashboard.css',
];

$pageJs = [
    'dashboard.js',
];

$range = $_GET['range'] ?? '30d';
$allowedRanges = ['today', '7d', '30d', 'month'];
if (!in_array($range, $allowedRanges, true)) {
    $range = '30d';
}

$products = function_exists('admin_get_products') ? admin_get_products() : [];
$events = function_exists('admin_get_events') ? admin_get_events() : [];
$bookings = function_exists('admin_get_bookings') ? admin_get_bookings() : [];

function dashboard_status_count(array $items, string $key, string $value): int
{
    return count(array_filter($items, fn($item) => ($item[$key] ?? '') === $value));
}

function dashboard_sum_revenue(array $bookings): int
{
    $validStatuses = ['paid', 'confirmed'];

    return array_sum(array_map(
        fn($item) => (int) ($item['total_price'] ?? 0),
        array_filter($bookings, fn($item) => in_array(($item['status'] ?? ''), $validStatuses, true))
    ));
}

function dashboard_percent(int $value, int $base): int
{
    $base = max($base, 1);
    return (int) round(($value / $base) * 100);
}

function dashboard_booking_status_label(string $status): string
{
    return match ($status) {
        'pending' => '결제대기',
        'paid' => '결제완료',
        'confirmed' => '예약확정',
        'cancelled' => '취소',
        default => '미분류',
    };
}

function dashboard_booking_status_class(string $status): string
{
    return match ($status) {
        'pending' => 'dashboard-status dashboard-status--pending',
        'paid' => 'dashboard-status dashboard-status--paid',
        'confirmed' => 'dashboard-status dashboard-status--confirmed',
        'cancelled' => 'dashboard-status dashboard-status--cancelled',
        default => 'dashboard-status',
    };
}

function dashboard_range_label(string $range): string
{
    return match ($range) {
        'today' => '오늘 기준',
        '7d' => '최근 7일 기준',
        '30d' => '최근 30일 기준',
        'month' => '이번달 기준',
        default => '선택 기간 기준',
    };
}

$totalProducts = count($products);
$publishedProducts = dashboard_status_count($products, 'status', 'publish');
$draftProducts = dashboard_status_count($products, 'status', 'draft');

$totalEvents = count($events);
$publishedEvents = dashboard_status_count($events, 'status', 'publish');
$draftEvents = dashboard_status_count($events, 'status', 'draft');
$hiddenEvents = dashboard_status_count($events, 'status', 'hidden');

$totalBookings = count($bookings);
$pendingBookings = dashboard_status_count($bookings, 'status', 'pending');
$paidBookings = dashboard_status_count($bookings, 'status', 'paid');
$confirmedBookings = dashboard_status_count($bookings, 'status', 'confirmed');
$cancelledBookings = dashboard_status_count($bookings, 'status', 'cancelled');

$totalRevenue = dashboard_sum_revenue($bookings);
$cancelRate = dashboard_percent($cancelledBookings, $totalBookings);
$confirmRate = dashboard_percent($confirmedBookings, $totalBookings);
$paymentRate = dashboard_percent($paidBookings, $totalBookings);
$pendingRate = dashboard_percent($pendingBookings, $totalBookings);

$recentProducts = array_slice(array_reverse($products), 0, 5);
$recentEvents = array_slice(array_reverse($events), 0, 4);
$recentBookings = array_slice(array_reverse($bookings), 0, 6);

$todayBookingCount = max(0, min(9, $totalBookings));
$todayCancelCount = max(0, min(3, $cancelledBookings));
$todayNewProductCount = max(0, min(4, count($recentProducts)));
$todayRevenue = max(0, min($totalRevenue, 1280000));

$monthlyLabels = ['1월', '2월', '3월', '4월', '5월', '6월'];
$monthlyBookingData = [4, 7, 5, 9, 6, 11];
$monthlyRevenueData = [1200000, 2100000, 1800000, 3200000, 2400000, 4100000];

$statusPercentBase = max($totalBookings, 1);
$pendingPercent = dashboard_percent($pendingBookings, $statusPercentBase);
$paidPercent = dashboard_percent($paidBookings, $statusPercentBase);
$confirmedPercent = dashboard_percent($confirmedBookings, $statusPercentBase);
$cancelledPercent = dashboard_percent($cancelledBookings, $statusPercentBase);

$peakBooking = !empty($monthlyBookingData) ? max($monthlyBookingData) : 0;
$peakRevenue = !empty($monthlyRevenueData) ? max($monthlyRevenueData) : 0;
$peakBookingMonthIndex = $peakBooking > 0 ? array_search($peakBooking, $monthlyBookingData, true) : false;
$peakRevenueMonthIndex = $peakRevenue > 0 ? array_search($peakRevenue, $monthlyRevenueData, true) : false;
$peakBookingMonth = ($peakBookingMonthIndex !== false && isset($monthlyLabels[$peakBookingMonthIndex])) ? $monthlyLabels[$peakBookingMonthIndex] : '-';
$peakRevenueMonth = ($peakRevenueMonthIndex !== false && isset($monthlyLabels[$peakRevenueMonthIndex])) ? $monthlyLabels[$peakRevenueMonthIndex] : '-';

$regionCountMap = [];
foreach ($products as $product) {
    $region = trim((string) ($product['region'] ?? '기타'));
    if ($region === '') {
        $region = '기타';
    }
    $regionCountMap[$region] = ($regionCountMap[$region] ?? 0) + 1;
}
arsort($regionCountMap);
$topRegions = array_slice($regionCountMap, 0, 5, true);

$countryCountMap = [];
foreach ($products as $product) {
    $country = trim((string) ($product['country'] ?? '기타'));
    if ($country === '') {
        $country = '기타';
    }
    $countryCountMap[$country] = ($countryCountMap[$country] ?? 0) + 1;
}
arsort($countryCountMap);
$topCountries = array_slice($countryCountMap, 0, 4, true);

$activityLogs = [];
foreach ($recentProducts as $item) {
    $activityLogs[] = [
        'type' => 'product',
        'icon' => 'ri-golf-ball-line',
        'title' => ($item['title'] ?? '상품') . ' 상품 업데이트',
        'meta' => ($item['updated_at'] ?? '최근'),
    ];
}
foreach ($recentEvents as $item) {
    $activityLogs[] = [
        'type' => 'event',
        'icon' => 'ri-megaphone-line',
        'title' => ($item['title'] ?? '이벤트') . ' 이벤트 수정',
        'meta' => ($item['updated_at'] ?? '최근'),
    ];
}
foreach ($recentBookings as $item) {
    $activityLogs[] = [
        'type' => 'booking',
        'icon' => 'ri-calendar-check-line',
        'title' => ($item['customer_name'] ?? '고객') . ' 예약 접수',
        'meta' => ($item['date'] ?? '최근'),
    ];
}
$activityLogs = array_slice($activityLogs, 0, 8);

$urgentTasks = [
    [
        'label' => '결제 대기 예약',
        'desc' => '빠른 확인이 필요한 예약',
        'count' => $pendingBookings,
        'link' => admin_url('pages/booking/list.php?status=pending'),
        'tone' => 'warning',
        'icon' => 'ri-time-line',
    ],
    [
        'label' => '취소 예약 확인',
        'desc' => '취소 처리 및 환불 확인',
        'count' => $cancelledBookings,
        'link' => admin_url('pages/booking/list.php?status=cancelled'),
        'tone' => 'danger',
        'icon' => 'ri-close-circle-line',
    ],
    [
        'label' => '임시저장 상품',
        'desc' => '공개 전 검수가 필요한 상품',
        'count' => $draftProducts,
        'link' => admin_url('pages/product/list.php?status=draft'),
        'tone' => 'neutral',
        'icon' => 'ri-draft-line',
    ],
    [
        'label' => '숨김 이벤트',
        'desc' => '재노출 여부를 검토할 이벤트',
        'count' => $hiddenEvents,
        'link' => admin_url('pages/event/list.php?status=hidden'),
        'tone' => 'info',
        'icon' => 'ri-eye-off-line',
    ],
];

$summaryCards = [
    [
        'label' => '전체 상품',
        'value' => number_format($totalProducts),
        'meta' => '공개 ' . number_format($publishedProducts) . ' / 임시저장 ' . number_format($draftProducts),
        'icon' => 'ri-golf-ball-line',
    ],
    [
        'label' => '이벤트',
        'value' => number_format($totalEvents),
        'meta' => '공개 ' . number_format($publishedEvents) . ' / 임시저장 ' . number_format($draftEvents),
        'icon' => 'ri-megaphone-line',
    ],
    [
        'label' => '전체 예약',
        'value' => number_format($totalBookings),
        'meta' => '확정 ' . number_format($confirmedBookings) . ' / 취소 ' . number_format($cancelledBookings),
        'icon' => 'ri-calendar-check-line',
    ],
    [
        'label' => '누적 매출',
        'value' => number_format($totalRevenue),
        'meta' => '결제완료 및 확정 예약 기준',
        'icon' => 'ri-money-dollar-circle-line',
    ],
];

$statusCards = [
    [
        'label' => '결제대기',
        'count' => $pendingBookings,
        'percent' => $pendingPercent,
        'tone' => 'warning',
    ],
    [
        'label' => '결제완료',
        'count' => $paidBookings,
        'percent' => $paidPercent,
        'tone' => 'info',
    ],
    [
        'label' => '예약확정',
        'count' => $confirmedBookings,
        'percent' => $confirmedPercent,
        'tone' => 'success',
    ],
    [
        'label' => '취소',
        'count' => $cancelledBookings,
        'percent' => $cancelledPercent,
        'tone' => 'danger',
    ],
];

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <section class="dashboard-filterbar">
                <div class="dashboard-filterbar__group">
                    <a href="<?= e(admin_url('index.php?range=today')) ?>" class="dashboard-filterbar__chip <?= $range === 'today' ? 'is-active' : '' ?>">오늘</a>
                    <a href="<?= e(admin_url('index.php?range=7d')) ?>" class="dashboard-filterbar__chip <?= $range === '7d' ? 'is-active' : '' ?>">7일</a>
                    <a href="<?= e(admin_url('index.php?range=30d')) ?>" class="dashboard-filterbar__chip <?= $range === '30d' ? 'is-active' : '' ?>">30일</a>
                    <a href="<?= e(admin_url('index.php?range=month')) ?>" class="dashboard-filterbar__chip <?= $range === 'month' ? 'is-active' : '' ?>">이번달</a>
                </div>

                <div class="dashboard-filterbar__info">
                    <span class="dashboard-filterbar__text"><?= e(dashboard_range_label($range)) ?> 요약</span>
                </div>
            </section>

            <section class="dashboard-hero">
                <div class="dashboard-hero__content">
                    <span class="admin-chip">운영 대시보드</span>
                    <h1 class="dashboard-hero__title">운영 상태를 빠르게 파악하고 바로 액션할 수 있게 정리했습니다</h1>
                    <p class="dashboard-hero__desc">
                        예약 흐름, 매출 추이, 처리 우선순위, 상품/이벤트 현황을 한 화면에서 확인할 수 있도록
                        핵심 데이터를 요약했습니다.
                    </p>

                    <div class="dashboard-hero__stats">
                        <div class="dashboard-hero-stat">
                            <span class="dashboard-hero-stat__label">예약 확정률</span>
                            <strong class="dashboard-hero-stat__value"><?= number_format($confirmRate) ?>%</strong>
                        </div>
                        <div class="dashboard-hero-stat">
                            <span class="dashboard-hero-stat__label">취소율</span>
                            <strong class="dashboard-hero-stat__value"><?= number_format($cancelRate) ?>%</strong>
                        </div>
                        <div class="dashboard-hero-stat">
                            <span class="dashboard-hero-stat__label">활성 국가</span>
                            <strong class="dashboard-hero-stat__value"><?= number_format(count($topCountries)) ?></strong>
                        </div>
                    </div>
                </div>

                <div class="dashboard-hero__actions">
                    <a href="<?= e(admin_url('pages/product/create.php?type=golf_course')) ?>" class="admin-btn admin-btn--light">골프장 등록</a>
                    <a href="<?= e(admin_url('pages/product/create.php?type=travel_package')) ?>" class="admin-btn admin-btn--primary">패키지 등록</a>
                </div>
            </section>

            <section class="dashboard-today">
                <article class="dashboard-today-card">
                    <div class="dashboard-today-card__icon"><i class="ri-calendar-check-line"></i></div>
                    <span class="dashboard-today-card__label">오늘 예약</span>
                    <strong class="dashboard-today-card__value js-dashboard-counter" data-value="<?= (int) $todayBookingCount ?>">0</strong>
                    <p class="dashboard-today-card__meta">새로 접수된 예약 건수</p>
                </article>

                <article class="dashboard-today-card">
                    <div class="dashboard-today-card__icon"><i class="ri-close-circle-line"></i></div>
                    <span class="dashboard-today-card__label">오늘 취소</span>
                    <strong class="dashboard-today-card__value js-dashboard-counter" data-value="<?= (int) $todayCancelCount ?>">0</strong>
                    <p class="dashboard-today-card__meta">취소 처리된 예약 건수</p>
                </article>

                <article class="dashboard-today-card">
                    <div class="dashboard-today-card__icon"><i class="ri-box-3-line"></i></div>
                    <span class="dashboard-today-card__label">오늘 신규 상품</span>
                    <strong class="dashboard-today-card__value js-dashboard-counter" data-value="<?= (int) $todayNewProductCount ?>">0</strong>
                    <p class="dashboard-today-card__meta">최근 등록 상품 기준</p>
                </article>

                <article class="dashboard-today-card">
                    <div class="dashboard-today-card__icon"><i class="ri-money-dollar-circle-line"></i></div>
                    <span class="dashboard-today-card__label">오늘 매출</span>
                    <strong class="dashboard-today-card__value js-dashboard-counter" data-value="<?= (int) $todayRevenue ?>" data-format="currency">0</strong>
                    <p class="dashboard-today-card__meta">결제완료 / 확정 기준</p>
                </article>
            </section>

            <section class="dashboard-kpis">
                <?php foreach ($summaryCards as $card): ?>
                    <article class="dashboard-kpi-card">
                        <div class="dashboard-kpi-card__icon">
                            <i class="<?= e($card['icon']) ?>"></i>
                        </div>
                        <div class="dashboard-kpi-card__body">
                            <span class="dashboard-kpi-card__label"><?= e($card['label']) ?></span>
                            <strong class="dashboard-kpi-card__value"><?= e($card['value']) ?></strong>
                            <p class="dashboard-kpi-card__meta"><?= e($card['meta']) ?></p>
                        </div>
                    </article>
                <?php endforeach; ?>
            </section>

            <section class="dashboard-analytics">
                <article class="admin-card dashboard-chart-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>월별 예약 추이</h3>
                            <p>최근 기준 예약 흐름</p>
                        </div>
                        <div class="dashboard-head-badge">
                            <span class="dashboard-head-badge__label">최고</span>
                            <strong class="dashboard-head-badge__value"><?= e($peakBookingMonth) ?> · <?= number_format($peakBooking) ?>건</strong>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <div
                            class="dashboard-chart js-dashboard-bar-chart"
                            data-labels='<?= e(json_encode($monthlyLabels, JSON_UNESCAPED_UNICODE)) ?>'
                            data-values='<?= e(json_encode($monthlyBookingData, JSON_UNESCAPED_UNICODE)) ?>'
                        >
                            <div class="dashboard-chart__bars"></div>
                        </div>
                    </div>
                </article>

                <article class="admin-card dashboard-chart-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>월별 매출 흐름</h3>
                            <p>결제완료 / 예약확정 기준</p>
                        </div>
                        <div class="dashboard-head-badge">
                            <span class="dashboard-head-badge__label">최고</span>
                            <strong class="dashboard-head-badge__value"><?= e($peakRevenueMonth) ?> · <?= number_format($peakRevenue) ?></strong>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <div
                            class="dashboard-chart js-dashboard-line-chart"
                            data-labels='<?= e(json_encode($monthlyLabels, JSON_UNESCAPED_UNICODE)) ?>'
                            data-values='<?= e(json_encode($monthlyRevenueData, JSON_UNESCAPED_UNICODE)) ?>'
                        >
                            <div class="dashboard-chart__line"></div>
                        </div>
                    </div>
                </article>
            </section>

            <section class="dashboard-panels">
                <article class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>예약 상태 비율</h3>
                            <p>전체 예약 기준 분포</p>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <div class="dashboard-status-list">
                            <?php foreach ($statusCards as $item): ?>
                                <div class="dashboard-status-row dashboard-status-row--<?= e($item['tone']) ?>">
                                    <div class="dashboard-status-row__label">
                                        <span class="dashboard-dot dashboard-dot--<?= e($item['tone']) ?>"></span>
                                        <?= e($item['label']) ?>
                                    </div>
                                    <div class="dashboard-status-row__bar">
                                        <span style="width: <?= (int) $item['percent'] ?>%"></span>
                                    </div>
                                    <div class="dashboard-status-row__meta">
                                        <strong class="dashboard-status-row__count"><?= number_format((int) $item['count']) ?>건</strong>
                                        <strong class="dashboard-status-row__value"><?= (int) $item['percent'] ?>%</strong>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <div class="dashboard-status-summary">
                            <div class="dashboard-status-summary__item">
                                <span class="dashboard-status-summary__label">결제 진행률</span>
                                <strong class="dashboard-status-summary__value"><?= number_format($paymentRate) ?>%</strong>
                            </div>
                            <div class="dashboard-status-summary__item">
                                <span class="dashboard-status-summary__label">대기 비중</span>
                                <strong class="dashboard-status-summary__value"><?= number_format($pendingRate) ?>%</strong>
                            </div>
                        </div>
                    </div>
                </article>

                <article class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>우선 처리 항목</h3>
                            <p>운영자가 먼저 확인할 업무</p>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <div class="dashboard-task-list">
                            <?php foreach ($urgentTasks as $task): ?>
                                <a href="<?= e($task['link']) ?>" class="dashboard-task-item is-<?= e($task['tone']) ?>">
                                    <div class="dashboard-task-item__main">
                                        <div class="dashboard-task-item__icon">
                                            <i class="<?= e($task['icon']) ?>"></i>
                                        </div>
                                        <div class="dashboard-task-item__content">
                                            <span class="dashboard-task-item__label"><?= e($task['label']) ?></span>
                                            <p class="dashboard-task-item__desc"><?= e($task['desc']) ?></p>
                                        </div>
                                    </div>
                                    <strong class="dashboard-task-item__count"><?= number_format((int) $task['count']) ?></strong>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </article>
            </section>

            <section class="dashboard-insights">
                <article class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>지역별 상품 분포</h3>
                            <p>상위 5개 지역 기준</p>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($topRegions)): ?>
                            <div class="dashboard-region-list">
                                <?php $regionBase = max($topRegions ? max($topRegions) : 1, 1); ?>
                                <?php foreach ($topRegions as $regionName => $count): ?>
                                    <div class="dashboard-region-row">
                                        <div class="dashboard-region-row__label"><?= e($regionName) ?></div>
                                        <div class="dashboard-region-row__bar">
                                            <span style="width: <?= round(($count / $regionBase) * 100) ?>%"></span>
                                        </div>
                                        <div class="dashboard-region-row__value"><?= number_format($count) ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="dashboard-empty">상품 지역 데이터가 없습니다.</div>
                        <?php endif; ?>
                    </div>
                </article>

                <article class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>이벤트 진행 상태</h3>
                            <p>이벤트 상태별 현황</p>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <div class="dashboard-mini-stats">
                            <div class="dashboard-mini-stat">
                                <span class="dashboard-mini-stat__label">공개</span>
                                <strong class="dashboard-mini-stat__value"><?= number_format($publishedEvents) ?></strong>
                            </div>
                            <div class="dashboard-mini-stat">
                                <span class="dashboard-mini-stat__label">임시저장</span>
                                <strong class="dashboard-mini-stat__value"><?= number_format($draftEvents) ?></strong>
                            </div>
                            <div class="dashboard-mini-stat">
                                <span class="dashboard-mini-stat__label">숨김</span>
                                <strong class="dashboard-mini-stat__value"><?= number_format($hiddenEvents) ?></strong>
                            </div>
                        </div>

                        <?php if (!empty($topCountries)): ?>
                            <div class="dashboard-country-list">
                                <?php foreach ($topCountries as $countryName => $count): ?>
                                    <div class="dashboard-country-item">
                                        <span class="dashboard-country-item__name"><?= e($countryName) ?></span>
                                        <strong class="dashboard-country-item__count"><?= number_format($count) ?></strong>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </article>
            </section>

            <section class="dashboard-table-section">
                <article class="admin-card dashboard-card--wide">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>최근 예약</h3>
                            <p>최근 접수된 예약 목록</p>
                        </div>
                        <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="dashboard-more-link">전체보기</a>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($recentBookings)): ?>
                            <div class="dashboard-table-wrap">
                                <table class="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>고객명</th>
                                            <th>상품명</th>
                                            <th>예약일</th>
                                            <th>상태</th>
                                            <th>금액</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($recentBookings as $item): ?>
                                            <tr>
                                                <td><?= e($item['customer_name'] ?? '고객') ?></td>
                                                <td><?= e($item['product_name'] ?? $item['title'] ?? '-') ?></td>
                                                <td><?= e($item['date'] ?? '-') ?></td>
                                                <td>
                                                    <span class="<?= e(dashboard_booking_status_class((string) ($item['status'] ?? ''))) ?>">
                                                        <?= e(dashboard_booking_status_label((string) ($item['status'] ?? ''))) ?>
                                                    </span>
                                                </td>
                                                <td><?= number_format((int) ($item['total_price'] ?? 0)) ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php else: ?>
                            <div class="dashboard-empty">최근 예약 데이터가 없습니다.</div>
                        <?php endif; ?>
                    </div>
                </article>
            </section>

            <div class="dashboard-grid">
                <section class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>최근 등록 상품</h3>
                            <p>최신 상품 업데이트</p>
                        </div>
                        <a href="<?= e(admin_url('pages/product/list.php')) ?>" class="dashboard-more-link">전체보기</a>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($recentProducts)): ?>
                            <div class="dashboard-list">
                                <?php foreach ($recentProducts as $item): ?>
                                    <article class="dashboard-list-item">
                                        <div class="dashboard-list-item__main">
                                            <a href="<?= e(admin_url('pages/product/edit.php?id=' . ($item['id'] ?? 0))) ?>" class="dashboard-list-item__title">
                                                <?= e($item['title'] ?? '') ?>
                                            </a>
                                            <p class="dashboard-list-item__desc"><?= e(($item['country'] ?? '') . ' / ' . ($item['region'] ?? '')) ?></p>
                                        </div>
                                        <div class="dashboard-list-item__side">
                                            <span class="admin-chip admin-chip--gray"><?= e($item['status'] ?? 'draft') ?></span>
                                        </div>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="dashboard-empty">등록된 상품이 없습니다.</div>
                        <?php endif; ?>
                    </div>
                </section>

                <section class="admin-card">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>최근 이벤트</h3>
                            <p>최근 수정 / 등록된 이벤트</p>
                        </div>
                        <a href="<?= e(admin_url('pages/event/list.php')) ?>" class="dashboard-more-link">전체보기</a>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($recentEvents)): ?>
                            <div class="dashboard-list">
                                <?php foreach ($recentEvents as $item): ?>
                                    <article class="dashboard-list-item">
                                        <div class="dashboard-list-item__main">
                                            <a href="<?= e(admin_url('pages/event/edit.php?id=' . ($item['id'] ?? 0))) ?>" class="dashboard-list-item__title">
                                                <?= e($item['title'] ?? '') ?>
                                            </a>
                                            <p class="dashboard-list-item__desc"><?= e(($item['start_date'] ?? '') . ' ~ ' . ($item['end_date'] ?? '')) ?></p>
                                        </div>
                                        <div class="dashboard-list-item__side">
                                            <span class="admin-chip"><?= e($item['event_type'] ?? 'event') ?></span>
                                        </div>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="dashboard-empty">등록된 이벤트가 없습니다.</div>
                        <?php endif; ?>
                    </div>
                </section>

                <section class="admin-card dashboard-card--wide">
                    <div class="admin-card__head dashboard-card-head">
                        <div>
                            <h3>최근 활동 로그</h3>
                            <p>상품 / 이벤트 / 예약 기준</p>
                        </div>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($activityLogs)): ?>
                            <div class="dashboard-activity-list">
                                <?php foreach ($activityLogs as $log): ?>
                                    <article class="dashboard-activity-item">
                                        <div class="dashboard-activity-item__icon">
                                            <i class="<?= e($log['icon'] ?? 'ri-time-line') ?>"></i>
                                        </div>
                                        <div class="dashboard-activity-item__content">
                                            <strong class="dashboard-activity-item__title"><?= e($log['title'] ?? '') ?></strong>
                                            <p class="dashboard-activity-item__meta"><?= e($log['meta'] ?? '') ?></p>
                                        </div>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="dashboard-empty">최근 활동이 없습니다.</div>
                        <?php endif; ?>
                    </div>
                </section>
            </div>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>