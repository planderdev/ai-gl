<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/customer/customer-storage.php';

$pageTitle = '고객 상세';
$currentAdminTitle = '고객관리';
$pageCss = ['customer.css'];
$pageJs = ['customer.js'];

$customerId = $_GET['id'] ?? '';
$customer = admin_get_customer_by_id($customerId);

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <?php if (!$customer): ?>
                <div class="admin-page-head">
                    <div>
                        <h1 class="admin-page-head__title">고객 정보를 찾을 수 없습니다</h1>
                        <p class="admin-page-head__desc">목록으로 돌아가서 다시 선택해 주세요.</p>
                    </div>
                    <div class="admin-page-head__actions">
                        <a href="<?= e(admin_url('pages/customer/list.php')) ?>" class="admin-btn admin-btn--primary">고객 목록으로</a>
                    </div>
                </div>
            <?php else: ?>
                <?php
                $consultLogs = admin_customer_consult_logs($customer);
                $campaignHistory = admin_customer_campaign_history($customer);
                $recommendedCoupon = admin_customer_recommended_coupon($customer);
                ?>

                <div class="admin-page-head">
                    <div>
                        <div class="customer-breadcrumb">
                            <a href="<?= e(admin_url('pages/customer/list.php')) ?>">고객 목록</a>
                            <i class="ri-arrow-right-s-line"></i>
                            <span><?= e($customer['name']) ?></span>
                        </div>
                        <h1 class="admin-page-head__title"><?= e($customer['name']) ?></h1>
                        <p class="admin-page-head__desc">고객 프로필, 상담 이력, 캠페인 이력, 운영 메모를 한 화면에서 관리합니다.</p>
                    </div>
                    <div class="admin-page-head__actions">
                        <button type="button" class="admin-btn admin-btn--light" data-modal-open="customerNoteModal">메모 편집</button>
                        <button type="button" class="admin-btn admin-btn--light" data-drawer-open="customerGradeDrawer">등급 변경</button>
                        <button type="button" class="admin-btn admin-btn--primary" data-modal-open="customerCampaignModal">캠페인 발송</button>
                    </div>
                </div>

                <section class="admin-card customer-profile-card">
                    <div class="admin-card__body customer-profile-card__body">
                        <div class="customer-profile-main">
                            <div class="customer-profile-main__avatar"><?= e(mb_substr((string) $customer['name'], 0, 1)) ?></div>
                            <div class="customer-profile-main__content">
                                <div class="customer-profile-main__chips">
                                    <span class="<?= e(admin_customer_grade_class($customer['grade'] ?? '')) ?>">
                                        <?= e(admin_customer_grade_label($customer['grade'] ?? '')) ?>
                                    </span>
                                    <span class="<?= e(admin_customer_status_class($customer['status'] ?? '')) ?>">
                                        <?= e(admin_customer_status_label($customer['status'] ?? '')) ?>
                                    </span>
                                    <span class="<?= e(admin_customer_segment_class($customer['segment'] ?? '')) ?>">
                                        <?= e(admin_customer_segment_label($customer['segment'] ?? '')) ?>
                                    </span>
                                </div>
                                <h2><?= e($customer['name']) ?></h2>
                                <p><?= e($customer['email']) ?> · <?= e($customer['phone']) ?></p>
                                <span class="customer-profile-main__joined">가입일 <?= e($customer['joined_at'] ?? '-') ?></span>
                            </div>
                        </div>

                        <div class="customer-profile-stats">
                            <div class="customer-stat-box">
                                <span>예약 수</span>
                                <strong><?= number_format((int) ($customer['booking_count'] ?? 0)) ?>회</strong>
                            </div>
                            <div class="customer-stat-box">
                                <span>누적 결제</span>
                                <strong><?= number_format((int) ($customer['total_amount'] ?? 0)) ?>원</strong>
                            </div>
                            <div class="customer-stat-box">
                                <span>평균 결제</span>
                                <strong>
                                    <?= number_format(
                                        (int) (($customer['booking_count'] ?? 0) > 0
                                            ? (($customer['total_amount'] ?? 0) / max(1, (int) $customer['booking_count']))
                                            : 0)
                                    ) ?>원
                                </strong>
                            </div>
                            <div class="customer-stat-box">
                                <span>최근 예약</span>
                                <strong><?= e($customer['last_booking_date'] ?? '-') ?></strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="admin-card">
                    <div class="admin-card__body">
                        <div class="customer-tab-nav" data-customer-tabs>
                            <button type="button" class="customer-tab-btn is-active" data-customer-tab="overview">기본 정보</button>
                            <button type="button" class="customer-tab-btn" data-customer-tab="consult">상담 이력</button>
                            <button type="button" class="customer-tab-btn" data-customer-tab="campaign">쿠폰/마케팅</button>
                        </div>
                    </div>
                </section>

                <div class="customer-tab-panels">
                    <section class="customer-tab-panel is-active" data-customer-panel="overview">
                        <div class="customer-detail-grid">
                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <h3>기본 정보</h3>
                                </div>
                                <div class="admin-card__body">
                                    <dl class="customer-info-list">
                                        <div>
                                            <dt>고객명</dt>
                                            <dd><?= e($customer['name'] ?? '-') ?></dd>
                                        </div>
                                        <div>
                                            <dt>지역</dt>
                                            <dd><?= e($customer['region'] ?? '-') ?></dd>
                                        </div>
                                        <div>
                                            <dt>이메일</dt>
                                            <dd><?= e($customer['email'] ?? '-') ?></dd>
                                        </div>
                                        <div>
                                            <dt>전화번호</dt>
                                            <dd><?= e($customer['phone'] ?? '-') ?></dd>
                                        </div>
                                        <div>
                                            <dt>최근 예약 상품</dt>
                                            <dd><?= e($customer['last_product'] ?? '-') ?></dd>
                                        </div>
                                        <div>
                                            <dt>마케팅 수신</dt>
                                            <dd><?= !empty($customer['marketing']) ? '동의' : '미동의' ?></dd>
                                        </div>
                                    </dl>
                                </div>
                            </section>

                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <h3>고객 메모</h3>
                                </div>
                                <div class="admin-card__body">
                                    <div class="customer-note-box">
                                        <?= nl2br(e($customer['memo'] ?? '등록된 메모가 없습니다.')) ?>
                                    </div>
                                </div>
                            </section>

                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <h3>선호 태그</h3>
                                </div>
                                <div class="admin-card__body">
                                    <div class="customer-tag-list">
                                        <?php foreach (($customer['tags'] ?? []) as $tag): ?>
                                            <span class="admin-chip admin-chip--gray">#<?= e($tag) ?></span>
                                        <?php endforeach; ?>
                                    </div>
                                    <div class="customer-destination-list">
                                        <?php foreach (($customer['preferred_destinations'] ?? []) as $destination): ?>
                                            <span class="admin-chip"><?= e($destination) ?></span>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </section>

                            <section class="admin-card customer-side-card">
                                <div class="admin-card__head">
                                    <h3>운영 메모</h3>
                                </div>
                                <div class="admin-card__body customer-side-stack">
                                    <div class="customer-side-metric">
                                        <span>재방문 가능성</span>
                                        <strong><?= (($customer['segment'] ?? '') === 'risk') ? '보통 이하' : '높음' ?></strong>
                                    </div>
                                    <div class="customer-side-metric">
                                        <span>프로모션 추천</span>
                                        <strong><?= !empty($customer['marketing']) ? '캠페인 발송 가능' : '개별 상담 권장' ?></strong>
                                    </div>
                                    <div class="customer-side-metric">
                                        <span>추천 액션</span>
                                        <strong><?= (($customer['segment'] ?? '') === 'risk') ? '재활성화 쿠폰' : '프리미엄 상품 제안' ?></strong>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section class="admin-card customer-history-card">
                            <div class="admin-card__head">
                                <h3>최근 예약 이력</h3>
                            </div>
                            <div class="admin-card__body">
                                <?php if (!empty($customer['recent_bookings'])): ?>
                                    <div class="customer-history-list">
                                        <?php foreach ($customer['recent_bookings'] as $booking): ?>
                                            <article class="customer-history-item">
                                                <div class="customer-history-item__date"><?= e($booking['date'] ?? '-') ?></div>
                                                <div class="customer-history-item__content">
                                                    <strong><?= e($booking['product'] ?? '-') ?></strong>
                                                    <span><?= number_format((int) ($booking['amount'] ?? 0)) ?>원</span>
                                                </div>
                                                <div>
                                                    <span class="<?= e(admin_booking_item_status_class($booking['status'] ?? '')) ?>">
                                                        <?= e(admin_booking_item_status_label($booking['status'] ?? '')) ?>
                                                    </span>
                                                </div>
                                            </article>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else: ?>
                                    <div class="customer-empty customer-empty--small">
                                        <i class="ri-calendar-close-line"></i>
                                        <p>최근 예약 이력이 없습니다.</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </section>
                    </section>

                    <section class="customer-tab-panel" data-customer-panel="consult">
                        <div class="customer-two-column">
                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <div>
                                        <h3>상담 이력</h3>
                                        <p class="admin-card__desc">전화/카카오톡/이메일 등 상담 로그를 타임라인 형태로 관리합니다.</p>
                                    </div>
                                    <button type="button" class="admin-btn admin-btn--light admin-btn--sm">상담 추가</button>
                                </div>
                                <div class="admin-card__body">
                                    <div class="customer-timeline">
                                        <?php foreach ($consultLogs as $log): ?>
                                            <article class="customer-timeline-item">
                                                <div class="customer-timeline-item__dot"></div>
                                                <div class="customer-timeline-item__content">
                                                    <div class="customer-timeline-item__meta">
                                                        <strong><?= e($log['type']) ?></strong>
                                                        <span><?= e($log['date']) ?></span>
                                                    </div>
                                                    <div class="customer-timeline-item__sub">
                                                        <span><?= e($log['channel']) ?></span>
                                                        <span>담당자 <?= e($log['manager']) ?></span>
                                                    </div>
                                                    <p><?= e($log['summary']) ?></p>
                                                    <div class="customer-inline-row">
                                                        <span class="admin-chip admin-chip--gray">다음 액션: <?= e($log['next_action']) ?></span>
                                                        <?php
                                                        $statusClass = 'admin-chip';
                                                        $statusLabel = '진행중';
                                                        if (($log['status'] ?? '') === 'done') {
                                                            $statusClass = 'admin-chip admin-chip--success';
                                                            $statusLabel = '완료';
                                                        } elseif (($log['status'] ?? '') === 'warning') {
                                                            $statusClass = 'admin-chip admin-chip--warning';
                                                            $statusLabel = '주의';
                                                        }
                                                        ?>
                                                        <span class="<?= e($statusClass) ?>"><?= e($statusLabel) ?></span>
                                                    </div>
                                                </div>
                                            </article>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </section>

                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <h3>상담 입력</h3>
                                </div>
                                <div class="admin-card__body customer-side-stack">
                                    <div class="admin-field">
                                        <label class="admin-label">상담 유형</label>
                                        <select class="admin-select">
                                            <option>예약상담</option>
                                            <option>일정변경</option>
                                            <option>견적안내</option>
                                            <option>클레임</option>
                                            <option>재예약 유도</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">채널</label>
                                        <select class="admin-select">
                                            <option>전화</option>
                                            <option>카카오톡</option>
                                            <option>문자</option>
                                            <option>이메일</option>
                                        </select>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">상담 내용</label>
                                        <textarea class="admin-textarea" rows="6" placeholder="상담 내용을 입력하세요."></textarea>
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">다음 액션</label>
                                        <input type="text" class="admin-input" placeholder="예: 견적안 재발송 / 3일 후 리마인드">
                                    </div>

                                    <div class="customer-form-actions">
                                        <button type="button" class="admin-btn admin-btn--light">초기화</button>
                                        <button type="button" class="admin-btn admin-btn--primary">상담 저장</button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </section>

                    <section class="customer-tab-panel" data-customer-panel="campaign">
                        <div class="customer-two-column">
                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <div>
                                        <h3>추천 캠페인</h3>
                                        <p class="admin-card__desc">고객 등급과 세그먼트를 기준으로 자동 추천되는 데모 카드입니다.</p>
                                    </div>
                                </div>
                                <div class="admin-card__body">
                                    <div class="customer-campaign-recommend">
                                        <div class="customer-campaign-recommend__badge"><?= e($recommendedCoupon['badge']) ?></div>
                                        <strong><?= e($recommendedCoupon['title']) ?></strong>
                                        <p><?= e($recommendedCoupon['desc']) ?></p>
                                        <div class="customer-inline-row">
                                            <span class="<?= e(admin_customer_segment_class($customer['segment'] ?? '')) ?>">
                                                <?= e(admin_customer_segment_label($customer['segment'] ?? '')) ?>
                                            </span>
                                            <span class="<?= e(admin_customer_grade_class($customer['grade'] ?? '')) ?>">
                                                <?= e(admin_customer_grade_label($customer['grade'] ?? '')) ?>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="customer-campaign-form">
                                        <div class="customer-form-grid">
                                            <div class="admin-field">
                                                <label class="admin-label">발송 채널</label>
                                                <select class="admin-select">
                                                    <option>카카오 알림톡</option>
                                                    <option>문자</option>
                                                    <option>이메일</option>
                                                </select>
                                            </div>

                                            <div class="admin-field">
                                                <label class="admin-label">발송 시점</label>
                                                <select class="admin-select">
                                                    <option>즉시 발송</option>
                                                    <option>내일 오전 10시</option>
                                                    <option>이번 주 금요일 18시</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="admin-field">
                                            <label class="admin-label">캠페인 제목</label>
                                            <input type="text" class="admin-input" value="<?= e($recommendedCoupon['title']) ?>">
                                        </div>

                                        <div class="admin-field">
                                            <label class="admin-label">메시지</label>
                                            <textarea class="admin-textarea" rows="6"><?= e($customer['name']) ?> 고객님, 최근 선호하셨던 일정 기준으로 추천 상품과 혜택을 안내드립니다.</textarea>
                                        </div>

                                        <div class="customer-form-actions">
                                            <button type="button" class="admin-btn admin-btn--light">미리보기</button>
                                            <button type="button" class="admin-btn admin-btn--primary">발송 예약</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="admin-card">
                                <div class="admin-card__head">
                                    <h3>최근 캠페인 이력</h3>
                                </div>
                                <div class="admin-card__body">
                                    <div class="customer-campaign-history">
                                        <?php foreach ($campaignHistory as $item): ?>
                                            <article class="customer-campaign-history__item">
                                                <div class="customer-campaign-history__meta">
                                                    <strong><?= e($item['title']) ?></strong>
                                                    <span><?= e($item['date']) ?></span>
                                                </div>
                                                <div class="customer-campaign-history__sub">
                                                    <span><?= e($item['channel']) ?></span>
                                                    <span><?= e($item['audience']) ?></span>
                                                </div>
                                                <div class="customer-inline-row">
                                                    <span class="<?= e($item['result_class']) ?>"><?= e($item['result']) ?></span>
                                                </div>
                                            </article>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </section>
                </div>
            <?php endif; ?>
        </div>
    </main>
