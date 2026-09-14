<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';

$id = (int) ($_GET['id'] ?? 0);
$bookings = admin_get_bookings();
$booking = null;

foreach ($bookings as $item) {
    if ((int) ($item['id'] ?? 0) === $id) {
        $booking = $item;
        break;
    }
}

if (!$booking) {
    header('Location: ' . admin_url('pages/booking/list.php'));
    exit;
}

$pageTitle = '예약 상세';
$currentAdminTitle = '예약관리';

$pageCss = [
    'booking.css',
];

$pageJs = [
    'booking.js',
];

$paymentMethodLabels = [
    'card' => '카드결제',
    'bank' => '무통장입금',
    'onsite' => '현장결제',
    'partial' => '부분결제',
];

$paymentStatusLabels = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'refunded' => '환불완료',
];

$statusLogs = $booking['status_logs'] ?? [];

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                    <h1 class="admin-page-head__title">예약 상세 #<?= e((string) ($booking['id'] ?? 0)) ?></h1>
                    <p class="admin-page-head__desc">예약 정보, 고객 정보, 결제 상태, 내부 메모를 관리합니다.</p>
                </div>

                <div class="admin-page-head__actions">
    <a href="<?= e(admin_url('pages/booking/edit.php?id=' . ($booking['id'] ?? 0))) ?>" class="admin-btn admin-btn--light">수정</a>
    <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="admin-btn admin-btn--light">목록</a>

    <form method="post" action="<?= e(admin_url('actions/booking-delete.php')) ?>" onsubmit="return confirm('이 예약을 삭제하시겠습니까?');">
        <input type="hidden" name="id" value="<?= e((string) ($booking['id'] ?? 0)) ?>">
        <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
    </form>
