<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/customer/customer-storage.php';

$pageTitle = '고객 목록';
$currentAdminTitle = '고객관리';

$pageCss = ['customer.css'];
$pageJs = ['customer.js'];

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'grade' => trim($_GET['grade'] ?? ''),
    'status' => trim($_GET['status'] ?? ''),
    'segment' => trim($_GET['segment'] ?? ''),
    'marketing' => trim($_GET['marketing'] ?? ''),
];

$customers = admin_get_customers();
$customers = is_array($customers) ? $customers : [];

$filteredCustomers = array_values(array_filter($customers, function (array $item) use ($filters) {
    $keywordHaystack = mb_strtolower(implode(' ', [
        $item['name'] ?? '',
        $item['email'] ?? '',
        $item['phone'] ?? '',
        $item['region'] ?? '',
        implode(' ', $item['tags'] ?? []),
        implode(' ', $item['preferred_destinations'] ?? []),
    ]));

    if ($filters['keyword'] !== '' && mb_strpos($keywordHaystack, mb_strtolower($filters['keyword'])) === false) {
        return false;
    }

    if ($filters['grade'] !== '' && ($item['grade'] ?? '') !== $filters['grade']) {
        return false;
    }

    if ($filters['status'] !== '' && ($item['status'] ?? '') !== $filters['status']) {
        return false;
    }

    if ($filters['segment'] !== '' && ($item['segment'] ?? '') !== $filters['segment']) {
        return false;
    }

    if ($filters['marketing'] !== '') {
        $marketingValue = ($filters['marketing'] === 'yes');
        if ((bool) ($item['marketing'] ?? false) !== $marketingValue) {
            return false;
        }
    }

    return true;
}));

$totalCount = count($customers);
$activeCount = count(array_filter($customers, fn(array $item) => ($item['status'] ?? '') === 'active'));
$vipCount = count(array_filter($customers, fn(array $item) => ($item['grade'] ?? '') === 'vip'));
$riskCount = count(array_filter($customers, fn(array $item) => ($item['segment'] ?? '') === 'risk'));
$marketingCount = count(array_filter($customers, fn(array $item) => !empty($item['marketing'])));
$totalSales = array_sum(array_map(fn(array $item) => (int) ($item['total_amount'] ?? 0), $customers));
$segmentCards = admin_customer_segment_summary($customers);

usort($filteredCustomers, function (array $a, array $b) {
    return strcmp((string) ($b['last_booking_date'] ?? ''), (string) ($a['last_booking_date'] ?? ''));
});

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
                    <h1 class="admin-page-head__title">고객 목록</h1>
                    <p class="admin-page-head__desc">예약 실적, 세그먼트, 등급, 마케팅 수신 여부를 한 번에 관리하는 CRM 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <button type="button" class="admin-btn admin-btn--light" data-modal-open="customerSegmentGuideModal">
                        <i class="ri-focus-3-line"></i>
                        세그먼트 가이드
                    </button>
                    <a href="<?= e(admin_url('pages/customer/create.php')) ?>" class="admin-btn admin-btn--primary">
    <i class="ri-user-add-line"></i>
    고객 등록
