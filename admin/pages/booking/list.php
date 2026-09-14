<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

$pageTitle = '예약 목록';
$currentAdminTitle = '예약관리';

$pageCss = [
    'booking.css',
];

$pageJs = [
    'booking.js',
];

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'status' => trim($_GET['status'] ?? ''),
    'date_from' => trim($_GET['date_from'] ?? ''),
    'date_to' => trim($_GET['date_to'] ?? ''),
];

$bookings = admin_get_bookings();
$bookings = is_array($bookings) ? $bookings : [];

$filteredBookings = array_values(array_filter($bookings, function ($item) use ($filters) {
    $customerName = (string) ($item['customer_name'] ?? '');
    $customerPhone = (string) ($item['customer_phone'] ?? '');
    $productTitle = (string) ($item['product_title'] ?? '');
    $status = (string) ($item['status'] ?? '');
    $date = (string) ($item['date'] ?? '');

    if ($filters['keyword'] !== '') {
        $haystack = mb_strtolower($customerName . ' ' . $customerPhone . ' ' . $productTitle);
        if (mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
            return false;
        }
    }

    if ($filters['status'] !== '' && $status !== $filters['status']) {
        return false;
    }

    if ($filters['date_from'] !== '' && $date < $filters['date_from']) {
        return false;
    }

    if ($filters['date_to'] !== '' && $date > $filters['date_to']) {
        return false;
    }

    return true;
}));

usort($filteredBookings, function ($a, $b) {
    return strcmp((string) ($a['date'] ?? ''), (string) ($b['date'] ?? ''));
});

$totalCount = count($bookings);
$pendingCount = count(array_filter($bookings, fn($item) => ($item['status'] ?? '') === 'pending'));
$paidCount = count(array_filter($bookings, fn($item) => ($item['status'] ?? '') === 'paid'));
$confirmedCount = count(array_filter($bookings, fn($item) => ($item['status'] ?? '') === 'confirmed'));
$cancelledCount = count(array_filter($bookings, fn($item) => ($item['status'] ?? '') === 'cancelled'));

