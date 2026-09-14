<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

$group = $_GET['group'] ?? 'countries';
$allowedGroups = ['countries', 'regions', 'themes', 'badges'];

if (!in_array($group, $allowedGroups, true)) {
    $group = 'countries';
}

$pageTitle = admin_taxonomy_group_label($group) . ' 관리';
$currentAdminTitle = '상품관리';

$chipClassMap = [
    'countries' => 'admin-chip--primary',
    'regions'   => 'admin-chip--primary',
    'themes'    => 'admin-chip--primary',
    'badges'    => 'admin-chip--primary',
  ];
  
  $chipClass = $chipClassMap[$group] ?? 'admin-chip--gray';
 


$pageCss = [
    'taxonomy.css',
];

$items = admin_get_taxonomy_items($group);
$allCountries = admin_get_active_taxonomy_items('countries');

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip <?= $chipClass ?>">
  <?= strtoupper($group) ?> MANAGER
</span>
                    <h1 class="admin-page-head__title"><?= e(admin_taxonomy_group_label($group)) ?> 관리</h1>
                    <p class="admin-page-head__desc">상품 등록 폼에서 사용하는 분류값을 관리합니다.</p>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="taxonomy-tabs">
                        <a href="<?= e(admin_url('pages/product/taxonomy.php?group=countries')) ?>" class="taxonomy-tabs__link <?= $group === 'countries' ? 'is-active' : '' ?>">국가</a>
                        <a href="<?= e(admin_url('pages/product/taxonomy.php?group=regions')) ?>" class="taxonomy-tabs__link <?= $group === 'regions' ? 'is-active' : '' ?>">지역</a>
                        <a href="<?= e(admin_url('pages/product/taxonomy.php?group=themes')) ?>" class="taxonomy-tabs__link <?= $group === 'themes' ? 'is-active' : '' ?>">테마</a>
                        <a href="<?= e(admin_url('pages/product/taxonomy.php?group=badges')) ?>" class="taxonomy-tabs__link <?= $group === 'badges' ? 'is-active' : '' ?>">배지</a>
                    </div>
                </div>
            </section>

            <div class="taxonomy-layout">
                <section class="admin-card">
                    <div class="admin-card__head">
                        <h3>신규 추가</h3>
                    </div>
                    <div class="admin-card__body">
                        <form action="<?= e(admin_url('actions/taxonomy-save.php')) ?>" method="post" class="taxonomy-form">
                            <input type="hidden" name="group" value="<?= e($group) ?>">
                            <input type="hidden" name="id" value="0">

                            <div class="admin-form-grid admin-form-grid--2">
                                <div class="admin-field">
                                    <label class="admin-label">이름</label>
                                    <input type="text" name="name" class="admin-input" required>
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">슬러그</label>
                                    <input type="text" name="slug" class="admin-input" placeholder="영문/코드값">
                                </div>

                                <?php if ($group === 'regions'): ?>
                                    <div class="admin-field">
                                        <label class="admin-label">국가 연결</label>
                                        <select name="country" class="admin-select">
                                            <option value="">선택</option>
                                            <?php foreach ($allCountries as $country): ?>
                                                <option value="<?= e($country['name'] ?? '') ?>"><?= e($country['name'] ?? '') ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                <?php endif; ?>

                                <div class="admin-field">
                                    <label class="admin-label">정렬 순서</label>
                                    <input type="number" name="sort_order" class="admin-input" value="0">
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">사용 여부</label>
                                    <select name="is_active" class="admin-select">
                                        <option value="1">사용</option>
                                        <option value="0">미사용</option>
                                    </select>
                                </div>
                            </div>

                            <div class="u-mt-20">
                                <button type="submit" class="admin-btn admin-btn--primary">저장하기</button>
                            </div>
                        </form>
                    </div>
                </section>

                <section class="admin-card">
                    <div class="admin-card__head">
                        <h3>목록</h3>
                    </div>
                    <div class="admin-card__body">
                        <?php if (!empty($items)): ?>
                            <div class="taxonomy-list">
                                <?php foreach ($items as $item): ?>
                                    <article class="taxonomy-item">
                                        <form action="<?= e(admin_url('actions/taxonomy-save.php')) ?>" method="post" class="taxonomy-item__form">
                                            <input type="hidden" name="group" value="<?= e($group) ?>">
                                            <input type="hidden" name="id" value="<?= e((string) ($item['id'] ?? 0)) ?>">

                                            <div class="taxonomy-item__grid">
                                                <div class="admin-field">
                                                    <label class="admin-label">이름</label>
                                                    <input type="text" name="name" class="admin-input" value="<?= e($item['name'] ?? '') ?>">
                                                </div>

                                                <div class="admin-field">
                                                    <label class="admin-label">슬러그</label>
                                                    <input type="text" name="slug" class="admin-input" value="<?= e($item['slug'] ?? '') ?>">
                                                </div>

                                                <?php if ($group === 'regions'): ?>
                                                    <div class="admin-field">
                                                        <label class="admin-label">국가 연결</label>
                                                        <select name="country" class="admin-select">
                                                            <option value="">선택</option>
                                                            <?php foreach ($allCountries as $country): ?>
                                                                <option value="<?= e($country['name'] ?? '') ?>" <?= ($item['country'] ?? '') === ($country['name'] ?? '') ? 'selected' : '' ?>>
                                                                    <?= e($country['name'] ?? '') ?>
                                                                </option>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </div>
                                                <?php endif; ?>

                                                <div class="admin-field">
                                                    <label class="admin-label">정렬 순서</label>
                                                    <input type="number" name="sort_order" class="admin-input" value="<?= e((string) ($item['sort_order'] ?? 0)) ?>">
                                                </div>

                                                <div class="admin-field">
                                                    <label class="admin-label">사용 여부</label>
                                                    <select name="is_active" class="admin-select">
                                                        <option value="1" <?= (int) ($item['is_active'] ?? 0) === 1 ? 'selected' : '' ?>>사용</option>
                                                        <option value="0" <?= (int) ($item['is_active'] ?? 0) === 0 ? 'selected' : '' ?>>미사용</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="taxonomy-item__actions">
                                                <button type="submit" class="admin-btn admin-btn--light">수정 저장</button>
                                            </div>
                                        </form>

                                        <form action="<?= e(admin_url('actions/taxonomy-delete.php')) ?>" method="post" onsubmit="return confirm('정말 삭제하시겠습니까?');">
                                            <input type="hidden" name="group" value="<?= e($group) ?>">
                                            <input type="hidden" name="id" value="<?= e((string) ($item['id'] ?? 0)) ?>">
                                            <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
                                        </form>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="product-empty">
                                <i class="ri-folder-open-line"></i>
                                <p>등록된 항목이 없습니다.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>
            </div>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>