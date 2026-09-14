<form action="<?= e(admin_url('actions/event-save.php')) ?>" method="post" class="event-form js-event-form">
    <input type="hidden" name="id" value="<?= e((string) ($formData['id'] ?? 0)) ?>">

    <section class="admin-card">
        <div class="admin-card__body">
            <div class="event-form__top">
                <div>
                    <h2 class="admin-page-head__title" style="font-size:24px;">이벤트 편집</h2>
                    <p class="admin-page-head__desc">히어로, CTA, 태그, 섹션 구조까지 상세페이지에 맞게 입력합니다.</p>
                </div>

                <div class="u-flex u-gap-12">
                    <button type="submit" class="admin-btn admin-btn--primary">저장하기</button>
                    <a href="<?= e(admin_url('pages/event/list.php')) ?>" class="admin-btn admin-btn--light">목록</a>
                </div>
            </div>
        </div>
    </section>

    <section class="admin-card u-mt-16">
        <div class="admin-card__body">
            <div class="event-tabs js-event-tabs">
                <button type="button" class="event-tabs__btn is-active" data-tab="basic">기본 정보</button>
                <button type="button" class="event-tabs__btn" data-tab="hero">히어로 / CTA</button>
                <button type="button" class="event-tabs__btn" data-tab="content">본문 / 태그</button>
                <button type="button" class="event-tabs__btn" data-tab="sections">이벤트 섹션</button>
                <button type="button" class="event-tabs__btn" data-tab="products">연결 상품</button>
                <button type="button" class="event-tabs__btn" data-tab="featured">대표 상품</button>
