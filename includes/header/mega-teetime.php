<?php
$teetime = $menuData['teetime'] ?? [];
$teetimeCategories = $teetime['categories'] ?? [];
$teetimeCountries = $teetime['countries'] ?? [];
$teetimePromo = $teetime['promo'] ?? [];
$firstTeetimeKey = !empty($teetimeCategories) ? array_key_first($teetimeCategories) : null;
?>

<div class="mega-menu">
    <div class="mega-menu-inner has-promo">
        <div class="mega-promo">
            <strong><?php echo htmlspecialchars($teetimePromo['title'] ?? ''); ?></strong>
            <p><?php echo htmlspecialchars($teetimePromo['desc'] ?? ''); ?></p>
            <a href="<?php echo htmlspecialchars($teetimePromo['url'] ?? '#'); ?>" class="mega-promo-banner">
                <img src="<?php echo htmlspecialchars($teetimePromo['image'] ?? ''); ?>" alt="이벤트 배너">
            </a>
        </div>

        <div class="mega-panel">
        <div class="mega-category-list">
    <?php foreach ($teetimeCategories as $key => $label): ?>
        <button
            type="button"
            class="mega-category <?php echo $key === $firstTeetimeKey ? 'is-active' : ''; ?>"
            data-target="teetime-<?php echo htmlspecialchars($key); ?>"
        >
            <span class="mega-category__label"><?php echo htmlspecialchars($label); ?></span>
            <span class="mega-category__icon material-symbols-rounded" aria-hidden="true">chevron_forward</span>
        </button>
    <?php endforeach; ?>
</div>

            <div class="mega-country-panels">
    <?php foreach ($teetimeCountries as $key => $countries): ?>
        <div
            class="mega-country-panel <?php echo $key === $firstTeetimeKey ? 'is-active' : ''; ?>"
            id="teetime-<?php echo htmlspecialchars($key); ?>"
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