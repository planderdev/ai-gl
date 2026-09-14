<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/content/banner-storage.php';

$pageTitle = '배너 등록';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$bannerId = $_GET['id'] ?? '';
$banner = $bannerId !== '' ? admin_get_banner_by_id($bannerId) : null;
$isEdit = is_array($banner);

$formData = [
    'name' => $banner['name'] ?? '',
    'position' => $banner['position'] ?? 'main_hero',
    'status' => $banner['status'] ?? 'inactive',
    'title' => $banner['title'] ?? '',
    'description' => $banner['description'] ?? '',
    'button_text' => $banner['button_text'] ?? '',
    'link_url' => $banner['link_url'] ?? '',
    'open_in_new_tab' => !empty($banner['open_in_new_tab']),
    'pc_image' => $banner['pc_image'] ?? '',
    'mobile_image' => $banner['mobile_image'] ?? '',
    'start_at' => !empty($banner['start_at']) ? str_replace(' ', 'T', substr((string)$banner['start_at'], 0, 16)) : '',
    'end_at' => !empty($banner['end_at']) ? str_replace(' ', 'T', substr((string)$banner['end_at'], 0, 16)) : '',
    'sort_order' => $banner['sort_order'] ?? 1,
    'author' => $banner['author'] ?? '관리자',
    'updated_at' => $banner['updated_at'] ?? date('Y-m-d H:i:s'),
];

