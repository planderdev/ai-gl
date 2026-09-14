<section class="admin-card">
    <div class="admin-card__head">
        <h3>위치 / 지도</h3>
    </div>

    <div class="admin-card__body">
        <div class="product-section-stack product-section-stack--spacious">

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>기본 위치 정보</h4>
                    <p>상세페이지 상단 및 위치 안내 영역에 사용하는 기본 주소 정보입니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--3">
                    <div class="admin-field">
                        <label class="admin-label">위치명</label>
                        <input
                            type="text"
                            name="location_name"
                            class="admin-input"
                            value="<?= e($formData['location_name'] ?? '') ?>"
                            placeholder="예: 도쿄 베이 리조트 골프클럽"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">국가</label>
                        <input
                            type="text"
                            name="location_country"
                            class="admin-input"
                            value="<?= e($formData['location_country'] ?? ($formData['country'] ?? '')) ?>"
                            placeholder="예: 일본"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">지역 표시명</label>
                        <input
                            type="text"
                            name="location_region_text"
                            class="admin-input"
                            value="<?= e($formData['location_region_text'] ?? '') ?>"
                            placeholder="예: 도쿄 / 치바"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">기본 주소</label>
                        <input
                            type="text"
                            name="address"
                            class="admin-input"
                            value="<?= e($formData['address'] ?? '') ?>"
                            placeholder="예: 1-2-3 Tokyo Bay, Chiba, Japan"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">상세 주소 / 안내 문구</label>
                        <input
                            type="text"
                            name="address_detail"
                            class="admin-input"
                            value="<?= e($formData['address_detail'] ?? '') ?>"
                            placeholder="예: 클럽하우스 정문 기준 / 호텔 로비 집결"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>지도 좌표</h4>
                    <p>지도 핀 표시와 외부 지도 연결에 사용하는 좌표 정보입니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--4">
                    <div class="admin-field">
                        <label class="admin-label">위도 (Latitude)</label>
                        <input
                            type="text"
                            name="latitude"
                            class="admin-input"
                            value="<?= e($formData['latitude'] ?? '') ?>"
                            placeholder="예: 35.6895"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">경도 (Longitude)</label>
                        <input
                            type="text"
                            name="longitude"
                            class="admin-input"
                            value="<?= e($formData['longitude'] ?? '') ?>"
                            placeholder="예: 139.6917"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">줌 레벨</label>
                        <input
                            type="number"
                            name="map_zoom"
                            class="admin-input"
                            min="1"
                            max="20"
                            step="1"
                            value="<?= e((string) ($formData['map_zoom'] ?? 14)) ?>"
                            placeholder="예: 14"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">지도 제목</label>
                        <input
                            type="text"
                            name="map_title"
                            class="admin-input"
                            value="<?= e($formData['map_title'] ?? '') ?>"
                            placeholder="예: 골프장 위치 / 호텔 위치"
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>지도 임베드</h4>
                    <p>상세페이지에 직접 삽입할 지도 iframe 또는 embed 코드를 입력합니다.</p>
                </div>

                <div class="admin-form-grid">
                    <div class="admin-field admin-field--full">
                        <label class="admin-label">지도 임베드 코드</label>
                        <textarea
                            name="map_embed"
                            class="admin-textarea admin-textarea--mono"
                            rows="6"
                            placeholder="<iframe ...></iframe>"
                        ><?= e($formData['map_embed'] ?? '') ?></textarea>
                        <div class="admin-help-text">iframe 전체 코드를 넣거나, 저장 로직에서 허용한 embed 문자열을 넣어주세요.</div>
                    </div>
                </div>
            </section>

            <section class="product-inner-card">
                <div class="product-inner-card__head">
                    <h4>외부 지도 링크</h4>
                    <p>네이버 지도, 구글 지도 등 외부 앱/웹으로 이동할 링크를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">구글맵 링크</label>
                        <input
                            type="text"
                            name="google_map_url"
                            class="admin-input"
                            value="<?= e($formData['google_map_url'] ?? '') ?>"
                            placeholder="https://maps.google.com/..."
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">네이버맵 링크</label>
                        <input
                            type="text"
                            name="naver_map_url"
                            class="admin-input"
                            value="<?= e($formData['naver_map_url'] ?? '') ?>"
                            placeholder="https://map.naver.com/..."
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">카카오맵 링크</label>
                        <input
                            type="text"
                            name="kakao_map_url"
                            class="admin-input"
                            value="<?= e($formData['kakao_map_url'] ?? '') ?>"
                            placeholder="https://map.kakao.com/..."
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">애플 지도 링크</label>
                        <input
                            type="text"
                            name="apple_map_url"
                            class="admin-input"
                            value="<?= e($formData['apple_map_url'] ?? '') ?>"
                            placeholder="https://maps.apple.com/..."
                        >
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="travel_package">
                <div class="product-inner-card__head">
                    <h4>패키지 이동 안내</h4>
                    <p>공항, 호텔, 골프장 이동과 관련된 위치 안내 문구를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">공항 → 호텔 안내</label>
                        <input
                            type="text"
                            name="airport_to_hotel_text"
                            class="admin-input"
                            value="<?= e($formData['airport_to_hotel_text'] ?? '') ?>"
                            placeholder="예: 공항에서 차량으로 약 50분"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">호텔 → 골프장 안내</label>
                        <input
                            type="text"
                            name="hotel_to_golf_text"
                            class="admin-input"
                            value="<?= e($formData['hotel_to_golf_text'] ?? '') ?>"
                            placeholder="예: 셔틀로 15분 이동"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">위치 안내 상세 문구</label>
                        <textarea
                            name="location_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 도착일 현지 미팅 후 전용 차량으로 이동하며, 일정에 따라 이동 순서는 달라질 수 있습니다."
                        ><?= e($formData['location_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

            <section class="product-inner-card js-type-panel" data-type-panel="golf_course">
                <div class="product-inner-card__head">
                    <h4>골프장 위치 안내</h4>
                    <p>내장객 안내용 주소/주차/도착 관련 문구를 입력합니다.</p>
                </div>

                <div class="admin-form-grid admin-form-grid--2">
                    <div class="admin-field">
                        <label class="admin-label">주차 안내</label>
                        <input
                            type="text"
                            name="parking_text"
                            class="admin-input"
                            value="<?= e($formData['parking_text'] ?? '') ?>"
                            placeholder="예: 클럽하우스 앞 무료 주차 가능"
                        >
                    </div>

                    <div class="admin-field">
                        <label class="admin-label">도착 권장 시간</label>
                        <input
                            type="text"
                            name="arrival_notice_text"
                            class="admin-input"
                            value="<?= e($formData['arrival_notice_text'] ?? '') ?>"
                            placeholder="예: 티오프 30분 전 도착 권장"
                        >
                    </div>

                    <div class="admin-field admin-field--full">
                        <label class="admin-label">골프장 위치 상세 안내</label>
                        <textarea
                            name="location_notice"
                            class="admin-textarea"
                            rows="4"
                            placeholder="예: 내비게이션 검색 시 클럽 공식 명칭으로 검색해 주세요."
                        ><?= e($formData['location_notice'] ?? '') ?></textarea>
                    </div>
                </div>
            </section>

        </div>
    </div>
</section>