</div>

<?php if ($customer): ?>
<div class="customer-modal" id="customerNoteModal" aria-hidden="true">
    <div class="customer-modal__backdrop" data-modal-close></div>
    <div class="customer-modal__dialog customer-modal__dialog--md">
        <div class="customer-modal__head">
            <div>
                <h3>고객 메모 편집</h3>
                <p><?= e($customer['name']) ?> 고객의 운영 메모를 수정하는 데모 화면입니다.</p>
            </div>
            <button type="button" class="customer-modal__close" data-modal-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>
        <div class="customer-modal__body">
            <div class="admin-field">
                <label class="admin-label">메모</label>
                <textarea class="admin-textarea" rows="10"><?= e($customer['memo'] ?? '') ?></textarea>
            </div>

            <div class="customer-form-actions">
                <button type="button" class="admin-btn admin-btn--light" data-modal-close>취소</button>
                <button type="button" class="admin-btn admin-btn--primary">저장</button>
            </div>
        </div>
    </div>
</div>

<div class="customer-modal" id="customerCampaignModal" aria-hidden="true">
    <div class="customer-modal__backdrop" data-modal-close></div>
    <div class="customer-modal__dialog customer-modal__dialog--md">
        <div class="customer-modal__head">
            <div>
                <h3>캠페인 발송</h3>
                <p>개별 고객 발송용 빠른 실행 팝업입니다.</p>
            </div>
            <button type="button" class="customer-modal__close" data-modal-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>
        <div class="customer-modal__body">
            <div class="customer-form-grid">
                <div class="admin-field">
                    <label class="admin-label">채널</label>
                    <select class="admin-select">
                        <option>카카오 알림톡</option>
                        <option>문자</option>
                        <option>이메일</option>
                    </select>
                </div>
                <div class="admin-field">
                    <label class="admin-label">쿠폰 유형</label>
                    <select class="admin-select">
                        <option><?= e($recommendedCoupon['title']) ?></option>
                        <option>프리미엄 객실 업그레이드</option>
                        <option>재예약 감사 쿠폰</option>
                    </select>
                </div>
            </div>

            <div class="admin-field">
                <label class="admin-label">메시지</label>
                <textarea class="admin-textarea" rows="7"><?= e($customer['name']) ?> 고객님, 고객님께 맞춘 혜택을 준비했습니다. 자세한 일정과 조건은 관리자에게 문의해 주세요.</textarea>
            </div>

            <div class="customer-form-actions">
                <button type="button" class="admin-btn admin-btn--light" data-modal-close>취소</button>
                <button type="button" class="admin-btn admin-btn--primary">발송하기</button>
            </div>
        </div>
    </div>
