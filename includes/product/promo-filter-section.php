<?php if (($pageType ?? '') === 'special' && !empty($teetimePageData['filters']['discount_ranges'])): ?>
    <section class="pr-visual-filter" aria-label="할인 상품 필터">
        <div class="pr-visual-filter__list pr-visual-filter__list--discount">
            <?php foreach ($teetimePageData['filters']['discount_ranges'] as $item): ?>
                <?php $parts = explode('~', $item['label']); ?>
                <button
                    type="button"
                    class="pr-visual-filter__btn pr-visual-filter__btn--discount"
                    data-discount-visual="<?= htmlspecialchars($item['value']) ?>"
                >
                 
                <span class="pr-visual-filter__discount-top">
                        <?= htmlspecialchars($parts[0] ?? '') ?>
                    </span>-
                    <span class="pr-visual-filter__discount-bottom">
                        <?= htmlspecialchars($parts[1] ?? '') ?>
                    </span>
                </button>
            <?php endforeach; ?>
        </div>
    </section>
<?php endif; ?>