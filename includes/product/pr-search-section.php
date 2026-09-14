 

<section class="tb-search-hero" aria-label="검색">
    <!-- PC / Tablet -->
    <form class="tb-page-search-bar" onsubmit="return false;">
        <div class="tb-page-search-item tb-page-search-item--destination">
            <label>어디로 가세요?</label>

            <div class="booking-input-wrap">
                <input
                    type="text"
                    class="booking-input"
                    id="destinationInput"
                    placeholder="<?= htmlspecialchars($teetimePageData['search']['country_placeholder']) ?>"
                    autocomplete="off"
                >
                <button type="button" class="booking-input-reset" id="destinationReset" aria-label="입력값 지우기">
                    <i class="ri-close-line"></i>
                </button>
            </div>

            <div class="booking-layer destination-layer" id="destinationLayer">
                <div class="booking-layer-inner">
                    <div class="booking-layer-section">
                        <strong>인기 지역</strong>
                        <div class="chip-list">
                            <?php foreach ($teetimePageData['search']['popular_regions'] as $region): ?>
                                <button
                                    type="button"
                                    class="chip-btn"
                                    data-destination="<?= htmlspecialchars($region) ?>"
                                >
                                    <?= htmlspecialchars($region) ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="booking-layer-section">
                        <strong>고객님들이 선택한 패키지</strong>
                        <div class="package-list">
                            <?php foreach ($teetimePageData['search']['popular_packages'] as $index => $package): ?>
                                <button
                                    type="button"
                                    class="package-item"
                                    data-destination="<?= htmlspecialchars($package) ?>"
                                >
                                    <span><?= $index + 1 ?></span>
                                    <em><?= htmlspecialchars($package) ?></em>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="booking-layer-section">
                        <strong>추천 골프장</strong>
                        <div class="chip-list">
                            <?php foreach ($teetimePageData['search']['recommended_courses'] as $course): ?>
                                <button
                                    type="button"
                                    class="chip-btn"
                                    data-destination="<?= htmlspecialchars($course) ?>"
                                >
                                    <?= htmlspecialchars($course) ?>
                                </button>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="tb-page-search-item tb-page-search-item--date">
            <label>언제 가세요?</label>
            <button type="button" class="tb-page-search-trigger" id="dateTrigger">
                <span id="dateValue"><?= htmlspecialchars($teetimePageData['search']['date']) ?></span>
            </button>
        </div>

        <div class="tb-page-search-item tb-page-search-item--person">
            <label>몇 분이서 가세요?</label>
            <button type="button" class="tb-page-search-trigger" id="personTrigger">
                <span id="personValue"><?= htmlspecialchars($teetimePageData['search']['players']) ?></span>
            </button>

            <div class="booking-layer person-layer" id="personLayer">
                <div class="booking-layer-inner">
                    <div class="chip-list">
                        <?php foreach ($teetimePageData['search']['persons'] as $person): ?>
                            <button
                                type="button"
                                class="chip-btn"
                                data-person="<?= htmlspecialchars($person) ?>"
                            >
                                <?= htmlspecialchars($person) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <div class="tb-page-search-submit-wrap">
            <button type="button" class="tb-page-search-submit" id="heroSearchBtn">검색하기</button>
        </div>
    </form>

    <!-- Mobile -->
    <div class="tb-search-mobile">
        <button
            type="button"
            class="tb-search-mobile-trigger"
            id="tbSearchMobileTrigger"
            aria-expanded="false"
            aria-controls="tbSearchMobileModal"
        >
            <span class="tb-search-mobile-trigger__text">
                <strong>티타임 검색</strong>
                <small id="tbSearchMobileSummary">
                    <?= htmlspecialchars($teetimePageData['search']['country_placeholder']) ?>
                    · <?= htmlspecialchars($teetimePageData['search']['date']) ?>
                    · <?= htmlspecialchars($teetimePageData['search']['players']) ?>
                </small>
            </span>
            <span class="tb-search-mobile-trigger__icon">
                <i class="ri-search-line"></i>
            </span>
        </button>
    </div>

    <div
        class="tb-search-mobile-modal"
        id="tbSearchMobileModal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tbSearchMobileTitle"
    >
        <div class="tb-search-mobile-modal__dialog">
            <div class="tb-search-mobile-modal__head">
                <strong class="tb-search-mobile-modal__title" id="tbSearchMobileTitle">티타임 검색</strong>
                <button
                    type="button"
                    class="tb-search-mobile-modal__close"
                    id="tbSearchMobileClose"
                    aria-label="검색창 닫기"
                >
                    <i class="ri-close-line"></i>
                </button>
            </div>

            <div class="tb-search-mobile-modal__body">
                <div class="tb-search-mobile-section">
                    <label class="tb-search-mobile-section__label" for="mobileDestinationInput">어디로 가세요?</label>
                    <div class="tb-search-mobile-input-wrap">
                        <input
                            type="text"
                            class="tb-search-mobile-input"
                            id="mobileDestinationInput"
                            placeholder="<?= htmlspecialchars($teetimePageData['search']['country_placeholder']) ?>"
                            autocomplete="off"
                        >
                        <button type="button" class="tb-search-mobile-input-reset" id="mobileDestinationReset" aria-label="입력값 지우기">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>

                    <div class="tb-search-mobile-chips">
                        <?php foreach ($teetimePageData['search']['popular_regions'] as $region): ?>
                            <button
                                type="button"
                                class="tb-search-mobile-chip"
                                data-mobile-destination="<?= htmlspecialchars($region) ?>"
                            >
                                <?= htmlspecialchars($region) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="tb-search-mobile-section">
                <span class="tb-search-mobile-section__label">언제 가시나요?</span>
 
  <div id="mobileCalendar" class="tb-search-mobile-calendar"></div>

  <div class="tb-search-mobile-date-summary" id="mobileDateSummary">
    날짜를 선택해주세요
  </div>
</div>

                <div class="tb-search-mobile-section">
                    <span class="tb-search-mobile-section__label">몇 분이서 가세요?</span>
                    <div class="tb-search-mobile-persons">
                        <?php foreach ($teetimePageData['search']['persons'] as $index => $person): ?>
                            <button
                                type="button"
                                class="tb-search-mobile-person<?= $index === 0 ? ' is-active' : '' ?>"
                                data-mobile-person="<?= htmlspecialchars($person) ?>"
                            >
                                <?= htmlspecialchars($person) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="tb-search-mobile-section">
                    <span class="tb-search-mobile-section__label">추천 골프장</span>
                    <div class="tb-search-mobile-chips">
                        <?php foreach ($teetimePageData['search']['recommended_courses'] as $course): ?>
                            <button
                                type="button"
                                class="tb-search-mobile-chip"
                                data-mobile-destination="<?= htmlspecialchars($course) ?>"
                            >
                                <?= htmlspecialchars($course) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div class="tb-search-mobile-modal__foot">
                <button type="button" class="tb-search-mobile-submit" id="tbSearchMobileSubmit">검색하기</button>
            </div>
        </div>
    </div>
</section>