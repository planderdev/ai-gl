<section class="admin-card">
    <div class="admin-card__head">
        <h3>취소 규정</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>기본 취소 정책</h4>
                    <p>상품 공통 취소/환불 정책의 기준값을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">취소 정책 유형</label>
                        <select name="cancel_policy_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="flexible" <?= ($formData['cancel_policy_type'] ?? '') === 'flexible' ? 'selected' : '' ?>>유연</option>
                            <option value="standard" <?= ($formData['cancel_policy_type'] ?? '') === 'standard' ? 'selected' : '' ?>>일반</option>
                            <option value="strict" <?= ($formData['cancel_policy_type'] ?? '') === 'strict' ? 'selected' : '' ?>>엄격</option>
                            <option value="custom" <?= ($formData['cancel_policy_type'] ?? '') === 'custom' ? 'selected' : '' ?>>직접 입력</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">무료 취소 기준</label>
                        <input
                            type="text"
                            name="cancel_free_until"
                            class="admin-input"
                            value="<?= e($formData['cancel_free_until'] ?? '') ?>"
                            placeholder="예: 출발 14일 전 / 라운드 7일 전"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">기본 수수료율(%)</label>
                        <input
                            type="number"
                            name="cancel_fee_rate"
                            class="admin-input"
                            min="0"
                            max="100"
                            step="1"
                            value="<?= e((string) ($formData['cancel_fee_rate'] ?? 0)) ?>"
                            placeholder="예: 10"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">환불 방식</label>
                        <select name="refund_method" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="same_method" <?= ($formData['refund_method'] ?? '') === 'same_method' ? 'selected' : '' ?>>동일 수단 환불</option>
                            <option value="manual_transfer" <?= ($formData['refund_method'] ?? '') === 'manual_transfer' ? 'selected' : '' ?>>계좌 환불</option>
                            <option value="case_by_case" <?= ($formData['refund_method'] ?? '') === 'case_by_case' ? 'selected' : '' ?>>개별 확인</option>
                        </select>
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">취소/환불 요약 문구</label>
                        <input
                            type="text"
                            name="cancel_policy_summary"
                            class="admin-input"
                            value="<?= e($formData['cancel_policy_summary'] ?? '') ?>"
                            placeholder="예: 출발일 임박 시 단계별 수수료가 적용됩니다."
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>환불 기준 안내</h4>
                    <p>단계별 취소/환불 기준을 항목 형태로 등록합니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-simple-repeater"
                        data-target-list="cancel-refund-list"
                        data-input-name="cancel_refund_items"
                    >
                        추가
                    </button>
                </div>

                <div class="repeater-list cancel-refund-list js-simple-repeater-list">
                    <?php foreach ($cancelRefundItems as $index => $item): ?>
                        <div class="repeater-item repeater-item--inline">
                            <input
                                type="text"
                                name="cancel_refund_items[<?= $index ?>]"
                                class="admin-input"
                                value="<?= e($item ?? '') ?>"
                                placeholder="예: 출발 14일 전까지 취소 시 전액 환불"
                            >
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>중요 안내</h4>
                    <p>예약자에게 반드시 고지해야 할 취소/환불 유의사항입니다.</p>
                    <button
                        type="button"
                        class="admin-btn admin-btn--light admin-btn--sm js-add-simple-repeater"
                        data-target-list="important-notice-list"
                        data-input-name="important_notice_items"
                    >
                        추가
                    </button>
                </div>

                <div class="repeater-list important-notice-list js-simple-repeater-list">
                    <?php foreach ($importantNoticeItems as $index => $item): ?>
                        <div class="repeater-item repeater-item--inline">
                            <input
                                type="text"
                                name="important_notice_items[<?= $index ?>]"
                                class="admin-input"
                                value="<?= e($item ?? '') ?>"
                                placeholder="예: 예약 확정 후 취소 시 실제 발생 비용이 차감될 수 있습니다."
                            >
                            <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>패키지 취소 기준</h4>
                    <p>항공, 호텔, 현지 행사 등 패키지형 상품에 맞는 별도 취소 기준을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">항공 취소 기준</label>
                        <select name="flight_cancel_rule_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="airline_policy" <?= ($formData['flight_cancel_rule_type'] ?? '') === 'airline_policy' ? 'selected' : '' ?>>항공사 규정 우선</option>
                            <option value="package_policy" <?= ($formData['flight_cancel_rule_type'] ?? '') === 'package_policy' ? 'selected' : '' ?>>패키지 규정 우선</option>
                            <option value="manual_confirm" <?= ($formData['flight_cancel_rule_type'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>개별 확인</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">호텔 취소 기준</label>
                        <select name="hotel_cancel_rule_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="hotel_policy" <?= ($formData['hotel_cancel_rule_type'] ?? '') === 'hotel_policy' ? 'selected' : '' ?>>호텔 규정 우선</option>
                            <option value="package_policy" <?= ($formData['hotel_cancel_rule_type'] ?? '') === 'package_policy' ? 'selected' : '' ?>>패키지 규정 우선</option>
                            <option value="manual_confirm" <?= ($formData['hotel_cancel_rule_type'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>개별 확인</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">환불 처리 기간</label>
                        <input
                            type="text"
                            name="refund_process_text"
                            class="admin-input"
                            value="<?= e($formData['refund_process_text'] ?? '') ?>"
                            placeholder="예: 영업일 기준 5~7일"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">패키지 취소 상세 안내</label>
                        <textarea
                            name="package_cancel_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 항공 발권 이후 취소 시 항공사 위약금이 별도 차감될 수 있습니다."
                        ><?= e($formData['package_cancel_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>골프장 취소 기준</h4>
                    <p>티타임 예약, 기상 상황, 현장 운영에 맞는 취소 기준을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3 u-mb-16">
                    <div class="admin-field">
                        <label class="admin-label">기상 취소 기준</label>
                        <select name="weather_cancel_rule" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="golf_course_policy" <?= ($formData['weather_cancel_rule'] ?? '') === 'golf_course_policy' ? 'selected' : '' ?>>골프장 규정 따름</option>
                            <option value="manual_confirm" <?= ($formData['weather_cancel_rule'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>현장 확인 후 안내</option>
                            <option value="full_refund" <?= ($formData['weather_cancel_rule'] ?? '') === 'full_refund' ? 'selected' : '' ?>>전액 환불</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">노쇼 기준</label>
                        <select name="noshow_rule" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="full_charge" <?= ($formData['noshow_rule'] ?? '') === 'full_charge' ? 'selected' : '' ?>>전액 차감</option>
                            <option value="partial_charge" <?= ($formData['noshow_rule'] ?? '') === 'partial_charge' ? 'selected' : '' ?>>부분 차감</option>
                            <option value="manual_confirm" <?= ($formData['noshow_rule'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>개별 확인</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">우천/현장 안내 문구</label>
                        <input
                            type="text"
                            name="weather_policy_text"
                            class="admin-input"
                            value="<?= e($formData['weather_policy_text'] ?? '') ?>"
                            placeholder="예: 우천 시 현장 규정에 따라 운영됩니다."
                        >
                    </div>
                </div>

                <div class="product-section-stack">
                    <section class="product-inner-card product-inner-card--nested">
                        <div class="product-inner-card__head">
                            <h5>라운드 관련 안내</h5>
                            <button
                                type="button"
                                class="admin-btn admin-btn--light admin-btn--sm js-add-simple-repeater"
                                data-target-list="round-notice-list"
                                data-input-name="round_notice_items"
                            >
                                추가
                            </button>
                        </div>

                        <div class="repeater-list round-notice-list js-simple-repeater-list">
                            <?php foreach ($roundNoticeItems as $index => $item): ?>
                                <div class="repeater-item repeater-item--inline">
                                    <input
                                        type="text"
                                        name="round_notice_items[<?= $index ?>]"
                                        class="admin-input"
                                        value="<?= e($item ?? '') ?>"
                                        placeholder="예: 티오프 30분 전 도착 권장"
                                    >
                                    <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </section>

                    <section class="product-inner-card product-inner-card--nested">
                        <div class="product-inner-card__head">
                            <h5>기상 관련 안내</h5>
                            <button
                                type="button"
                                class="admin-btn admin-btn--light admin-btn--sm js-add-simple-repeater"
                                data-target-list="weather-notice-list"
                                data-input-name="weather_notice_items"
                            >
                                추가
                            </button>
                        </div>

                        <div class="repeater-list weather-notice-list js-simple-repeater-list">
                            <?php foreach ($weatherNoticeItems as $index => $item): ?>
                                <div class="repeater-item repeater-item--inline">
                                    <input
                                        type="text"
                                        name="weather_notice_items[<?= $index ?>]"
                                        class="admin-input"
                                        value="<?= e($item ?? '') ?>"
                                        placeholder="예: 강풍/폭우 시 현장 판단에 따라 휴장될 수 있습니다."
                                    >
                                    <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </section>
                </div>
            </section>

        </div>
    </div>
</section>