$todayCount = count(array_filter($bookings, fn($item) => ($item['date'] ?? '') === date('Y-m-d')));

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
                    <h1 class="admin-page-head__title">예약 목록</h1>
                    <p class="admin-page-head__desc">예약 현황, 고객 정보, 결제/확정 상태를 한 화면에서 관리합니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/booking/calendar.php')) ?>" class="admin-btn admin-btn--light">
                        <i class="ri-calendar-line"></i>
                        예약 캘린더
                    </a>
                </div>
            </div>

            <section class="booking-summary">
                <article class="booking-summary__card">
                    <span class="booking-summary__label">전체 예약</span>
                    <strong class="booking-summary__value"><?= number_format($totalCount) ?></strong>
                    <p class="booking-summary__meta">누적 예약 건수</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">오늘 예약</span>
                    <strong class="booking-summary__value"><?= number_format($todayCount) ?></strong>
                    <p class="booking-summary__meta">오늘 기준 일정</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">결제대기</span>
                    <strong class="booking-summary__value"><?= number_format($pendingCount) ?></strong>
                    <p class="booking-summary__meta">입금/결제 확인 필요</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">결제완료</span>
                    <strong class="booking-summary__value"><?= number_format($paidCount) ?></strong>
                    <p class="booking-summary__meta">결제 처리 완료</p>
                </article>

                <article class="booking-summary__card">
                    <span class="booking-summary__label">예약확정</span>
                    <strong class="booking-summary__value"><?= number_format($confirmedCount) ?></strong>
                    <p class="booking-summary__meta">최종 확정 예약</p>
                </article>

                <article class="booking-summary__card booking-summary__card--danger">
                    <span class="booking-summary__label">취소</span>
                    <strong class="booking-summary__value"><?= number_format($cancelledCount) ?></strong>
                    <p class="booking-summary__meta">취소 처리된 예약</p>
                </article>
            </section>

            <section class="admin-card u-mt-16">
                <div class="admin-card__body">
                    <form method="get" class="booking-filter">
                        <div class="booking-filter__grid booking-filter__grid--list">
                            <div class="admin-field booking-filter__keyword">
                                <label class="admin-label">검색</label>
                                <input
                                    type="text"
                                    name="keyword"
                                    class="admin-input"
                                    value="<?= e($filters['keyword']) ?>"
                                    placeholder="고객명, 연락처, 상품명"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상태</label>
                                <select name="status" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="pending" <?= $filters['status'] === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                    <option value="paid" <?= $filters['status'] === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                    <option value="confirmed" <?= $filters['status'] === 'confirmed' ? 'selected' : '' ?>>예약확정</option>
                                    <option value="cancelled" <?= $filters['status'] === 'cancelled' ? 'selected' : '' ?>>취소</option>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">시작일</label>
                                <input type="date" name="date_from" class="admin-input" value="<?= e($filters['date_from']) ?>">
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">종료일</label>
                                <input type="date" name="date_to" class="admin-input" value="<?= e($filters['date_to']) ?>">
                            </div>
                        </div>

                        <div class="booking-filter__actions">
                            <button type="submit" class="admin-btn admin-btn--primary">검색</button>
                            <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="admin-btn admin-btn--light">초기화</a>

                            <a
                                href="<?= e(admin_url(
                                    'actions/booking-export.php?keyword=' . urlencode($filters['keyword']) .
                                    '&status=' . urlencode($filters['status']) .
                                    '&date_from=' . urlencode($filters['date_from']) .
                                    '&date_to=' . urlencode($filters['date_to'])
                                )) ?>"
                                class="admin-btn admin-btn--light"
                            >
                                CSV 다운로드
                            </a>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card u-mt-16">
                <div class="admin-card__head booking-table-head">
                    <div>
                        <h3>예약 리스트</h3>
                        <p class="booking-table-head__meta">총 <?= number_format(count($filteredBookings)) ?>건</p>
                    </div>

                    <div class="booking-bulk-toolbar js-booking-bulk-toolbar is-disabled">
                        <span class="booking-bulk-toolbar__count js-booking-selected-count">0건 선택됨</span>

                        <form method="post" action="<?= e(admin_url('actions/booking-bulk-update.php')) ?>" class="booking-bulk-toolbar__form js-booking-bulk-form">
                            <input type="hidden" name="bulk_action" class="js-booking-bulk-action" value="">
                            <div class="js-booking-bulk-hidden-inputs"></div>

                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-booking-bulk-trigger" data-action="mark_paid">
                                일괄 결제완료
                            </button>
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-booking-bulk-trigger" data-action="mark_confirmed">
                                일괄 예약확정
                            </button>
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-booking-bulk-trigger" data-action="mark_cancelled">
                                일괄 취소
                            </button>
                        </form>
                    </div>
                </div>

                <div class="admin-card__body booking-table-card">
                    <div class="booking-table-wrap">
                        <table class="booking-table">
                            <thead>
                                <tr>
                                    <th class="booking-table__check">
                                        <input type="checkbox" class="js-booking-check-all">
                                    </th>
                                    <th>ID</th>
                                    <th>고객</th>
                                    <th>상품</th>
                                    <th>예약일</th>
                                    <th>인원</th>
                                    <th>금액</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($filteredBookings)): ?>
                                    <?php foreach ($filteredBookings as $item): ?>
                                        <tr>
                                            <td class="booking-table__check">
                                                <input type="checkbox" class="js-booking-row-check" value="<?= e((string) ($item['id'] ?? 0)) ?>">
                                            </td>

                                            <td>#<?= e((string) ($item['id'] ?? 0)) ?></td>

                                            <td>
                                                <div class="booking-table__person">
                                                    <strong><?= e($item['customer_name'] ?? '') ?></strong>
                                                    <span><?= e($item['customer_phone'] ?? '') ?></span>
                                                </div>
                                            </td>

                                            <td>
                                                <div class="booking-table__product">
                                                    <?= e($item['product_title'] ?? '') ?>
                                                </div>
                                            </td>

                                            <td><?= e($item['date'] ?? '') ?></td>
                                            <td><?= e((string) ($item['people'] ?? '')) ?>명</td>
                                            <td><?= number_format((int) ($item['total_price'] ?? 0)) ?>원</td>

                                            <td>
                                                <span class="booking-status booking-status--<?= e($item['status'] ?? 'pending') ?>">
                                                    <?= e(function_exists('admin_booking_status_label') ? admin_booking_status_label($item['status'] ?? 'pending') : ($item['status'] ?? 'pending')) ?>
                                                </span>
                                            </td>

                                            <td>
                                                <div class="booking-table__actions">
                                                    <a href="<?= e(admin_url('pages/booking/detail.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light admin-btn--sm">상세</a>
                                                    <a href="<?= e(admin_url('pages/booking/edit.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light admin-btn--sm">수정</a>

                                                    <form method="post" action="<?= e(admin_url('actions/booking-delete.php')) ?>" onsubmit="return confirm('이 예약을 삭제하시겠습니까?');">
                                                        <input type="hidden" name="id" value="<?= e((string) ($item['id'] ?? 0)) ?>">
                                                        <button type="submit" class="admin-btn admin-btn--danger admin-btn--sm">삭제</button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="9">
                                            <div class="booking-empty">
                                                <i class="ri-calendar-close-line"></i>
                                                <p>조건에 맞는 예약이 없습니다.</p>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="booking-mobile-list">
                        <?php if (!empty($filteredBookings)): ?>
                            <?php foreach ($filteredBookings as $item): ?>
                                <article class="booking-mobile-card">
                                    <div class="booking-mobile-card__head">
                                        <label class="booking-mobile-card__check">
                                            <input type="checkbox" class="js-booking-row-check" value="<?= e((string) ($item['id'] ?? 0)) ?>">
                                        </label>

                                        <div>
                                            <strong class="booking-mobile-card__name"><?= e($item['customer_name'] ?? '') ?></strong>
                                            <p class="booking-mobile-card__phone"><?= e($item['customer_phone'] ?? '') ?></p>
                                        </div>

                                        <span class="booking-status booking-status--<?= e($item['status'] ?? 'pending') ?>">
                                            <?= e(function_exists('admin_booking_status_label') ? admin_booking_status_label($item['status'] ?? 'pending') : ($item['status'] ?? 'pending')) ?>
                                        </span>
                                    </div>

                                    <div class="booking-mobile-card__body">
                                        <div class="booking-mobile-card__row">
                                            <span>상품</span>
                                            <strong><?= e($item['product_title'] ?? '') ?></strong>
                                        </div>
                                        <div class="booking-mobile-card__row">
                                            <span>예약일</span>
                                            <strong><?= e($item['date'] ?? '') ?></strong>
                                        </div>
                                        <div class="booking-mobile-card__row">
                                            <span>인원</span>
                                            <strong><?= e((string) ($item['people'] ?? '')) ?>명</strong>
                                        </div>
                                        <div class="booking-mobile-card__row">
                                            <span>금액</span>
                                            <strong><?= number_format((int) ($item['total_price'] ?? 0)) ?>원</strong>
                                        </div>
                                    </div>

                                    <div class="booking-mobile-card__actions">
                                        <a href="<?= e(admin_url('pages/booking/detail.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light">상세 보기</a>
                                        <a href="<?= e(admin_url('pages/booking/edit.php?id=' . ($item['id'] ?? 0))) ?>" class="admin-btn admin-btn--light">수정</a>

                                        <form method="post" action="<?= e(admin_url('actions/booking-delete.php')) ?>" onsubmit="return confirm('이 예약을 삭제하시겠습니까?');">
                                            <input type="hidden" name="id" value="<?= e((string) ($item['id'] ?? 0)) ?>">
                                            <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
                                        </form>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="booking-empty booking-empty--mobile">
                                <i class="ri-calendar-close-line"></i>
                                <p>조건에 맞는 예약이 없습니다.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>