<button type="button" class="event-tabs__btn" data-tab="guide">안내 / 장소</button>
            </div>
        </div>
    </section>

    <div class="event-tab-panel is-active" data-tab-panel="basic">
        <section class="admin-card u-mt-16">
            <div class="admin-card__body">
                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">이벤트명</label>
                        <input type="text" name="title" class="admin-input" value="<?= e($formData['title'] ?? '') ?>">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">상태</label>
                        <select name="status" class="admin-select">
                            <option value="draft" <?= ($formData['status'] ?? '') === 'draft' ? 'selected' : '' ?>>임시저장</option>
                            <option value="publish" <?= ($formData['status'] ?? '') === 'publish' ? 'selected' : '' ?>>공개</option>
                            <option value="hidden" <?= ($formData['status'] ?? '') === 'hidden' ? 'selected' : '' ?>>숨김</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">이벤트 유형</label>
                        <select name="event_type" class="admin-select">
                            <option value="promotion" <?= ($formData['event_type'] ?? '') === 'promotion' ? 'selected' : '' ?>>프로모션</option>
                            <option value="special" <?= ($formData['event_type'] ?? '') === 'special' ? 'selected' : '' ?>>특가</option>
                            <option value="exhibition" <?= ($formData['event_type'] ?? '') === 'exhibition' ? 'selected' : '' ?>>기획전</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">지역</label>
                        <select name="region" class="admin-select">
                            <option value="">선택</option>
                            <?php foreach ($regionOptions as $item): ?>
                                <option value="<?= e($item['name'] ?? '') ?>" <?= ($formData['region'] ?? '') === ($item['name'] ?? '') ? 'selected' : '' ?>>
                                    <?= e($item['name'] ?? '') ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">시작일</label>
                        <input type="date" name="start_date" class="admin-input" value="<?= e($formData['start_date'] ?? '') ?>">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">종료일</label>
                        <input type="date" name="end_date" class="admin-input" value="<?= e($formData['end_date'] ?? '') ?>">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">상태 라벨</label>
                        <input type="text" name="status_label" class="admin-input" value="<?= e($formData['status_label'] ?? '') ?>" placeholder="예: 진행중">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">보조 배지 텍스트</label>
                        <input type="text" name="badge_text" class="admin-input" value="<?= e($formData['badge_text'] ?? '') ?>" placeholder="예: PREMIUM">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">대상 텍스트</label>
                        <input type="text" name="target_text" class="admin-input" value="<?= e($formData['target_text'] ?? '') ?>" placeholder="예: 2인 이상 / 선착순">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 방식</label>
                        <input type="text" name="booking_method" class="admin-input" value="<?= e($formData['booking_method'] ?? '') ?>" placeholder="예: 상담 후 예약 확정">
                    </div>
                </div>

                <div class="admin-field u-mt-20">
                    <label class="admin-label">요약 설명</label>
                    <textarea name="summary" class="admin-textarea" rows="4"><?= e($formData['summary'] ?? '') ?></textarea>
                </div>
            </div>
        </section>
    </div>

    <div class="event-tab-panel" data-tab-panel="hero">
        <section class="admin-card u-mt-16">
            <div class="admin-card__head">
                <h3>대표 배너 / 히어로 갤러리</h3>
            </div>
            <div class="admin-card__body">
                <div class="admin-field">
                    <label class="admin-label">대표 배너 이미지</label>
                    <input type="text" name="banner_image" class="admin-input" value="<?= e($formData['banner_image'] ?? '') ?>" placeholder="이미지 URL">
                </div>

                <div class="u-mt-20">
                    <div class="u-flex u-justify-between u-align-center">
                        <label class="admin-label">히어로 갤러리</label>
                        <button type="button" class="admin-btn admin-btn--light js-add-hero-gallery">이미지 추가</button>
                    </div>

                    <div class="repeater-list js-hero-gallery-list" data-name="hero_gallery">
                        <?php foreach (($formData['hero_gallery'] ?? []) as $index => $image): ?>
                            <div class="repeater-item">
                                <div class="repeater-item__grid repeater-item__grid--3">
                                    <input type="text" name="hero_gallery[<?= $index ?>][url]" class="admin-input" value="<?= e($image['url'] ?? '') ?>" placeholder="이미지 URL">
                                    <input type="text" name="hero_gallery[<?= $index ?>][alt]" class="admin-input" value="<?= e($image['alt'] ?? '') ?>" placeholder="ALT">
                                    <input type="text" name="hero_gallery[<?= $index ?>][caption]" class="admin-input" value="<?= e($image['caption'] ?? '') ?>" placeholder="캡션">
                                </div>
                                <div class="repeater-item__actions">
                                    <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <template id="hero-gallery-template">
                        <div class="repeater-item">
                            <div class="repeater-item__grid repeater-item__grid--3">
                                <input type="text" data-field="url" class="admin-input" placeholder="이미지 URL">
                                <input type="text" data-field="alt" class="admin-input" placeholder="ALT">
                                <input type="text" data-field="caption" class="admin-input" placeholder="캡션">
                            </div>
                            <div class="repeater-item__actions">
                                <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="admin-form-grid admin-form-grid--2 u-mt-20">
                    <div class="admin-field">
                        <label class="admin-label">1차 CTA 텍스트</label>
                        <input type="text" name="cta_primary_text" class="admin-input" value="<?= e($formData['cta_primary_text'] ?? '') ?>" placeholder="예: 프로모션 문의하기">
                    </div>
                    <div class="admin-field">
                        <label class="admin-label">1차 CTA URL</label>
                        <input type="text" name="cta_primary_url" class="admin-input" value="<?= e($formData['cta_primary_url'] ?? '') ?>" placeholder="/contact 또는 외부 링크">
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">2차 CTA 텍스트</label>
                        <input type="text" name="cta_secondary_text" class="admin-input" value="<?= e($formData['cta_secondary_text'] ?? '') ?>" placeholder="예: 연결 상품 보기">
                    </div>
                    <div class="admin-field">
                        <label class="admin-label">2차 CTA URL</label>
                        <input type="text" name="cta_secondary_url" class="admin-input" value="<?= e($formData['cta_secondary_url'] ?? '') ?>" placeholder="/pages/product/list">
                    </div>
                </div>
            </div>
        </section>
    </div>

    <div class="event-tab-panel" data-tab-panel="content">
        <section class="admin-card u-mt-16">
            <div class="admin-card__head">
                <h3>본문 / 태그</h3>
            </div>
            <div class="admin-card__body">
                <div class="admin-field">
                    <label class="admin-label">상세 내용</label>
                    <textarea name="content" class="admin-textarea" rows="8"><?= e($formData['content'] ?? '') ?></textarea>
                </div>

                <div class="admin-field u-mt-20">
                    <label class="admin-label">혜택 안내</label>
                    <textarea name="benefit" class="admin-textarea" rows="6"><?= e($formData['benefit'] ?? '') ?></textarea>
                </div>

                <div class="u-mt-20">
                    <div class="u-flex u-justify-between u-align-center">
                        <label class="admin-label">대상 태그</label>
                        <button type="button" class="admin-btn admin-btn--light js-add-simple-tag" data-target-list=".js-target-tag-list" data-name="target_tags">추가</button>
                    </div>
                    <div class="repeater-list js-target-tag-list">
                        <?php foreach (($formData['target_tags'] ?? []) as $index => $tag): ?>
                            <div class="repeater-item repeater-item--inline">
                                <input type="text" name="target_tags[<?= $index ?>]" class="admin-input" value="<?= e($tag) ?>" placeholder="예: 골프 여행">
                                <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="u-mt-20">
                    <div class="u-flex u-justify-between u-align-center">
                        <label class="admin-label">특징 태그</label>
                        <button type="button" class="admin-btn admin-btn--light js-add-simple-tag" data-target-list=".js-feature-tag-list" data-name="feature_tags">추가</button>
                    </div>
                    <div class="repeater-list js-feature-tag-list">
                        <?php foreach (($formData['feature_tags'] ?? []) as $index => $tag): ?>
                            <div class="repeater-item repeater-item--inline">
                                <input type="text" name="feature_tags[<?= $index ?>]" class="admin-input" value="<?= e($tag) ?>" placeholder="예: 호텔 연계">
                                <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <div class="event-tab-panel" data-tab-panel="sections">
        <section class="admin-card u-mt-16">
            <div class="admin-card__head">
                <h3>이벤트 섹션</h3>
                <button type="button" class="admin-btn admin-btn--light js-add-event-section">섹션 추가</button>
            </div>

            <div class="admin-card__body">
                <?php $sections = $formData['sections'] ?? []; ?>
                <div class="repeater-list js-event-section-list" data-name="sections">
                    <?php if (!empty($sections)): ?>
                        <?php foreach ($sections as $index => $section): ?>
                            <div class="repeater-item">
                                <div class="repeater-item__grid repeater-item__grid--2">
                                    <input type="text" name="sections[<?= $index ?>][title]" class="admin-input" value="<?= e($section['title'] ?? '') ?>" placeholder="섹션 제목">
                                    <input type="text" name="sections[<?= $index ?>][subtitle]" class="admin-input" value="<?= e($section['subtitle'] ?? '') ?>" placeholder="섹션 부제목">
                                </div>

                                <div class="admin-field u-mt-12">
                                    <input type="text" name="sections[<?= $index ?>][image]" class="admin-input" value="<?= e($section['image'] ?? '') ?>" placeholder="섹션 이미지 URL">
                                </div>

                                <div class="admin-field u-mt-12">
                                    <textarea name="sections[<?= $index ?>][description]" class="admin-textarea" rows="5" placeholder="섹션 설명"><?= e($section['description'] ?? '') ?></textarea>
                                </div>

                                <div class="repeater-item__actions">
                                    <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>

                <template id="event-section-template">
                    <div class="repeater-item">
                        <div class="repeater-item__grid repeater-item__grid--2">
                            <input type="text" data-field="title" class="admin-input" placeholder="섹션 제목">
                            <input type="text" data-field="subtitle" class="admin-input" placeholder="섹션 부제목">
                        </div>

                        <div class="admin-field u-mt-12">
                            <input type="text" data-field="image" class="admin-input" placeholder="섹션 이미지 URL">
                        </div>

                        <div class="admin-field u-mt-12">
                            <textarea data-field="description" class="admin-textarea" rows="5" placeholder="섹션 설명"></textarea>
                        </div>

                        <div class="repeater-item__actions">
                            <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </div>

    <div class="event-tab-panel" data-tab-panel="products">
        <section class="admin-card u-mt-16">
            <div class="admin-card__head">
                <h3>연결 상품</h3>
            </div>
            <div class="admin-card__body">
                <div class="event-product-list">
                    <?php $relatedIds = array_map('intval', $formData['related_product_ids'] ?? []); ?>
                    <?php foreach ($products as $product): ?>
                        <label class="admin-check-card">
                            <input
                                type="checkbox"
                                name="related_product_ids[]"
                                value="<?= e((string) ($product['id'] ?? 0)) ?>"
                                <?= in_array((int) ($product['id'] ?? 0), $relatedIds, true) ? 'checked' : '' ?>>
                            <span><?= e($product['title'] ?? '') ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>

                <?php if (!empty($formData['id'])): ?>
                    <div class="u-mt-20">
                        <form action="<?= e(admin_url('actions/event-delete.php')) ?>" method="post" onsubmit="return confirm('정말 삭제하시겠습니까?');">
                            <input type="hidden" name="id" value="<?= e((string) $formData['id']) ?>">
                            <button type="submit" class="admin-btn admin-btn--danger">삭제</button>
                        </form>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <div class="event-tab-panel" data-tab-panel="featured">
    <section class="admin-card u-mt-16">
        <div class="admin-card__head">
            <h3>대표 추천 상품</h3>
        </div>
        <div class="admin-card__body">
            <div class="admin-form-grid admin-form-grid--2">
                <div class="admin-field">
                    <label class="admin-label">대표 상품 선택</label>
                    <select name="featured_product_id" class="admin-select">
                        <option value="0">선택 안함</option>
                        <?php foreach ($products as $product): ?>
                            <option value="<?= e((string) ($product['id'] ?? 0)) ?>" <?= (int) ($formData['featured_product_id'] ?? 0) === (int) ($product['id'] ?? 0) ? 'selected' : '' ?>>
                                <?= e($product['title'] ?? '') ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="admin-field">
                    <label class="admin-label">대표 라벨</label>
                    <input type="text" name="featured_label" class="admin-input" value="<?= e($formData['featured_label'] ?? '') ?>" placeholder="예: 3박 패키지">
                </div>

                <div class="admin-field">
                    <label class="admin-label">할인율 텍스트</label>
                    <input type="text" name="featured_discount_rate" class="admin-input" value="<?= e($formData['featured_discount_rate'] ?? '') ?>" placeholder="예: 15%">
                </div>

                <div class="admin-field">
                    <label class="admin-label">가격 텍스트</label>
                    <input type="text" name="featured_price_text" class="admin-input" value="<?= e($formData['featured_price_text'] ?? '') ?>" placeholder="예: 1인 129만원~">
                </div>
            </div>

            <div class="u-mt-20">
                <div class="u-flex u-justify-between u-align-center">
                    <label class="admin-label">대표 상품 포인트</label>
                    <button type="button" class="admin-btn admin-btn--light js-add-featured-point">포인트 추가</button>
                </div>

                <div class="repeater-list js-featured-point-list" data-name="featured_points">
                    <?php foreach (($formData['featured_points'] ?? []) as $index => $point): ?>
                        <div class="repeater-item">
                            <div class="repeater-item__grid repeater-item__grid--3">
                                <input type="text" name="featured_points[<?= $index ?>][category]" class="admin-input" value="<?= e($point['category'] ?? '') ?>" placeholder="예: 골프">
                                <input type="text" name="featured_points[<?= $index ?>][title]" class="admin-input" value="<?= e($point['title'] ?? '') ?>" placeholder="제목">
                                <input type="text" name="featured_points[<?= $index ?>][description]" class="admin-input" value="<?= e($point['description'] ?? '') ?>" placeholder="설명">
                            </div>
                            <div class="repeater-item__actions">
                                <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <template id="featured-point-template">
                    <div class="repeater-item">
                        <div class="repeater-item__grid repeater-item__grid--3">
                            <input type="text" data-field="category" class="admin-input" placeholder="예: 골프">
                            <input type="text" data-field="title" class="admin-input" placeholder="제목">
                            <input type="text" data-field="description" class="admin-input" placeholder="설명">
                        </div>
                        <div class="repeater-item__actions">
                            <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </section>