</div>
            </div>

            <section class="booking-detail-hero">
                <div class="booking-detail-hero__main">
                    <span class="booking-detail-hero__label">예약 상품</span>
                    <h2 class="booking-detail-hero__title"><?= e($booking['product_title'] ?? '') ?></h2>
                    <p class="booking-detail-hero__meta">
                        예약일 <?= e($booking['date'] ?? '') ?> · <?= e((string) ($booking['people'] ?? '')) ?>명 · <?= number_format((int) ($booking['total_price'] ?? 0)) ?>원
                    </p>
                </div>

                <div class="booking-detail-hero__side">
                    <span class="booking-status booking-status--<?= e($booking['status'] ?? 'pending') ?>">
                        <?= e(function_exists('admin_booking_status_label') ? admin_booking_status_label($booking['status'] ?? 'pending') : ($booking['status'] ?? 'pending')) ?>
                    </span>
                </div>
            </section>

            <div class="booking-detail-layout">
                <div class="booking-detail-main">
                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>예약 정보</h3>
                        </div>
                        <div class="admin-card__body">
                            <div class="booking-detail-grid">
                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">상품명</span>
                                    <strong class="booking-detail-item__value"><?= e($booking['product_title'] ?? '') ?></strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">예약일</span>
                                    <strong class="booking-detail-item__value"><?= e($booking['date'] ?? '') ?></strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">인원</span>
                                    <strong class="booking-detail-item__value"><?= e((string) ($booking['people'] ?? '')) ?>명</strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">총 금액</span>
                                    <strong class="booking-detail-item__value"><?= number_format((int) ($booking['total_price'] ?? 0)) ?>원</strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card u-mt-16">
                        <div class="admin-card__head">
                            <h3>결제 정보</h3>
                        </div>
                        <div class="admin-card__body">
                            <div class="booking-detail-grid">
                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">결제 수단</span>
                                    <strong class="booking-detail-item__value">
                                        <?= e($paymentMethodLabels[$booking['payment_method'] ?? ''] ?? '-') ?>
                                    </strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">결제 상태</span>
                                    <strong class="booking-detail-item__value">
                                        <?= e($paymentStatusLabels[$booking['payment_status'] ?? ''] ?? '-') ?>
                                    </strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">결제 금액</span>
                                    <strong class="booking-detail-item__value">
                                        <?= number_format((int) ($booking['payment_amount'] ?? 0)) ?>원
                                    </strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">결제 일시</span>
                                    <strong class="booking-detail-item__value">
                                        <?= e($booking['payment_date'] ?? '-') ?>
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card u-mt-16">
                        <div class="admin-card__head">
                            <h3>내부 메모</h3>
                        </div>
                        <div class="admin-card__body">
                            <form method="post" action="<?= e(admin_url('actions/booking-memo-update.php')) ?>" class="booking-memo-form">
                                <input type="hidden" name="id" value="<?= e((string) ($booking['id'] ?? 0)) ?>">

                                <div class="admin-field">
                                    <label class="admin-label">운영 메모</label>
                                    <textarea name="admin_memo" class="admin-textarea" rows="6" placeholder="내부 운영 메모를 입력하세요"><?= e($booking['admin_memo'] ?? '') ?></textarea>
                                </div>

                                <button type="submit" class="admin-btn admin-btn--primary">
                                    메모 저장
                                </button>
                            </form>
                        </div>
                    </section>

                    <section class="admin-card u-mt-16">
                        <div class="admin-card__head">
                            <h3>상태 변경 이력</h3>
                        </div>
                        <div class="admin-card__body">
                            <?php if (!empty($statusLogs)): ?>
                                <div class="booking-timeline">
                                    <?php foreach ($statusLogs as $log): ?>
                                        <article class="booking-timeline__item">
                                            <div class="booking-timeline__dot"></div>
                                            <div class="booking-timeline__content">
                                                <strong class="booking-timeline__title"><?= e($log['label'] ?? '') ?></strong>
                                                <p class="booking-timeline__meta"><?= e($log['changed_at'] ?? '') ?></p>
                                            </div>
                                        </article>
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <div class="booking-empty booking-empty--compact">
                                    <p>상태 변경 이력이 없습니다.</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </section>
                </div>

                <aside class="booking-detail-side">
                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>고객 정보</h3>
                        </div>
                        <div class="admin-card__body">
                            <div class="booking-detail-stack">
                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">고객명</span>
                                    <strong class="booking-detail-item__value"><?= e($booking['customer_name'] ?? '') ?></strong>
                                </div>

                                <div class="booking-detail-item">
                                    <span class="booking-detail-item__label">연락처</span>
                                    <strong class="booking-detail-item__value"><?= e($booking['customer_phone'] ?? '') ?></strong>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>상태 변경</h3>
                        </div>
                        <div class="admin-card__body">
                            <form method="post" action="<?= e(admin_url('actions/booking-status-update.php')) ?>" class="booking-status-form">
                                <input type="hidden" name="id" value="<?= e((string) ($booking['id'] ?? 0)) ?>">

                                <div class="admin-field">
                                    <label class="admin-label">예약 상태</label>
                                    <select name="status" class="admin-select">
                                        <option value="pending" <?= ($booking['status'] ?? '') === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                        <option value="paid" <?= ($booking['status'] ?? '') === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                        <option value="confirmed" <?= ($booking['status'] ?? '') === 'confirmed' ? 'selected' : '' ?>>예약확정</option>
                                        <option value="cancelled" <?= ($booking['status'] ?? '') === 'cancelled' ? 'selected' : '' ?>>취소</option>
                                    </select>
                                </div>

                                <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                    상태 저장
                                </button>
                            </form>
                        </div>
                    </section>

                    <section class="admin-card">
    <div class="admin-card__head">
        <h3>취소 / 환불 처리</h3>
    </div>
    <div class="admin-card__body">
        <form method="post" action="<?= e(admin_url('actions/booking-cancel-refund.php')) ?>" class="booking-status-form">
            <input type="hidden" name="id" value="<?= e((string) ($booking['id'] ?? 0)) ?>">

            <div class="admin-field">
                <label class="admin-label">취소 사유</label>
                <textarea name="cancel_reason" class="admin-textarea" rows="4" placeholder="취소 사유를 입력하세요"><?= e($booking['cancel_reason'] ?? '') ?></textarea>
            </div>

            <div class="admin-field">
                <label class="admin-label">환불 상태</label>
                <select name="refund_status" class="admin-select">
                    <option value="none" <?= ($booking['refund_status'] ?? 'none') === 'none' ? 'selected' : '' ?>>없음</option>
                    <option value="requested" <?= ($booking['refund_status'] ?? '') === 'requested' ? 'selected' : '' ?>>환불요청</option>
                    <option value="refunded" <?= ($booking['refund_status'] ?? '') === 'refunded' ? 'selected' : '' ?>>환불완료</option>
                </select>
            </div>

            <div class="admin-field">
                <label class="admin-label">환불 금액</label>
                <input type="number" name="refund_amount" class="admin-input" value="<?= e((string) ($booking['refund_amount'] ?? 0)) ?>" placeholder="예: 1280000">
            </div>

            <div class="admin-field">
                <label class="admin-label">환불 메모</label>
                <textarea name="refund_memo" class="admin-textarea" rows="4" placeholder="환불 관련 메모를 입력하세요"><?= e($booking['refund_memo'] ?? '') ?></textarea>
            </div>

            <div class="booking-refund-summary">
                <div class="booking-detail-item">
                    <span class="booking-detail-item__label">취소 일시</span>
                    <strong class="booking-detail-item__value"><?= e($booking['cancel_date'] ?? '-') ?></strong>
                </div>

                <div class="booking-detail-item">
                    <span class="booking-detail-item__label">환불 일시</span>
                    <strong class="booking-detail-item__value"><?= e($booking['refund_date'] ?? '-') ?></strong>
                </div>
            </div>

            <button type="submit" class="admin-btn admin-btn--danger admin-btn--block">
                취소 / 환불 저장
            </button>
        </form>
    </div>
</section>
                </aside>
            </div>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>