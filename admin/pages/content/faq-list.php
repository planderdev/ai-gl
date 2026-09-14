<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/board/faq-storage.php';

$pageTitle = 'FAQ 관리';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'category' => trim($_GET['category'] ?? ''),
    'visibility' => trim($_GET['visibility'] ?? ''),
    'popular' => trim($_GET['popular'] ?? ''),
];

$faqs = admin_get_faqs();

$filteredFaqs = array_values(array_filter($faqs, function (array $item) use ($filters) {
    $haystack = mb_strtolower(implode(' ', [
        $item['question'] ?? '',
        strip_tags((string)($item['answer'] ?? '')),
        $item['author'] ?? '',
    ]));

    if ($filters['keyword'] !== '' && mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
        return false;
    }

    if ($filters['category'] !== '' && ($item['category'] ?? '') !== $filters['category']) {
        return false;
    }

    if ($filters['visibility'] !== '' && ($item['visibility'] ?? '') !== $filters['visibility']) {
        return false;
    }

    if ($filters['popular'] === 'yes' && empty($item['is_popular'])) {
        return false;
    }

    if ($filters['popular'] === 'no' && !empty($item['is_popular'])) {
        return false;
    }

    return true;
}));

usort($filteredFaqs, function (array $a, array $b) {
    $aPopular = !empty($a['is_popular']) ? 1 : 0;
    $bPopular = !empty($b['is_popular']) ? 1 : 0;

    if ($aPopular !== $bPopular) {
        return $bPopular <=> $aPopular;
    }

    $sortCompare = ((int)($a['sort_order'] ?? 0)) <=> ((int)($b['sort_order'] ?? 0));
    if ($sortCompare !== 0) {
        return $sortCompare;
    }

    return strcmp((string)($b['updated_at'] ?? ''), (string)($a['updated_at'] ?? ''));
});

