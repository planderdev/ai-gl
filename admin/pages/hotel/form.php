<?php
$gallery = is_array($formData['gallery'] ?? null) ? $formData['gallery'] : [];
if (empty($gallery)) $gallery = [['url' => '', 'caption' => '', 'alt' => '', 'is_cover' => 1]];
$isEditMode = !empty($formData['id']);
?>
<form action="<?= e(admin_url('actions/hotel-save.php')) ?>" method="post" class="product-form hotel-form">
    <input type="hidden" name="id" value="<?= e((string) ($formData['id'] ?? 0)) ?>">
    <div class="product-form__topbar">
        <div class="product-form__topbar-left">
            <div class="product-form__type-chip">호텔 정보</div>
            <?php if ($isEditMode): ?><div class="admin-chip admin-chip--gray">ID <?= e((string) ($formData['id'] ?? 0)) ?></div><?php endif; ?>
            <div class="product-form__title-wrap">
                <h1 class="product-form__page-title"><?= $isEditMode ? '호텔 수정' : '호텔 등록' ?></h1>
                <p class="product-form__page-desc">숙소 안내 섹션에 필요한 호텔 정보, 설명 문단, 이미지 갤러리를 등록합니다.</p>
            </div>
        </div>
        <div class="product-form__topbar-actions"><a href="<?= e(admin_url('pages/hotel/list.php')) ?>" class="admin-btn admin-btn--light">목록으로</a><button type="submit" class="admin-btn admin-btn--primary"><?= $isEditMode ? '수정 저장' : '저장하기' ?></button></div>
    </div>

    <section class="admin-card"><div class="admin-card__body"><div class="hotel-form-intro"><div><span class="admin-chip"><?= e($formData['brand_label'] ?? 'HOTEL INFO') ?></span><h2><?= e($formData['name'] ?? '호텔명을 입력하세요') ?></h2><p>패키지 등록 화면에서 불러와 숙소명, 연락처, 주소, 설명, 갤러리를 한 번에 연결할 수 있습니다.</p></div></div></div></section>

    <section class="admin-card u-mt-16"><div class="admin-card__body"><div class="admin-form-grid admin-form-grid--3">
        <div class="admin-field"><label class="admin-label">호텔명</label><input type="text" name="name" class="admin-input" value="<?= e($formData['name'] ?? '') ?>" required></div>
        <div class="admin-field"><label class="admin-label">상태</label><select name="status" class="admin-select"><option value="publish" <?= ($formData['status'] ?? '') === 'publish' ? 'selected' : '' ?>>공개</option><option value="draft" <?= ($formData['status'] ?? '') === 'draft' ? 'selected' : '' ?>>임시저장</option><option value="hidden" <?= ($formData['status'] ?? '') === 'hidden' ? 'selected' : '' ?>>숨김</option></select></div>
        <div class="admin-field"><label class="admin-label">정렬순서</label><input type="number" name="sort_order" class="admin-input" value="<?= e((string) ($formData['sort_order'] ?? 0)) ?>"></div>
        <div class="admin-field"><label class="admin-label">상단 태그</label><input type="text" name="tag" class="admin-input" value="<?= e($formData['tag'] ?? '') ?>" placeholder="예: 아오모리 와이너리 호텔"></div>
        <div class="admin-field"><label class="admin-label">정보 배지명</label><input type="text" name="brand_label" class="admin-input" value="<?= e($formData['brand_label'] ?? 'HOTEL INFO') ?>" placeholder="예: HOTEL INFO"></div>
        <div class="admin-field"><label class="admin-label">체크인 / 체크아웃</label><input type="text" name="checkin_out" class="admin-input" value="<?= e($formData['checkin_out'] ?? '') ?>" placeholder="예: 15:00 / 11:00"></div>
        <div class="admin-field"><label class="admin-label">웹사이트</label><input type="text" name="website" class="admin-input" value="<?= e($formData['website'] ?? '') ?>"></div>
        <div class="admin-field"><label class="admin-label">전화번호</label><input type="text" name="phone" class="admin-input" value="<?= e($formData['phone'] ?? '') ?>"></div>
        <div class="admin-field admin-field--full"><label class="admin-label">주소</label><input type="text" name="address" class="admin-input" value="<?= e($formData['address'] ?? '') ?>"></div>
        <div class="admin-field admin-field--full"><label class="admin-label">소개 문단 1</label><textarea name="description" class="admin-textarea" rows="3"><?= e($formData['description'] ?? '') ?></textarea></div>
        <div class="admin-field admin-field--full"><label class="admin-label">소개 문단 2</label><textarea name="description_2" class="admin-textarea" rows="3"><?= e($formData['description_2'] ?? '') ?></textarea></div>
        <div class="admin-field admin-field--full"><label class="admin-label">소개 문단 3</label><textarea name="description_3" class="admin-textarea" rows="3"><?= e($formData['description_3'] ?? '') ?></textarea></div>
    </div></div></section>

    <section class="admin-card u-mt-16"><div class="admin-card__head"><h3>호텔 갤러리</h3><button type="button" class="admin-btn admin-btn--light admin-btn--sm js-add-gallery-block" data-gallery-target="hotel-gallery-list" data-gallery-prefix="gallery">추가</button></div><div class="admin-card__body"><div class="repeater-list js-gallery-block hotel-gallery-list">
        <?php foreach ($gallery as $index => $image): ?>
            <div class="repeater-item gallery-block-item"><div class="gallery-upload-row"><div class="gallery-upload-row__preview"><?php if (!empty($image['url'])): ?><img src="<?= e($image['url']) ?>" alt="<?= e($image['alt'] ?? '호텔 이미지') ?>"><?php else: ?>미리보기<?php endif; ?></div><div class="gallery-upload-row__fields"><input type="hidden" name="gallery[<?= $index ?>][url]" class="js-gallery-url" value="<?= e($image['url'] ?? '') ?>"><div class="admin-form-grid admin-form-grid--2"><div class="admin-field"><label class="admin-label">캡션</label><input type="text" name="gallery[<?= $index ?>][caption]" class="admin-input" value="<?= e($image['caption'] ?? '') ?>"></div><div class="admin-field"><label class="admin-label">ALT</label><input type="text" name="gallery[<?= $index ?>][alt]" class="admin-input" value="<?= e($image['alt'] ?? '') ?>"></div></div><label class="admin-switch-row"><span>대표컷</span><input type="radio" name="hotel_gallery_cover" class="js-gallery-cover" data-cover-target="gallery" data-item-index="<?= $index ?>" <?= !empty($image['is_cover']) ? 'checked' : '' ?>></label><input type="hidden" name="gallery[<?= $index ?>][is_cover]" value="<?= !empty($image['is_cover']) ? '1' : '0' ?>" class="js-gallery-cover-hidden"><div class="gallery-upload-row__actions"><input type="file" class="js-image-upload" data-upload-type="product_gallery" data-target="gallery-item" accept="image/*"><button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-up">위로</button><button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-down">아래로</button><button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-gallery-item">복제</button><button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button></div></div></div></div>
        <?php endforeach; ?>
    </div></div></section>
</form>
