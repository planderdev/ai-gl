<section class="admin-card">
    <div class="admin-card__head">
        <h3>상세 콘텐츠</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack product-section-stack--spacious">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>상세 설명</h4>
                    <p>상세페이지 상단 본문에 들어가는 기본 소개 문구입니다.</p>
                </div>

                <div class="admin-form-grid">
                    <div class="admin-field admin-field--full">
                        <label class="admin-label">상세 설명</label>
                        <textarea
                            name="description"
                            class="admin-textarea"
                            rows="8"
                            placeholder="상품의 특징, 구성, 추천 포인트 등을 자세히 입력하세요."
                        ><?= e($formData['description'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>하이라이트</h4>
                    <p>상세 상단 핵심 포인트나 강조 문구를 입력합니다.</p>
                </div>

                <div class="admin-form-grid">
                    <div class="admin-field admin-field--full">
                        <label class="admin-label">하이라이트</label>
                        <textarea
                            name="highlight_text"
                            class="admin-textarea"
                            rows="5"
                            placeholder="예: 토너먼트 코스 포함 · 리조트 숙박 · 공항 송영 제공"
                        ><?= e($formData['highlight_text'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>포함 / 불포함 사항</h4>
                    <p>구성에 포함되는 항목과 별도 비용 항목을 나눠 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field admin-field--full">
                        <label class="admin-label">포함 사항</label>
                        <textarea
                            name="included_items"
                            class="admin-textarea"
                            rows="6"
                            placeholder="예: 그린피, 숙박, 조식, 송영차량"
                        ><?= e($formData['included_items'] ?? '') ?></textarea>
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">불포함 사항</label>
                        <textarea
                            name="excluded_items"
                            class="admin-textarea"
                            rows="6"
                            placeholder="예: 중식/석식, 카트비, 캐디피, 개인경비"
                        ><?= e($formData['excluded_items'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>추가 유의사항</h4>
                    <p>예약 전 꼭 안내해야 할 주의 문구를 입력합니다.</p>
                </div>

                <div class="admin-form-grid">
                    <div class="admin-field admin-field--full">
                        <label class="admin-label">유의사항</label>
                        <textarea
                            name="additional_notice"
                            class="admin-textarea"
                            rows="5"
                            placeholder="예: 현지 사정에 따라 일정 순서 및 티타임은 변동될 수 있습니다."
                        ><?= e($formData['additional_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>기본 갤러리</h4>
                    <p>상세페이지 대표 이미지와 본문 이미지 영역에 사용하는 공통 갤러리입니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-gallery-block"
                        data-gallery-target="gallery-list"
                        data-gallery-prefix="gallery"
                    >
                        추가
                    </button>
                </div>

                <div class="repeater-list js-gallery-block gallery-list">
                    <?php foreach ($gallery as $index => $image): ?>
                        <div class="repeater-item gallery-block-item">
                            <div class="gallery-upload-row">
                                <div class="gallery-upload-row__preview">
                                    <?php if (!empty($image['url'])): ?>
                                        <img src="<?= e($image['url']) ?>" alt="<?= e($image['alt'] ?? '상품 이미지') ?>">
                                    <?php else: ?>
                                        미리보기
                                    <?php endif; ?>
                                </div>

                                <div class="gallery-upload-row__fields">
                                    <input
                                        type="hidden"
                                        name="gallery[<?= $index ?>][url]"
                                        class="js-gallery-url"
                                        value="<?= e($image['url'] ?? '') ?>"
                                    >

                                    <div class="admin-form-grid admin-form-grid--2">
                                        <div class="admin-field">
                                            <label class="admin-label">캡션</label>
                                            <input
                                                type="text"
                                                name="gallery[<?= $index ?>][caption]"
                                                class="admin-input"
                                                value="<?= e($image['caption'] ?? '') ?>"
                                            >
                                        </div>

                                        <div class="admin-field">
                                            <label class="admin-label">ALT</label>
                                            <input
                                                type="text"
                                                name="gallery[<?= $index ?>][alt]"
                                                class="admin-input"
                                                value="<?= e($image['alt'] ?? '') ?>"
                                            >
                                        </div>
                                    </div>

                                    <label class="admin-switch-row">
                                        <span>대표컷</span>
                                        <input
                                            type="radio"
                                            name="gallery_cover"
                                            class="js-gallery-cover"
                                            data-cover-target="gallery"
                                            data-item-index="<?= $index ?>"
                                            <?= !empty($image['is_cover']) ? 'checked' : '' ?>
                                        >
                                    </label>

                                    <input
                                        type="hidden"
                                        name="gallery[<?= $index ?>][is_cover]"
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

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>일정표</h4>
                    <p>여행 패키지 상품에 사용하는 일차별 일정표를 등록합니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-itinerary-day"
                    >
                        일차 추가
                    </button>
                </div>

                <div class="repeater-list js-itinerary-day-list">
                    <?php foreach ($itineraryDays as $dayIndex => $day): ?>
                        <div class="repeater-item itinerary-day-item">
                            <div class="itinerary-day-item__head">
                                <div class="admin-form-grid admin-form-grid--3">
                                    <div class="admin-field">
                                        <label class="admin-label">일차</label>
                                        <input
                                            type="text"
                                            name="itinerary_days[<?= $dayIndex ?>][day]"
                                            class="admin-input"
                                            value="<?= e($day['day'] ?? '') ?>"
                                            placeholder="예: DAY 1"
                                        >
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">제목</label>
                                        <input
                                            type="text"
                                            name="itinerary_days[<?= $dayIndex ?>][title]"
                                            class="admin-input"
                                            value="<?= e($day['title'] ?? '') ?>"
                                            placeholder="예: 인천 출발 · 골프장 이동"
                                        >
                                    </div>

                                    <div class="admin-field">
                                        <label class="admin-label">서브 문구</label>
                                        <input
                                            type="text"
                                            name="itinerary_days[<?= $dayIndex ?>][subtitle]"
                                            class="admin-input"
                                            value="<?= e($day['subtitle'] ?? '') ?>"
                                            placeholder="예: 석식 후 호텔 체크인"
                                        >
                                    </div>
                                </div>
                            </div>

                            <div class="admin-field admin-field--full">
                                <label class="admin-label">일정 설명</label>
                                <textarea
                                    name="itinerary_days[<?= $dayIndex ?>][description]"
                                    class="admin-textarea"
                                    rows="5"
                                    placeholder="해당 일차의 세부 일정을 입력하세요."
                                ><?= e($day['description'] ?? '') ?></textarea>
                            </div>

                            <div class="itinerary-day-item__actions">
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-itinerary-day">복제</button>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <template id="itineraryDayTemplate">
                    <div class="repeater-item itinerary-day-item">
                        <div class="itinerary-day-item__head">
                            <div class="admin-form-grid admin-form-grid--3">
                                <div class="admin-field">
                                    <label class="admin-label">일차</label>
                                    <input type="text" name="__NAME__[day]" class="admin-input" placeholder="예: DAY 1">
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">제목</label>
                                    <input type="text" name="__NAME__[title]" class="admin-input" placeholder="예: 인천 출발 · 골프장 이동">
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">서브 문구</label>
                                    <input type="text" name="__NAME__[subtitle]" class="admin-input" placeholder="예: 석식 후 호텔 체크인">
                                </div>
                            </div>
                        </div>

                        <div class="admin-field admin-field--full">
                            <label class="admin-label">일정 설명</label>
                            <textarea name="__NAME__[description]" class="admin-textarea" rows="5" placeholder="해당 일차의 세부 일정을 입력하세요."></textarea>
                        </div>

                        <div class="itinerary-day-item__actions">
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-itinerary-day">복제</button>
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                        </div>
                    </div>
                </template>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>연관 상품</h4>
                    <p>같이 노출할 추천 상품 ID를 등록합니다.</p>
                </div>

                <div class="admin-field admin-field--full">
                    <label class="admin-label">연관 상품 ID</label>
                    <input
                        type="text"
                        name="related_product_ids_text"
                        class="admin-input"
                        value="<?= e(!empty($relatedProductIds) ? implode(', ', $relatedProductIds) : '') ?>"
                        placeholder="예: 12, 15, 33"
                    >
                    <div class="admin-help-text">쉼표로 구분해서 입력하면 저장 시 배열로 처리하기 좋습니다.</div>
                </div>
            </section>

        </div>
    </div>
</section>