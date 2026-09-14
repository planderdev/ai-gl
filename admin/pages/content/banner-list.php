<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/content/banner-storage.php';

$pageTitle = '배너 관리';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$filters = [
    'keyword' => trim($_GET['keyword'] ?? ''),
    'position' => trim($_GET['position'] ?? ''),
    'status' => trim($_GET['status'] ?? ''),
    'new_tab' => trim($_GET['new_tab'] ?? ''),
];

$banners = admin_get_banners();

$filteredBanners = array_values(array_filter($banners, function (array $item) use ($filters) {
    $haystack = mb_strtolower(implode(' ', [
        $item['name'] ?? '',
        $item['title'] ?? '',
        $item['description'] ?? '',
        $item['author'] ?? '',
        $item['link_url'] ?? '',
    ]));

    if ($filters['keyword'] !== '' && mb_strpos($haystack, mb_strtolower($filters['keyword'])) === false) {
        return false;
    }

    if ($filters['position'] !== '' && ($item['position'] ?? '') !== $filters['position']) {
        return false;
    }

    if ($filters['status'] !== '' && ($item['status'] ?? '') !== $filters['status']) {
        return false;
    }

    if ($filters['new_tab'] === 'yes' && empty($item['open_in_new_tab'])) {
        return false;
    }

    if ($filters['new_tab'] === 'no' && !empty($item['open_in_new_tab'])) {
        return false;
    }

    return true;
}));

usort($filteredBanners, function (array $a, array $b) {
    $statusWeight = [
        'active' => 3,
        'scheduled' => 2,
        'inactive' => 1,
    ];

    $aWeight = $statusWeight[(string)($a['status'] ?? '')] ?? 0;
    $bWeight = $statusWeight[(string)($b['status'] ?? '')] ?? 0;

    if ($aWeight !== $bWeight) {
        return $bWeight <=> $aWeight;
    }

    $sortCompare = ((int)($a['sort_order'] ?? 0)) <=> ((int)($b['sort_order'] ?? 0));
    if ($sortCompare !== 0) {
        return $sortCompare;
    }

    return strcmp((string)($b['updated_at'] ?? ''), (string)($a['updated_at'] ?? ''));
});

