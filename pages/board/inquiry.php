<?php

$pageTitle = '1:1 문의';

$pageCss = [
    'assets/css/pages/board/inquiry.css',
];

$pageJs = [
    'assets/js/pages/board/inquiry.js',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="iq-page">
    <div class="container">
        <div class="iq-wrap">

            <section class="iq-hero">
                <p class="iq-eyebrow">CONTACT SUPPORT</p>
                <h1 class="iq-title">1:1 문의</h1>
                <p class="iq-desc">
                    예약, 결제, 취소/환불, 서비스 이용 중 불편사항까지
                    문의 내용을 남겨주시면 확인 후 순차적으로 답변드려요.
                </p>

                <div class="iq-meta">
                    <span class="iq-meta__item">
                    <span class="material-symbols-rounded">
schedule
</span>
                        평균 1~2영업일 내 답변
                    </span>
                    <span class="iq-meta__item">
                    <span class="material-symbols-rounded">
shield
</span>
                        개인정보 보호 처리
                    </span>
                    <span class="iq-meta__item">
                    <span class="material-symbols-rounded">
attach_file
</span>
                        파일 첨부 가능
                    </span>
                </div>
            </section>

            <section class="iq-card">
                <div class="iq-card__head">
                    <div>
                        <h2 class="iq-card__title">문의 작성</h2>
                        <p class="iq-card__desc">
                            정확한 확인을 위해 문의 유형과 내용을 자세히 작성해주세요.
                        </p>
                    </div>
                </div>

                <form class="iq-form" method="post" action="/pages/board/inquiry-submit.php" enctype="multipart/form-data">
                    <div class="iq-form-grid">

                        <div class="iq-group">
                            <label class="iq-label" for="iqCategory">
                                문의 유형
                                <span class="iq-label__required">*</span>
                            </label>
                            <select class="iq-field" id="iqCategory" name="category" required>
                                <option value="">선택하세요</option>
                                <option value="예약">예약</option>
                                <option value="결제">결제</option>
                                <option value="취소/환불">취소/환불</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>

                        <div class="iq-group">
                            <label class="iq-label" for="iqEmail">
                                이메일
                                <span class="iq-label__required">*</span>
                            </label>
                            <input
                                class="iq-field"
                                type="email"
                                id="iqEmail"
                                name="email"
                                placeholder="답변 받을 이메일을 입력하세요"
                                required
                            >
                        </div>

                        <div class="iq-group iq-group--full">
                            <label class="iq-label" for="iqTitle">
                                제목
                                <span class="iq-label__required">*</span>
                            </label>
                            <input
                                class="iq-field"
                                type="text"
                                id="iqTitle"
                                name="title"
                                placeholder="문의 제목을 입력하세요"
                                required
                            >
                            <p class="iq-help">제목은 최소 3자 이상 입력해주세요.</p>
                        </div>

                        <div class="iq-group iq-group--full">
                            <label class="iq-label" for="iqContent">
                                문의 내용
                                <span class="iq-label__required">*</span>
                            </label>
                            <textarea
                                class="iq-field"
                                id="iqContent"
                                name="content"
                                rows="6"
                                placeholder="문의하실 내용을 자세히 입력해주세요"
                                required
                            ></textarea>
                            <p class="iq-help">예약 정보, 이용 일자, 불편사항 등을 함께 적어주시면 더 빠르게 확인할 수 있어요.</p>
                        </div>

                        <div class="iq-group">
                            <label class="iq-label" for="iqPhone">연락처</label>
                            <input
                                class="iq-field"
                                type="text"
                                id="iqPhone"
                                name="phone"
                                placeholder="예: 010-1234-5678"
                            >
                        </div>

                        <div class="iq-group">
                            <label class="iq-label" for="iqFile">첨부파일</label>
                            <div class="iq-file">
                                <div class="iq-file__box">
                                    <span class="iq-file__icon">
                                    <span class="material-symbols-rounded">
upload
</span>
                                    </span>

                                    <div class="iq-file__text">
                                        <strong class="iq-file__title">파일 업로드</strong>
                                        <span class="iq-file__name">선택된 파일 없음</span>
                                    </div>

                                    <input
                                        type="file"
                                        id="iqFile"
                                        name="file"
                                    >
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="iq-divider"></div>

                    <div class="iq-agree">
                        <div class="iq-check">
                            <input type="checkbox" id="iqAgree" name="agree" required>
                            <label for="iqAgree">개인정보 수집 및 이용에 동의합니다.</label>
                        </div>
                        <p class="iq-agree__caption">
                            문의 처리 및 답변 안내를 위한 최소한의 개인정보만 수집하며,
                            관련 법령 및 내부 정책에 따라 안전하게 보호됩니다.
                        </p>
                    </div>

                    <div class="iq-actions">
                        <button type="submit" class="iq-submit">
                        <span class="material-symbols-rounded">
send
</span>
                            문의하기
                        </button>
                    </div>

                    <div class="iq-note">
                        <p class="iq-note__title">문의 전 확인해주세요</p>
                        <ul class="iq-note__list">
                            <li>예약/결제 관련 문의는 예약자명 또는 이용일 정보를 함께 적어주세요.</li>
                            <li>취소/환불 문의는 결제일과 결제수단을 함께 남겨주시면 확인이 빨라집니다.</li>
                            <li>파일 첨부 시 화면 캡처나 관련 자료를 함께 올리면 더 정확한 안내가 가능합니다.</li>
                        </ul>
                    </div>
                </form>
            </section>

        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>