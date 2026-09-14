<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/board/faq-storage.php';

$pageTitle = 'FAQ 등록';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$faqId = $_GET['id'] ?? '';
$faq = $faqId !== '' ? admin_get_faq_by_id($faqId) : null;
$isEdit = is_array($faq);

$formData = [
    'question' => $faq['question'] ?? '',
    'answer' => $faq['answer'] ?? '',
    'category' => $faq['category'] ?? 'booking',
    'visibility' => $faq['visibility'] ?? 'visible',
    'is_popular' => !empty($faq['is_popular']),
    'sort_order' => $faq['sort_order'] ?? 1,
    'author' => $faq['author'] ?? '관리자',
    'updated_at' => $faq['updated_at'] ?? date('Y-m-d H:i:s'),
];

$pageTitle = $isEdit ? 'FAQ 수정' : 'FAQ 등록';

include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/head.php';
include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/header.php';
?>

<div class="admin-layout">
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/sidebar.php'; ?>

    <main class="admin-main">
        <div class="admin-content">
            <div class="admin-page-head">
                <div>
                    <div class="content-breadcrumb">
                        <a href="<?= e(admin_url('pages/content/faq-list.php')) ?>">FAQ 관리</a>
                        <i class="ri-arrow-right-s-line"></i>
                        <span><?= $isEdit ? 'FAQ 수정' : 'FAQ 등록' ?></span>
                    </div>
                    <h1 class="admin-page-head__title"><?= $isEdit ? 'FAQ 수정' : 'FAQ 등록' ?></h1>
                    <p class="admin-page-head__desc">질문, 답변, 카테고리, 정렬 순서, 노출 여부를 관리하는 FAQ 편집 화면입니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/faq-list.php')) ?>" class="admin-btn admin-btn--light">목록으로</a>
                    <button type="button" class="admin-btn admin-btn--primary">저장</button>
                </div>
            </div>

            <div class="content-form-layout">
                <section class="admin-card">
                    <div class="admin-card__head">
                        <h3>FAQ 정보</h3>
                    </div>

                    <div class="admin-card__body content-form-stack">
                        <div class="admin-field">
                            <label class="admin-label">질문</label>
                            <input
                                type="text"
                                class="admin-input"
                                value="<?= e($formData['question']) ?>"
                                placeholder="자주 묻는 질문을 입력하세요"
                            >
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">카테고리</label>
                                <select class="admin-select">
                                    <?php foreach (admin_faq_category_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['category'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">노출 상태</label>
                                <select class="admin-select">
                                    <?php foreach (admin_faq_visibility_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['visibility'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
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

                        <div class="admin-field">
                            <label class="admin-label">답변</label>
                            <div class="content-editor">
                                <div class="content-editor__toolbar">
                                    <button type="button">H</button>
                                    <button type="button">B</button>
                                    <button type="button">Link</button>
                                    <button type="button">List</button>
                                    <button type="button">Note</button>
                                </div>
                                <textarea class="content-editor__textarea" rows="14" placeholder="FAQ 답변을 입력하세요"><?= strip_tags((string)$formData['answer']) ?></textarea>
                            </div>
                        </div>

                        <div class="content-toggle-row">
                            <label class="content-switch-card">
                                <span>
                                    <strong>인기 FAQ</strong>
                                    <small>자주 확인되는 핵심 항목으로 상단 또는 우선 영역에 노출할 수 있습니다.</small>
                                </span>
                                <input type="checkbox" <?= $formData['is_popular'] ? 'checked' : '' ?>>
                            </label>
                        </div>
                    </div>
                </section>

                <aside class="content-side-stack">
                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>노출 설정</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-side-metric">
                                <span>현재 상태</span>
                                <strong><?= e(admin_faq_visibility_label($formData['visibility'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>카테고리</span>
                                <strong><?= e(admin_faq_category_label($formData['category'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>인기 FAQ</span>
                                <strong><?= $formData['is_popular'] ? '사용' : '미사용' ?></strong>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>정렬 정보</h3>
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
                            <h3>빠른 액션</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <button type="button" class="admin-btn admin-btn--light">미리보기</button>
                            <button type="button" class="admin-btn admin-btn--light">비노출 저장</button>
                            <button type="button" class="admin-btn admin-btn--primary">FAQ 저장</button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    </main>
</div>

<div class="content-form-bottom-bar">
    <div class="content-form-bottom-bar__meta">
        <strong><?= $isEdit ? 'FAQ 수정 중' : '신규 FAQ 작성 중' ?></strong>
        <span>노출 여부와 정렬 순서를 함께 확인하면서 저장할 수 있습니다.</span>
    </div>
    <div class="content-form-bottom-bar__actions">
        <button
            type="button"
            class="admin-btn admin-btn--light"
            data-content-preview
            data-preview-title="<?= e($formData['question'] !== '' ? $formData['question'] : 'FAQ 미리보기') ?>"
            data-preview-meta="<?= e($formData['author'] . ' · 정렬 ' . $formData['sort_order']) ?>"
            data-preview-body="<?= e($formData['answer'] !== '' ? $formData['answer'] : '<p>답변 내용이 없습니다.</p>') ?>"
        >
            미리보기
        </button>
        <button type="button" class="admin-btn admin-btn--light">비노출 저장</button>
        <button type="button" class="admin-btn admin-btn--primary">FAQ 저장</button>
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