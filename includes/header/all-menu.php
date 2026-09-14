<?php
$teetime = $menuData['teetime'];
$package = $menuData['package'];
$allMenuLinks = $menuData['all_menu_links'];

$teetimeCategories = $teetime['categories'];
$teetimeCountries = $teetime['countries'];
$packageCategories = $package['categories'];
$packageCountries = $package['countries'];

$firstTeetimeKey = array_key_first($teetimeCategories);
$firstPackageKey = array_key_first($packageCategories);

$linkMap = [
    '테마 골프' => '/pages/product/pr-list',
    '특가' => '/pages/product/pr-list',
    '기획전' => '/pages/event/list',
    '나의여행' => '/pages/mypage/travel',
    '내 정보' => '/pages/mypage/profile',
    '보유쿠폰' => '/pages/mypage/coupons',
    '마일리지' => '/pages/mypage/mileage',
    '알림설정' => '/pages/mypage/notifications',
    '1:1문의' => '/pages/board/inquiry',
    'FAQ' => '/pages/board/faq',
    '공지사항' => '/pages/board/notice',
];
?>

<div class="all-menu-overlay" id="allMenuOverlay">
    <div class="all-menu-inner">
        <div class="all-menu-top">
            <?php include __DIR__ . '/logo.php'; ?>

            <button type="button" class="all-menu-close" id="allMenuClose" aria-label="전체 메뉴 닫기">
            <span class="material-symbols-rounded">
close
</span>
            </button>
        </div>

        <div class="all-menu-sections">
            <!-- 티타임 -->
            <section class="all-menu-section">
                <h2>티타임</h2>

                <!-- desktop / tablet -->
                <div class="all-menu-mega-box all-menu-mega-box--desktop">
                    <div class="mega-category-list static">
                        <?php foreach ($teetimeCategories as $key => $label): ?>
                            <button
                                type="button"
                                class="mega-category <?php echo $key === $firstTeetimeKey ? 'is-active' : ''; ?>"
                                data-target="all-teetime-<?php echo htmlspecialchars($key); ?>"
                            >
                                <?php echo htmlspecialchars($label); ?>
                                <span class="material-symbols-rounded">
chevron_forward
</span>
                            </button>
                        <?php endforeach; ?>
                    </div>

                    <div class="mega-country-panels">
                        <?php foreach ($teetimeCountries as $key => $countries): ?>
                            <div
                                class="mega-country-panel <?php echo $key === $firstTeetimeKey ? 'is-active' : ''; ?>"
                                id="all-teetime-<?php echo htmlspecialchars($key); ?>"
                            >
                                <?php foreach ($countries as $country): ?>
                                    <a href="/pages/product/pr-list?country=<?php echo urlencode($country); ?>">
                                        <?php echo htmlspecialchars($country); ?>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- mobile accordion -->
                <div class="mobile-menu-accordion">
                    <?php foreach ($teetimeCategories as $key => $label): ?>
                        <div class="mobile-menu-accordion__item">
                            <button
                                type="button"
                                class="mobile-menu-accordion__trigger"
                                data-accordion-trigger
                                aria-expanded="false"
                                aria-controls="mobile-teetime-<?php echo htmlspecialchars($key); ?>"
                            >
                                <span><?php echo htmlspecialchars($label); ?></span>
                                <span class="material-symbols-rounded">
keyboard_arrow_down
</span>
                            </button>

                            <div
                                class="mobile-menu-accordion__panel"
                                id="mobile-teetime-<?php echo htmlspecialchars($key); ?>"
                                hidden
                            >
                                <div class="mobile-menu-country-list">
                                    <?php foreach ($teetimeCountries[$key] ?? [] as $country): ?>
                                        <a href="/pages/product/pr-list?country=<?php echo urlencode($country); ?>">
                                            <?php echo htmlspecialchars($country); ?>
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <!-- 패키지 -->
            <section class="all-menu-section">
                <h2>패키지</h2>

                <!-- desktop / tablet -->
                <div class="all-menu-mega-box all-menu-mega-box--desktop">
                    <div class="mega-category-list static">
                        <?php foreach ($packageCategories as $key => $label): ?>
                            <button
                                type="button"
                                class="mega-category <?php echo $key === $firstPackageKey ? 'is-active' : ''; ?>"
                                data-target="all-package-<?php echo htmlspecialchars($key); ?>"
                            >
                                <?php echo htmlspecialchars($label); ?>
                                <span class="material-symbols-rounded">
chevron_forward
</span>
                            </button>
                        <?php endforeach; ?>
                    </div>

                    <div class="mega-country-panels">
                        <?php foreach ($packageCountries as $key => $countries): ?>
                            <div
                                class="mega-country-panel <?php echo $key === $firstPackageKey ? 'is-active' : ''; ?>"
                                id="all-package-<?php echo htmlspecialchars($key); ?>"
                            >
                                <?php foreach ($countries as $country): ?>
                                    <a href="/pages/product/pr-list?country=<?php echo urlencode($country); ?>">
                                        <?php echo htmlspecialchars($country); ?>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- mobile accordion -->
                <div class="mobile-menu-accordion">
                    <?php foreach ($packageCategories as $key => $label): ?>
                        <div class="mobile-menu-accordion__item">
                            <button
                                type="button"
                                class="mobile-menu-accordion__trigger"
                                data-accordion-trigger
                                aria-expanded="false"
                                aria-controls="mobile-package-<?php echo htmlspecialchars($key); ?>"
                            >
                                <span><?php echo htmlspecialchars($label); ?></span>
                                <span class="material-symbols-rounded">
keyboard_arrow_down
</span>
                            </button>

                            <div
                                class="mobile-menu-accordion__panel"
                                id="mobile-package-<?php echo htmlspecialchars($key); ?>"
                                hidden
                            >
                                <div class="mobile-menu-country-list">
                                    <?php foreach ($packageCountries[$key] ?? [] as $country): ?>
                                        <a href="/pages/product/pr-list?country=<?php echo urlencode($country); ?>">
                                            <?php echo htmlspecialchars($country); ?>
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="all-menu-grid">
                <?php foreach ($allMenuLinks as $title => $links): ?>
                    <div class="all-menu-link-group">
                        <h2><?php echo htmlspecialchars($title); ?></h2>
                        <?php foreach ($links as $link): ?>
                            <a href="<?php echo htmlspecialchars($linkMap[$link] ?? '#'); ?>">
                                <?php echo htmlspecialchars($link); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            </section>
        </div>
    </div>
</div>