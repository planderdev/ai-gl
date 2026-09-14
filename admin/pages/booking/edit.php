<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/booking/booking-storage.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

$id = (int) ($_GET['id'] ?? 0);
$bookings = admin_get_bookings();
$products = admin_get_products();

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

$pageTitle = '예약 수정';
$currentAdminTitle = '예약관리';

$pageCss = [
    'booking.css',
];

$pageJs = [
    'booking.js',
];

$formData = array_merge([
    'id' => 0,
    'product_id' => '',
    'product_title' => '',
    'date' => '',
    'people' => '1',
    'total_price' => '',
    'status' => 'pending',
    'customer_name' => '',
    'customer_phone' => '',
    'payment_method' => 'card',
    'payment_status' => 'pending',
    'payment_amount' => '',
    'payment_date' => '',
    'cancel_reason' => '',
    'cancel_date' => '',
    'admin_memo' => '',
    'refund_status' => 'none',
    'refund_amount' => 0,
    'refund_date' => '',
    'refund_memo' => '',
    'status_logs' => [],
], $booking);

$statusLabelMap = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'confirmed' => '예약확정',
    'cancelled' => '취소',
];

$paymentMethodLabelMap = [
    'card' => '카드결제',
    'bank' => '무통장입금',
    'onsite' => '현장결제',
    'partial' => '부분결제',
];

$paymentStatusLabelMap = [
    'pending' => '결제대기',
    'paid' => '결제완료',
    'refunded' => '환불완료',
];

$refundStatusLabelMap = [
    'none' => '환불 없음',
    'requested' => '환불 요청',
    'processing' => '환불 진행중',
    'completed' => '환불 완료',
];

$statusLogs = is_array($formData['status_logs'] ?? null) ? $formData['status_logs'] : [];

$selectedProductTitle = trim((string) ($formData['product_title'] ?? ''));
$selectedProductPrice = (int) ($formData['total_price'] ?? 0);

