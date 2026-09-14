<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/board/notice-storage.php';

$pageTitle = '공지사항 관리';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'category' => trim($_GET['category'] ?? ''),
    'status' => trim($_GET['status'] ?? ''),
    'pinned' => trim($_GET['pinned'] ?? ''),
];

$notices = admin_get_notices();

$filteredNotices = array_values(array_filter($notices, function (array $item) use ($filters) {
    $haystack = mb_strtolower(implode(' ', [
        $item['title'] ?? '',
        $item['summary'] ?? '',
        $item['author'] ?? '',
    ]));

    if ($filters['keyword'] !== '' && mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
        return false;
    }

    if ($filters['category'] !== '' && ($item['category'] ?? '') !== $filters['category']) {
        return false;
    }

    if ($filters['status'] !== '' && ($item['status'] ?? '') !== $filters['status']) {
        return false;
    }

    if ($filters['pinned'] === 'yes' && empty($item['is_pinned'])) {
        return false;
    }

    if ($filters['pinned'] === 'no' && !empty($item['is_pinned'])) {
        return false;
    }

    return true;
}));

usort($filteredNotices, function (array $a, array $b) {
    $aPinned = !empty($a['is_pinned']) ? 1 : 0;
    $bPinned = !empty($b['is_pinned']) ? 1 : 0;

    if ($aPinned !== $bPinned) {
        return $bPinned <=> $aPinned;
    }

    return strcmp((string)($b['publish_at'] ?? ''), (string)($a['publish_at'] ?? ''));
});

