<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/customer/customer-storage.php';

$pageTitle = '고객 등록';
$currentAdminTitle = '고객관리';

$pageCss = ['customer.css'];
$pageJs = ['customer.js'];

$formData = [
    'name' => '',
    'email' => '',
    'phone' => '',
    'grade' => 'silver',
    'segment' => 'new',
    'region' => '',
    'status' => 'active',
    'marketing' => true,
    'booking_count' => 0,
    'cancel_count' => 0,
    'total_amount' => 0,
    'avg_amount' => 0,
    'last_booking_date' => '',
    'last_product' => '',
    'joined_at' => date('Y-m-d'),
    'memo' => '',
    'tags' => '',
    'preferred_destinations' => '',
];

$gradeOptions = admin_customer_grade_options();
$segmentOptions = admin_customer_segment_options();
$statusOptions = admin_customer_status_options();

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip">customer MANAGER</span>
                    <h1 class="admin-page-head__title">고객 등록</h1>
                    <p class="admin-page-head__desc">
                        CRM 기본 정보, 고객 세그먼트, 마케팅 가능 여부를 한 번에 등록할 수 있습니다.
                    </p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/customer/list.php')) ?>" class="admin-btn admin-btn--light">목록</a>
                </div>
            </div>

            <section class="customer-create-hero">
                <div class="customer-create-hero__main">
                    <span class="customer-create-hero__eyebrow">Customer Onboarding</span>
                    <h2 class="customer-create-hero__title">새 고객 프로필을 등록하세요</h2>
                    <p class="customer-create-hero__desc">
                        기본 정보와 CRM 운영 정보를 함께 기록해두면, 이후 목록/상세/세그먼트 관리에 바로 연결됩니다.
                    </p>

                    <div class="customer-create-hero__chips">
                        <span class="admin-chip">고객 DB 연동형</span>
                        <span class="admin-chip admin-chip--success">세그먼트 기반</span>
                        <span class="admin-chip admin-chip--gray">마케팅 활용 가능</span>
                    </div>
                </div>

                <div class="customer-create-hero__summary">
                    <div class="customer-create-hero__summary-item">
                        <span>기본 세그먼트</span>
                        <strong>신규 고객</strong>
                    </div>
                    <div class="customer-create-hero__summary-item">
                        <span>기본 등급</span>
                        <strong>Silver</strong>
                    </div>
                    <div class="customer-create-hero__summary-item">
                        <span>가입일</span>
                        <strong><?= e($formData['joined_at']) ?></strong>
                    </div>
                </div>
            </section>

            <form action="<?= e(admin_url('actions/customer-create.php')) ?>" method="post" class="customer-create-form">
                <div class="customer-create-layout">
                    <div class="customer-create-main">
                        <section class="admin-card customer-create-card">
                            <div class="admin-card__head">
                                <div>
                                    <h3>기본 정보</h3>
                                    <p class="admin-card__desc">고객 식별과 기본 응대를 위한 핵심 정보입니다.</p>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="customer-create-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">고객명</label>
                                        <input
                                            type="text"
                                            name="name"
                                            class="admin-input"
                                            value="<?= e($formData['name']) ?>"
                                            placeholder="예: 김민지"
                                            required
                                        >
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">연락처</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            class="admin-input"
                                            value="<?= e($formData['phone']) ?>"
                                            placeholder="010-0000-0000"
                                            required
                                        >
                                    </div>

                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">이메일</label>
                                        <input
                                            type="email"
                                            name="email"
                                            class="admin-input"
                                            value="<?= e($formData['email']) ?>"
                                            placeholder="example@domain.com"
                                        >
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">지역</label>
                                        <input
                                            type="text"
                                            name="region"
                                            class="admin-input"
                                            value="<?= e($formData['region']) ?>"
                                            placeholder="예: 서울"
                                        >
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">가입일</label>
                                        <input
                                            type="date"
                                            name="joined_at"
                                            class="admin-input"
                                            value="<?= e($formData['joined_at']) ?>"
                                        >
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card customer-create-card u-mt-16">
                            <div class="admin-card__head">
                                <div>
                                    <h3>CRM 정보</h3>
                                    <p class="admin-card__desc">등급, 상태, 세그먼트를 설정해 운영 우선순위를 정합니다.</p>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="customer-create-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">등급</label>
                                        <select name="grade" class="admin-select">
                                            <?php foreach ($gradeOptions as $key => $label): ?>
                                                <option value="<?= e($key) ?>" <?= $formData['grade'] === $key ? 'selected' : '' ?>>
                                                    <?= e($label) ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">고객 상태</label>
                                        <select name="status" class="admin-select">
                                            <?php foreach ($statusOptions as $key => $label): ?>
                                                <option value="<?= e($key) ?>" <?= $formData['status'] === $key ? 'selected' : '' ?>>
                                                    <?= e($label) ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>

                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">세그먼트</label>
                                        <select name="segment" class="admin-select">
                                            <?php foreach ($segmentOptions as $key => $label): ?>
                                                <option value="<?= e($key) ?>" <?= $formData['segment'] === $key ? 'selected' : '' ?>>
                                                    <?= e($label) ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                        <p class="admin-help">
                                            신규 유입 고객은 <strong>신규</strong>, 재예약/고액 고객은 <strong>충성</strong> 또는 <strong>고가치</strong>,
                                            장기 미예약 고객은 <strong>이탈 위험</strong>으로 운영하는 흐름에 맞춰두었습니다.
                                        </p>
                                    </div>

                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">마케팅 수신 여부</label>
                                        <div class="customer-create-radio-group">
                                            <label class="customer-create-radio">
                                                <input type="radio" name="marketing" value="1" checked>
                                                <span>동의</span>
                                            </label>
                                            <label class="customer-create-radio">
                                                <input type="radio" name="marketing" value="0">
                                                <span>미동의</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card customer-create-card u-mt-16">
                            <div class="admin-card__head">
                                <div>
                                    <h3>고객 메모 / 관심사</h3>
                                    <p class="admin-card__desc">상담 히스토리, 성향, 선호 지역을 간단히 남겨둘 수 있습니다.</p>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="customer-create-grid">
                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">운영 메모</label>
                                        <textarea
                                            name="memo"
                                            class="admin-textarea"
                                            rows="6"
                                            placeholder="예: 일본 남부 지역 선호, 가족 동반 문의 비중 높음, 숙소 퀄리티 중요"
                                        ><?= e($formData['memo']) ?></textarea>
                                    </div>

                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">태그</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            class="admin-input"
                                            value="<?= e($formData['tags']) ?>"
                                            placeholder="예: VIP, 일본, 가족여행, 카카오상담"
                                        >
                                        <p class="admin-help">쉼표(,)로 구분해서 입력하면 자동으로 태그 배열로 저장됩니다.</p>
                                    </div>

                                    <div class="admin-field customer-create-grid__full">
                                        <label class="admin-label">선호 목적지</label>
                                        <input
                                            type="text"
                                            name="preferred_destinations"
                                            class="admin-input"
                                            value="<?= e($formData['preferred_destinations']) ?>"
                                            placeholder="예: 오키나와, 후쿠오카, 제주"
                                        >
                                        <p class="admin-help">목적지도 쉼표(,) 기준으로 분리 저장됩니다.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="admin-card customer-create-card u-mt-16">
                            <div class="admin-card__head">
                                <div>
                                    <h3>초기 실적 정보</h3>
                                    <p class="admin-card__desc">기존 외부 DB나 수기 데이터를 옮겨올 때 함께 입력할 수 있습니다.</p>
                                </div>
                            </div>

                            <div class="admin-card__body">
                                <div class="customer-create-grid">
                                    <div class="admin-field">
                                        <label class="admin-label">예약 수</label>
                                        <input type="number" min="0" name="booking_count" class="admin-input js-customer-booking-count" value="<?= e((string) $formData['booking_count']) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">취소 수</label>
                                        <input type="number" min="0" name="cancel_count" class="admin-input" value="<?= e((string) $formData['cancel_count']) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">누적 결제액</label>
                                        <input type="number" min="0" name="total_amount" class="admin-input js-customer-total-amount" value="<?= e((string) $formData['total_amount']) ?>" placeholder="예: 3200000">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">평균 결제액</label>
                                        <input type="number" min="0" name="avg_amount" class="admin-input js-customer-avg-amount" value="<?= e((string) $formData['avg_amount']) ?>" placeholder="자동 계산 가능">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">최근 예약일</label>
                                        <input type="date" name="last_booking_date" class="admin-input" value="<?= e($formData['last_booking_date']) ?>">
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">최근 예약 상품</label>
                                        <input type="text" name="last_product" class="admin-input" value="<?= e($formData['last_product']) ?>" placeholder="예: 제주 프라이빗 라운드 2인 패키지">
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside class="customer-create-side">
                        <section class="admin-card customer-create-side-card">
                            <div class="admin-card__head">
                                <h3>등록 전 체크</h3>
                            </div>

                            <div class="admin-card__body">
                                <ul class="customer-create-checklist">
                                    <li class="customer-create-checklist__item">
                                        <span class="customer-create-checklist__label">기본 상태</span>
                                        <strong class="customer-create-checklist__value">활성</strong>
                                    </li>
                                    <li class="customer-create-checklist__item">
                                        <span class="customer-create-checklist__label">기본 세그먼트</span>
                                        <strong class="customer-create-checklist__value">신규</strong>
                                    </li>
                                    <li class="customer-create-checklist__item">
                                        <span class="customer-create-checklist__label">마케팅 기본값</span>
                                        <strong class="customer-create-checklist__value">동의</strong>
                                    </li>
                                </ul>

                                <div class="customer-create-side-note">
                                    <strong>운영 팁</strong>
                                    <p>
                                        아직 예약 이력이 없는 신규 고객이라면 예약 수/매출은 비워두거나 0으로 두고,
                                        메모와 관심 목적지 위주로 먼저 등록하는 방식이 관리하기 편합니다.
                                    </p>
                                </div>

                                <div class="customer-create-side-actions">
                                    <button type="submit" class="admin-btn admin-btn--primary admin-btn--block">
                                        고객 등록
                                    </button>
                                    <a href="<?= e(admin_url('pages/customer/list.php')) ?>" class="admin-btn admin-btn--light admin-btn--block">
                                        취소
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