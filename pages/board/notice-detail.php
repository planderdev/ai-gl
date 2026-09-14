<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/notice-data.php';

$id = $_GET['id'] ?? 0;
$notice = null;
$currentIndex = null;

/* 현재 글 */
foreach ($noticeData as $i => $n) {
    if ((string) ($n['id'] ?? '') === (string) $id) {
        $notice = $n;
        $currentIndex = $i;
        break;
    }
}

if (!$notice) {
    $pageTitle = '공지사항';
    $pageCss = [
        'assets/css/pages/board/notice-detail.css',
    ];
 
    include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
    ?>
    <main class="nd-page">
        <div class="container">
            <section class="nd-empty">
                <div class="nd-empty__icon">
                    <span class="material-symbols-rounded" aria-hidden="true">warning</span>
                </div>
                <h1 class="nd-empty__title">존재하지 않는 공지입니다.</h1>
                <p class="nd-empty__desc">삭제되었거나 잘못된 경로로 접근하셨어요.</p>
                <div class="nd-empty__actions">
                    <a href="/pages/board/notice.php" class="nd-btn nd-btn--primary">목록으로 이동</a>
                </div>
            </section>
        </div>
    </main>
    <?php
    include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php';
    exit;
}

/* 이전 / 다음 */
$prev = $noticeData[$currentIndex - 1] ?? null;
$next = $noticeData[$currentIndex + 1] ?? null;

$pageTitle = htmlspecialchars($notice['title'] ?? '공지사항', ENT_QUOTES, 'UTF-8');

$pageCss = [
    'assets/css/pages/board/notice-detail.css',
];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/head.php';
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="nd-page">
    <div class="container">
        <div class="nd-wrap">

            <section class="nd-hero">
                <div class="nd-hero__top">
                    <a href="/pages/board/notice.php" class="nd-back">
                        <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>
                        <span>공지사항 목록</span>
                    </a>
                </div>

                <div class="nd-hero__body">
                    <p class="nd-eyebrow">NOTICE</p>

                    <div class="nd-title-wrap">
                        <?php if (!empty($notice['is_pinned'])): ?>
                            <span class="nd-badge nd-badge--pinned">공지</span>
                        <?php endif; ?>

                        <?php if (!empty($notice['is_new'])): ?>
                            <span class="nd-badge">NEW</span>
                        <?php endif; ?>
                    </div>

                    <h1 class="nd-title">
                        <?= htmlspecialchars($notice['title'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                    </h1>

                    <div class="nd-meta">
                        <span class="nd-meta__item">
                            <span class="material-symbols-rounded" aria-hidden="true">calendar_today</span>
                            <?= htmlspecialchars($notice['date'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                        </span>

                        <?php if (!empty($notice['is_pinned'])): ?>
                            <span class="nd-meta__item">
                                <span class="material-symbols-rounded" aria-hidden="true">push_pin</span>
                                중요 공지
                            </span>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

            <article class="nd-card">
                <div class="nd-content">
                    <?= $notice['content'] ?? '' ?>
                </div>
            </article>

            <?php if ($prev || $next): ?>
                <section class="nd-nav-section">
                    <h2 class="nd-section-title">이전 / 다음 글</h2>

                    <div class="nd-nav">
                        <?php if ($prev): ?>
                            <a href="?id=<?= urlencode($prev['id']) ?>" class="nd-nav-item nd-nav-item--prev">
                                <span class="nd-nav-item__label">
                                    <span class="material-symbols-rounded" aria-hidden="true">arrow_upward</span>
                                    이전글
                                </span>
                                <strong class="nd-nav-item__title">
                                    <?= htmlspecialchars($prev['title'], ENT_QUOTES, 'UTF-8') ?>
                                </strong>
                                <span class="nd-nav-item__date">
                                    <?= htmlspecialchars($prev['date'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                                </span>
                            </a>
                        <?php endif; ?>

                        <?php if ($next): ?>
                            <a href="?id=<?= urlencode($next['id']) ?>" class="nd-nav-item nd-nav-item--next">
                                <span class="nd-nav-item__label">
                                    <span class="material-symbols-rounded" aria-hidden="true">arrow_downward</span>
                                    다음글
                                </span>
                                <strong class="nd-nav-item__title">
                                    <?= htmlspecialchars($next['title'], ENT_QUOTES, 'UTF-8') ?>
                                </strong>
                                <span class="nd-nav-item__date">
                                    <?= htmlspecialchars($next['date'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                                </span>
                            </a>
                        <?php endif; ?>
                    </div>
                </section>
            <?php endif; ?>

            <div class="nd-bottom">
                <a href="/pages/board/notice.php" class="nd-btn nd-btn--ghost">
                    <span class="material-symbols-rounded" aria-hidden="true">list_alt</span>
                    <span>목록으로</span>
                </a>
            </div>

        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>