</a>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="customer-summary-grid">
                        <article class="customer-summary-card">
                            <span class="customer-summary-card__label">전체 고객</span>
                            <strong class="customer-summary-card__value"><?= number_format($totalCount) ?></strong>
                            <p class="customer-summary-card__meta">누적 매출 <?= number_format($totalSales) ?>원</p>
                        </article>
                        <article class="customer-summary-card">
                            <span class="customer-summary-card__label">활성 고객</span>
                            <strong class="customer-summary-card__value"><?= number_format($activeCount) ?></strong>
                            <p class="customer-summary-card__meta">최근 예약 기준 우선 응대</p>
                        </article>
                        <article class="customer-summary-card">
                            <span class="customer-summary-card__label">VIP 고객</span>
                            <strong class="customer-summary-card__value"><?= number_format($vipCount) ?></strong>
                            <p class="customer-summary-card__meta">프리미엄 업셀 우선 대상</p>
                        </article>
                        <article class="customer-summary-card customer-summary-card--warning">
                            <span class="customer-summary-card__label">이탈 위험</span>
                            <strong class="customer-summary-card__value"><?= number_format($riskCount) ?></strong>
                            <p class="customer-summary-card__meta">재활성화 쿠폰 권장</p>
                        </article>
                        <article class="customer-summary-card">
                            <span class="customer-summary-card__label">마케팅 수신</span>
                            <strong class="customer-summary-card__value"><?= number_format($marketingCount) ?></strong>
                            <p class="customer-summary-card__meta">프로모션 발송 가능 고객</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="admin-card customer-highlight-card">
                <div class="admin-card__body customer-highlight-grid">
                    <article class="customer-highlight">
                        <div class="customer-highlight__icon"><i class="ri-vip-crown-2-line"></i></div>
                        <div>
                            <strong>VIP 케어 대상</strong>
                            <p>최근 30일 예약이 있고 누적 결제액이 높은 고객을 우선 응대합니다.</p>
                        </div>
                    </article>
                    <article class="customer-highlight">
                        <div class="customer-highlight__icon"><i class="ri-alarm-warning-line"></i></div>
                        <div>
                            <strong>이탈 방지 캠페인</strong>
                            <p>최근 예약 공백이 긴 고객에게 쿠폰/상담 시나리오를 우선 적용합니다.</p>
                        </div>
                    </article>
                    <article class="customer-highlight">
                        <div class="customer-highlight__icon"><i class="ri-megaphone-line"></i></div>
                        <div>
                            <strong>마케팅 타깃 운영</strong>
                            <p>수신 동의 고객을 따로 묶어 시즌 상품과 이벤트를 발송할 수 있습니다.</p>
                        </div>
                    </article>
                </div>
            </section>

            <section class="admin-card">
                <div class="admin-card__head">
                    <div>
                        <h3>세그먼트 관리</h3>
                        <p class="admin-card__desc">고객군 기준을 빠르게 확인하고 운영 액션을 연결할 수 있습니다.</p>
                    </div>
                    <div class="admin-page-head__actions">
                        <button type="button" class="admin-btn admin-btn--light" data-modal-open="customerSegmentGuideModal">
                            관리 기준 보기
                        </button>
                    </div>
                </div>
                <div class="admin-card__body">
                    <div class="customer-segment-grid">
                        <?php foreach ($segmentCards as $segment): ?>
                            <article class="customer-segment-card">
                                <div class="customer-segment-card__head">
                                    <div class="customer-segment-card__icon">
                                        <i class="<?= e($segment['icon']) ?>"></i>
                                    </div>
                                    <span class="<?= e(admin_customer_segment_class($segment['key'])) ?>">
                                        <?= e($segment['label']) ?>
                                    </span>
                                </div>

                                <strong class="customer-segment-card__count"><?= number_format((int) $segment['count']) ?>명</strong>
                                <p class="customer-segment-card__desc"><?= e($segment['desc']) ?></p>

                                <div class="customer-segment-card__actions">
                                    <a
                                        href="<?= e(admin_url('pages/customer/list.php?segment=' . urlencode((string) $segment['key']))) ?>"
                                        class="admin-btn admin-btn--light admin-btn--sm"
                                    >
                                        고객 보기
                                    </a>
                                    <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-modal-open="customerSegmentGuideModal">
                                        운영 팁
                                    </button>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <section class="admin-card">
                <div class="admin-card__body">
                    <form method="get" class="customer-filter-form">
                        <div class="customer-filter-grid">
                            <div class="admin-field customer-filter-grid__keyword">
                                <label class="admin-label">검색어</label>
                                <input
                                    type="text"
                                    name="keyword"
                                    class="admin-input"
                                    value="<?= e($filters['keyword']) ?>"
                                    placeholder="이름, 이메일, 전화번호, 태그 검색"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">고객 등급</label>
                                <select name="grade" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_customer_grade_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['grade'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">고객 상태</label>
                                <select name="status" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="active" <?= $filters['status'] === 'active' ? 'selected' : '' ?>>활성</option>
                                    <option value="inactive" <?= $filters['status'] === 'inactive' ? 'selected' : '' ?>>휴면</option>
                                    <option value="lead" <?= $filters['status'] === 'lead' ? 'selected' : '' ?>>리드</option>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">세그먼트</label>
                                <select name="segment" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_customer_segment_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['segment'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">마케팅 수신</label>
                                <select name="marketing" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="yes" <?= $filters['marketing'] === 'yes' ? 'selected' : '' ?>>수신</option>
                                    <option value="no" <?= $filters['marketing'] === 'no' ? 'selected' : '' ?>>미수신</option>
                                </select>
                            </div>
                        </div>

                        <div class="customer-filter-actions">
                            <a href="<?= e(admin_url('pages/customer/list.php')) ?>" class="admin-btn admin-btn--light">초기화</a>
                            <button type="submit" class="admin-btn admin-btn--primary">검색</button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card customer-table-card">
                <div class="admin-card__head customer-table-card__head">
                    <div>
                        <h3>고객 리스트</h3>
                        <p class="customer-table-card__meta">총 <?= number_format(count($filteredCustomers)) ?>명의 고객</p>
                    </div>
                    <div class="admin-page-head__actions">
                        <button type="button" class="admin-btn admin-btn--light admin-btn--sm" data-modal-open="customerBulkCampaignModal">
                            일괄 캠페인 발송
                        </button>
                    </div>
                </div>

                <?php if (!empty($filteredCustomers)): ?>
                    <div class="customer-table-wrap">
                        <table class="customer-table">
                            <thead>
                                <tr>
                                    <th>고객</th>
                                    <th>등급</th>
                                    <th>세그먼트</th>
                                    <th>지역</th>
                                    <th>예약 수</th>
                                    <th>누적 결제</th>
                                    <th>최근 예약</th>
                                    <th>마케팅</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($filteredCustomers as $customer): ?>
                                    <tr>
                                        <td>
                                            <div class="customer-cell-user">
                                                <div class="customer-avatar"><?= e(mb_substr((string) $customer['name'], 0, 1)) ?></div>
                                                <div class="customer-cell-user__content">
                                                    <strong><?= e($customer['name'] ?? '-') ?></strong>
                                                    <span><?= e($customer['email'] ?? '-') ?></span>
                                                    <span><?= e($customer['phone'] ?? '-') ?></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_customer_grade_class($customer['grade'] ?? '')) ?>">
                                                <?= e(admin_customer_grade_label($customer['grade'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_customer_segment_class($customer['segment'] ?? '')) ?>">
                                                <?= e(admin_customer_segment_label($customer['segment'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td><?= e($customer['region'] ?? '-') ?></td>
                                        <td><strong><?= number_format((int) ($customer['booking_count'] ?? 0)) ?>회</strong></td>
                                        <td><strong><?= number_format((int) ($customer['total_amount'] ?? 0)) ?>원</strong></td>
                                        <td>
                                            <div class="customer-cell-meta">
                                                <strong><?= e($customer['last_booking_date'] ?? '-') ?></strong>
                                                <span><?= e($customer['last_product'] ?? '-') ?></span>
                                            </div>
                                        </td>
                                        <td>
                                            <?= !empty($customer['marketing']) ? '<span class="admin-chip admin-chip--success">수신</span>' : '<span class="admin-chip admin-chip--gray">미수신</span>' ?>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_customer_status_class($customer['status'] ?? '')) ?>">
                                                <?= e(admin_customer_status_label($customer['status'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <a href="<?= e(admin_url('pages/customer/detail.php?id=' . urlencode((string) $customer['id']))) ?>" class="customer-link-arrow">
                                                상세
                                                <i class="ri-arrow-right-line"></i>
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="customer-mobile-list">
                        <?php foreach ($filteredCustomers as $customer): ?>
                            <article class="customer-mobile-card">
                                <div class="customer-mobile-card__top">
                                    <div class="customer-avatar"><?= e(mb_substr((string) $customer['name'], 0, 1)) ?></div>
                                    <div class="customer-mobile-card__head">
                                        <strong><?= e($customer['name'] ?? '-') ?></strong>
                                        <span><?= e($customer['email'] ?? '-') ?></span>
                                    </div>
                                    <span class="<?= e(admin_customer_grade_class($customer['grade'] ?? '')) ?>">
                                        <?= e(admin_customer_grade_label($customer['grade'] ?? '')) ?>
                                    </span>
                                </div>

                                <div class="customer-mobile-card__grid">
                                    <div>
                                        <span>세그먼트</span>
                                        <strong><?= e(admin_customer_segment_label($customer['segment'] ?? '')) ?></strong>
                                    </div>
                                    <div>
                                        <span>예약 수</span>
                                        <strong><?= number_format((int) ($customer['booking_count'] ?? 0)) ?>회</strong>
                                    </div>
                                    <div>
                                        <span>누적 결제</span>
                                        <strong><?= number_format((int) ($customer['total_amount'] ?? 0)) ?>원</strong>
                                    </div>
                                    <div>
                                        <span>최근 예약</span>
                                        <strong><?= e($customer['last_booking_date'] ?? '-') ?></strong>
                                    </div>
                                </div>

                                <div class="customer-mobile-card__bottom">
                                    <span class="<?= e(admin_customer_status_class($customer['status'] ?? '')) ?>">
                                        <?= e(admin_customer_status_label($customer['status'] ?? '')) ?>
                                    </span>
                                    <a href="<?= e(admin_url('pages/customer/detail.php?id=' . urlencode((string) $customer['id']))) ?>" class="customer-link-arrow">
                                        상세 보기
                                        <i class="ri-arrow-right-line"></i>
                                    </a>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="customer-empty">
                        <i class="ri-user-search-line"></i>
                        <p>조건에 맞는 고객이 없습니다.</p>
                    </div>
                <?php endif; ?>
            </section>
        </div>
    </main>
</div>

<div class="customer-modal" id="customerSegmentGuideModal" aria-hidden="true">
    <div class="customer-modal__backdrop" data-modal-close></div>
    <div class="customer-modal__dialog customer-modal__dialog--md">
        <div class="customer-modal__head">
            <div>
                <h3>세그먼트 운영 가이드</h3>
                <p>고객군별 기본 운영 원칙을 정의하는 데모 화면입니다.</p>
            </div>
            <button type="button" class="customer-modal__close" data-modal-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>

        <div class="customer-modal__body">
            <div class="customer-guide-list">
                <article class="customer-guide-item">
                    <strong>고가치 고객</strong>
                    <p>전담 응대, 상위 상품 제안, 이벤트 선공개 우선 적용</p>
                </article>
                <article class="customer-guide-item">
                    <strong>충성 고객</strong>
                    <p>재예약 리워드, 멤버십 업그레이드, 추천인 이벤트 연결</p>
                </article>
                <article class="customer-guide-item">
                    <strong>신규 고객</strong>
                    <p>온보딩 메시지, 첫 재예약 쿠폰, 후기 유도 자동화 적용</p>
                </article>
                <article class="customer-guide-item">
                    <strong>이탈 위험</strong>
                    <p>장기 미예약 쿠폰, 개인 상담, 선호 목적지 맞춤 상품 재제안</p>
                </article>
            </div>
        </div>
    </div>
</div>

<div class="customer-modal" id="customerBulkCampaignModal" aria-hidden="true">
    <div class="customer-modal__backdrop" data-modal-close></div>
    <div class="customer-modal__dialog customer-modal__dialog--md">
        <div class="customer-modal__head">
            <div>
                <h3>일괄 캠페인 발송</h3>
                <p>프론트 데모용 화면입니다. 실제 발송 로직은 아직 연결하지 않았습니다.</p>
            </div>
            <button type="button" class="customer-modal__close" data-modal-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>

        <div class="customer-modal__body">
            <div class="customer-form-grid">
                <div class="admin-field">
                    <label class="admin-label">발송 대상</label>
                    <select class="admin-select">
                        <option>현재 검색 결과 전체</option>
                        <option>마케팅 수신 고객만</option>
                        <option>VIP / Gold 고객</option>
                        <option>이탈 위험 고객</option>
                    </select>
                </div>

                <div class="admin-field">
                    <label class="admin-label">채널</label>
                    <select class="admin-select">
                        <option>카카오 알림톡</option>
                        <option>문자</option>
                        <option>이메일</option>
                    </select>
                </div>
            </div>

            <div class="admin-field">
                <label class="admin-label">캠페인 제목</label>
                <input type="text" class="admin-input" value="봄 시즌 특가 패키지 안내">
            </div>

            <div class="admin-field">
                <label class="admin-label">메시지</label>
                <textarea class="admin-textarea" rows="6">이번 시즌 인기 골프 패키지를 우선 안내드립니다. 조기 마감 전에 확인해보세요.</textarea>
            </div>

            <div class="customer-form-actions">
                <button type="button" class="admin-btn admin-btn--light" data-modal-close>취소</button>
                <button type="button" class="admin-btn admin-btn--primary">발송 예약</button>
            </div>
        </div>
    </div>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>