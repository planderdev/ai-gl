<section class="admin-card">
    <div class="admin-card__head">
        <h3>상품 구성</h3>
    </div>
    <div class="admin-card__body">
        <div class="product-section-stack">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>공항 / 이동 정보</h4>
                    <p>상세 상단 및 상품 정보 영역에서 사용하는 접근/이동 정보를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">공항명</label>
                        <input
                            type="text"
                            name="airport_name"
                            class="admin-input js-airport-input"
                            value="<?= e($formData['airport_name'] ?? '') ?>"
                            placeholder="예: 하네다공항"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">공항 거리(km)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            name="airport_distance_km"
                            class="admin-input"
                            value="<?= e((string) ($airportDistanceKm ?? '')) ?>"
                            placeholder="예: 41.2"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">공항 이동시간(분)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            name="airport_time_min"
                            class="admin-input"
                            value="<?= e((string) ($airportTimeMin ?? '')) ?>"
                            placeholder="예: 52"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">이동수단</label>
                        <input
                            type="text"
                            name="transport_type"
                            class="admin-input"
                            value="<?= e($formData['transport_type'] ?? '') ?>"
                            placeholder="차량 / 셔틀 / 송영"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">공항 안내 문구</label>
                        <input
                            type="text"
                            name="airport_text"
                            class="admin-input"
                            value="<?= e($formData['airport_text'] ?? '') ?>"
                            placeholder="비워두면 자동 생성: 하네다공항에서 41.2km · 52분"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course travel_package">
                <div class="product-inner-card__head">
                    <h4>골프장 정보</h4>
                    <p>상세페이지 기본 소개와 코스 요약에 사용하는 핵심 골프장 정보를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">골프장명</label>
                        <input
                            type="text"
                            name="golf_name"
                            class="admin-input js-golf-input"
                            value="<?= e($formData['golf_name'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">전화번호</label>
                        <input
                            type="text"
                            name="golf_phone"
                            class="admin-input"
                            value="<?= e($formData['golf_phone'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">레거시 코스 유형</label>
                        <input
                            type="text"
                            name="course_type"
                            class="admin-input"
                            value="<?= e($formData['course_type'] ?? '') ?>"
                            placeholder="비워두면 선택한 코스타입 첫 값으로 자동 저장"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">골프장 주소</label>
                        <input
                            type="text"
                            name="golf_address"
                            class="admin-input"
                            value="<?= e($formData['golf_address'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">홀</label>
                        <input
                            type="text"
                            name="holes"
                            class="admin-input js-course-part"
                            value="<?= e($formData['holes'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">파</label>
                        <input
                            type="text"
                            name="par"
                            class="admin-input js-course-part"
                            value="<?= e($formData['par'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">야드</label>
                        <input
                            type="text"
                            name="yard"
                            class="admin-input js-course-part"
                            value="<?= e($formData['yard'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">코스 요약</label>
                        <input
                            type="text"
                            name="course_summary"
                            class="admin-input"
                            value="<?= e($formData['course_summary'] ?? '') ?>"
                            placeholder="비워두면 홀 / 파 / 야드로 자동 생성"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">골프장 소개</label>
                        <textarea name="golf_intro" class="admin-textarea" rows="5"><?= e($formData['golf_intro'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>코스타입 태그</h4>
                    <p>상품목록 필터와 맞는 값으로 저장되며, 프론트 코스타입 분류에 활용됩니다.</p>
                </div>

                <div class="admin-check-grid product-badge-grid">
                    <?php foreach ($courseTagOptions as $courseTag): ?>
                        <label class="admin-check-card product-badge-card">
                            <input
                                type="checkbox"
                                name="course_tags[]"
                                value="<?= e($courseTag) ?>"
                                <?= in_array($courseTag, $selectedCourseTags, true) ? 'checked' : '' ?>
                            >
                            <span><?= e($courseTag) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
    <div class="product-inner-card__head">
        <div>
            <h4>호텔 정보</h4>
            <p>여행 패키지 상품에서 사용하는 숙소 정보와 호텔 갤러리를 등록합니다.</p>
        </div>
    </div>

    <div class="hotel-preset-card">
        <div class="hotel-preset-card__head">
            <div>
                <strong>등록된 호텔 정보 불러오기</strong>
                <p>호텔 관리 메뉴에 등록해둔 숙소 정보를 선택하면 아래 입력칸과 호텔 갤러리가 자동으로 채워집니다.</p>
            </div>
        </div>

        <div class="hotel-preset-bar">
            <input type="hidden" name="hotel_id" value="<?= e((string) $selectedHotelId) ?>" class="js-hotel-id-input">

            <div class="admin-field hotel-preset-bar__field">
                <label class="admin-label">등록 호텔 선택</label>
                <select class="admin-select js-hotel-preset-select">
                    <option value="0">직접 입력</option>
                    <?php foreach ($hotelOptions as $hotelOption): ?>
                        <?php
                        $optionId = (int) ($hotelOption['id'] ?? 0);
                        $optionGallery = is_array($hotelOption['gallery'] ?? null) ? $hotelOption['gallery'] : [];
                        $optionDescription = trim(implode("\n\n", array_filter([
                            (string) ($hotelOption['description'] ?? ''),
                            (string) ($hotelOption['description_2'] ?? ''),
                            (string) ($hotelOption['description_3'] ?? ''),
                        ])));
                        ?>
                        <option
                            value="<?= e((string) $optionId) ?>"
                            <?= $selectedHotelId === $optionId ? 'selected' : '' ?>
                            data-id="<?= e((string) $optionId) ?>"
                            data-name="<?= e($hotelOption['name'] ?? '') ?>"
                            data-checkin-out="<?= e($hotelOption['checkin_out'] ?? '') ?>"
                            data-phone="<?= e($hotelOption['phone'] ?? '') ?>"
                            data-website="<?= e($hotelOption['website'] ?? '') ?>"
                            data-address="<?= e($hotelOption['address'] ?? '') ?>"
                            data-description="<?= e($optionDescription) ?>"
                            data-gallery='<?= e(json_encode($optionGallery, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) ?>'
                        >
                            <?= e($hotelOption['name'] ?? '') ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="hotel-preset-bar__help">
                <i class="ri-information-line"></i>
                <span>등록 호텔 선택 시 현재 입력된 호텔 갤러리도 함께 덮어써집니다.</span>
            </div>
        </div>
    </div>

    <div class="admin-form-grid admin-form-grid--3">
        <div class="admin-field">
            <label class="admin-label">호텔명</label>
            <input
                type="text"
                name="hotel_name"
                class="admin-input js-hotel-input"
                value="<?= e($formData['hotel_name'] ?? '') ?>"
            >
        </div>

        <div class="admin-field">
            <label class="admin-label">체크인 / 체크아웃</label>
            <input
                type="text"
                name="hotel_checkin_out"
                class="admin-input"
                value="<?= e($formData['hotel_checkin_out'] ?? '') ?>"
                placeholder="예: 15:00 / 11:00"
            >
        </div>

        <div class="admin-field">
            <label class="admin-label">호텔 전화번호</label>
            <input
                type="text"
                name="hotel_phone"
                class="admin-input"
                value="<?= e($formData['hotel_phone'] ?? '') ?>"
            >
        </div>

        <div class="admin-field">
            <label class="admin-label">호텔 웹사이트</label>
            <input
                type="text"
                name="hotel_website"
                class="admin-input"
                value="<?= e($formData['hotel_website'] ?? '') ?>"
            >
        </div>

        <div class="admin-field admin-field--full">
            <label class="admin-label">호텔 주소</label>
            <input
                type="text"
                name="hotel_address"
                class="admin-input"
                value="<?= e($formData['hotel_address'] ?? '') ?>"
            >
        </div>

        <div class="admin-field admin-field--full">
            <label class="admin-label">호텔 소개</label>
            <textarea name="hotel_description" class="admin-textarea" rows="5"><?= e($formData['hotel_description'] ?? '') ?></textarea>
        </div>
    </div>

    <div class="product-media-group">
        <div class="product-media-group__head">
            <h5>호텔 갤러리</h5>
            <button
                type="button"
                class="admin-btn admin-btn--light admin-btn--sm js-add-gallery-block"
                data-gallery-target="hotel-gallery-list"
                data-gallery-prefix="hotel_gallery"
            >
                추가
            </button>
        </div>

        <div class="repeater-list js-gallery-block hotel-gallery-list">
            <?php foreach ($hotelGallery as $index => $image): ?>
                <div class="repeater-item gallery-block-item">
                    <div class="gallery-upload-row">
                        <div class="gallery-upload-row__preview">
                            <?php if (!empty($image['url'])): ?>
                                <img src="<?= e($image['url']) ?>" alt="<?= e($image['alt'] ?? '호텔 이미지') ?>">
                            <?php else: ?>
                                미리보기
                            <?php endif; ?>
                        </div>

                        <div class="gallery-upload-row__fields">
                            <input type="hidden" name="hotel_gallery[<?= $index ?>][url]" class="js-gallery-url" value="<?= e($image['url'] ?? '') ?>">

                            <div class="admin-form-grid admin-form-grid--2">
                                <div class="admin-field">
                                    <label class="admin-label">캡션</label>
                                    <input type="text" name="hotel_gallery[<?= $index ?>][caption]" class="admin-input" value="<?= e($image['caption'] ?? '') ?>">
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">ALT</label>
                                    <input type="text" name="hotel_gallery[<?= $index ?>][alt]" class="admin-input" value="<?= e($image['alt'] ?? '') ?>">
                                </div>
                            </div>

                            <label class="admin-switch-row">
                                <span>대표컷</span>
                                <input
                                    type="radio"
                                    name="hotel_gallery_cover"
                                    class="js-gallery-cover"
                                    data-cover-target="hotel_gallery"
                                    data-item-index="<?= $index ?>"
                                    <?= !empty($image['is_cover']) ? 'checked' : '' ?>
                                >
                            </label>
                            <input
                                type="hidden"
                                name="hotel_gallery[<?= $index ?>][is_cover]"
                                value="<?= !empty($image['is_cover']) ? '1' : '0' ?>"
                                class="js-gallery-cover-hidden"
                            >

                            <div class="gallery-upload-row__actions">
                                <input type="file" class="js-image-upload" data-upload-type="product_gallery" data-target="gallery-item" accept="image/*">
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-up">위로</button>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-down">아래로</button>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-gallery-item">복제</button>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
 
            <?php
$facilityPresetOptions = [
    ['label' => '클럽하우스', 'icon' => 'ri-building-line'],
    ['label' => '레스토랑', 'icon' => 'ri-restaurant-2-line'],
    ['label' => '프로샵', 'icon' => 'ri-store-2-line'],
    ['label' => '락커룸', 'icon' => 'ri-door-lock-line'],
    ['label' => '샤워실', 'icon' => 'ri-drop-line'],
    ['label' => '사우나', 'icon' => 'ri-hotspot-line'],
    ['label' => '퍼팅연습장', 'icon' => 'ri-golf-ball-line'],
    ['label' => '드라이빙레인지', 'icon' => 'ri-focus-3-line'],
    ['label' => '연회장', 'icon' => 'ri-goblet-line'],
    ['label' => '주차장', 'icon' => 'ri-roadster-line'],
    ['label' => '픽업서비스', 'icon' => 'ri-car-line'],
    ['label' => '와이파이', 'icon' => 'ri-wifi-line'],
];

$selectedFacilityLabels = array_values(array_filter(array_map(
    static fn($item) => trim((string) ($item['label'] ?? '')),
    is_array($facilities ?? null) ? $facilities : []
)));

$presetFacilityLabels = array_column($facilityPresetOptions, 'label');
$customFacilityLabels = array_values(array_filter(
    $selectedFacilityLabels,
    static fn($label) => !in_array($label, $presetFacilityLabels, true)
));
?>

<section class="product-inner-card">
    <div class="product-inner-card__head">
        <div>
            <h4>서비스 및 편의시설</h4>
            <p class="admin-help-text">상세페이지에 노출할 시설을 아이콘 카드 형태로 선택하세요.</p>
        </div>
    </div>

    <div class="facility-picker js-facility-picker">
        <div class="facility-picker__grid">
            <?php foreach ($facilityPresetOptions as $index => $option): ?>
                <?php
                $isChecked = in_array($option['label'], $selectedFacilityLabels, true);
                $fieldIndex = $index;
                ?>
                <label class="facility-card <?= $isChecked ? 'is-active' : '' ?>">
                    <input
                        type="checkbox"
                        class="facility-card__check js-facility-toggle"
                        data-target-index="<?= $fieldIndex ?>"
                        <?= $isChecked ? 'checked' : '' ?>
                    >
                    <input
                        type="hidden"
                        name="facilities[<?= $fieldIndex ?>][label]"
                        value="<?= e($option['label']) ?>"
                        class="js-facility-hidden"
                        data-target-index="<?= $fieldIndex ?>"
                        <?= $isChecked ? '' : 'disabled' ?>
                    >

                    <span class="facility-card__icon">
                        <i class="<?= e($option['icon']) ?>"></i>
                    </span>
                    <span class="facility-card__label"><?= e($option['label']) ?></span>
                </label>
            <?php endforeach; ?>
        </div>

        <div class="facility-custom-box">
            <div class="facility-custom-box__head">
                <h5>직접 입력 시설</h5>
                <button
                    type="button"
                    class="admin-btn admin-btn--light admin-btn--sm js-add-custom-facility"
                    data-next-index="100"
                >
                    직접 추가
                </button>
            </div>

            <div class="facility-custom-list js-custom-facility-list">
                <?php if (empty($customFacilityLabels)): ?>
                    <div class="facility-custom-item">
                        <input
                            type="text"
                            name="facilities[100][label]"
                            class="admin-input"
                            value=""
                            placeholder="예: 키즈존, 수영장, 발렛파킹"
                        >
                        <button
                            type="button"
                            class="admin-btn admin-btn--light admin-btn--sm js-remove-custom-facility"
                        >
                            삭제
                        </button>
                    </div>
                <?php else: ?>
                    <?php foreach ($customFacilityLabels as $customIndex => $customLabel): ?>
                        <?php $fieldIndex = 100 + $customIndex; ?>
                        <div class="facility-custom-item">
                            <input
                                type="text"
                                name="facilities[<?= $fieldIndex ?>][label]"
                                class="admin-input"
                                value="<?= e($customLabel) ?>"
                                placeholder="예: 키즈존, 수영장, 발렛파킹"
                            >
                            <button
                                type="button"
                                class="admin-btn admin-btn--light admin-btn--sm js-remove-custom-facility"
                            >
                                삭제
                            </button>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>



            <section class="product-inner-card js-type-panel" data-type-panel="golf_course travel_package">
                <div class="product-inner-card__head">
                    <h4>골프장 갤러리</h4>
                    <p>골프장 전경, 코스 이미지, 시설 컷 등을 등록합니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-gallery-block"
                        data-gallery-target="golf-gallery-list"
                        data-gallery-prefix="golf_gallery"
                    >
                        추가
                    </button>
                </div>

                <div class="repeater-list js-gallery-block golf-gallery-list">
                    <?php foreach ($golfGallery as $index => $image): ?>
                        <div class="repeater-item gallery-block-item">
                            <div class="gallery-upload-row">
                                <div class="gallery-upload-row__preview">
                                    <?php if (!empty($image['url'])): ?>
                                        <img src="<?= e($image['url']) ?>" alt="<?= e($image['alt'] ?? '골프장 이미지') ?>">
                                    <?php else: ?>
                                        미리보기
                                    <?php endif; ?>
                                </div>

                                <div class="gallery-upload-row__fields">
                                    <input type="hidden" name="golf_gallery[<?= $index ?>][url]" class="js-gallery-url" value="<?= e($image['url'] ?? '') ?>">

                                    <div class="admin-form-grid admin-form-grid--2">
                                        <div class="admin-field">
                                            <label class="admin-label">캡션</label>
                                            <input type="text" name="golf_gallery[<?= $index ?>][caption]" class="admin-input" value="<?= e($image['caption'] ?? '') ?>">
                                        </div>

                                        <div class="admin-field">
                                            <label class="admin-label">ALT</label>
                                            <input type="text" name="golf_gallery[<?= $index ?>][alt]" class="admin-input" value="<?= e($image['alt'] ?? '') ?>">
                                        </div>
                                    </div>

                                    <label class="admin-switch-row">
                                        <span>대표컷</span>
                                        <input
                                            type="radio"
                                            name="golf_gallery_cover"
                                            class="js-gallery-cover"
                                            data-cover-target="golf_gallery"
                                            data-item-index="<?= $index ?>"
                                            <?= !empty($image['is_cover']) ? 'checked' : '' ?>
                                        >
                                    </label>
                                    <input
                                        type="hidden"
                                        name="golf_gallery[<?= $index ?>][is_cover]"
                                        value="<?= !empty($image['is_cover']) ? '1' : '0' ?>"
                                        class="js-gallery-cover-hidden"
                                    >

                                    <div class="gallery-upload-row__actions">
                                        <input type="file" class="js-image-upload" data-upload-type="product_gallery" data-target="gallery-item" accept="image/*">
                                        <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-up">위로</button>
                                        <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-down">아래로</button>
                                        <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-gallery-item">복제</button>
                                        <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

        </div>
    </div>
</section>