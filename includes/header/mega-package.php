<?php
$package = $menuData['package'] ?? [];
$packageCategories = $package['categories'] ?? [];
$packageCountries = $package['countries'] ?? [];
$packagePromo = $package['promo'] ?? [];
$firstPackageKey = !empty($packageCategories) ? array_key_first($packageCategories) : null;
?>

<div class="mega-menu">
    <div class="mega-menu-inner has-promo">
    <div class="mega-promo">
            <strong><?php echo htmlspecialchars($packagePromo['title'] ?? ''); ?></strong>
            <p><?php echo htmlspecialchars($packagePromo['desc'] ?? ''); ?></p>
            <a href="<?php echo htmlspecialchars($packagePromo['url'] ?? '#'); ?>" class="mega-promo-banner">
                <img src="<?php echo htmlspecialchars($packagePromo['image'] ?? ''); ?>" alt="이벤트 배너">
            </a>
        </div>
        <div class="mega-panel">
        <div class="mega-category-list">
    <?php foreach ($packageCategories as $key => $label): ?>
        <button
            type="button"
            class="mega-category <?php echo $key === $firstPackageKey ? 'is-active' : ''; ?>"
            data-target="package-<?php echo htmlspecialchars($key); ?>"
        >
            <span class="mega-category__label"><?php echo htmlspecialchars($label); ?></span>
            <span class="mega-category__icon material-symbols-rounded" aria-hidden="true">chevron_forward</span>
        </button>
    <?php endforeach; ?>
</div>

            <div class="mega-country-panels">
                <?php foreach ($packageCountries as $key => $countries): ?>
                    <div
                        class="mega-country-panel <?php echo $key === $firstPackageKey ? 'is-active' : ''; ?>"
                        id="package-<?php echo htmlspecialchars($key); ?>"
                    >
                        <?php foreach ($countries as $country): ?>
                            <?php
                            $countryLabel = is_array($country) ? ($country['label'] ?? '') : $country;
                            $countryUrl = is_array($country)
                                ? ($country['url'] ?? '#')
                                : '/pages/product/pr-list?country=' . urlencode($countryLabel);
                            ?>
                            <a href="<?php echo htmlspecialchars($countryUrl); ?>">
                                <?php echo htmlspecialchars($countryLabel); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>