foreach ($products as $product) {
    if ((int) ($product['id'] ?? 0) === (int) ($formData['product_id'] ?? 0)) {
        $selectedProductTitle = $product['title'] ?? $selectedProductTitle;
        $selectedProductPrice = (int) ($product['sale_price'] ?? $product['base_price'] ?? $selectedProductPrice);
        break;
    }
}

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                    <h1 class="admin-page-head__title">예약 수정 #<?= e((string) ($formData['id'] ?? 0)) ?></h1>
                    <p class="admin-page-head__desc">
                        예약 기본정보, 고객 정보, 결제/취소/환불 상태를 한 화면에서 정리해 수정할 수 있습니다.
                    </p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/booking/detail.php?id=' . ($formData['id'] ?? 0))) ?>" class="admin-btn admin-btn--light">상세 보기</a>
                    <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="admin-btn admin-btn--light">목록</a>

                    <form method="post" action="<?= e(admin_url('actions/booking-delete.php')) ?>" onsubmit="return confirm('이 예약을 삭제하시겠습니까?');">
                        <input type="hidden" name="id" value="<?= e((string) ($formData['id'] ?? 0)) ?>">
                        <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
                    </form>
                </div>
            </div>

            <section class="booking-edit-hero">
                <div class="booking-edit-hero__main">
                    <span class="booking-edit-hero__eyebrow">Booking Overview</span>

                    <h2 class="booking-edit-hero__title">
                        <?= e($selectedProductTitle ?: '예약 상품을 선택해주세요') ?>
                    </h2>

                    <p class="booking-edit-hero__desc">
                        예약일 <?= e($formData['date'] ?: '-') ?>
                        <span class="booking-edit-hero__dot"></span>
                        <?= e((string) ($formData['people'] ?: 0)) ?>명
                        <span class="booking-edit-hero__dot"></span>
                        총 <?= number_format((int) ($formData['total_price'] ?? 0)) ?>원
                    </p>

                    <div class="booking-edit-hero__chips">
                        <span class="booking-status booking-status--<?= e($formData['status'] ?? 'pending') ?>">
                            <?= e($statusLabelMap[$formData['status'] ?? 'pending'] ?? '상태없음') ?>
                        </span>

                        <span class="admin-chip admin-chip--gray">
                            결제 <?= e($paymentStatusLabelMap[$formData['payment_status'] ?? 'pending'] ?? '-') ?>
                        </span>

                        <?php if (($formData['refund_status'] ?? 'none') !== 'none'): ?>
                            <span class="admin-chip admin-chip--warning">
                                환불 <?= e($refundStatusLabelMap[$formData['refund_status'] ?? 'none'] ?? '-') ?>
                            </span>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="booking-edit-hero__summary">
                    <div class="booking-edit-hero__summary-item">
                        <span>예약 번호</span>
                        <strong>#<?= e((string) ($formData['id'] ?? 0)) ?></strong>
                    </div>
                    <div class="booking-edit-hero__summary-item">
                        <span>고객명</span>
                        <strong><?= e($formData['customer_name'] ?: '-') ?></strong>
                    </div>
                    <div class="booking-edit-hero__summary-item">
                        <span>결제 수단</span>
                        <strong><?= e($paymentMethodLabelMap[$formData['payment_method'] ?? 'card'] ?? '-') ?></strong>
                    </div>
                </div>
            </section>

            <form action="<?= e(admin_url('actions/booking-update.php')) ?>" method="post" class="booking-create-form booking-edit-form">
                <input type="hidden" name="id" value="<?= e((string) ($formData['id'] ?? 0)) ?>">

                <div class="booking-detail-layout booking-detail-layout--edit">
                    <div class="booking-detail-main">
                        <section class="admin-card booking-edit-card">
                            <div class="admin-card__head">
                                <h3>예약 기본 정보</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="booking-form-grid booking-form-grid--edit">
                                    <div class="admin-field booking-form-grid__full">
                                        <label class="admin-label">상품 선택</label>
                                        <select name="product_id" class="admin-select js-booking-product-select">
                                            <option value="">상품을 선택하세요</option>
                                            <?php foreach ($products as $item): ?>
                                                <option
                                                    value="<?= e((string) ($item['id'] ?? 0)) ?>"
                                                    data-title="<?= e($item['title'] ?? '') ?>"
                                                    data-price="<?= e((string) ($item['sale_price'] ?? $item['base_price'] ?? 0)) ?>"
                                                    <?= (int) ($formData['product_id'] ?? 0) === (int) ($item['id'] ?? 0) ? 'selected' : '' ?>
                                                >
                                                    <?= e($item['title'] ?? '') ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                        <input type="hidden" name="product_title" class="js-booking-product-title" value="<?= e($formData['product_title'] ?? '') ?>">
                                        <p class="admin-help">상품 변경 시 상품명은 자동 반영되고, 금액 입력란이 비어 있을 때 기본 금액이 자동 채워집니다.</p>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">예약일</label>
                                        <input type="date" name="date" class="admin-input" value="<?= e($formData['date'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">인원</label>
                                        <input type="number" name="people" class="admin-input" min="1" step="1" value="<?= e((string) ($formData['people'] ?? 1)) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">총 금액</label>
                                        <input type="number" name="total_price" class="admin-input js-booking-total-price" value="<?= e((string) ($formData['total_price'] ?? '')) ?>" placeholder="예: 1280000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">예약 상태</label>
                                        <select name="status" class="admin-select js-booking-status-select">
                                            <option value="pending" <?= ($formData['status'] ?? '') === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                            <option value="paid" <?= ($formData['status'] ?? '') === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                            <option value="confirmed" <?= ($formData['status'] ?? '') === 'confirmed' ? 'selected' : '' ?>>예약확정</option>
                                            <option value="cancelled" <?= ($formData['status'] ?? '') === 'cancelled' ? 'selected' : '' ?>>취소</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="booking-edit-inline-summary">
                                    <article class="booking-edit-inline-summary__item">
                                        <span>기본 판매가</span>
                                        <strong><?= number_format($selectedProductPrice) ?>원</strong>
                                    </article>
                                    <article class="booking-edit-inline-summary__item">
                                        <span>현재 결제금액</span>
                                        <strong><?= number_format((int) ($formData['payment_amount'] ?? 0)) ?>원</strong>
                                    </article>
                                    <article class="booking-edit-inline-summary__item">
                                        <span>환불금액</span>
                                        <strong><?= number_format((int) ($formData['refund_amount'] ?? 0)) ?>원</strong>
                                    </article>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card booking-edit-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>고객 정보</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="booking-form-grid booking-form-grid--edit">
                                    <div class="admin-field">
                                        <label class="admin-label">고객명</label>
                                        <input type="text" name="customer_name" class="admin-input" value="<?= e($formData['customer_name'] ?? '') ?>" placeholder="고객명을 입력하세요">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">연락처</label>
                                        <input type="text" name="customer_phone" class="admin-input" value="<?= e($formData['customer_phone'] ?? '') ?>" placeholder="010-0000-0000">
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card booking-edit-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>취소 / 환불 관리</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="booking-form-grid booking-form-grid--edit">
                                    <div class="admin-field booking-form-grid__full">
                                        <label class="admin-label">취소 사유</label>
                                        <textarea
                                            name="cancel_reason"
                                            class="admin-textarea"
                                            rows="4"
                                            placeholder="취소 사유가 있으면 입력하세요"
                                        ><?= e($formData['cancel_reason'] ?? '') ?></textarea>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">취소 일시</label>
                                        <input type="datetime-local" name="cancel_date" class="admin-input" value="<?= e($formData['cancel_date'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">환불 상태</label>
                                        <select name="refund_status" class="admin-select">
                                            <option value="none" <?= ($formData['refund_status'] ?? 'none') === 'none' ? 'selected' : '' ?>>환불 없음</option>
                                            <option value="requested" <?= ($formData['refund_status'] ?? 'none') === 'requested' ? 'selected' : '' ?>>환불 요청</option>
                                            <option value="processing" <?= ($formData['refund_status'] ?? 'none') === 'processing' ? 'selected' : '' ?>>환불 진행중</option>
                                            <option value="completed" <?= ($formData['refund_status'] ?? 'none') === 'completed' ? 'selected' : '' ?>>환불 완료</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">환불 금액</label>
                                        <input type="number" name="refund_amount" class="admin-input" value="<?= e((string) ($formData['refund_amount'] ?? 0)) ?>" placeholder="예: 300000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">환불 일시</label>
                                        <input type="datetime-local" name="refund_date" class="admin-input" value="<?= e($formData['refund_date'] ?? '') ?>">
                                    </div>

                                    <div class="admin-field booking-form-grid__full">
                                        <label class="admin-label">환불 메모</label>
                                        <textarea
                                            name="refund_memo"
                                            class="admin-textarea"
                                            rows="4"
                                            placeholder="환불 처리 관련 메모를 남겨주세요"
                                        ><?= e($formData['refund_memo'] ?? '') ?></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card booking-edit-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>내부 운영 메모</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="admin-field">
                                    <label class="admin-label">운영 메모</label>
                                    <textarea
                                        name="admin_memo"
                                        class="admin-textarea"
                                        rows="7"
                                        placeholder="고객 응대 메모, 일정 특이사항, 내부 전달 내용 등을 기록하세요"
                                    ><?= e($formData['admin_memo'] ?? '') ?></textarea>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card booking-edit-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>상태 변경 이력</h3>
                            </div>

                            <div class="admin-card__body">
                                <?php if (!empty($statusLogs)): ?>
                                    <div class="booking-timeline">
                                        <?php foreach ($statusLogs as $log): ?>
                                            <?php
                                            $logLabel = $log['label'] ?? '';
                                            if (!$logLabel && !empty($log['status'])) {
                                                $logLabel = $statusLabelMap[$log['status']] ?? (string) $log['status'];
                                            }
                                            ?>
                                            <article class="booking-timeline__item">
                                                <div class="booking-timeline__dot"></div>
                                                <div class="booking-timeline__content">
                                                    <strong class="booking-timeline__title"><?= e($logLabel ?: '변경 기록') ?></strong>
                                                    <p class="booking-timeline__meta"><?= e($log['changed_at'] ?? '-') ?></p>
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

                    <aside class="booking-detail-side booking-detail-side--sticky">
                        <section class="admin-card booking-edit-side-card">
                            <div class="admin-card__head">
                                <h3>결제 정보</h3>
                            </div>

                            <div class="admin-card__body">
                                <div class="booking-status-form">
                                    <div class="admin-field">
                                        <label class="admin-label">결제 수단</label>
                                        <select name="payment_method" class="admin-select">
                                            <option value="card" <?= ($formData['payment_method'] ?? '') === 'card' ? 'selected' : '' ?>>카드결제</option>
                                            <option value="bank" <?= ($formData['payment_method'] ?? '') === 'bank' ? 'selected' : '' ?>>무통장입금</option>
                                            <option value="onsite" <?= ($formData['payment_method'] ?? '') === 'onsite' ? 'selected' : '' ?>>현장결제</option>
                                            <option value="partial" <?= ($formData['payment_method'] ?? '') === 'partial' ? 'selected' : '' ?>>부분결제</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 상태</label>
                                        <select name="payment_status" class="admin-select">
                                            <option value="pending" <?= ($formData['payment_status'] ?? '') === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                            <option value="paid" <?= ($formData['payment_status'] ?? '') === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                            <option value="refunded" <?= ($formData['payment_status'] ?? '') === 'refunded' ? 'selected' : '' ?>>환불완료</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 금액</label>
                                        <input type="number" name="payment_amount" class="admin-input js-booking-payment-amount" value="<?= e((string) ($formData['payment_amount'] ?? '')) ?>" placeholder="예: 1280000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 일시</label>
                                        <input type="datetime-local" name="payment_date" class="admin-input" value="<?= e($formData['payment_date'] ?? '') ?>">
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card booking-edit-side-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>저장 전 체크</h3>
                            </div>

                            <div class="admin-card__body">
                                <ul class="booking-edit-checklist">
                                    <li class="booking-edit-checklist__item">
                                        <span class="booking-edit-checklist__label">예약 상태</span>
                                        <strong class="booking-edit-checklist__value"><?= e($statusLabelMap[$formData['status'] ?? 'pending'] ?? '-') ?></strong>
                                    </li>
                                    <li class="booking-edit-checklist__item">
                                        <span class="booking-edit-checklist__label">결제 상태</span>
                                        <strong class="booking-edit-checklist__value"><?= e($paymentStatusLabelMap[$formData['payment_status'] ?? 'pending'] ?? '-') ?></strong>
                                    </li>
                                    <li class="booking-edit-checklist__item">
                                        <span class="booking-edit-checklist__label">총 금액</span>
                                        <strong class="booking-edit-checklist__value"><?= number_format((int) ($formData['total_price'] ?? 0)) ?>원</strong>
                                    </li>
                                    <li class="booking-edit-checklist__item">
                                        <span class="booking-edit-checklist__label">결제 금액</span>
                                        <strong class="booking-edit-checklist__value"><?= number_format((int) ($formData['payment_amount'] ?? 0)) ?>원</strong>
                                    </li>
                                </ul>

                                <div class="booking-edit-side-actions">
                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        예약 수정 저장
                                    </button>

                                    <a href="<?= e(admin_url('pages/booking/detail.php?id=' . ($formData['id'] ?? 0))) ?>" class="admin-btn admin-btn--light admin-btn--block">
                                        상세 페이지로
                                    </a>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>