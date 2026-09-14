<?php

$pageTitle = '문의 접수 완료';

$pageCss = [
    'assets/css/pages/board/inquiry-complete.css',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';

/* 실제 저장 연동 전까지는 임시 더미값 */
$submittedCategory = $_GET['category'] ?? '일반 문의';
$submittedEmail = $_GET['email'] ?? 'example@email.com';
$submittedDate = date('Y.m.d H:i');
$inquiryNumber = 'IQ-' . date('Ymd') . '-' . mt_rand(1000, 9999);
?>

<main class="iqc-page">
    <div class="container">
        <div class="iqc-wrap">
            <section class="iqc-card">
                <div class="iqc-icon" aria-hidden="true">
                <span class="material-symbols-rounded">
check
</span>
                </div>

                <div class="iqc-head">
                    <p class="iqc-eyebrow">INQUIRY RECEIVED</p>
                    <h1 class="iqc-title">문의가 정상적으로 접수되었어요</h1>
                    <p class="iqc-desc">
                        남겨주신 내용을 확인한 뒤 순차적으로 답변드릴게요.
                        답변은 입력하신 이메일 또는 고객 응대 채널을 통해 안내됩니다.
                    </p>
                </div>

                <div class="iqc-info">
                    <div class="iqc-info__row">
                        <div class="iqc-info__label">문의번호</div>
                        <div class="iqc-info__value"><?= htmlspecialchars($inquiryNumber) ?></div>
                    </div>
                    <div class="iqc-info__row">
                        <div class="iqc-info__label">문의유형</div>
                        <div class="iqc-info__value"><?= htmlspecialchars($submittedCategory) ?></div>
                    </div>
                    <div class="iqc-info__row">
                        <div class="iqc-info__label">답변 받을 이메일</div>
                        <div class="iqc-info__value"><?= htmlspecialchars($submittedEmail) ?></div>
                    </div>
                    <div class="iqc-info__row">
                        <div class="iqc-info__label">접수일시</div>
                        <div class="iqc-info__value"><?= htmlspecialchars($submittedDate) ?></div>
                    </div>
                </div>

                <div class="iqc-note">
                    <p class="iqc-note__title">안내사항</p>
                    <ul class="iqc-note__list">
                        <li>일반적으로 1~2영업일 내 답변드리고 있어요.</li>
                        <li>예약/결제/환불 관련 문의는 확인에 조금 더 시간이 걸릴 수 있어요.</li>
                        <li>입력하신 이메일 주소가 정확한지 다시 확인해주세요.</li>
                    </ul>
                </div>

                <div class="iqc-actions">
                    <a href="/pages/board/inquiry.php" class="iqc-btn iqc-btn--ghost">
                    <span class="material-symbols-rounded">
edit_document
</span>
                        새 문의 작성
                    </a>
                    <a href="/" class="iqc-btn iqc-btn--primary">
                    <span class="material-symbols-rounded">
home
</span>
                        홈으로 이동
                    </a>
                </div>
            </section>
        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>