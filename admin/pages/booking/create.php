<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

$pageTitle = '예약 등록';
$currentAdminTitle = '예약관리';

$pageCss = [
    'booking.css',
];

$pageJs = [
    'booking.js',
];

$products = admin_get_products();
$products = is_array($products) ? $products : [];

$formData = [
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
];

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
                    <h1 class="admin-page-head__title">예약 등록</h1>
                    <p class="admin-page-head__desc">관리자가 직접 예약을 등록할 수 있습니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/booking/list.php')) ?>" class="admin-btn admin-btn--light">목록</a>
                </div>
            </div>

            <form action="<?= e(admin_url('actions/booking-create.php')) ?>" method="post" class="booking-create-form">
                <div class="booking-detail-layout">
                    <div class="booking-detail-main">
                        <section class="admin-card">
                            <div class="admin-card__head">
                                <h3>예약 정보</h3>
                            </div>
                            <div class="admin-card__body">
                                <div class="booking-form-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">상품 선택</label>
                                        <select name="product_id" class="admin-select js-booking-product-select">
                                            <option value="">선택</option>
                                            <?php foreach ($products as $item): ?>
                                                <option
                                                    value="<?= e((string) ($item['id'] ?? 0)) ?>"
                                                    data-title="<?= e($item['title'] ?? '') ?>"
                                                    data-price="<?= e((string) ($item['sale_price'] ?? $item['base_price'] ?? 0)) ?>"
                                                >
                                                    <?= e($item['title'] ?? '') ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                        <input type="hidden" name="product_title" class="js-booking-product-title" value="">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">예약일</label>
                                        <input type="date" name="date" class="admin-input" value="<?= e($formData['date']) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">인원</label>
                                        <input type="number" name="people" class="admin-input" min="1" value="<?= e($formData['people']) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">총 금액</label>
                                        <input type="number" name="total_price" class="admin-input js-booking-total-price" value="<?= e($formData['total_price']) ?>" placeholder="예: 1280000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">예약 상태</label>
                                        <select name="status" class="admin-select">
                                            <option value="pending" <?= $formData['status'] === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                            <option value="paid" <?= $formData['status'] === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                            <option value="confirmed" <?= $formData['status'] === 'confirmed' ? 'selected' : '' ?>>예약확정</option>
                                            <option value="cancelled" <?= $formData['status'] === 'cancelled' ? 'selected' : '' ?>>취소</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>고객 정보</h3>
                            </div>
                            <div class="admin-card__body">
                                <div class="booking-form-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">고객명</label>
                                        <input type="text" name="customer_name" class="admin-input" value="<?= e($formData['customer_name']) ?>" placeholder="고객명을 입력하세요">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">연락처</label>
                                        <input type="text" name="customer_phone" class="admin-input" value="<?= e($formData['customer_phone']) ?>" placeholder="010-0000-0000">
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card u-mt-16">
                            <div class="admin-card__head">
                                <h3>내부 메모</h3>
                            </div>
                            <div class="admin-card__body">
                                <div class="admin-field">
                                    <label class="admin-label">운영 메모</label>
                                    <textarea name="admin_memo" class="admin-textarea" rows="6" placeholder="내부 메모를 입력하세요"><?= e($formData['admin_memo']) ?></textarea>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside class="booking-detail-side">
                        <section class="admin-card">
                            <div class="admin-card__head">
                                <h3>결제 정보</h3>
                            </div>
                            <div class="admin-card__body">
                                <div class="booking-status-form">
                                    <div class="admin-field">
                                        <label class="admin-label">결제 수단</label>
                                        <select name="payment_method" class="admin-select">
                                            <option value="card" <?= $formData['payment_method'] === 'card' ? 'selected' : '' ?>>카드결제</option>
                                            <option value="bank" <?= $formData['payment_method'] === 'bank' ? 'selected' : '' ?>>무통장입금</option>
                                            <option value="onsite" <?= $formData['payment_method'] === 'onsite' ? 'selected' : '' ?>>현장결제</option>
                                            <option value="partial" <?= $formData['payment_method'] === 'partial' ? 'selected' : '' ?>>부분결제</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 상태</label>
                                        <select name="payment_status" class="admin-select">
                                            <option value="pending" <?= $formData['payment_status'] === 'pending' ? 'selected' : '' ?>>결제대기</option>
                                            <option value="paid" <?= $formData['payment_status'] === 'paid' ? 'selected' : '' ?>>결제완료</option>
                                            <option value="refunded" <?= $formData['payment_status'] === 'refunded' ? 'selected' : '' ?>>환불완료</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 금액</label>
                                        <input type="number" name="payment_amount" class="admin-input js-booking-payment-amount" value="<?= e($formData['payment_amount']) ?>" placeholder="예: 1280000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">결제 일시</label>
                                        <input type="datetime-local" name="payment_date" class="admin-input" value="<?= e($formData['payment_date']) ?>">
                                    </div>

                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        예약 등록
                                    </button>
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