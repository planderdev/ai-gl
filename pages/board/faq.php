<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/faq-data.php';

$category = $_GET['cat'] ?? '전체';
$search = trim($_GET['q'] ?? '');

$cats = ['전체','골프','예약','결제','클럽대여','송영'];

/* 필터 */
$filtered = array_values(array_filter($faqData, function($f) use ($category, $search){
    if ($category !== '전체' && ($f['category'] ?? '') !== $category) {
        return false;
    }

    if ($search !== '') {
        $question = $f['question'] ?? '';
        $answer = trim(strip_tags($f['answer'] ?? ''));

        if (
            stripos($question, $search) === false &&
            stripos($answer, $search) === false
        ) {
            return false;
        }
    }

    return true;
}));

$pageCss = [
    'assets/css/pages/board/faq.css',
];

$pageJs = [
    'assets/js/pages/board/faq.js',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="fq-page">
    <div class="container">

        <section class="fq-hero">
            <div class="fq-hero__inner">
                <div class="fq-hero__text">
                    <p class="fq-hero__eyebrow">HELP CENTER</p>
                    <h1 class="fq-title">자주 묻는 질문</h1>
                    <p class="fq-hero__desc">
                        예약, 결제, 클럽 대여, 송영 서비스까지
                        고객님이 가장 많이 문의하시는 내용을 빠르게 찾아보세요.
                    </p>
                </div>

                <div class="fq-hero__search">
                    <form class="fq-search" method="get" autocomplete="off">
                        <input type="hidden" name="cat" value="<?= htmlspecialchars($category) ?>">

                        <label class="screen-out" for="faqSearchInput">FAQ 검색</label>
                        <div class="fq-search__field">
                            <span class="fq-search__icon" aria-hidden="true">
                                <span class="material-symbols-rounded">search</span>
                            </span>
                            <input
                                id="faqSearchInput"
                                type="text"
                                name="q"
                                placeholder="궁금한 내용을 검색하세요"
                                value="<?= htmlspecialchars($search) ?>"
                            >
                            <?php if ($search !== ''): ?>
                                <a
                                    href="?cat=<?= urlencode($category) ?>"
                                    class="fq-search__clear"
                                    aria-label="검색어 지우기"
                                >
                                    <span class="material-symbols-rounded">close</span>
                                </a>
                            <?php endif; ?>
                        </div>

                        <button type="submit" class="fq-search__submit">검색</button>
                    </form>

                    <div class="fq-autocomplete"></div>

                    <div class="fq-search-meta">
                        <div class="fq-search-meta__left">
                            <strong><?= count($filtered) ?></strong>개의 질문이 검색되었습니다.
                        </div>
                        <?php if ($search !== ''): ?>
                            <div class="fq-search-meta__right">
                                <span class="fq-search-keyword">“<?= htmlspecialchars($search) ?>”</span>
                                검색 결과
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>

        <script>
            const FAQ_DATA = <?= json_encode(array_values($faqData), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
        </script>

        <section class="fq-section">
            <div class="fq-tabs" role="tablist" aria-label="FAQ 카테고리">
                <?php foreach ($cats as $cat): ?>
                    <a
                        href="?cat=<?= urlencode($cat) ?>&q=<?= urlencode($search) ?>"
                        class="fq-tab <?= $category === $cat ? 'active' : '' ?>"
                        aria-selected="<?= $category === $cat ? 'true' : 'false' ?>"
                    >
                        <span><?= htmlspecialchars($cat) ?></span>
                    </a>
                <?php endforeach; ?>
            </div>

            <div class="fq-list">
                <?php if (empty($filtered)): ?>
                    <div class="fq-empty">
                        <div class="fq-empty__icon">
                            <span class="material-symbols-rounded">help</span>
                        </div>
                        <strong>검색 결과가 없습니다.</strong>
                        <p>다른 키워드로 검색하거나 카테고리를 변경해보세요.</p>
                    </div>
                <?php endif; ?>

                <?php foreach ($filtered as $index => $faq): ?>
                    <?php
                    $faqId = 'faq-item-' . $index;
                    $answerId = 'faq-answer-' . $index;
                    ?>
                    <article class="fq-item" id="<?= $faqId ?>">
                        <button
                            type="button"
                            class="fq-question"
                            aria-expanded="false"
                            aria-controls="<?= $answerId ?>"
                        >
                            <div class="fq-question__main">
                                <span class="fq-badge">Q</span>
                                <span class="fq-q"><?= htmlspecialchars($faq['question'] ?? '') ?></span>
                            </div>

                            <div class="fq-right">
                                <span class="fq-cat"><?= htmlspecialchars($faq['category'] ?? '') ?></span>
                                <span class="fq-icon" aria-hidden="true">
                                    <span class="material-symbols-rounded">add</span>
                                </span>
                            </div>
                        </button>

                        <div
                            id="<?= $answerId ?>"
                            class="fq-answer"
                            hidden
                        >
                            <div class="fq-answer__inner">
                                <span class="fq-badge fq-badge--answer">A</span>
                                <div class="fq-answer__content">
                                    <?= $faq['answer'] ?? '' ?>
                                </div>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>

    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>