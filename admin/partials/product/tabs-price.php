<section class="admin-card">
    <div class="admin-card__head">
        <h3>가격 설정</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>기본 판매 가격</h4>
                    <p>목록 카드, 상세 상단, 우측 미리보기에 사용하는 기본 가격 정보입니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">정상가</label>
                        <input
                            type="number"
                            name="base_price"
                            class="admin-input js-price-base"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['base_price'] ?? 0)) ?>"
                            placeholder="예: 350000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">판매가</label>
                        <input
                            type="number"
                            name="sale_price"
                            class="admin-input js-price-sale"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['sale_price'] ?? 0)) ?>"
                            placeholder="예: 299000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">목록 노출가</label>
                        <input
                            type="number"
                            name="list_price"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) $listPrice) ?>"
                            placeholder="비워두면 판매가 기준"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">통화</label>
                        <input
                            type="text"
                            name="currency"
                            class="admin-input"
                            value="<?= e($formData['currency'] ?? 'KRW') ?>"
                            placeholder="KRW / JPY / USD"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">할인율</label>
                        <input
                            type="text"
                            class="admin-input"
                            value="<?= $discountRate > 0 ? e((string) $discountRate) . '%' : '-' ?>"
                            readonly
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">최저가 문구</label>
                        <input
                            type="text"
                            name="price_label"
                            class="admin-input"
                            value="<?= e($formData['price_label'] ?? '') ?>"
                            placeholder="예: 1인 기준 / 주중 기준 / VAT 포함"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">결제 플랜 요약</label>
                        <input
                            type="text"
                            name="payment_plan_text"
                            class="admin-input"
                            value="<?= e($formData['payment_plan_text'] ?? '') ?>"
                            placeholder="예: 계약금 30% + 잔금 출발 14일 전"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>패키지 가격 구성</h4>
                    <p>여행 패키지 상품의 인원별 가격과 부가 요금을 관리합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">성인 요금</label>
                        <input
                            type="number"
                            name="adult_price"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['adult_price'] ?? 0)) ?>"
                            placeholder="예: 1290000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">소아 요금</label>
                        <input
                            type="number"
                            name="child_price"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['child_price'] ?? 0)) ?>"
                            placeholder="예: 990000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">유아 요금</label>
                        <input
                            type="number"
                            name="infant_price"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['infant_price'] ?? 0)) ?>"
                            placeholder="예: 300000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">1인실 추가요금</label>
                        <input
                            type="number"
                            name="single_room_price"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['single_room_price'] ?? 0)) ?>"
                            placeholder="예: 180000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">캐디피</label>
                        <input
                            type="number"
                            name="caddie_fee"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['caddie_fee'] ?? 0)) ?>"
                            placeholder="예: 150000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">카트비</label>
                        <input
                            type="number"
                            name="cart_fee"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['cart_fee'] ?? 0)) ?>"
                            placeholder="예: 100000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">유류할증 / 세금</label>
                        <input
                            type="number"
                            name="fuel_surcharge"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['fuel_surcharge'] ?? 0)) ?>"
                            placeholder="예: 70000"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">현지 추가비용</label>
                        <input
                            type="number"
                            name="local_extra_fee"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['local_extra_fee'] ?? 0)) ?>"
                            placeholder="예: 50000"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">패키지 가격 안내</label>
                        <textarea
                            name="package_price_note"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 유류할증료는 발권 시점 기준으로 변동될 수 있습니다."
                        ><?= e($formData['package_price_note'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>티타임 필터 / 시간대</h4>
                    <p>골프장 리스트 필터와 상세페이지 시간대 표시용 구간입니다.</p>
                </div>

                <div class="admin-check-grid product-badge-grid">
                    <?php foreach ($teeTimeBandOptions as $bandValue => $bandLabel): ?>
                        <label class="admin-check-card product-badge-card">
                            <input
                                type="checkbox"
                                name="tee_time_band[]"
                                value="<?= e($bandValue) ?>"
                                <?= in_array($bandValue, $selectedTeeTimeBands, true) ? 'checked' : '' ?>
                            >
                            <span><?= e($bandLabel) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>티타임 슬롯 가격</h4>
                    <p>골프장 상세에서 사용하는 시간대별 예약 슬롯과 가격을 등록합니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-tee-time-slot"
                    >
                        슬롯 추가
                    </button>
                </div>

                <div class="repeater-list js-tee-time-slot-list">
                    <?php foreach ($teeTimeSlots as $index => $slot): ?>
                        <div class="repeater-item tee-time-slot-item">
                            <div class="admin-form-grid admin-form-grid--5">
                                <div class="admin-field">
                                    <label class="admin-label">라벨</label>
                                    <input
                                        type="text"
                                        name="tee_time_slots[<?= $index ?>][label]"
                                        class="admin-input"
                                        value="<?= e($slot['label'] ?? '') ?>"
                                        placeholder="예: 오전 / 황금시간"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">시간</label>
                                    <input
                                        type="text"
                                        name="tee_time_slots[<?= $index ?>][time]"
                                        class="admin-input"
                                        value="<?= e($slot['time'] ?? '') ?>"
                                        placeholder="예: 07:12"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">상태</label>
                                    <input
                                        type="text"
                                        name="tee_time_slots[<?= $index ?>][status]"
                                        class="admin-input"
                                        value="<?= e($slot['status'] ?? '') ?>"
                                        placeholder="예: 예약가능 / 마감임박"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">가격</label>
                                    <input
                                        type="number"
                                        name="tee_time_slots[<?= $index ?>][price]"
                                        class="admin-input"
                                        min="0"
                                        step="1"
                                        value="<?= e((string) ($slot['price'] ?? '')) ?>"
                                        placeholder="예: 189000"
                                    >
                                </div>

                                <div class="admin-field">
                                    <label class="admin-label">잔여수량</label>
                                    <input
                                        type="number"
                                        name="tee_time_slots[<?= $index ?>][stock]"
                                        class="admin-input"
                                        min="0"
                                        step="1"
                                        value="<?= e((string) ($slot['stock'] ?? '')) ?>"
                                        placeholder="예: 4"
                                    >
                                </div>
                            </div>

                            <div class="tee-time-slot-item__actions">
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-tee-time-slot">복제</button>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <template id="teeTimeSlotTemplate">
                    <div class="repeater-item tee-time-slot-item">
                        <div class="admin-form-grid admin-form-grid--5">
                            <div class="admin-field">
                                <label class="admin-label">라벨</label>
                                <input type="text" name="__NAME__[label]" class="admin-input" placeholder="예: 오전 / 황금시간">
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">시간</label>
                                <input type="text" name="__NAME__[time]" class="admin-input" placeholder="예: 07:12">
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상태</label>
                                <input type="text" name="__NAME__[status]" class="admin-input" placeholder="예: 예약가능 / 마감임박">
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">가격</label>
                                <input type="number" name="__NAME__[price]" class="admin-input" min="0" step="1" placeholder="예: 189000">
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">잔여수량</label>
                                <input type="number" name="__NAME__[stock]" class="admin-input" min="0" step="1" placeholder="예: 4">
                            </div>
                        </div>

                        <div class="tee-time-slot-item__actions">
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-tee-time-slot">복제</button>
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                        </div>
                    </div>
                </template>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>가격 보조 안내</h4>
                    <p>상세페이지 가격 하단과 예약 안내 영역에 함께 노출할 보조 설명입니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">노출 배지</label>
                        <input
                            type="text"
                            name="card_label"
                            class="admin-input js-sidebar-badge-input"
                            value="<?= e($formData['card_label'] ?? '') ?>"
                            placeholder="예: 특가 / 얼리버드 / 실시간"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">가격 강조 문구</label>
                        <input
                            type="text"
                            name="price_highlight_text"
                            class="admin-input"
                            value="<?= e($formData['price_highlight_text'] ?? '') ?>"
                            placeholder="예: 선착순 한정가 / 4인 출발 기준"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">가격 상세 안내</label>
                        <textarea
                            name="price_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 출발일/라운드 시간대에 따라 요금이 달라질 수 있습니다."
                        ><?= e($formData['price_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

        </div>
    </div>
</section>