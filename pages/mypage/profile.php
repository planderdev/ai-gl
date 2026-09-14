<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'profile';

$pageTitle = '내 정보';
$pageDescription = '캐디스 내 정보';
$pageKeywords = '캐디스, 내정보, 회원정보';
$pageUrl = 'https://ai-gl.ai/pages/mypage/profile.php';

$pageCss = [
    'assets/css/pages/mypage/main.css',
];

$pageJs = [
    'assets/js/pages/mypage/main.js',
];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="mp-page">
    <section class="mp-hero">
        <div class="container">
            <div class="mp-hero__content" data-aos="fade-up" data-aos-duration="700">
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['profile']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= htmlspecialchars($myPageData['profile']['hero']['title']) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['profile']['hero']['desc']) ?></p>
            </div>
        </div>
    </section>

    <section class="mp-section">
        <div class="container">
            <div class="mp-layout">
                <div data-aos="fade-right" data-aos-duration="700">
                    <?php include $_SERVER['DOCUMENT_ROOT'] . '/pages/mypage/sidebar.php'; ?>
                </div>

                <div class="mp-content">
                    <section class="mp-surface" data-aos="fade-up" data-aos-duration="700">
                        <div class="mp-section__head">
                            <div class="mp-section__head-main">
                                <span class="mp-section__eyebrow">Profile</span>
                                <h2 class="mp-section__title">기본 정보</h2>
                                <p class="mp-section__desc">예약과 상담에 필요한 회원 정보를 관리하세요.</p>
                            </div>
                        </div>

                        <form class="mp-form">
                            <div class="mp-form__grid">
                                <div class="mp-field">
                                    <label for="userName">이름</label>
                                    <input type="text" id="userName" value="<?= htmlspecialchars($myPageData['user']['name']) ?>">
                                </div>

                                <div class="mp-field">
                                    <label for="userBirth">생년월일</label>
                                    <input type="text" id="userBirth" value="<?= htmlspecialchars($myPageData['user']['birth']) ?>">
                                </div>

                                <div class="mp-field">
                                    <label for="userEmail">이메일</label>
                                    <input type="email" id="userEmail" value="<?= htmlspecialchars($myPageData['user']['email']) ?>">
                                </div>

                                <div class="mp-field">
                                    <label for="userPhone">휴대폰 번호</label>
                                    <input type="text" id="userPhone" value="<?= htmlspecialchars($myPageData['user']['phone']) ?>">
                                </div>

                                <div class="mp-field mp-field--full">
                                    <label for="userAddress">주소</label>
                                    <input type="text" id="userAddress" value="<?= htmlspecialchars($myPageData['user']['address']) ?>">
                                </div>

                                <div class="mp-field mp-field--full">
                                    <label for="userMemo">요청사항</label>
                                    <textarea id="userMemo" rows="5" placeholder="선호 지역, 여행 스타일, 상담 요청 내용을 입력해 주세요."></textarea>
                                </div>
                            </div>

                            <div class="mp-btn-group">
                                <button type="button" class="mp-btn mp-btn--line">취소</button>
                                <button type="submit" class="mp-btn mp-btn--dark">정보 저장</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>