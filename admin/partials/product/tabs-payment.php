<section class="admin-card">
    <div class="admin-card__head">
        <h3>결제 설정</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>결제 기본 설정</h4>
                    <p>상품 결제 방식과 결제 타이밍을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">대표 결제수단</label>
                        <select name="primary_payment_method" class="admin-select">
                            <option value="">선택하세요</option>
                            <?php foreach ($paymentMethodOptions as $methodValue => $methodLabel): ?>
                                <option
                                    value="<?= e($methodValue) ?>"
                                    <?= ($formData['primary_payment_method'] ?? '') === $methodValue ? 'selected' : '' ?>
                                >
                                    <?= e($methodLabel) ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">결제 타이밍</label>
                        <select name="payment_timing" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="full" <?= ($formData['payment_timing'] ?? '') === 'full' ? 'selected' : '' ?>>전액 결제</option>
                            <option value="deposit_balance" <?= ($formData['payment_timing'] ?? '') === 'deposit_balance' ? 'selected' : '' ?>>계약금 + 잔금</option>
                            <option value="onsite" <?= ($formData['payment_timing'] ?? '') === 'onsite' ? 'selected' : '' ?>>현장 결제</option>
                            <option value="manual_confirm" <?= ($formData['payment_timing'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>상담 후 결제</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">결제 상태 문구</label>
                        <input
                            type="text"
                            name="payment_status_text"
                            class="admin-input"
                            value="<?= e($formData['payment_status_text'] ?? '') ?>"
                            placeholder="예: 예약 후 순차 결제 안내"
                        >
                    </div> 
                    <?php foreach ($paymentMethodOptions as $methodValue => $methodLabel): ?>
                        <label class="admin-check-card product-badge-card">
                            <input
                                type="checkbox"
                                name="payment_methods[]"
                                value="<?= e($methodValue) ?>"
                                <?= in_array($methodValue, $paymentMethods, true) ? 'checked' : '' ?>
                            >
                            <span><?= e($methodLabel) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>무통장입금 정보</h4>
                    <p>무통장입금을 사용하는 경우 노출할 계좌 정보를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">은행명</label>
                        <input
                            type="text"
                            name="bank_name"
                            class="admin-input"
                            value="<?= e($formData['bank_name'] ?? '') ?>"
                            placeholder="예: 국민은행"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">계좌번호</label>
                        <input
                            type="text"
                            name="bank_account"
                            class="admin-input"
                            value="<?= e($formData['bank_account'] ?? '') ?>"
                            placeholder="예: 123-456-789012"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예금주</label>
                        <input
                            type="text"
                            name="bank_account_holder"
                            class="admin-input"
                            value="<?= e($formData['bank_account_holder'] ?? '') ?>"
                            placeholder="예: AI GOLF"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">입금 기한</label>
                        <input
                            type="text"
                            name="deposit_due_text"
                            class="admin-input"
                            value="<?= e($formData['deposit_due_text'] ?? '') ?>"
                            placeholder="예: 예약 후 24시간 이내"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">입금 확인 기준</label>
                        <select name="deposit_check_rule" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="manual" <?= ($formData['deposit_check_rule'] ?? '') === 'manual' ? 'selected' : '' ?>>수동 확인</option>
                            <option value="same_day" <?= ($formData['deposit_check_rule'] ?? '') === 'same_day' ? 'selected' : '' ?>>당일 확인</option>
                            <option value="business_day" <?= ($formData['deposit_check_rule'] ?? '') === 'business_day' ? 'selected' : '' ?>>영업일 기준 확인</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">입금 안내 연락처</label>
                        <input
                            type="text"
                            name="payment_contact"
                            class="admin-input"
                            value="<?= e($formData['payment_contact'] ?? '') ?>"
                            placeholder="예: 02-1234-5678 / 카카오톡 채널"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>패키지 결제 정책</h4>
                    <p>여행 패키지 상품에 맞는 계약금/잔금 정책과 발권 전 안내를 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">계약금 비율(%)</label>
                        <input
                            type="number"
                            name="deposit_rate"
                            class="admin-input"
                            min="0"
                            max="100"
                            step="1"
                            value="<?= e((string) ($formData['deposit_rate'] ?? 0)) ?>"
                            placeholder="예: 30"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">잔금 결제 시점</label>
                        <input
                            type="text"
                            name="balance_due_text"
                            class="admin-input"
                            value="<?= e($formData['balance_due_text'] ?? '') ?>"
                            placeholder="예: 출발 14일 전"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">항공 발권 기준</label>
                        <select name="ticketing_rule" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="after_full_payment" <?= ($formData['ticketing_rule'] ?? '') === 'after_full_payment' ? 'selected' : '' ?>>전액 결제 후 발권</option>
                            <option value="after_deposit" <?= ($formData['ticketing_rule'] ?? '') === 'after_deposit' ? 'selected' : '' ?>>계약금 확인 후 진행</option>
                            <option value="manual_confirm" <?= ($formData['ticketing_rule'] ?? '') === 'manual_confirm' ? 'selected' : '' ?>>상담 후 확정</option>
                        </select>
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">패키지 결제 안내</label>
                        <textarea
                            name="payment_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 계약금 입금 확인 후 항공/호텔 가능 여부를 다시 안내드립니다."
                        ><?= e($formData['payment_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>골프장 결제 정책</h4>
                    <p>티타임 예약에 맞는 결제/정산 방식을 설정합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">정산 방식</label>
                        <select name="settlement_type" class="admin-select">
                            <option value="">선택하세요</option>
                            <option value="prepaid" <?= ($formData['settlement_type'] ?? '') === 'prepaid' ? 'selected' : '' ?>>사전 결제</option>
                            <option value="mixed" <?= ($formData['settlement_type'] ?? '') === 'mixed' ? 'selected' : '' ?>>예약금 + 현장결제</option>
                            <option value="onsite" <?= ($formData['settlement_type'] ?? '') === 'onsite' ? 'selected' : '' ?>>현장 결제</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">예약금 안내</label>
                        <input
                            type="text"
                            name="reservation_deposit_text"
                            class="admin-input"
                            value="<?= e($formData['reservation_deposit_text'] ?? '') ?>"
                            placeholder="예: 1팀당 5만원 선결제"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">현장 추가결제 항목</label>
                        <input
                            type="text"
                            name="onsite_payment_text"
                            class="admin-input"
                            value="<?= e($formData['onsite_payment_text'] ?? '') ?>"
                            placeholder="예: 카트비, 캐디피 현장 별도"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">골프장 결제 안내</label>
                        <textarea
                            name="payment_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 티타임 확정 후 결제 링크 또는 계좌 정보를 안내드립니다."
                        ><?= e($formData['payment_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>추가 결제 안내</h4>
                    <p>상세페이지 하단 또는 예약 안내에 공통으로 보여줄 결제 유의사항입니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">세금/VAT 안내</label>
                        <input
                            type="text"
                            name="tax_notice_text"
                            class="admin-input"
                            value="<?= e($formData['tax_notice_text'] ?? '') ?>"
                            placeholder="예: VAT 포함 / 세금 별도"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">영수증 / 증빙 안내</label>
                        <input
                            type="text"
                            name="receipt_notice_text"
                            class="admin-input"
                            value="<?= e($formData['receipt_notice_text'] ?? '') ?>"
                            placeholder="예: 요청 시 세금계산서 발행 가능"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">결제 정책 요약</label>
                        <textarea
                            name="payment_policy_text"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 결제 완료 후 예약이 확정되며, 일부 상품은 담당자 확인 후 최종 확정됩니다."
                        ><?= e($formData['payment_policy_text'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

        </div>
    </div>
</section>