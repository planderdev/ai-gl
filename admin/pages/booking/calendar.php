<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

$pageTitle = '예약 캘린더';
$currentAdminTitle = '예약관리';

$pageCss = [
    'booking.css',
];

$pageJs = [
    'booking.js',
];

$year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');
$month = isset($_GET['month']) ? (int) $_GET['month'] : (int) date('n');

if ($month < 1) {
    $month = 1;
}
if ($month > 12) {
    $month = 12;
}
if ($year < 2020) {
    $year = (int) date('Y');
}

$firstDayTimestamp = strtotime(sprintf('%04d-%02d-01', $year, $month));
$daysInMonth = (int) date('t', $firstDayTimestamp);
$startWeekday = (int) date('w', $firstDayTimestamp);

$prevTimestamp = strtotime('-1 month', $firstDayTimestamp);
$nextTimestamp = strtotime('+1 month', $firstDayTimestamp);

$prevYear = (int) date('Y', $prevTimestamp);
$prevMonth = (int) date('n', $prevTimestamp);
$nextYear = (int) date('Y', $nextTimestamp);
$nextMonth = (int) date('n', $nextTimestamp);

$bookings = admin_get_bookings();
$bookings = is_array($bookings) ? $bookings : [];

$calendarMap = [];
foreach ($bookings as $item) {
    $date = (string) ($item['date'] ?? '');
    if ($date === '') {
        continue;
    }

    if (!isset($calendarMap[$date])) {
        $calendarMap[$date] = [];
    }

    $calendarMap[$date][] = $item;
}

foreach ($calendarMap as $date => $items) {
    usort($items, function ($a, $b) {
        $statusWeight = [
            'pending' => 1,
            'paid' => 2,
            'confirmed' => 3,
            'cancelled' => 4,
        ];

        $aWeight = $statusWeight[(string) ($a['status'] ?? '')] ?? 0;
        $bWeight = $statusWeight[(string) ($b['status'] ?? '')] ?? 0;

        if ($aWeight !== $bWeight) {
            return $aWeight <=> $bWeight;
        }

        return strcmp((string) ($a['customer_name'] ?? ''), (string) ($b['customer_name'] ?? ''));
    });

    $calendarMap[$date] = $items;
}

$selectedDate = trim($_GET['date'] ?? '');
if ($selectedDate === '' || strpos($selectedDate, sprintf('%04d-%02d-', $year, $month)) !== 0) {
    $todayDate = date('Y-m-d');
    if (strpos($todayDate, sprintf('%04d-%02d-', $year, $month)) === 0) {
        $selectedDate = $todayDate;
    } else {
        $selectedDate = sprintf('%04d-%02d-01', $year, $month);
    }
}

$selectedBookings = $calendarMap[$selectedDate] ?? [];

$monthBookingCount = 0;
$monthConfirmedCount = 0;
$monthPendingCount = 0;
$monthCancelledCount = 0;
$monthPaidCount = 0;
$activeDaysCount = 0;

foreach ($calendarMap as $date => $items) {
    if (strpos($date, sprintf('%04d-%02d-', $year, $month)) !== 0) {
        continue;
    }

    $monthBookingCount += count($items);

    if (!empty($items)) {
        $activeDaysCount++;
    }

    foreach ($items as $item) {
        $status = (string) ($item['status'] ?? '');
        if ($status === 'confirmed') {
            $monthConfirmedCount++;
        } elseif ($status === 'pending') {
            $monthPendingCount++;
        } elseif ($status === 'cancelled') {
            $monthCancelledCount++;
        } elseif ($status === 'paid') {
            $monthPaidCount++;
        }
    }
}

$selectedTotalPrice = array_sum(array_map(function ($item) {
    return (int) ($item['total_price'] ?? 0);
}, $selectedBookings));

