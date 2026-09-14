<section class="admin-card">
    <div class="admin-card__head">
        <h3>예약 가능일 / 판매 설정</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>예약 방식</h4>
                    <p>상품의 예약 접수 방식과 기본 판매 상태를 설정합니다.</p>
                </div>
                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">예약 방식</label>
                        <select name="booking_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="instant" <?= ($formData['booking_type'] ?? '') === 'instant' ? 'selected' : '' ?>>실시간 예약</option>
                            <option value="request" <?= ($formData['booking_type'] ?? '') === 'request' ? 'selected' : '' ?>>예약 요청</option>
                            <option value="confirm" <?= ($formData['booking_type'] ?? '') === 'confirm' ? 'selected' : '' ?>>상담 후 확정</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 오픈일</label>
                        <input
                            type="date"
                            name="booking_open_date"
                            class="admin-input"
                            value="<?= e($formData['booking_open_date'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 마감일</label>
                        <input
                            type="date"
                            name="booking_close_date"
                            class="admin-input"
                            value="<?= e($formData['booking_close_date'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">판매 상태 문구</label>
                        <input
                            type="text"
                            name="booking_status_text"
                            class="admin-input"
                            value="<?= e($formData['booking_status_text'] ?? '') ?>"
                            placeholder="예: 예약 가능 / 마감 임박 / 문의 필요"
                        >
                    </div>
                
                    <label class="admin-check-card">
                        <input
                            type="checkbox"
                            name="instant_confirm"
                            value="1"
                            <?= !empty($formData['instant_confirm']) ? 'checked' : '' ?>
                        >
                        <span>즉시 확정 사용</span>
                    </label>

                    <label class="admin-check-card">
                        <input
                            type="checkbox"
                            name="auto_close_soldout"
                            value="1"
                            <?= !empty($formData['auto_close_soldout']) ? 'checked' : '' ?>
                        >
                        <span>재고 소진 시 자동 판매중지</span>
                    </label>

                    <label class="admin-check-card">
                        <input
                            type="checkbox"
                            name="expose_remaining_stock"
                            value="1"
                            <?= !empty($formData['expose_remaining_stock']) ? 'checked' : '' ?>
                        >
                        <span>잔여 수량 노출</span>
                    </label>

                    <label class="admin-check-card">
                        <input
                            type="checkbox"
                            name="weekend_booking_only"
                            value="1"
                            <?= !empty($formData['weekend_booking_only']) ? 'checked' : '' ?>
                        >
                        <span>주말 예약 전용</span>
                    </label>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>예약 가능 기간 / 인원</h4>
                    <p>판매 가능 기간과 최소/최대 예약 인원을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">출발/라운드 시작일</label>
                        <input
                            type="date"
                            name="available_start_date"
                            class="admin-input"
                            value="<?= e($formData['available_start_date'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">출발/라운드 종료일</label>
                        <input
                            type="date"
                            name="available_end_date"
                            class="admin-input"
                            value="<?= e($formData['available_end_date'] ?? '') ?>"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">최소 인원</label>
                        <input
                            type="number"
                            name="min_people"
                            class="admin-input"
                            min="1"
                            step="1"
                            value="<?= e((string) ($formData['min_people'] ?? 1)) ?>"
                            placeholder="예: 2"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">최대 인원</label>
                        <input
                            type="number"
                            name="max_people"
                            class="admin-input"
                            min="1"
                            step="1"
                            value="<?= e((string) ($formData['max_people'] ?? 4)) ?>"
                            placeholder="예: 4"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">기본 재고</label>
                        <input
                            type="number"
                            name="stock"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['stock'] ?? 0)) ?>"
                            placeholder="예: 20"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 마감 기준(일)</label>
                        <input
                            type="number"
                            name="booking_deadline_days"
                            class="admin-input"
                            min="0"
                            step="1"
                            value="<?= e((string) ($formData['booking_deadline_days'] ?? 0)) ?>"
                            placeholder="예: 출발 3일 전"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 확정 소요시간</label>
                        <input
                            type="text"
                            name="booking_confirm_time"
                            class="admin-input"
                            value="<?= e($formData['booking_confirm_time'] ?? '') ?>"
                            placeholder="예: 영업일 기준 24시간 이내"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">판매 수량 문구</label>
                        <input
                            type="text"
                            name="stock_text"
                            class="admin-input"
                            value="<?= e($formData['stock_text'] ?? '') ?>"
                            placeholder="예: 선착순 12팀 / 잔여 3석"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>예약 가능 요일</h4>
                    <p>상품 예약이 가능한 요일만 선택해서 저장합니다.</p>
                </div>

                <div class="admin-check-grid product-badge-grid">
                    <?php foreach ($weekdayOptions as $weekdayValue => $weekdayLabel): ?>
                        <label class="admin-check-card product-badge-card">
                            <input
                                type="checkbox"
                                name="available_weekdays[]"
                                value="<?= e($weekdayValue) ?>"
                                <?= in_array($weekdayValue, $availableWeekdays, true) ? 'checked' : '' ?>
                            >
                            <span><?= e($weekdayLabel) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>패키지 예약 안내</h4>
                    <p>여행 패키지 예약 과정에서 안내할 운영 문구를 등록합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">출발 확정 기준</label>
                        <input
                            type="text"
                            name="departure_confirm_rule"
                            class="admin-input"
                            value="<?= e($formData['departure_confirm_rule'] ?? '') ?>"
                            placeholder="예: 최소 8명 이상 모객 시 출발 확정"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약 안내 문구</label>
                        <input
                            type="text"
                            name="reservation_notice_text"
                            class="admin-input"
                            value="<?= e($formData['reservation_notice_text'] ?? '') ?>"
                            placeholder="예: 항공 확정 후 순차 안내"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">패키지 예약 상세 안내</label>
                        <textarea
                            name="package_booking_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 예약 요청 후 담당자가 좌석 가능 여부와 객실 상황을 확인하여 안내드립니다."
                        ><?= e($formData['package_booking_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>골프장 예약 안내</h4>
                    <p>티타임 예약과 관련된 운영 문구 및 제한 조건을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">티오프 간격</label>
                        <input
                            type="text"
                            name="teeoff_interval"
                            class="admin-input"
                            value="<?= e($formData['teeoff_interval'] ?? '') ?>"
                            placeholder="예: 7분 / 8분"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">동반 인원 기준</label>
                        <input
                            type="text"
                            name="player_rule_text"
                            class="admin-input"
                            value="<?= e($formData['player_rule_text'] ?? '') ?>"
                            placeholder="예: 3~4인 플레이 권장"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">골프장 예약 상세 안내</label>
                        <textarea
                            name="golf_booking_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 티타임 확정 후 문자 또는 카카오톡으로 안내드립니다."
                        ><?= e($formData['golf_booking_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

        </div>
    </div>
</section>