<?php if (!empty($teetimePageData['filters']['theme_visuals'])): ?>
    <section class="pr-visual-filter" aria-label="테마 상품 필터">
        <div class="pr-visual-filter__list">
            <?php foreach ($teetimePageData['filters']['theme_visuals'] as $index => $item): ?>
                <button
                    type="button"
                    class="pr-visual-filter__btn <?= $currentThemeVisual === $item['value'] ? 'is-active' : '' ?>"
                    data-theme-visual="<?= htmlspecialchars($item['value']) ?>"
                >
                    <span class="pr-visual-filter__icon">
                        <i class="<?= htmlspecialchars($item['icon']) ?>"></i>
                    </span>
                    <span class="pr-visual-filter__label">
                        <?= htmlspecialchars($item['label']) ?>
                    </span>
                </button>
            <?php endforeach; ?>
        </div>
    </section>
<?php endif; ?>