</div>


<div class="event-tab-panel" data-tab-panel="guide">
    <section class="admin-card u-mt-16">
        <div class="admin-card__head">
            <h3>리스트형 안내</h3>
        </div>
        <div class="admin-card__body">
            <?php
            $guideGroups = [
                'recommended_for_items' => ['title' => '이런 분께 추천', 'placeholder' => '예: 커플 골프 여행 고객'],
                'key_points' => ['title' => '핵심 포인트', 'placeholder' => '예: 호텔 + 라운드 연계'],
                'before_booking_items' => ['title' => '예약 전 체크', 'placeholder' => '예: 여권 영문명 확인'],
                'booking_guide_items' => ['title' => '예약 안내', 'placeholder' => '예: 상담 후 일정 확정'],
                'change_cancel_items' => ['title' => '변경 / 취소', 'placeholder' => '예: 출발 7일 전 무료 취소'],
            ];
            ?>

            <?php foreach ($guideGroups as $fieldName => $group): ?>
                <div class="u-mt-20">
                    <div class="u-flex u-justify-between u-align-center">
                        <label class="admin-label"><?= e($group['title']) ?></label>
                        <button type="button" class="admin-btn admin-btn--light js-add-simple-tag" data-target-list=".js-<?= e($fieldName) ?>-list" data-name="<?= e($fieldName) ?>">추가</button>
                    </div>

                    <div class="repeater-list js-<?= e($fieldName) ?>-list">
                        <?php foreach (($formData[$fieldName] ?? []) as $index => $item): ?>
                            <div class="repeater-item repeater-item--inline">
                                <input type="text" name="<?= e($fieldName) ?>[<?= $index ?>]" class="admin-input" value="<?= e($item) ?>" placeholder="<?= e($group['placeholder']) ?>">
                                <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="admin-card u-mt-16">
        <div class="admin-card__head">
            <h3>장소 소개 블록</h3>
            <button type="button" class="admin-btn admin-btn--light js-add-venue-section">장소 추가</button>
        </div>
        <div class="admin-card__body">
            <div class="repeater-list js-venue-section-list" data-name="venue_sections">
                <?php foreach (($formData['venue_sections'] ?? []) as $index => $venue): ?>
                    <div class="repeater-item">
                        <div class="repeater-item__grid repeater-item__grid--2">
                            <select name="venue_sections[<?= $index ?>][type]" class="admin-select">
                                <option value="">타입 선택</option>
                                <option value="golf_course" <?= ($venue['type'] ?? '') === 'golf_course' ? 'selected' : '' ?>>골프장</option>
                                <option value="resort" <?= ($venue['type'] ?? '') === 'resort' ? 'selected' : '' ?>>리조트</option>
                                <option value="hotel" <?= ($venue['type'] ?? '') === 'hotel' ? 'selected' : '' ?>>호텔</option>
                            </select>
                            <input type="text" name="venue_sections[<?= $index ?>][title]" class="admin-input" value="<?= e($venue['title'] ?? '') ?>" placeholder="제목">
                        </div>

                        <div class="repeater-item__grid repeater-item__grid--2 u-mt-12">
                            <input type="text" name="venue_sections[<?= $index ?>][subtitle]" class="admin-input" value="<?= e($venue['subtitle'] ?? '') ?>" placeholder="부제목">
                            <input type="text" name="venue_sections[<?= $index ?>][image]" class="admin-input" value="<?= e($venue['image'] ?? '') ?>" placeholder="이미지 URL">
                        </div>

                        <div class="admin-field u-mt-12">
                            <textarea name="venue_sections[<?= $index ?>][description]" class="admin-textarea" rows="4" placeholder="설명"><?= e($venue['description'] ?? '') ?></textarea>
                        </div>

                        <div class="u-mt-12">
                            <div class="u-flex u-justify-between u-align-center">
                                <label class="admin-label">스펙</label>
                                <button type="button" class="admin-btn admin-btn--light js-add-venue-spec">스펙 추가</button>
                            </div>

                            <div class="repeater-list js-venue-spec-list">
                                <?php foreach (($venue['specs'] ?? []) as $specIndex => $spec): ?>
                                    <div class="repeater-item repeater-item--inline">
                                        <input type="text" name="venue_sections[<?= $index ?>][specs][<?= $specIndex ?>]" class="admin-input" value="<?= e($spec) ?>" placeholder="예: 18홀 / PAR 71">
                                        <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <div class="repeater-item__actions">
                            <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <template id="venue-section-template">
                <div class="repeater-item">
                    <div class="repeater-item__grid repeater-item__grid--2">
                        <select data-field="type" class="admin-select">
                            <option value="">타입 선택</option>
                            <option value="golf_course">골프장</option>
                            <option value="resort">리조트</option>
                            <option value="hotel">호텔</option>
                        </select>
                        <input type="text" data-field="title" class="admin-input" placeholder="제목">
                    </div>

                    <div class="repeater-item__grid repeater-item__grid--2 u-mt-12">
                        <input type="text" data-field="subtitle" class="admin-input" placeholder="부제목">
                        <input type="text" data-field="image" class="admin-input" placeholder="이미지 URL">
                    </div>

                    <div class="admin-field u-mt-12">
                        <textarea data-field="description" class="admin-textarea" rows="4" placeholder="설명"></textarea>
                    </div>

                    <div class="u-mt-12">
                        <div class="u-flex u-justify-between u-align-center">
                            <label class="admin-label">스펙</label>
                            <button type="button" class="admin-btn admin-btn--light js-add-venue-spec">스펙 추가</button>
                        </div>
                        <div class="repeater-list js-venue-spec-list"></div>
                    </div>

                    <div class="repeater-item__actions">
                        <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
                    </div>
                </div>
            </template>
        </div>
    </section>
</div>




</form>