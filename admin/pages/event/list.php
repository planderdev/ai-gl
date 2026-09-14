<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/event/event-storage.php';

$pageTitle = '이벤트 목록';
$currentAdminTitle = '이벤트관리';

$pageCss = [
    'event.css',
];

$events = admin_get_events();

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                <span class="admin-chip">event manager</span>
                    <h1 class="admin-page-head__title">이벤트 목록</h1>
                    <p class="admin-page-head__desc">기획전, 특가, 프로모션을 관리합니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/event/create.php')) ?>" class="admin-btn admin-btn--primary">이벤트 등록</a>
                </div>
            </div>

            <section class="admin-card">
                <div class="admin-card__body">
                    <div class="event-list">
                        <?php if (!empty($events)): ?>
                            <?php foreach ($events as $event): ?>
                                <article class="event-item">
                                    <div class="event-item__body">
                                        <div class="event-item__top">
                                            <span class="admin-chip"><?= e($event['event_type'] ?? 'event') ?></span>
                                            <span class="admin-chip admin-chip--gray"><?= e($event['status'] ?? 'draft') ?></span>
                                        </div>

                                        <a href="<?= e(admin_url('pages/event/edit.php?id=' . ($event['id'] ?? 0))) ?>" class="event-item__title">
                                            <?= e($event['title'] ?? '') ?>
                                        </a>

                                        <p class="event-item__summary"><?= e($event['summary'] ?? '') ?></p>

                                        <div class="event-item__meta">
                                            <span>기간: <?= e($event['start_date'] ?? '') ?> ~ <?= e($event['end_date'] ?? '') ?></span>
                                            <span>지역: <?= e($event['region'] ?? '') ?></span>
                                        </div>
                                    </div>

                                    <div class="event-item__actions">
    <a href="<?= e(admin_url('pages/event/edit.php?id=' . ($event['id'] ?? 0))) ?>" class="admin-btn admin-btn--light">수정</a>

    <form action="<?= e(admin_url('actions/event-delete.php')) ?>" method="post" onsubmit="return confirm('정말 삭제하시겠습니까?');">
        <input type="hidden" name="id" value="<?= e((string) ($event['id'] ?? 0)) ?>">
        <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
    </form>
</div>
                                </article>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="product-empty">
                                <i class="ri-inbox-archive-line"></i>
                                <p>등록된 이벤트가 없습니다.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>
        </div>
    </main>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>