$stats = admin_banner_summary_stats($banners);

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
                    <h1 class="admin-page-head__title">배너 관리</h1>
                    <p class="admin-page-head__desc">배너 위치, 노출 상태, 링크, 기간, 정렬 순서를 관리하는 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/banner-form.php')) ?>" class="admin-btn admin-btn--primary">
                        <i class="ri-add-line"></i>
                        배너 등록
                    </a>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="content-summary-grid">
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">전체 배너</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['total']) ?></strong>
                            <p class="content-summary-card__meta">등록된 배너 수</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">노출중</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['active']) ?></strong>
                            <p class="content-summary-card__meta">현재 활성 배너</p>
                        </article>
                        <article class="content-summary-card content-summary-card--warning">
                            <span class="content-summary-card__label">예약 노출</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['scheduled']) ?></strong>
                            <p class="content-summary-card__meta">기간 대기중</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">비활성</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['inactive']) ?></strong>
                            <p class="content-summary-card__meta">노출 제외 배너</p>
                        </article>
                        <article class="content-summary-card">
                            <span class="content-summary-card__label">새창 링크</span>
                            <strong class="content-summary-card__value"><?= number_format($stats['new_window']) ?></strong>
                            <p class="content-summary-card__meta">외부/새창 이동</p>
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
                                    placeholder="배너명, 제목, 링크, 작성자 검색"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">노출 위치</label>
                                <select name="position" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_banner_position_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['position'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상태</label>
                                <select name="status" class="admin-select">
                                    <option value="">전체</option>
                                    <?php foreach (admin_banner_status_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $filters['status'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">새창 링크</label>
                                <select name="new_tab" class="admin-select">
                                    <option value="">전체</option>
                                    <option value="yes" <?= $filters['new_tab'] === 'yes' ? 'selected' : '' ?>>새창만</option>
                                    <option value="no" <?= $filters['new_tab'] === 'no' ? 'selected' : '' ?>>일반만</option>
                                </select>
                            </div>
                        </div>

                        <div class="content-filter-actions">
                            <a href="<?= e(admin_url('pages/content/banner-list.php')) ?>" class="admin-btn admin-btn--light">초기화</a>
                            <button type="submit" class="admin-btn admin-btn--primary">검색</button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="admin-card content-table-card">
                <div class="admin-card__head content-table-card__head">
                    <div>
                        <h3>배너 리스트</h3>
                        <p class="content-table-card__meta">총 <?= number_format(count($filteredBanners)) ?>건</p>
                    </div>
                </div>

                <?php if (!empty($filteredBanners)): ?>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>배너 정보</th>
                                    <th>노출 위치</th>
                                    <th>상태</th>
                                    <th>빠른 전환</th>
                                    <th>노출 기간</th>
                                    <th>정렬</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($filteredBanners as $banner): ?>
                                    <tr>
                                        <td>
                                            <div class="content-banner-item">
                                                <div class="content-banner-thumb">
                                                    <span>PC</span>
                                                </div>
                                                <div class="content-item__body">
                                                    <strong><?= e($banner['name'] ?? '-') ?></strong>
                                                    <p><?= e($banner['title'] ?? '-') ?> · <?= e($banner['description'] ?? '-') ?></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_banner_position_class($banner['position'] ?? '')) ?>">
                                                <?= e(admin_banner_position_label($banner['position'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="<?= e(admin_banner_status_class($banner['status'] ?? '')) ?>">
                                                <?= e(admin_banner_status_label($banner['status'] ?? '')) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                class="content-status-switch <?= (($banner['status'] ?? '') === 'active') ? 'is-on' : '' ?>"
                                                data-content-status-toggle
                                                data-status-type="banner"
                                                data-status-current="<?= e($banner['status'] ?? 'inactive') ?>"
                                            >
                                                <span data-status-label><?= e((($banner['status'] ?? '') === 'active') ? '노출중' : '비활성') ?></span>
                                            </button>
                                        </td>
                                        <td>
                                            <div class="content-date-meta">
                                                <strong><?= e(substr((string)($banner['start_at'] ?? '-'), 0, 10)) ?></strong>
                                                <span>~ <?= e(substr((string)($banner['end_at'] ?? '-'), 0, 10)) ?></span>
                                            </div>
                                        </td>
                                        <td><strong><?= number_format((int)($banner['sort_order'] ?? 0)) ?></strong></td>
                                        <td>
                                            <div class="content-row-actions">
                                                <button
                                                    type="button"
                                                    class="content-icon-btn"
                                                    data-content-preview
                                                    data-preview-title="<?= e($banner['name'] ?? '-') ?>"
                                                    data-preview-meta="<?= e(admin_banner_position_label($banner['position'] ?? '') . ' · ' . admin_banner_status_label($banner['status'] ?? '')) ?>"
                                                    data-preview-body="<?= e('<p><strong>' . ($banner['title'] ?? '-') . '</strong></p><p>' . ($banner['description'] ?? '-') . '</p><p>버튼: ' . ($banner['button_text'] ?? '-') . '</p><p>링크: ' . ($banner['link_url'] ?? '-') . '</p>') ?>"
                                                    aria-label="미리보기"
                                                >
                                                    <i class="ri-eye-line"></i>
                                                </button>

                                                <a href="<?= e(admin_url('pages/content/banner-form.php?id=' . urlencode((string)$banner['id']))) ?>" class="content-icon-btn" aria-label="수정">
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
                        <?php foreach ($filteredBanners as $banner): ?>
                            <article class="content-mobile-card">
                                <div class="content-mobile-card__top">
                                    <div class="content-banner-thumb content-banner-thumb--sm">
                                        <span>PC</span>
                                    </div>
                                    <div class="content-mobile-card__head">
                                        <strong><?= e($banner['name'] ?? '-') ?></strong>
                                        <span><?= e($banner['author'] ?? '-') ?></span>
                                    </div>
                                </div>

                                <p class="content-mobile-card__summary"><?= e($banner['title'] ?? '-') ?> · <?= e($banner['description'] ?? '-') ?></p>

                                <div class="content-mobile-card__chips">
                                    <span class="<?= e(admin_banner_position_class($banner['position'] ?? '')) ?>">
                                        <?= e(admin_banner_position_label($banner['position'] ?? '')) ?>
                                    </span>
                                    <span class="<?= e(admin_banner_status_class($banner['status'] ?? '')) ?>">
                                        <?= e(admin_banner_status_label($banner['status'] ?? '')) ?>
                                    </span>
                                    <?= !empty($banner['open_in_new_tab']) ? '<span class="admin-chip admin-chip--gray">새창</span>' : '' ?>
                                </div>

                                <div class="content-row-actions">
                                    <button
                                        type="button"
                                        class="content-icon-btn"
                                        data-content-preview
                                        data-preview-title="<?= e($banner['name'] ?? '-') ?>"
                                        data-preview-meta="<?= e(admin_banner_position_label($banner['position'] ?? '') . ' · ' . admin_banner_status_label($banner['status'] ?? '')) ?>"
                                        data-preview-body="<?= e('<p><strong>' . ($banner['title'] ?? '-') . '</strong></p><p>' . ($banner['description'] ?? '-') . '</p><p>버튼: ' . ($banner['button_text'] ?? '-') . '</p><p>링크: ' . ($banner['link_url'] ?? '-') . '</p>') ?>"
                                    >
                                        <i class="ri-eye-line"></i>
                                    </button>
                                    <a href="<?= e(admin_url('pages/content/banner-form.php?id=' . urlencode((string)$banner['id']))) ?>" class="content-icon-btn">
                                        <i class="ri-edit-line"></i>
                                    </a>
                                    <button
                                        type="button"
                                        class="content-status-switch <?= (($banner['status'] ?? '') === 'active') ? 'is-on' : '' ?>"
                                        data-content-status-toggle
                                        data-status-type="banner"
                                        data-status-current="<?= e($banner['status'] ?? 'inactive') ?>"
                                    >
                                        <span data-status-label><?= e((($banner['status'] ?? '') === 'active') ? '노출중' : '비활성') ?></span>
                                    </button>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="content-empty">
                        <i class="ri-image-circle-line"></i>
                        <p>조건에 맞는 배너가 없습니다.</p>
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