$selectedPendingCount = count(array_filter($selectedBookings, fn($item) => ($item['status'] ?? '') === 'pending'));
$selectedConfirmedCount = count(array_filter($selectedBookings, fn($item) => ($item['status'] ?? '') === 'confirmed'));

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip">BOOKING MANAGER</span>
                    <h1 class="admin-page-head__title">예약 캘린더</h1>
                    <p class="admin-page-head__desc">월별 예약 분포를 달력으로 확인하고 날짜별 상세 예약을 빠르게 확인합니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="admin-btn admin-btn--light">
                        <i class="ri-list-check-3"></i>
                        예약 목록
                    </a>
                </div>
            </div>

            <section class="booking-summary booking-summary--calendar">
                <article class="booking-summary__card">
                    <span class="booking-summary__label">월 예약</span>
                    <strong class="booking-summary__value"><?= number_format($monthBookingCount) ?></strong>
                    <p class="booking-summary__meta"><?= $year ?>년 <?= $month ?>월 전체 예약</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">예약일 수</span>
                    <strong class="booking-summary__value"><?= number_format($activeDaysCount) ?></strong>
                    <p class="booking-summary__meta">예약이 있는 날짜 수</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">예약확정</span>
                    <strong class="booking-summary__value"><?= number_format($monthConfirmedCount) ?></strong>
                    <p class="booking-summary__meta">확정 상태 기준</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">결제완료</span>
                    <strong class="booking-summary__value"><?= number_format($monthPaidCount) ?></strong>
                    <p class="booking-summary__meta">결제 처리 완료</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">결제대기</span>
                    <strong class="booking-summary__value"><?= number_format($monthPendingCount) ?></strong>
                    <p class="booking-summary__meta">확인 필요 예약</p>
                </article>

                <article class="booking-summary__card booking-summary__card--danger">
                    <span class="booking-summary__label">취소</span>
                    <strong class="booking-summary__value"><?= number_format($monthCancelledCount) ?></strong>
                    <p class="booking-summary__meta">취소 상태 기준</p>
                </article>
            </section>

            <section class="admin-card u-mt-16">
                <div class="admin-card__body">
                    <div class="booking-calendar-head">
                        <div class="booking-calendar-nav">
                            <a href="<?= e(admin_url('pages/booking/calendar.php?year=' . $prevYear . '&month=' . $prevMonth)) ?>" class="admin-btn admin-btn--light booking-calendar-nav__btn">
                                <i class="ri-arrow-left-s-line"></i>
                                이전달
                            </a>

                            <div class="booking-calendar-nav__title-wrap">
                                <strong class="booking-calendar-title"><?= $year ?>년 <?= $month ?>월</strong>
                                <span class="booking-calendar-title__sub">월간 예약 캘린더</span>
                            </div>

                            <a href="<?= e(admin_url('pages/booking/calendar.php?year=' . $nextYear . '&month=' . $nextMonth)) ?>" class="admin-btn admin-btn--light booking-calendar-nav__btn">
                                다음달
                                <i class="ri-arrow-right-s-line"></i>
                            </a>
                        </div>

                        <form method="get" class="booking-calendar-jump">
                            <input type="hidden" name="date" value="<?= e($selectedDate) ?>">

                            <select name="year" class="admin-select booking-calendar-jump__select">
                                <?php for ($y = (int) date('Y') - 2; $y <= (int) date('Y') + 3; $y++): ?>
                                    <option value="<?= e((string) $y) ?>" <?= $year === (int) $y ? 'selected' : '' ?>>
                                        <?= e((string) $y) ?>년
                                    </option>
                                <?php endfor; ?>
                            </select>

                            <select name="month" class="admin-select booking-calendar-jump__select">
                                <?php for ($m = 1; $m <= 12; $m++): ?>
                                    <option value="<?= e((string) $m) ?>" <?= $month === $m ? 'selected' : '' ?>>
                                        <?= e((string) $m) ?>월
                                    </option>
                                <?php endfor; ?>
                            </select>

                            <button type="submit" class="admin-btn admin-btn--primary">이동</button>

                            <a
                                href="<?= e(admin_url('pages/booking/calendar.php?year=' . date('Y') . '&month=' . date('n') . '&date=' . date('Y-m-d'))) ?>"
                                class="admin-btn admin-btn--light"
                            >
                                오늘
                            </a>
                        </form>
                    </div>

                    <div class="booking-calendar-legend">
                        <span class="booking-calendar-legend__item">
                            <i class="booking-calendar-legend__dot booking-calendar-legend__dot--pending"></i>
                            결제대기
                        </span>
                        <span class="booking-calendar-legend__item">
                            <i class="booking-calendar-legend__dot booking-calendar-legend__dot--paid"></i>
                            결제완료
                        </span>
                        <span class="booking-calendar-legend__item">
                            <i class="booking-calendar-legend__dot booking-calendar-legend__dot--confirmed"></i>
                            예약확정
                        </span>
                        <span class="booking-calendar-legend__item">
                            <i class="booking-calendar-legend__dot booking-calendar-legend__dot--cancelled"></i>
                            취소
                        </span>
                    </div>
                </div>
            </section>

            <div class="booking-calendar-layout u-mt-16">
                <section class="admin-card booking-calendar-card">
                    <div class="admin-card__body">
                        <div class="booking-calendar-grid" data-booking-calendar>
                            <div class="booking-calendar-grid__weekdays">
                                <span class="is-sun">일</span>
                                <span>월</span>
                                <span>화</span>
                                <span>수</span>
                                <span>목</span>
                                <span>금</span>
                                <span class="is-sat">토</span>
                            </div>

                            <div class="booking-calendar-grid__days">
                                <?php for ($i = 0; $i < $startWeekday; $i++): ?>
                                    <div class="booking-calendar-day booking-calendar-day--empty" aria-hidden="true"></div>
                                <?php endfor; ?>

                                <?php for ($day = 1; $day <= $daysInMonth; $day++): ?>
                                    <?php
                                    $currentDate = sprintf('%04d-%02d-%02d', $year, $month, $day);
                                    $dayBookings = $calendarMap[$currentDate] ?? [];
                                    $isToday = $currentDate === date('Y-m-d');
                                    $isSelected = $currentDate === $selectedDate;

                                    $dayPendingCount = count(array_filter($dayBookings, fn($item) => ($item['status'] ?? '') === 'pending'));
                                    $dayPaidCount = count(array_filter($dayBookings, fn($item) => ($item['status'] ?? '') === 'paid'));
                                    $dayConfirmedCount = count(array_filter($dayBookings, fn($item) => ($item['status'] ?? '') === 'confirmed'));
                                    $dayCancelledCount = count(array_filter($dayBookings, fn($item) => ($item['status'] ?? '') === 'cancelled'));
                                    ?>
                                    <a
                                        href="<?= e(admin_url('pages/booking/calendar.php?year=' . $year . '&month=' . $month . '&date=' . $currentDate)) ?>"
                                        class="booking-calendar-day<?= $isToday ? ' is-today' : '' ?><?= $isSelected ? ' is-selected' : '' ?>"
                                        data-booking-calendar-day="<?= e($currentDate) ?>"
                                    >
                                        <div class="booking-calendar-day__top">
                                            <strong><?= $day ?></strong>

                                            <?php if (!empty($dayBookings)): ?>
                                                <span class="booking-calendar-day__count"><?= count($dayBookings) ?></span>
                                            <?php endif; ?>
                                        </div>

                                        <?php if (!empty($dayBookings)): ?>
                                            <div class="booking-calendar-day__stats">
                                                <?php if ($dayPendingCount > 0): ?>
                                                    <span class="booking-calendar-mini booking-calendar-mini--pending">대기 <?= $dayPendingCount ?></span>
                                                <?php endif; ?>
                                                <?php if ($dayPaidCount > 0): ?>
                                                    <span class="booking-calendar-mini booking-calendar-mini--paid">결제 <?= $dayPaidCount ?></span>
                                                <?php endif; ?>
                                                <?php if ($dayConfirmedCount > 0): ?>
                                                    <span class="booking-calendar-mini booking-calendar-mini--confirmed">확정 <?= $dayConfirmedCount ?></span>
                                                <?php endif; ?>
                                                <?php if ($dayCancelledCount > 0): ?>
                                                    <span class="booking-calendar-mini booking-calendar-mini--cancelled">취소 <?= $dayCancelledCount ?></span>
                                                <?php endif; ?>
                                            </div>

                                            <div class="booking-calendar-day__items">
                                                <?php foreach (array_slice($dayBookings, 0, 2) as $booking): ?>
                                                    <span class="booking-calendar-dot booking-calendar-dot--<?= e($booking['status'] ?? 'pending') ?>">
                                                        <?= e($booking['customer_name'] ?? '') ?>
                                                    </span>
                                                <?php endforeach; ?>

                                                <?php if (count($dayBookings) > 2): ?>
                                                    <span class="booking-calendar-day__more">+<?= count($dayBookings) - 2 ?>건 더보기</span>
                                                <?php endif; ?>
                                            </div>
                                        <?php else: ?>
                                            <div class="booking-calendar-day__empty">예약 없음</div>
                                        <?php endif; ?>
                                    </a>
                                <?php endfor; ?>
                            </div>
                        </div>
                    </div>
                </section>

                <aside class="admin-card booking-calendar-side">
                    <div class="admin-card__head">
                        <div>
                            <h3>선택 날짜 예약</h3>
                            <p class="admin-card__desc"><?= e($selectedDate) ?></p>
                        </div>
                    </div>

                    <div class="admin-card__body">
                        <div class="booking-calendar-side__summary">
                            <div class="booking-calendar-side__summary-item">
                                <span>예약 건수</span>
                                <strong><?= number_format(count($selectedBookings)) ?>건</strong>
                            </div>
                            <div class="booking-calendar-side__summary-item">
                                <span>예약확정</span>
                                <strong><?= number_format($selectedConfirmedCount) ?>건</strong>
                            </div>
                            <div class="booking-calendar-side__summary-item">
                                <span>결제대기</span>
                                <strong><?= number_format($selectedPendingCount) ?>건</strong>
                            </div>
                            <div class="booking-calendar-side__summary-item">
                                <span>총 예약금액</span>
                                <strong><?= number_format($selectedTotalPrice) ?>원</strong>
                            </div>
                        </div>

                        <?php if (!empty($selectedBookings)): ?>
                            <div class="booking-calendar-side__list">
                                <?php foreach ($selectedBookings as $item): ?>
                                    <article class="booking-calendar-side__item">
                                        <div class="booking-calendar-side__item-head">
                                            <strong><?= e($item['customer_name'] ?? '') ?></strong>
                                            <span class="booking-status booking-status--<?= e($item['status'] ?? 'pending') ?>">
                                                <?= e(function_exists('admin_booking_status_label') ? admin_booking_status_label($item['status'] ?? 'pending') : ($item['status'] ?? 'pending')) ?>
                                            </span>
                                        </div>

                                        <div class="booking-calendar-side__meta">
                                            <span><?= e($item['product_title'] ?? '') ?></span>
                                            <span><?= e((string) ($item['people'] ?? '')) ?>명</span>
                                            <span><?= number_format((int) ($item['total_price'] ?? 0)) ?>원</span>
                                        </div>

                                        <div class="booking-calendar-side__phone"><?= e($item['customer_phone'] ?? '') ?></div>

                                        <div class="booking-calendar-side__actions">
                                            <a href="<?= e(admin_url('pages/booking/detail.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light admin-btn--sm">상세</a>
                                            <a href="<?= e(admin_url('pages/booking/edit.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>
                                        </div>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="booking-empty booking-empty--calendar">
                                <i class="ri-calendar-event-line"></i>
                                <p>선택한 날짜에 예약이 없습니다.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </aside>
            </div>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>