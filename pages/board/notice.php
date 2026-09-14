<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/notice-data.php';

/* ===============================
   Query
=============================== */
$page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : 1;
$search = trim($_GET['q'] ?? '');
$perPage = 10;

/* ===============================
   Filter
=============================== */
$filtered = array_values(array_filter($noticeData, function ($n) use ($search) {
    if ($search === '') {
        return true;
    }

    $title = $n['title'] ?? '';
    $content = strip_tags($n['content'] ?? '');

    return stripos($title, $search) !== false || stripos($content, $search) !== false;
}));

/* ===============================
   Pinned 분리
=============================== */
$pinned = array_values(array_filter($filtered, fn($n) => !empty($n['is_pinned'])));
$normal = array_values(array_filter($filtered, fn($n) => empty($n['is_pinned'])));

/* ===============================
   Pagination (일반 공지에만 적용)
=============================== */
$total = count($normal);
$totalPages = max(1, (int) ceil($total / $perPage));

if ($page > $totalPages) {
    $page = $totalPages;
}

$start = ($page - 1) * $perPage;
$list = array_slice($normal, $start, $perPage);

/* ===============================
   Page Meta
=============================== */
$pageTitle = '공지사항';

$pageCss = [
    'assets/css/pages/board/notice.css',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="nt-page">
    <div class="container">
        <div class="nt-wrap">

            <section class="nt-hero">
                <p class="nt-eyebrow">NOTICE BOARD</p>
                <h1 class="nt-title">공지사항</h1>
                <p class="nt-desc">
                    서비스 이용에 필요한 안내, 업데이트, 운영 공지를 빠르게 확인해보세요.
                </p>

                <div class="nt-meta">
                    <span class="nt-meta__item">
                    <span class="material-symbols-rounded">notifications</span>
                        총 <?= count($filtered) ?>건
                    </span>
                    <?php if ($search !== ''): ?>
                        <span class="nt-meta__item">
                        <span class="material-symbols-rounded">search</span>
                            “<?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8') ?>” 검색 결과
                        </span>
                    <?php endif; ?>
                </div>

                <form class="nt-search" method="get">
                    <label class="screen-out" for="ntSearchInput">공지 검색</label>

                    <div class="nt-search__field">
                        <span class="nt-search__icon" aria-hidden="true">
                        <span class="material-symbols-rounded">search</span>
                        </span>

                        <input
                            id="ntSearchInput"
                            type="text"
                            name="q"
                            placeholder="제목 또는 내용으로 검색해보세요"
                            value="<?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8') ?>"
                        >

                        <?php if ($search !== ''): ?>
                            <a href="/pages/board/notice.php" class="nt-search__clear" aria-label="검색 초기화">
                            <span class="material-symbols-rounded">close</span>
                            </a>
                        <?php endif; ?>
                    </div>

                    <button type="submit">검색</button>
                </form>
            </section>

            <section class="nt-board-wrap">
                <div class="nt-board-head">
                    <div class="nt-board-head__left">
                        <h2 class="nt-board-title">공지 목록</h2>
                        <p class="nt-board-desc">최신 공지와 중요 공지를 확인할 수 있어요.</p>
                    </div>
                </div>

                <div class="nt-board">
                    <?php if (empty($filtered)): ?>
                        <div class="nt-empty">
                            <div class="nt-empty__icon">
                            <span class="material-symbols-rounded">search_off</span>
                            </div>
                            <strong class="nt-empty__title">검색 결과가 없습니다.</strong>
                            <p class="nt-empty__desc">다른 검색어로 다시 시도해보세요.</p>
                        </div>
                    <?php else: ?>

                        <?php foreach ($pinned as $notice): ?>
                            <a
                                href="/pages/board/notice-detail.php?id=<?= urlencode($notice['id']) ?>"
                                class="nt-item nt-item--pinned"
                            >
                                <div class="nt-left">
                                    <span class="nt-no nt-no--pinned">공지</span>

                                    <div class="nt-subject">
                                        <div class="nt-subject__badges">
                                            <span class="nt-badge nt-badge--pinned">중요</span>
                                            <?php if (!empty($notice['is_new'])): ?>
                                                <span class="nt-badge">NEW</span>
                                            <?php endif; ?>
                                        </div>

                                        <strong class="nt-subject-text">
                                            <?= htmlspecialchars($notice['title'], ENT_QUOTES, 'UTF-8') ?>
                                        </strong>
                                    </div>
                                </div>

                                <div class="nt-date">
                                    <?= htmlspecialchars($notice['date'], ENT_QUOTES, 'UTF-8') ?>
                                </div>
                            </a>
                        <?php endforeach; ?>

                        <?php foreach ($list as $index => $notice): ?>
                            <a
                                href="/pages/board/notice-detail.php?id=<?= urlencode($notice['id']) ?>"
                                class="nt-item"
                            >
                                <div class="nt-left">
                                    <span class="nt-no">
                                        <?= $total - ($start + $index) ?>
                                    </span>

                                    <div class="nt-subject">
                                        <div class="nt-subject__badges">
                                            <?php if (!empty($notice['is_new'])): ?>
                                                <span class="nt-badge">NEW</span>
                                            <?php endif; ?>
                                        </div>

                                        <strong class="nt-subject-text">
                                            <?= htmlspecialchars($notice['title'], ENT_QUOTES, 'UTF-8') ?>
                                        </strong>
                                    </div>
                                </div>

                                <div class="nt-date">
                                    <?= htmlspecialchars($notice['date'], ENT_QUOTES, 'UTF-8') ?>
                                </div>
                            </a>
                        <?php endforeach; ?>

                    <?php endif; ?>
                </div>

                <?php if ($totalPages > 1): ?>
                    <nav class="pagination" aria-label="공지사항 페이지네이션">
                        <?php if ($page > 1): ?>
                            <a
                                href="?page=<?= $page - 1 ?>&q=<?= urlencode($search) ?>"
                                class="pagination__arrow"
                                aria-label="이전 페이지"
                            >
                            <span class="material-symbols-rounded">chevron_left</span>
                            </a>
                        <?php endif; ?>

                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <a
                                href="?page=<?= $i ?>&q=<?= urlencode($search) ?>"
                                class="pagination__link <?= $i === $page ? 'active' : '' ?>"
                                aria-current="<?= $i === $page ? 'page' : 'false' ?>"
                            >
                                <?= $i ?>
                            </a>
                        <?php endfor; ?>

                        <?php if ($page < $totalPages): ?>
                            <a
                                href="?page=<?= $page + 1 ?>&q=<?= urlencode($search) ?>"
                                class="pagination__arrow"
                                aria-label="다음 페이지"
                            >
                            <span class="material-symbols-rounded">
chevron_forward
</span>
                            </a>
                        <?php endif; ?>
                    </nav>
                <?php endif; ?>
            </section>

        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>