</div>

<div class="customer-drawer" id="customerGradeDrawer" aria-hidden="true">
    <div class="customer-drawer__backdrop" data-drawer-close></div>
    <div class="customer-drawer__panel">
        <div class="customer-drawer__head">
            <div>
                <h3>고객 등급 변경</h3>
                <p><?= e($customer['name']) ?> 고객의 등급과 세그먼트를 조정합니다.</p>
            </div>
            <button type="button" class="customer-modal__close" data-drawer-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>

        <div class="customer-drawer__body">
            <div class="admin-field">
                <label class="admin-label">현재 등급</label>
                <div class="customer-static-box">
                    <span class="<?= e(admin_customer_grade_class($customer['grade'] ?? '')) ?>">
                        <?= e(admin_customer_grade_label($customer['grade'] ?? '')) ?>
                    </span>
                </div>
            </div>

            <div class="admin-field">
                <label class="admin-label">변경 등급</label>
                <div class="customer-radio-grid">
                    <?php foreach (admin_customer_grade_options() as $value => $label): ?>
                        <label class="customer-radio-card">
                            <input type="radio" name="customer_grade_demo" value="<?= e($value) ?>" <?= ($customer['grade'] ?? '') === $value ? 'checked' : '' ?>>
                            <span class="<?= e(admin_customer_grade_class($value)) ?>"><?= e($label) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="admin-field">
                <label class="admin-label">세그먼트</label>
                <div class="customer-radio-grid">
                    <?php foreach (admin_customer_segment_options() as $value => $label): ?>
                        <label class="customer-radio-card">
                            <input type="radio" name="customer_segment_demo" value="<?= e($value) ?>" <?= ($customer['segment'] ?? '') === $value ? 'checked' : '' ?>>
                            <span class="<?= e(admin_customer_segment_class($value)) ?>"><?= e($label) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="admin-field">
                <label class="admin-label">변경 사유</label>
                <textarea class="admin-textarea" rows="6" placeholder="예: 최근 3회 예약 완료 및 누적 결제액 기준으로 Gold 승급"></textarea>
            </div>
        </div>

        <div class="customer-drawer__foot">
            <button type="button" class="admin-btn admin-btn--light" data-drawer-close>취소</button>
            <button type="button" class="admin-btn admin-btn--primary">등급 저장</button>
        </div>
    </div>
</div>
<?php endif; ?>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>