$stats = admin_notice_summary_stats($notices);

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
                    <h1 class="admin-page-head__title">공지사항 관리</h1>
                    <p class="admin-page-head__desc">공지 등록, 상단 고정, 게시 상태, 예약 발행까지 한 번에 관리하는 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/notice-form.php')) ?>" class="admin-btn admin-btn--primary">
                        <i class="ri-add-line"></i>
                        공지 등록
                    </a>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="content-summary-grid">
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">전체 공지</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['total']) ?></strong>
                            <p class="content-summary-card__meta">누적 등록 공지 수</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">게시중</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['published']) ?></strong>
                            <p class="content-summary-card__meta">현재 노출중인 공지</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">임시저장</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['draft']) ?></strong>
                            <p class="content-summary-card__meta">작성 중 문서</p>
                        </article>
                        <article class="content-summary-card content-summary-card--warning">
                            <span class="content-summary-card__label">예약발행</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['scheduled']) ?></strong>
                            <p class="content-summary-card__meta">발행 대기중</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">상단 고정</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['pinned']) ?></strong>
                            <p class="content-summary-card__meta">우선 노출 공지</p>
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
                                    placeholder="제목, 요약, 작성자 검색"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">카테고리</label>
                                <select name="category" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_notice_category_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['category'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상태</label>
                                <select name="status" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_notice_status_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['status'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상단 고정</label>
                                <select name="pinned" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="yes" <?= $filters['pinned'] === 'yes' ? 'selected' : '' ?>>고정만</option>
                                    <option value="no" <?= $filters['pinned'] === 'no' ? 'selected' : '' ?>>일반만</option>
                                </select>
                            </div>
                        </div>

                        <div class="content-filter-actions">
                            <a href="<?= e(admin_url('pages/content/notice-list.php')) ?>" class="admin-btn admin-btn--light">초기화</a>
                            <button type="submit" class="admin-btn admin-btn--primary">검색</button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card content-table-card">
                <div class="admin-card__head content-table-card__head">
                    <div>
                        <h3>공지 리스트</h3>
                        <p class="content-table-card__meta">총 <?= number_format(count($filteredNotices)) ?>건</p>
                    </div>
                </div>

                <?php if (!empty($filteredNotices)): ?>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>공지 정보</th>
                                    <th>카테고리</th>
                                    <th>상태</th>
                                    <th>빠른 전환</th>
                                    <th>작성자</th>
                                    <th>게시일</th>
                                    <th>고정</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($filteredNotices as $notice): ?>
                                    <tr>
                                        <td>
                                            <div class="content-item">
                                                <div class="content-item__icon">
                                                    <i class="ri-notification-3-line"></i>
                                                </div>
                                                <div class="content-item__body">
                                                    <strong><?= e($notice['title'] ?? '-') ?></strong>
                                                    <p><?= e($notice['summary'] ?? '-') ?></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_notice_category_class($notice['category'] ?? '')) ?>">
                                                <?= e(admin_notice_category_label($notice['category'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_notice_status_class($notice['status'] ?? '')) ?>">
                                                <?= e(admin_notice_status_label($notice['status'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                class="content-status-switch <?= (($notice['status'] ?? '') === 'published') ? 'is-on' : '' ?>"
                                                data-content-status-toggle
                                                data-status-type="notice"
                                                data-status-current="<?= e($notice['status'] ?? 'draft') ?>"
                                            >
                                                <span data-status-label><?= e((($notice['status'] ?? '') === 'published') ? '게시중' : '임시저장') ?></span>
                                            </button>
                                        </td>
                                        <td><?= e($notice['author'] ?? '-') ?></td>
                                        <td>
                                            <div class="content-date-meta">
                                                <strong><?= e(substr((string)($notice['publish_at'] ?? '-'), 0, 10)) ?></strong>
                                                <span><?= e(substr((string)($notice['publish_at'] ?? '-'), 11, 5)) ?></span>
                                            </div>
                                        </td>
                                        <td>
                                            <?= !empty($notice['is_pinned']) ? '<span class="admin-chip admin-chip--danger">고정</span>' : '<span class="admin-chip admin-chip--gray">일반</span>' ?>
                                        </td>
                                        <td>
                                            <div class="content-row-actions">
                                                <button
                                                    type="button"
                                                    class="content-icon-btn"
                                                    data-content-preview
                                                    data-preview-title="<?= e($notice['title'] ?? '-') ?>"
                                                    data-preview-meta="<?= e(($notice['author'] ?? '-') . ' · ' . substr((string)($notice['publish_at'] ?? '-'), 0, 16)) ?>"
                                                    data-preview-body="<?= e($notice['content'] ?? '') ?>"
                                                    aria-label="미리보기"
                                                >
                                                    <i class="ri-eye-line"></i>
                                                </button>

                                                <a href="<?= e(admin_url('pages/content/notice-form.php?id=' . urlencode((string)$notice['id']))) ?>" class="content-icon-btn" aria-label="수정">
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
                        <?php foreach ($filteredNotices as $notice): ?>
                            <article class="content-mobile-card">
                                <div class="content-mobile-card__top">
                                    <div class="content-item__icon">
                                        <i class="ri-notification-3-line"></i>
                                    </div>
                                    <div class="content-mobile-card__head">
                                        <strong><?= e($notice['title'] ?? '-') ?></strong>
                                        <span><?= e($notice['author'] ?? '-') ?></span>
                                    </div>
                                </div>

                                <p class="content-mobile-card__summary"><?= e($notice['summary'] ?? '-') ?></p>

                                <div class="content-mobile-card__chips">
                                    <span class="<?= e(admin_notice_category_class($notice['category'] ?? '')) ?>">
                                        <?= e(admin_notice_category_label($notice['category'] ?? '')) ?>
                                    </span>
                                    <span class="<?= e(admin_notice_status_class($notice['status'] ?? '')) ?>">
                                        <?= e(admin_notice_status_label($notice['status'] ?? '')) ?>
                                    </span>
                                    <?= !empty($notice['is_pinned']) ? '<span class="admin-chip admin-chip--danger">고정</span>' : '' ?>
                                </div>

                                <div class="content-row-actions">
                                    <button
                                        type="button"
                                        class="content-icon-btn"
                                        data-content-preview
                                        data-preview-title="<?= e($notice['title'] ?? '-') ?>"
                                        data-preview-meta="<?= e(($notice['author'] ?? '-') . ' · ' . substr((string)($notice['publish_at'] ?? '-'), 0, 16)) ?>"
                                        data-preview-body="<?= e($notice['content'] ?? '') ?>"
                                    >
                                        <i class="ri-eye-line"></i>
                                    </button>
                                    <a href="<?= e(admin_url('pages/content/notice-form.php?id=' . urlencode((string)$notice['id']))) ?>" class="content-icon-btn">
                                        <i class="ri-edit-line"></i>
                                    </a>
                                    <button
                                        type="button"
                                        class="content-status-switch <?= (($notice['status'] ?? '') === 'published') ? 'is-on' : '' ?>"
                                        data-content-status-toggle
                                        data-status-type="notice"
                                        data-status-current="<?= e($notice['status'] ?? 'draft') ?>"
                                    >
                                        <span data-status-label><?= e((($notice['status'] ?? '') === 'published') ? '게시중' : '임시저장') ?></span>
                                    </button>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="content-empty">
                        <i class="ri-search-eye-line"></i>
                        <p>조건에 맞는 공지사항이 없습니다.</p>
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