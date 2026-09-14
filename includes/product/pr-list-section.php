 

<?php
$currentThemeVisual = isset($_GET['themeVisual']) ? trim($_GET['themeVisual']) : '';

$allowedThemeVisuals = array_column($teetimePageData['filters']['theme_visuals'], 'value');

if (!in_array($currentThemeVisual, $allowedThemeVisuals, true)) {
    $currentThemeVisual = '';
}

$filteredCourses = array_values(array_filter(
    $teetimePageData['courses'],
    function ($course) use ($currentThemeVisual) {
        if ($currentThemeVisual === '') {
            return true;
        }

        return isset($course['theme_type']) && $course['theme_type'] === $currentThemeVisual;
    }
));
?>


<div class="tb-layout">
    <div class="tb-filter-mobile-bar">
        <button
            type="button"
            class="tb-filter-mobile-btn"
            id="tbFilterOpen"
            aria-controls="tbFilter"
            aria-expanded="false"
        >
            <i class="ri-equalizer-line"></i>
            <span>필터</span>
        </button>
    </div>

    <div class="tb-filter-modal" id="tbFilterModal" aria-hidden="true">
        <div class="tb-filter-modal__backdrop" data-filter-close></div>
    </div>

    <aside class="tb-filter" id="tbFilter">
        <div class="tb-filter-modal__top">
            <strong class="tb-filter-modal__title" id="tbFilterModalTitle">필터</strong>

            <button
                type="button"
                class="tb-filter-modal__close"
                data-filter-close
                aria-label="필터 닫기"
            >
                <i class="ri-close-line"></i>
            </button>
        </div>

        <div class="tb-filter__head">
            <strong class="tb-filter__title">필터</strong>
            <button type="button" class="tb-filter__reset">초기화</button>
        </div>

        <div class="tb-filter__body">
        <div class="tb-filter-group">
            <h3 class="tb-filter-group__title">가격</h3>

            <div class="tb-price-chips">
                <button type="button" class="tb-price-chip is-active" data-price="all">전체</button>
                <button type="button" class="tb-price-chip" data-price="0-100000">10만원 이하</button>
                <button type="button" class="tb-price-chip" data-price="100000-150000">10만~15만</button>
                <button type="button" class="tb-price-chip" data-price="150000-200000">15만~20만</button>
                <button type="button" class="tb-price-chip" data-price="200000-300000">20만~30만</button>
                <button type="button" class="tb-price-chip" data-price="300000-999999999">30만 이상</button>
            </div>
        </div>

        <div class="tb-filter-group">
            <button type="button" class="tb-filter-group__toggle" data-filter-toggle>
                <h3 class="tb-filter-group__title">공항과의 거리</h3>
                <span class="tb-filter-group__arrow">
                    <i class="ri-arrow-up-s-line"></i>
                </span>
            </button>

            <div class="tb-filter-group__body">
                <div class="tb-price-chips tb-distance-chips">
                    <?php foreach ($teetimePageData['filters']['airport_distance_ranges'] as $index => $distance): ?>
                        <button
                            type="button"
                            class="tb-price-chip tb-distance-chip <?= $index === 0 ? 'is-active' : '' ?>"
                            data-distance="<?= htmlspecialchars($distance['value']) ?>"
                        >
                            <?= htmlspecialchars($distance['label']) ?>
                        </button>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <div class="tb-filter-group">
            <button type="button" class="tb-filter-group__toggle" data-filter-toggle>
                <h3 class="tb-filter-group__title">티타임 시간대</h3>
                <span class="tb-filter-group__arrow">
                    <i class="ri-arrow-up-s-line"></i>
                </span>
            </button>

            <div class="tb-filter-group__body tb-filter-checks">
                <?php foreach ($teetimePageData['filters']['time_bands'] as $band): ?>
                    <label class="tb-check">
                        <input
                            type="checkbox"
                            class="tb-filter-time-band"
                            value="<?= htmlspecialchars($band['value']) ?>"
                            <?= !empty($band['checked']) ? 'checked' : '' ?>
                        >
                        <span><?= htmlspecialchars($band['label']) ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="tb-filter-group">
            <button type="button" class="tb-filter-group__toggle" data-filter-toggle>
                <h3 class="tb-filter-group__title">예약방식</h3>
                <span class="tb-filter-group__arrow">
                    <i class="ri-arrow-up-s-line"></i>
                </span>
            </button>

            <div class="tb-filter-group__body tb-filter-checks">
                <?php foreach ($teetimePageData['filters']['booking_types'] as $type): ?>
                    <label class="tb-check">
                        <input
                            type="checkbox"
                            class="tb-filter-booking-type"
                            value="<?= htmlspecialchars($type['value']) ?>"
                            <?= !empty($type['checked']) ? 'checked' : '' ?>
                        >
                        <span><?= htmlspecialchars($type['label']) ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="tb-filter-group">
            <button type="button" class="tb-filter-group__toggle" data-filter-toggle>
                <h3 class="tb-filter-group__title">코스타입</h3>
                <span class="tb-filter-group__arrow">
                    <i class="ri-arrow-up-s-line"></i>
                </span>
            </button>

            <div class="tb-filter-group__body tb-filter-checks">
                <?php foreach ($teetimePageData['filters']['course_types'] as $type): ?>
                    <label class="tb-check">
                        <input
                            type="checkbox"
                            class="tb-filter-course-type"
                            value="<?= htmlspecialchars($type['value']) ?>"
                            <?= !empty($type['checked']) ? 'checked' : '' ?>
                        >
                        <span><?= htmlspecialchars($type['label']) ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="tb-filter-group">
            <h3 class="tb-filter-group__title">지역</h3>

            <div class="tb-filter-checks">
                <?php foreach ($teetimePageData['filters']['regions'] as $region): ?>
                    <label class="tb-check">
                        <input
                            type="checkbox"
                            class="tb-filter-region"
                            value="<?= htmlspecialchars($region['label']) ?>"
                            <?= !empty($region['checked']) ? 'checked' : '' ?>
                        >
                        <span><?= htmlspecialchars($region['label']) ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="tb-filter-group">
            <h3 class="tb-filter-group__title">테마</h3>

            <div class="tb-filter-checks">
                <?php foreach ($teetimePageData['filters']['themes'] as $theme): ?>
                    <label class="tb-check">
                        <input
                            type="checkbox"
                            class="tb-filter-theme"
                            value="<?= htmlspecialchars($theme['label']) ?>"
                            <?= !empty($theme['checked']) ? 'checked' : '' ?>
                        >
                        <span><?= htmlspecialchars($theme['label']) ?></span>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>
        </div>
        <div class="tb-filter-modal__actions">
            <button type="button" class="tb-filter-mobile-reset tb-filter__reset">초기화</button>
            <button type="button" class="tb-filter-mobile-apply" data-filter-close>필터 적용</button>
        </div>
    </aside>

    <section class="tb-content">
        <div class="tb-list-head">
            <strong class="tb-list-head__count">
            상품 <span id="tbVisibleCount"><?= count($filteredCourses) ?></span>개
            </strong>

            <div class="tb-list-head__sort">
                <button type="button" class="tb-sort-btn is-active" data-sort="recommended">추천순</button>
                <button type="button" class="tb-sort-btn" data-sort="price-asc">낮은 가격순</button>
                <button type="button" class="tb-sort-btn" data-sort="time-asc">빠른 티오프순</button>
            </div>
        </div>

        <div class="tb-empty" id="tbEmptyState" hidden>조건에 맞는 상품이 없습니다.</div>

        <div class="tb-list" id="tbList">
        <?php foreach ($filteredCourses as $index => $course): ?>
                <article
                    class="tb-card"
                    data-index="<?= $index ?>"
                    data-name="<?= htmlspecialchars($course['name']) ?>"
                    data-location="<?= htmlspecialchars($course['location']) ?>"
                    data-region="<?= htmlspecialchars($course['region']) ?>"
                    data-theme="<?= htmlspecialchars($course['theme']) ?>"
                    data-price="<?= (int) $course['price_value'] ?>"
                    data-first-time="<?= htmlspecialchars($course['first_time']) ?>"
                    data-airport-distance="<?= (int) $course['airport_distance_value'] ?>"
                    data-time-band="<?= htmlspecialchars($course['time_band']) ?>"
                    data-booking-type="<?= htmlspecialchars($course['booking_type']) ?>"
                    data-course-type="<?= htmlspecialchars($course['course_type']) ?>"
                    data-theme-type="<?= htmlspecialchars($course['theme_type']) ?>"
                    data-discount-range="<?= htmlspecialchars($course['discount_range']) ?>"
                >
                    <a href="<?= htmlspecialchars($course['detail_url']) ?>" class="tb-card__img">
                        <img src="<?= htmlspecialchars($course['image']) ?>" alt="<?= htmlspecialchars($course['name']) ?>">
                    </a>

                    <div class="tb-card__body">
                        <p class="tb-card__location"><?= htmlspecialchars($course['location']) ?></p>

                        <h2 class="tb-card__title">
                            <a href="<?= htmlspecialchars($course['detail_url']) ?>">
                                <?= htmlspecialchars($course['name']) ?>
                            </a>
                        </h2>

                        <div class="tb-card__specs">
                            <span class="tb-card__status"><?= htmlspecialchars($course['status_label']) ?></span>
                            <span class="tb-card__spec-text"><?= (int) $course['holes'] ?>홀</span>
                            <span class="tb-card__spec-text"><?= (int) $course['par'] ?>파</span>
                            <span class="tb-card__spec-text"><?= htmlspecialchars($course['yard']) ?></span>
                        </div>

                        <p class="tb-card__airport">
                            <?= htmlspecialchars($course['airport_name']) ?>에서
                            <?= htmlspecialchars($course['airport_distance']) ?> ·
                            <?= htmlspecialchars($course['airport_time']) ?>
                        </p>

                        <div class="tb-card__badge-row">
                            <span class="tb-card__badge"><?= htmlspecialchars($course['badge']) ?></span>
                        </div>

                        <div class="tb-card__times">
                            <?php foreach ($course['times'] as $time): ?>
                                <button type="button" class="tb-time-chip"><?= htmlspecialchars($time) ?></button>
                            <?php endforeach; ?>
                        </div>

                        <div class="tb-card__footer">
                            <div class="tb-card__price"><?= htmlspecialchars($course['price']) ?></div>
                            <a href="<?= htmlspecialchars($course['detail_url']) ?>" class="tb-card__link">상세보기</a>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </section>
</div>