$pageTitle = $isEdit ? '배너 수정' : '배너 등록';

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                    <div class="admin-breadcrumb">
                        <a href="<?= e(admin_url('pages/content/banner-list.php')) ?>">배너 관리</a>
                        <i class="ri-arrow-right-s-line"></i>
                        <span><?= $isEdit ? '배너 수정' : '배너 등록' ?></span>
                    </div>
                    <h1 class="admin-page-head__title"><?= $isEdit ? '배너 수정' : '배너 등록' ?></h1>
                    <p class="admin-page-head__desc">노출 위치, 이미지, 링크, 버튼 문구, 기간, 정렬 순서를 설정하는 배너 편집 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/banner-list.php')) ?>" class="admin-btn admin-btn--light">목록으로</a>
                    <button type="button" class="admin-btn admin-btn--primary">저장</button>
                </div>
            </div>

            <div class="content-form-layout">
                <section class="admin-card">
                    <div class="admin-card__head">
                        <h3>배너 정보</h3>
                    </div>

                    <div class="admin-card__body content-form-stack">
                        <div class="admin-field">
                            <label class="admin-label">배너명</label>
                            <input
                                type="text"
                                class="admin-input"
                                value="<?= e($formData['name']) ?>"
                                placeholder="배너명을 입력하세요"
                            >
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">노출 위치</label>
                                <select class="admin-select">
                                    <?php foreach (admin_banner_position_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['position'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">상태</label>
                                <select class="admin-select">
                                    <?php foreach (admin_banner_status_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['status'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">타이틀</label>
                                <input
                                    type="text"
                                    class="admin-input"
                                    value="<?= e($formData['title']) ?>"
                                    placeholder="배너 타이틀"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">버튼 텍스트</label>
                                <input
                                    type="text"
                                    class="admin-input"
                                    value="<?= e($formData['button_text']) ?>"
                                    placeholder="예: 자세히 보기"
                                >
                            </div>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">설명 문구</label>
                            <textarea class="admin-textarea" rows="4" placeholder="배너 설명 문구를 입력하세요"><?= e($formData['description']) ?></textarea>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">링크 URL</label>
                            <input
                                type="text"
                                class="admin-input"
                                value="<?= e($formData['link_url']) ?>"
                                placeholder="/pages/... 또는 외부 URL"
                            >
                        </div>

                        <div class="content-toggle-row">
                            <label class="content-switch-card">
                                <span>
                                    <strong>새창으로 열기</strong>
                                    <small>외부 페이지 또는 별도 랜딩 연결 시 사용합니다.</small>
                                </span>
                                <input type="checkbox" <?= $formData['open_in_new_tab'] ? 'checked' : '' ?>>
                            </label>
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">노출 시작일</label>
                                <input
                                    type="datetime-local"
                                    class="admin-input"
                                    value="<?= e($formData['start_at']) ?>"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">노출 종료일</label>
                                <input
                                    type="datetime-local"
                                    class="admin-input"
                                    value="<?= e($formData['end_at']) ?>"
                                >
                            </div>
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">정렬 순서</label>
                                <input
                                    type="number"
                                    class="admin-input"
                                    min="1"
                                    step="1"
                                    value="<?= e((string)$formData['sort_order']) ?>"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">작성자</label>
                                <input
                                    type="text"
                                    class="admin-input"
                                    value="<?= e($formData['author']) ?>"
                                    placeholder="작성자 이름"
                                >
                            </div>
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">PC 이미지</label>
                                <div class="content-upload-box">
                                    <div class="content-upload-box__icon">
                                        <i class="ri-image-line"></i>
                                    </div>
                                    <div class="content-upload-box__body">
                                        <strong>PC 배너 이미지</strong>
                                        <p>데모 업로드 영역입니다.</p>
                                        <?php if ($formData['pc_image'] !== ''): ?>
                                            <span class="content-upload-box__file"><?= e($formData['pc_image']) ?></span>
                                        <?php else: ?>
                                            <span class="content-upload-box__file content-upload-box__file--empty">등록된 이미지 없음</span>
                                        <?php endif; ?>
                                    </div>
                                    <button type="button" class="admin-btn admin-btn--light admin-btn--sm">파일 선택</button>
                                </div>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">모바일 이미지</label>
                                <div class="content-upload-box">
                                    <div class="content-upload-box__icon">
                                        <i class="ri-smartphone-line"></i>
                                    </div>
                                    <div class="content-upload-box__body">
                                        <strong>모바일 배너 이미지</strong>
                                        <p>데모 업로드 영역입니다.</p>
                                        <?php if ($formData['mobile_image'] !== ''): ?>
                                            <span class="content-upload-box__file"><?= e($formData['mobile_image']) ?></span>
                                        <?php else: ?>
                                            <span class="content-upload-box__file content-upload-box__file--empty">등록된 이미지 없음</span>
                                        <?php endif; ?>
                                    </div>
                                    <button type="button" class="admin-btn admin-btn--light admin-btn--sm">파일 선택</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <aside class="content-side-stack">
                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>배너 상태</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-side-metric">
                                <span>현재 상태</span>
                                <strong><?= e(admin_banner_status_label($formData['status'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>노출 위치</span>
                                <strong><?= e(admin_banner_position_label($formData['position'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>새창 열기</span>
                                <strong><?= $formData['open_in_new_tab'] ? '사용' : '미사용' ?></strong>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>문서 정보</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-side-meta">
                                <span>정렬 순서</span>
                                <strong><?= e((string)$formData['sort_order']) ?></strong>
                            </div>
                            <div class="content-side-meta">
                                <span>최종 수정일</span>
                                <strong><?= e($formData['updated_at']) ?></strong>
                            </div>
                            <div class="content-side-meta">
                                <span>작성자</span>
                                <strong><?= e($formData['author']) ?></strong>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>미리보기 가이드</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-preview-box">
                                <div class="content-preview-box__image">Preview</div>
                                <div class="content-preview-box__text">
                                    <strong><?= e($formData['title'] !== '' ? $formData['title'] : '배너 타이틀') ?></strong>
                                    <p><?= e($formData['description'] !== '' ? $formData['description'] : '배너 설명 문구가 이 영역에 표시됩니다.') ?></p>
                                    <span><?= e($formData['button_text'] !== '' ? $formData['button_text'] : '버튼 텍스트') ?></span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>빠른 액션</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <button type="button" class="admin-btn admin-btn--light">미리보기</button>
                            <button type="button" class="admin-btn admin-btn--light">비활성 저장</button>
                            <button type="button" class="admin-btn admin-btn--primary">배너 저장</button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    </main>
</div>

<div class="content-form-bottom-bar">
    <div class="content-form-bottom-bar__meta">
        <strong><?= $isEdit ? '배너 수정 중' : '신규 배너 작성 중' ?></strong>
        <span>노출 기간, 링크, 버튼 문구를 확인한 뒤 저장하세요.</span>
    </div>
    <div class="content-form-bottom-bar__actions">
        <button
            type="button"
            class="admin-btn admin-btn--light"
            data-content-preview
            data-preview-title="<?= e($formData['name'] !== '' ? $formData['name'] : '배너 미리보기') ?>"
            data-preview-meta="<?= e(admin_banner_position_label($formData['position']) . ' · ' . admin_banner_status_label($formData['status'])) ?>"
            data-preview-body="<?= e('<p><strong>' . ($formData['title'] !== '' ? $formData['title'] : '배너 타이틀') . '</strong></p><p>' . ($formData['description'] !== '' ? $formData['description'] : '배너 설명 문구') . '</p><p>버튼: ' . ($formData['button_text'] !== '' ? $formData['button_text'] : '버튼 텍스트') . '</p><p>링크: ' . ($formData['link_url'] !== '' ? $formData['link_url'] : '-') . '</p>') ?>"
        >
            미리보기
        </button>
        <button type="button" class="admin-btn admin-btn--light">비활성 저장</button>
        <button type="button" class="admin-btn admin-btn--primary">배너 저장</button>
    </div>
</div>

<div class="content-modal" id="contentPreviewModal" aria-hidden="true">
    <div class="content-modal__backdrop" data-content-preview-close></div>
    <div class="content-modal__dialog">
        <div class="content-modal__head">
            <div>
                <h3 data-preview-title>미리보기</h3>
                <p data-preview-meta></p>
            </div>
            <button type="button" class="content-icon-btn" data-content-preview-close aria-label="닫기">
                <i class="ri-close-line"></i>
            </button>
        </div>
        <div class="content-modal__body">
            <article class="content-preview-article">
                <div class="content-preview-article__meta" data-preview-meta></div>
                <div class="content-preview-article__body" data-preview-body></div>
            </article>
        </div>
    </div>
</div>

<?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/footer.php'; ?>