<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/mypage-data.php';

$myPageCurrent = 'notifications';

$pageTitle = '알림설정';
$pageDescription = '캐디스 알림설정';
$pageKeywords = '캐디스, 알림설정, 여행알림';
$pageUrl = 'https://ai-gl.ai/pages/mypage/notifications.php';

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
            <div class="mp-hero__content">
                <span class="mp-section__eyebrow"><?= htmlspecialchars($myPageData['notifications']['hero']['eyebrow']) ?></span>
                <h1 class="mp-hero__title"><?= htmlspecialchars($myPageData['notifications']['hero']['title']) ?></h1>
                <p class="mp-hero__desc"><?= htmlspecialchars($myPageData['notifications']['hero']['desc']) ?></p>
            </div>
        </div>
    </section>

    <section class="mp-section">
        <div class="container">
            <div class="mp-layout">
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/pages/mypage/sidebar.php'; ?>

                <div class="mp-content">
                    <div class="mp-section__head">
                        <div>
                            <span class="mp-section__eyebrow">Settings</span>
                            <h2 class="mp-section__title">알림 수신 설정</h2>
                            <p class="mp-section__desc">필요한 알림만 선택해서 받아보세요.</p>
                        </div>
                    </div>

                    <div class="mp-toggle-list">
                        <?php foreach ($myPageData['notifications']['items'] as $index => $item): ?>
                            <label class="mp-toggle-item">
                                <div>
                                    <strong><?= htmlspecialchars($item['title']) ?></strong>
                                    <p><?= htmlspecialchars($item['desc']) ?></p>
                                </div>

                                <input type="checkbox" <?= $item['checked'] ? 'checked' : '' ?>>
                                <span class="mp-switch"></span>
                            </label>
                        <?php endforeach; ?>

                        <div class="mp-empty mp-empty--notification mp-empty--compact" data-aos="fade-up" data-aos-duration="700">
                        <div class="mp-empty__icon">
                            <i class="ri-notification-3-line" aria-hidden="true"></i>
                        </div>
                        <h3 class="mp-empty__title">설정 가능한 알림이 없어요</h3>
                        <p class="mp-empty__desc">새로운 여행 일정이나 혜택이 준비되면 이곳에서 수신 설정을 관리할 수 있어요.</p>
                    </div>
                    
                    </div> 

                    <div class="mp-btn-group">
                        <button type="button" class="mp-btn mp-btn--dark mp-notification-save">설정 저장</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>