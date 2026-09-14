<?php if (!isset($heroData)) include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/hero.php'; ?>

<section class="main-hero">
    <div class="hero-slider swiper" id="heroSlider">
        <div class="swiper-wrapper">

            <?php if (!empty($heroData['slides'])): ?>
                <?php foreach ($heroData['slides'] as $slide): ?>
                    <div class="swiper-slide">
                        <div
                            class="hero-slide-bg"
                            style="background-image: url('<?= htmlspecialchars($slide['image']) ?>');"
                        ></div>
                        <div class="hero-slide-overlay"></div>

                        <div class="container hero-content">
                            <div class="hero-copy">
                                <h1><?= nl2br(htmlspecialchars($slide['title'])) ?></h1>
                                <p><?= htmlspecialchars($slide['desc']) ?></p>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>

        </div>

        <button type="button" class="hero-nav hero-prev" aria-label="이전 슬라이드">
            <i class="ri-arrow-left-s-line"></i>
        </button>

        <button type="button" class="hero-nav hero-next" aria-label="다음 슬라이드">
            <i class="ri-arrow-right-s-line"></i>
        </button>

        <div class="hero-pagination"></div>
    </div>

    <div class="container hero-booking-wrap">
        <form class="hero-booking-bar" onsubmit="return false;">
            <!-- 목적지 -->
            <div class="hero-booking-item booking-destination">
                <label>어디로 가세요?</label>

                <div class="booking-input-wrap">
    <input
        type="text"
        class="booking-input"
        id="destinationInput"
        placeholder="골프장, 지역 검색"
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
                                <?php if (!empty($heroData['booking']['destinations']['popular_regions'])): ?>
                                    <?php foreach ($heroData['booking']['destinations']['popular_regions'] as $region): ?>
                                        <button
                                            type="button"
                                            class="chip-btn"
                                            data-destination="<?= htmlspecialchars($region) ?>"
                                        >
                                            <?= htmlspecialchars($region) ?>
                                        </button>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="booking-layer-section">
                            <strong>고객님들이 선택한 패키지</strong>
                            <div class="package-list">
                                <?php if (!empty($heroData['booking']['destinations']['popular_packages'])): ?>
                                    <?php foreach ($heroData['booking']['destinations']['popular_packages'] as $index => $package): ?>
                                        <button
                                            type="button"
                                            class="package-item"
                                            data-destination="<?= htmlspecialchars($package) ?>"
                                        >
                                            <span><?= $index + 1 ?></span>
                                            <em><?= htmlspecialchars($package) ?></em>
                                        </button>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="booking-layer-section">
                            <strong>추천 골프장</strong>
                            <div class="chip-list">
                                <?php if (!empty($heroData['booking']['destinations']['recommended_courses'])): ?>
                                    <?php foreach ($heroData['booking']['destinations']['recommended_courses'] as $course): ?>
                                        <button
                                            type="button"
                                            class="chip-btn"
                                            data-destination="<?= htmlspecialchars($course) ?>"
                                        >
                                            <?= htmlspecialchars($course) ?>
                                        </button>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 날짜 -->
            <div class="hero-booking-item booking-date">
                <label>언제 가세요?</label>

                <button type="button" class="booking-trigger" id="dateTrigger">
                    <span id="dateValue">날짜 선택</span>
                </button>
            </div>

            <!-- 인원 -->
            <div class="hero-booking-item booking-person">
                <label>몇 분이서 가세요?</label>

                <button type="button" class="booking-trigger" id="personTrigger">
                    <span id="personValue">인원 선택</span>
                </button>

                <div class="booking-layer person-layer" id="personLayer">
                    <div class="booking-layer-inner">
                        <div class="chip-list">
                        <?php if (!empty($heroData['booking']['persons'])): ?>
    <?php foreach ($heroData['booking']['persons'] as $person): ?>
        <?php $personLabel = is_numeric($person) ? $person . '인' : $person; ?>
        <button
            type="button"
            class="chip-btn"
            data-person="<?= htmlspecialchars($personLabel) ?>"
        >
            <?= htmlspecialchars($personLabel) ?>
        </button>
    <?php endforeach; ?>
<?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 검색 -->
            <div class="hero-booking-submit">
                <button type="button" class="hero-search-btn" id="heroSearchBtn">검색하기</button>
            </div>
        </form>
    </div>
</section>

<div class="booking-modal" id="dateModal" aria-hidden="true">
    <div class="booking-modal-dim"></div>

    <div class="booking-modal-dialog">
        <div class="booking-modal-header">
            <button type="button" class="calendar-nav-btn" id="prevMonthBtn">
                <i class="ri-arrow-left-s-line"></i>
            </button>

            <strong id="calendarTitle">2026 3월</strong>

            <button type="button" class="calendar-nav-btn" id="nextMonthBtn">
                <i class="ri-arrow-right-s-line"></i>
            </button>
        </div>

        <div class="calendar-weekdays">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>

        <div class="booking-modal-footer">
            <button type="button" class="calendar-action-btn cancel" id="calendarCancelBtn">취소</button>
            <button type="button" class="calendar-action-btn confirm" id="calendarConfirmBtn">확인</button>
        </div>
    </div>
</div>