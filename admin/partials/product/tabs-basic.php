<section class="admin-card">
    <div class="admin-card__head">
        <h3>기본 정보</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack product-section-stack--spacious">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>상품 기본 분류</h4>
                    <p>상품 유형, 상태, 운영용 식별 정보를 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">상품 유형</label>
                        <select name="type" class="admin-select js-product-type-select">
                            <option value="golf_course" <?= $productType === 'golf_course' ? 'selected' : '' ?>>골프장</option>
                            <option value="travel_package" <?= $productType === 'travel_package' ? 'selected' : '' ?>>여행 패키지</option>
                        </select>
                        <div class="admin-help-text">저장 시 hidden `product_type`과 함께 기준 타입으로 사용됩니다.</div>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">SKU / 상품코드</label>
                        <input
                            type="text"
                            name="sku"
                            class="admin-input"
                            value="<?= e($formData['sku'] ?? '') ?>"
                            placeholder="예: JP-TOKYO-001"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">공개 상태</label>
                        <select name="status" class="admin-select js-summary-status-select">
                            <?php foreach ($statusOptions as $value => $label): ?>
                                <option value="<?= e($value) ?>" <?= ($formData['status'] ?? '') === $value ? 'selected' : '' ?>>
                                    <?= e($label) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">정렬 우선순위</label>
                        <input
                            type="number"
                            name="sort_order"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['sort_order'] ?? 0)) ?>"
                            placeholder="예: 10"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>지역 / 노출 분류</h4>
                    <p>상세/목록 페이지와 검색/필터에 사용하는 지역 분류를 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">국가</label>
                        <select name="country" class="admin-select js-country-select">
                            <option value="">선택하세요</option>
                            <?php foreach ($countries as $country): ?>
                                <?php
                                $countryName = is_array($country)
                                    ? (string) ($country['name'] ?? '')
                                    : (string) $country;
                                if ($countryName === '') continue;
                                ?>
                                <option value="<?= e($countryName) ?>" <?= ($formData['country'] ?? '') === $countryName ? 'selected' : '' ?>>
                                    <?= e($countryName) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">지역</label>
                        <select name="region" class="admin-select js-region-select">
                            <option value="">선택하세요</option>
                            <?php foreach ($regions as $region): ?>
                                <?php
                                $regionName = is_array($region)
                                    ? (string) ($region['name'] ?? '')
                                    : (string) $region;
                                if ($regionName === '') continue;
                                ?>
                                <option value="<?= e($regionName) ?>" <?= ($formData['region'] ?? '') === $regionName ? 'selected' : '' ?>>
                                    <?= e($regionName) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">서브 지역</label>
                        <input
                            type="text"
                            name="sub_region"
                            class="admin-input"
                            value="<?= e($subRegion) ?>"
                            placeholder="예: 치바 북부 / 서귀포 동부"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">프론트 지역</label>
                        <select name="front_region" class="admin-select js-front-region-select">
                            <option value="">선택하세요</option>
                            <?php
                            $selectedCountry = (string) ($formData['country'] ?? '');
                            $frontRegionOptions = $frontRegionOptionsByCountry[$selectedCountry] ?? [];
                            foreach ($frontRegionOptions as $frontRegion):
                            ?>
                                <option value="<?= e($frontRegion) ?>" <?= ($formData['front_region'] ?? '') === $frontRegion ? 'selected' : '' ?>>
                                    <?= e($frontRegion) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <div class="admin-help-text">상품목록 상단 필터/지역 버튼과 맞춰 사용하는 프론트 노출용 지역입니다.</div>
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">브레드크럼 문구</label>
                        <input
                            type="text"
                            name="breadcrumb_text"
                            class="admin-input"
                            value="<?= e($formData['breadcrumb_text'] ?? '') ?>"
                            placeholder="예: 일본 &gt; 도쿄/치바 &gt; 프리미엄 골프"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>카드 / 뱃지 노출</h4>
                    <p>상품 카드와 상세 상단에서 사용할 라벨, 배지, 대표 테마를 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">카드 라벨</label>
                        <input
                            type="text"
                            name="card_label"
                            class="admin-input js-sidebar-badge-input"
                            value="<?= e($formData['card_label'] ?? '') ?>"
                            placeholder="예: 특가 / 추천 / 실시간"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">대표 테마 문구</label>
                        <input
                            type="text"
                            name="theme_text"
                            class="admin-input"
                            value="<?= e($formData['theme_text'] ?? '') ?>"
                            placeholder="예: 오션뷰 · 리조트형"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 노출 타입</label>
                        <select name="booking_display_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="instant" <?= ($formData['booking_display_type'] ?? '') === 'instant' ? 'selected' : '' ?>>실시간 예약</option>
                            <option value="request" <?= ($formData['booking_display_type'] ?? '') === 'request' ? 'selected' : '' ?>>예약 요청</option>
                            <option value="consult" <?= ($formData['booking_display_type'] ?? '') === 'consult' ? 'selected' : '' ?>>상담 문의</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">대표 비주얼 테마</label>
                        <select name="primary_theme_visual" class="admin-select">
                            <option value="">선택하세요</option>
                            <?php foreach ($themeVisualOptions as $visual): ?>
                                <option value="<?= e($visual) ?>" <?= ($formData['primary_theme_visual'] ?? '') === $visual ? 'selected' : '' ?>>
                                    <?= e($visual) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="product-subsection">
                    <div class="product-subsection__head">
                        <h5>테마 비주얼</h5>
                        <p>목록/상세의 테마 필터 및 비주얼 키워드에 활용합니다.</p>
                    </div>

                    <div class="admin-check-grid product-badge-grid">
                        <?php foreach ($themeVisualOptions as $visual): ?>
                            <label class="admin-check-card product-badge-card">
                                <input
                                    type="checkbox"
                                    name="theme_visuals[]"
                                    value="<?= e($visual) ?>"
                                    <?= in_array($visual, $themeVisuals, true) ? 'checked' : '' ?>
                                >
                                <span><?= e($visual) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="product-subsection">
                    <div class="product-subsection__head">
                        <h5>프론트 테마 노출</h5>
                        <p>프론트 페이지 테마 버튼/필터와 연결되는 값입니다.</p>
                    </div>

                    <div class="admin-check-grid product-badge-grid">
                        <?php foreach ($frontThemeOptions as $themeOption): ?>
                            <label class="admin-check-card product-badge-card">
                                <input
                                    type="checkbox"
                                    name="themes[]"
                                    value="<?= e($themeOption) ?>"
                                    <?= in_array($themeOption, $selectedThemeFilters, true) ? 'checked' : '' ?>
                                >
                                <span><?= e($themeOption) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="product-subsection">
                    <div class="product-subsection__head">
                        <h5>배지 선택</h5>
                        <p>운영 배지 및 프론트 강조 뱃지로 사용할 항목입니다.</p>
                    </div>

                    <div class="admin-check-grid product-badge-grid">
                        <?php foreach ($badgesTax as $badge): ?>
                            <?php
                            $badgeName = is_array($badge)
                                ? (string) ($badge['name'] ?? '')
                                : (string) $badge;
                            if ($badgeName === '') continue;
                            ?>
                            <label class="admin-check-card product-badge-card">
                                <input
                                    type="checkbox"
                                    name="badges[]"
                                    value="<?= e($badgeName) ?>"
                                    <?= in_array($badgeName, $badges, true) ? 'checked' : '' ?>
                                >
                                <span><?= e($badgeName) ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>목록 / 카드 노출 문구</h4>
                    <p>상품 카드와 요약 영역에서 보이는 보조 문구를 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">카드 서브 문구</label>
                        <input
                            type="text"
                            name="card_sub_text"
                            class="admin-input"
                            value="<?= e($formData['card_sub_text'] ?? '') ?>"
                            placeholder="예: 3박4일 / 36홀 / 프리미엄 리조트"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">최저가 강조 문구</label>
                        <input
                            type="text"
                            name="lowest_price_text"
                            class="admin-input"
                            value="<?= e($formData['lowest_price_text'] ?? '') ?>"
                            placeholder="예: 주중 1인 기준 / 선착순 특가"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">요약 상태 문구</label>
                        <input
                            type="text"
                            name="summary_status_text"
                            class="admin-input"
                            value="<?= e($formData['summary_status_text'] ?? '') ?>"
                            placeholder="예: 마감 임박 / 즉시 확정 가능"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">운영 메모</label>
                        <textarea
                            name="admin_memo"
                            class="admin-textarea"
                            rows="4"
                            placeholder="운영자만 참고할 메모를 입력하세요."
                        ><?= e($formData['admin_memo'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

        </div>
    </div>
</section>