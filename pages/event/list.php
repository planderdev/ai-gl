<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/event-data.php';

$pageTitle = '캐디스 AI │ 기획전';
$pageDescription = '진행 중인 기획전과 시즌 특가를 한눈에 확인해보세요.';
$pageKeywords = '프로모션, 기획전, 골프 프로모션, 여행 특가, 캐디스 AI';
$pageUrl = 'https://ai-gl.ai/pages/event/list.php';

$pageCss = [
    'assets/css/pages/event/list.css',
];

$pageJs = [
    'assets/js/pages/event/list.js',
];

include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="pr-page">
    <div class="pr-container">

        <nav class="breadcrumb" aria-label="breadcrumb">
            <?php foreach ($eventPageData['breadcrumbs'] as $index => $crumb): ?>
                <span><?= htmlspecialchars($crumb) ?></span>
                <?php if ($index !== array_key_last($eventPageData['breadcrumbs'])): ?>
                    <span class="breadcrumb__sep">/</span>
                <?php endif; ?>
            <?php endforeach; ?>
        </nav>

        <header class="pr-page-head">
            <div class="pr-page-head__main">
                <h1><?= htmlspecialchars($eventPageData['page_title']) ?></h1>
                <p class="pr-page-head__desc"><?= htmlspecialchars($eventPageData['page_subtitle']) ?></p>
            </div>

            <div class="pr-page-head__meta">
                <span class="pr-page-head__chip">
                    총 <?= number_format(count($eventPageData['events'])) ?>개 프로모션
                </span>
                <span class="pr-page-head__chip">
                    <?= htmlspecialchars($eventPageData['summary']['status_label']) ?>
                </span>
            </div>
        </header>

        <?php if (!empty($eventPageData['featured_events'])): ?>
            <section class="pr-featured" aria-label="주요 프로모션">
                <div class="pr-featured__head">
                    <h2 class="pr-featured__heading">추천 프로모션</h2>
                </div>

                <div class="pr-featured__grid">
                    <?php foreach ($eventPageData['featured_events'] as $featured): ?>
                        <a href="<?= htmlspecialchars($featured['detail_url']) ?>" class="pr-featured-card">
                            <div class="pr-featured-card__thumb">
                                <img src="<?= htmlspecialchars($featured['image']) ?>" alt="<?= htmlspecialchars($featured['title']) ?>">
                                <div class="pr-featured-card__overlay"></div>

                                <div class="pr-featured-card__content">
                                    <?php if (!empty($featured['badge'])): ?>
                                        <span class="pr-featured-card__badge"><?= htmlspecialchars($featured['badge']) ?></span>
                                    <?php endif; ?>

                                    <?php if (!empty($featured['subtitle'])): ?>
                                        <p class="pr-featured-card__subtitle"><?= htmlspecialchars($featured['subtitle']) ?></p>
                                    <?php endif; ?>

                                    <h3 class="pr-featured-card__title"><?= htmlspecialchars($featured['title']) ?></h3>
                                </div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

        <section class="pr-category-tabs" aria-label="프로모션 상태 탭">
            <div class="pr-category-tabs__inner" id="prQuickTabs">
                <?php foreach ($eventPageData['quick_tabs'] as $tabIndex => $tab): ?>
                    <button
                        type="button"
                        class="pr-category-tab <?= $tabIndex === 0 ? 'is-active' : '' ?>"
                        data-quick-status="<?= htmlspecialchars($tab['value']) ?>"
                    >
                        <?= htmlspecialchars($tab['label']) ?>
                    </button>
                <?php endforeach; ?>
            </div>
        </section>

        <div class="pr-layout">
            <div class="pr-filter-mobile-bar">
                <button
                    type="button"
                    class="pr-filter-mobile-btn"
                    id="prFilterOpen"
                    aria-controls="prFilter"
                    aria-expanded="false"
                >
                    <i class="ri-equalizer-line" aria-hidden="true"></i>
                    <span>필터</span>
                </button>
            </div>

            <div class="pr-filter-modal" id="prFilterModal" aria-hidden="true">
                <div class="pr-filter-modal__backdrop" data-filter-close></div>
            </div>

            <aside class="pr-filter" id="prFilter">
                <div class="pr-filter-modal__top">
                    <strong class="pr-filter-modal__title" id="prFilterModalTitle">필터</strong>

                    <button
                        type="button"
                        class="pr-filter-modal__close"
                        data-filter-close
                        aria-label="필터 닫기"
                    >
                        <i class="ri-close-line" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="pr-filter__head">
                    <strong class="pr-filter__title">필터</strong>
                    <button type="button" class="pr-filter__reset" id="prFilterReset">초기화</button>
                </div>
                <div class="pr-filter__body">
                <div class="pr-filter-group">
                    <h3 class="pr-filter-group__title">카테고리</h3>
                    <div class="pr-filter-checks">
                        <?php foreach ($eventPageData['filters']['categories'] as $category): ?>
                            <label class="pr-check">
                                <input
                                    type="checkbox"
                                    class="pr-filter-category"
                                    value="<?= htmlspecialchars($category['label']) ?>"
                                    <?= !empty($category['checked']) ? 'checked' : '' ?>
                                >
                                <span><?= htmlspecialchars($category['label']) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="pr-filter-group">
                    <h3 class="pr-filter-group__title">상태</h3>
                    <div class="pr-filter-checks">
                        <?php foreach ($eventPageData['filters']['status'] as $status): ?>
                            <label class="pr-check">
                                <input
                                    type="checkbox"
                                    class="pr-filter-status"
                                    value="<?= htmlspecialchars($status['label']) ?>"
                                    <?= !empty($status['checked']) ? 'checked' : '' ?>
                                >
                                <span><?= htmlspecialchars($status['label']) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
                </div>
                <div class="pr-filter-modal__actions">
                    <button type="button" class="pr-filter-mobile-reset pr-filter__reset" id="prFilterResetMobile">초기화</button>
                    <button type="button" class="pr-filter-mobile-apply" data-filter-close>필터 적용</button>
                </div>
            </aside>

            <section class="pr-content">
                <div class="pr-list-head">
                    <strong class="pr-list-head__count">
                        프로모션 <span id="prVisibleCount"><?= count($eventPageData['events']) ?></span>개
                    </strong>

                    <div class="pr-list-head__sort">
                        <button type="button" class="pr-sort-btn is-active" data-sort="latest">최신순</button>
                        <button type="button" class="pr-sort-btn" data-sort="ending">종료임박순</button>
                        <button type="button" class="pr-sort-btn" data-sort="title">이름순</button>
                    </div>
                </div>

                <div class="pr-empty" id="prEmptyState" hidden>조건에 맞는 프로모션이 없습니다.</div>

                <div class="pr-list" id="prList">
                    <?php foreach ($eventPageData['events'] as $index => $item): ?>
                        <article
                            class="pr-card"
                            data-index="<?= $index ?>"
                            data-title="<?= htmlspecialchars($item['title']) ?>"
                            data-category="<?= htmlspecialchars($item['category']) ?>"
                            data-status="<?= htmlspecialchars($item['status_label']) ?>"
                            data-start-date="<?= htmlspecialchars($item['start_date']) ?>"
                            data-end-date="<?= htmlspecialchars($item['end_date']) ?>"
                            data-sort-order="<?= (int) $item['sort_order'] ?>"
                        >
                            <a href="<?= htmlspecialchars($item['detail_url']) ?>" class="pr-card__thumb">
                                <img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['title']) ?>">
                                <div class="pr-card__overlay"></div>

                                <div class="pr-card__visual">
                                    <?php if (!empty($item['badge'])): ?>
                                        <span class="pr-card__badge"><?= htmlspecialchars($item['badge']) ?></span>
                                    <?php endif; ?>

                                    <?php if (!empty($item['subtitle'])): ?>
                                        <p class="pr-card__subtitle"><?= htmlspecialchars($item['subtitle']) ?></p>
                                    <?php endif; ?>

                                    <h2 class="pr-card__visual-title"><?= htmlspecialchars($item['title']) ?></h2>
                                </div>
                            </a>

                            <div class="pr-card__body">
                                <p class="pr-card__status"><?= htmlspecialchars($item['status_label']) ?></p>

                                <h3 class="pr-card__title">
                                    <a href="<?= htmlspecialchars($item['detail_url']) ?>">
                                        <?= htmlspecialchars($item['title']) ?>
                                    </a>
                                </h3>

                                <p class="pr-card__date">
                                    <?= htmlspecialchars($item['start_date']) ?> - <?= htmlspecialchars($item['end_date']) ?>
                                </p>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>

                <div class="pagination" id="prPagination"></div>
            </section>
        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>