$stats = admin_faq_summary_stats($faqs);

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip">content MANAGER</span>
                    <h1 class="admin-page-head__title">FAQ 관리</h1>
                    <p class="admin-page-head__desc">자주 묻는 질문의 카테고리, 노출 상태, 정렬 순서, 인기 FAQ 여부를 관리하는 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/faq-form.php')) ?>" class="admin-btn admin-btn--primary">
                        <i class="ri-add-line"></i>
                        FAQ 등록
                    </a>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="content-summary-grid">
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">전체 FAQ</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['total']) ?></strong>
                            <p class="content-summary-card__meta">등록된 전체 질문 수</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">노출중</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['visible']) ?></strong>
                            <p class="content-summary-card__meta">사용자 페이지 노출 FAQ</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">비노출</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['hidden']) ?></strong>
                            <p class="content-summary-card__meta">관리 전용 숨김 항목</p>
                        </article>
                        <article class="content-summary-card content-summary-card--warning">
                            <span class="content-summary-card__label">인기 FAQ</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['popular']) ?></strong>
                            <p class="content-summary-card__meta">우선 노출용 FAQ</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">최대 정렬순서</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['max_sort']) ?></strong>
                            <p class="content-summary-card__meta">현재 리스트 기준</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="admin-card">
                <div class="admin-card__body">
                    <form method="get" class="content-filter-form">
                        <div class="content-filter-grid">
                            <div class="admin-field content-filter-grid__keyword">
                                <label class="admin-label">검색어</label>
                                <input
                                    type="text"
                                    name="keyword"
                                    class="admin-input"
                                    value="<?= e($filters['keyword']) ?>"
                                    placeholder="질문, 답변, 작성자 검색"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">카테고리</label>
                                <select name="category" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_faq_category_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['category'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">노출 상태</label>
                                <select name="visibility" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_faq_visibility_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['visibility'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">인기 FAQ</label>
                                <select name="popular" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="yes" <?= $filters['popular'] === 'yes' ? 'selected' : '' ?>>인기만</option>
                                    <option value="no" <?= $filters['popular'] === 'no' ? 'selected' : '' ?>>일반만</option>
                                </select>
                            </div>
                        </div>

                        <div class="content-filter-actions">
                            <a href="<?= e(admin_url('pages/content/faq-list.php')) ?>" class="admin-btn admin-btn--light">초기화</a>
                            <button type="submit" class="admin-btn admin-btn--primary">검색</button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card content-table-card">
                <div class="admin-card__head content-table-card__head">
                    <div>
                        <h3>FAQ 리스트</h3>
                        <p class="content-table-card__meta">총 <?= number_format(count($filteredFaqs)) ?>건</p>
                    </div>
                </div>

                <?php if (!empty($filteredFaqs)): ?>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>질문/답변</th>
                                    <th>카테고리</th>
                                    <th>노출 상태</th>
                                    <th>빠른 전환</th>
                                    <th>인기</th>
                                    <th>정렬 순서</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($filteredFaqs as $faq): ?>
                                    <tr>
                                        <td>
                                            <div class="content-item">
                                                <div class="content-item__icon">
                                                    <i class="ri-question-line"></i>
                                                </div>
                                                <div class="content-item__body">
                                                    <strong><?= e($faq['question'] ?? '-') ?></strong>
                                                    <p><?= e(mb_strimwidth(trim(strip_tags((string)($faq['answer'] ?? ''))), 0, 140, '...')) ?></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_faq_category_class($faq['category'] ?? '')) ?>">
                                                <?= e(admin_faq_category_label($faq['category'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_faq_visibility_class($faq['visibility'] ?? '')) ?>">
                                                <?= e(admin_faq_visibility_label($faq['visibility'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                class="content-status-switch <?= (($faq['visibility'] ?? '') === 'visible') ? 'is-on' : '' ?>"
                                                data-content-status-toggle
                                                data-status-type="faq"
                                                data-status-current="<?= e($faq['visibility'] ?? 'hidden') ?>"
                                            >
                                                <span data-status-label><?= e((($faq['visibility'] ?? '') === 'visible') ? '노출' : '비노출') ?></span>
                                            </button>
                                        </td>
                                        <td>
                                            <?= !empty($faq['is_popular']) ? '<span class="admin-chip admin-chip--warning">인기</span>' : '<span class="admin-chip admin-chip--gray">일반</span>' ?>
                                        </td>
                                        <td><strong><?= number_format((int)($faq['sort_order'] ?? 0)) ?></strong></td>
                                        <td>
                                            <div class="content-row-actions">
                                                <button
                                                    type="button"
                                                    class="content-icon-btn"
                                                    data-content-preview
                                                    data-preview-title="<?= e($faq['question'] ?? '-') ?>"
                                                    data-preview-meta="<?= e(($faq['author'] ?? '-') . ' · 정렬 ' . (int)($faq['sort_order'] ?? 0)) ?>"
                                                    data-preview-body="<?= e($faq['answer'] ?? '') ?>"
                                                    aria-label="미리보기"
                                                >
                                                    <i class="ri-eye-line"></i>
                                                </button>

                                                <a href="<?= e(admin_url('pages/content/faq-form.php?id=' . urlencode((string)$faq['id']))) ?>" class="content-icon-btn" aria-label="수정">
                                                    <i class="ri-edit-line"></i>
                                                </a>

                                                <div class="content-action-dropdown">
                                                    <button type="button" class="content-icon-btn" data-content-action-menu aria-label="더보기">
                                                        <i class="ri-more-2-fill"></i>
                                                    </button>
                                                    <div class="content-action-dropdown__menu">
                                                        <button type="button"><i class="ri-file-copy-line"></i>복제</button>
                                                        <button type="button" class="is-danger"><i class="ri-delete-bin-6-line"></i>삭제</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="content-mobile-list">
                        <?php foreach ($filteredFaqs as $faq): ?>
                            <article class="content-mobile-card">
                                <div class="content-mobile-card__top">
                                    <div class="content-item__icon">
                                        <i class="ri-question-line"></i>
                                    </div>
                                    <div class="content-mobile-card__head">
                                        <strong><?= e($faq['question'] ?? '-') ?></strong>
                                        <span><?= e($faq['author'] ?? '-') ?></span>
                                    </div>
                                </div>

                                <p class="content-mobile-card__summary"><?= e(mb_strimwidth(trim(strip_tags((string)($faq['answer'] ?? ''))), 0, 110, '...')) ?></p>

                                <div class="content-mobile-card__chips">
                                    <span class="<?= e(admin_faq_category_class($faq['category'] ?? '')) ?>">
                                        <?= e(admin_faq_category_label($faq['category'] ?? '')) ?>
                                    </span>
                                    <span class="<?= e(admin_faq_visibility_class($faq['visibility'] ?? '')) ?>">
                                        <?= e(admin_faq_visibility_label($faq['visibility'] ?? '')) ?>
                                    </span>
                                    <?= !empty($faq['is_popular']) ? '<span class="admin-chip admin-chip--warning">인기</span>' : '' ?>
                                </div>

                                <div class="content-row-actions">
                                    <button
                                        type="button"
                                        class="content-icon-btn"
                                        data-content-preview
                                        data-preview-title="<?= e($faq['question'] ?? '-') ?>"
                                        data-preview-meta="<?= e(($faq['author'] ?? '-') . ' · 정렬 ' . (int)($faq['sort_order'] ?? 0)) ?>"
                                        data-preview-body="<?= e($faq['answer'] ?? '') ?>"
                                    >
                                        <i class="ri-eye-line"></i>
                                    </button>
                                    <a href="<?= e(admin_url('pages/content/faq-form.php?id=' . urlencode((string)$faq['id']))) ?>" class="content-icon-btn">
                                        <i class="ri-edit-line"></i>
                                    </a>
                                    <button
                                        type="button"
                                        class="content-status-switch <?= (($faq['visibility'] ?? '') === 'visible') ? 'is-on' : '' ?>"
                                        data-content-status-toggle
                                        data-status-type="faq"
                                        data-status-current="<?= e($faq['visibility'] ?? 'hidden') ?>"
                                    >
                                        <span data-status-label><?= e((($faq['visibility'] ?? '') === 'visible') ? '노출' : '비노출') ?></span>
                                    </button>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="content-empty">
                        <i class="ri-search-eye-line"></i>
                        <p>조건에 맞는 FAQ가 없습니다.</p>
                    </div>
                <?php endif; ?>
            </section>
        </div>
    </main>
</div>

<div class="content-modal" id="contentPreviewModal" aria-hidden="true">
    <div class="content-modal__backdrop" data-content-preview-close></div>
    <div class="content-modal__dialog">
        <div class="content-modal__head">
            <div>
                <h3 data-preview-title>미리보기</h3>
                <p data-preview-meta></p>
            </div>
            <button type="button" class="content-icon-btn" data-content-preview-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>
        <div class="content-modal__body">
            <article class="content-preview-article">
                <div class="content-preview-article__meta" data-preview-meta></div>
                <div class="content-preview-article__body" data-preview-body></div>
            </article>
        </div>
    </div>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>