<aside class="mp-sidebar" data-aos="fade-right">
    <div class="mp-sidebar__card">
        <div class="mp-sidebar__profile">
            <div class="mp-sidebar__avatar">
                <?= htmlspecialchars($myPageData['user']['avatar_text']) ?>
            </div>

            <div class="mp-sidebar__meta">
                <span class="mp-sidebar__grade-badge">
                    <?= htmlspecialchars($myPageData['user']['grade_label'] ?? 'MEMBER') ?>
                </span>
                <strong class="mp-sidebar__name">
                    <?= htmlspecialchars($myPageData['user']['name']) ?> 님
                </strong>
                <p class="mp-sidebar__grade">
                    <?= htmlspecialchars($myPageData['user']['grade']) ?>
                </p>
            </div>
        </div>

        <div class="mp-sidebar__summary">
            <div class="mp-sidebar__summary-item">
                <span>보유쿠폰</span>
                <strong><?= htmlspecialchars($myPageData['summary']['couponCount']) ?>장</strong>
            </div>
            <div class="mp-sidebar__summary-item">
                <span>마일리지</span>
                <strong><?= htmlspecialchars($myPageData['summary']['mileage']) ?></strong>
            </div>
        </div>

        <nav class="mp-sidebar__nav" aria-label="마이페이지 메뉴">
            <?php foreach ($myPageData['menu'] as $item): ?>
                <?php $isActive = $myPageCurrent === $item['key']; ?>
                <a
                    href="<?= htmlspecialchars($item['url']) ?>"
                    class="mp-sidebar__link <?= $isActive ? 'is-active' : '' ?>"
                    <?= $isActive ? 'aria-current="page"' : '' ?>
                >
                    <span class="mp-sidebar__link-icon">
                        <i class="<?= htmlspecialchars($item['icon'] ?? 'ri-arrow-right-s-line') ?>" aria-hidden="true"></i>
                    </span>
                    <span class="mp-sidebar__link-text"><?= htmlspecialchars($item['label']) ?></span>
                    <span class="mp-sidebar__link-arrow">
                        <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
                    </span>
                </a>
            <?php endforeach; ?>
        </nav>
    </div>
</aside>