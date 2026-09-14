<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/board/notice-storage.php';

$pageTitle = '공지사항 등록';
$currentAdminTitle = '콘텐츠관리';

$pageCss = ['content.css'];
$pageJs = ['content.js'];

$noticeId = $_GET['id'] ?? '';
$notice = $noticeId !== '' ? admin_get_notice_by_id($noticeId) : null;
$isEdit = is_array($notice);

$formData = [
    'title' => $notice['title'] ?? '',
    'category' => $notice['category'] ?? 'general',
    'status' => $notice['status'] ?? 'draft',
    'author' => $notice['author'] ?? '관리자',
    'is_pinned' => !empty($notice['is_pinned']),
    'summary' => $notice['summary'] ?? '',
    'content' => $notice['content'] ?? '',
    'publish_at' => !empty($notice['publish_at']) ? str_replace(' ', 'T', substr((string)$notice['publish_at'], 0, 16)) : '',
    'attachment_name' => $notice['attachment_name'] ?? '',
    'created_at' => $notice['created_at'] ?? date('Y-m-d H:i:s'),
    'updated_at' => $notice['updated_at'] ?? date('Y-m-d H:i:s'),
];

$pageTitle = $isEdit ? '공지사항 수정' : '공지사항 등록';

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
                        <a href="<?= e(admin_url('pages/content/notice-list.php')) ?>">공지사항 관리</a>
                        <i class="ri-arrow-right-s-line"></i>
                        <span><?= $isEdit ? '공지 수정' : '공지 등록' ?></span>
                    </div>
                    <h1 class="admin-page-head__title"><?= $isEdit ? '공지사항 수정' : '공지사항 등록' ?></h1>
                    <p class="admin-page-head__desc">공지 제목, 본문, 첨부파일, 게시 상태, 상단 고정 여부를 설정할 수 있습니다.</p>
                </div>

                <div class="admin-page-head__actions">
                    <a href="<?= e(admin_url('pages/content/notice-list.php')) ?>" class="admin-btn admin-btn--light">목록으로</a>
                    <button type="button" class="admin-btn admin-btn--primary">저장</button>
                </div>
            </div>

            <div class="content-form-layout">
                <section class="admin-card">
                    <div class="admin-card__head">
                        <h3>기본 정보</h3>
                    </div>
                    <div class="admin-card__body content-form-stack">
                        <div class="admin-field">
                            <label class="admin-label">공지 제목</label>
                            <input
                                type="text"
                                class="admin-input"
                                value="<?= e($formData['title']) ?>"
                                placeholder="공지 제목을 입력하세요"
                            >
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">카테고리</label>
                                <select class="admin-select">
                                    <?php foreach (admin_notice_category_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['category'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">게시 상태</label>
                                <select class="admin-select">
                                    <?php foreach (admin_notice_status_options() as $value => $label): ?>
                                        <option value="<?= e($value) ?>" <?= $formData['status'] === $value ? 'selected' : '' ?>>
                                            <?= e($label) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <div class="content-form-grid">
                            <div class="admin-field">
                                <label class="admin-label">작성자</label>
                                <input
                                    type="text"
                                    class="admin-input"
                                    value="<?= e($formData['author']) ?>"
                                    placeholder="작성자 이름"
                                >
                            </div>

                            <div class="admin-field">
                                <label class="admin-label">게시 예정일</label>
                                <input
                                    type="datetime-local"
                                    class="admin-input"
                                    value="<?= e($formData['publish_at']) ?>"
                                >
                            </div>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">요약 설명</label>
                            <textarea class="admin-textarea" rows="4" placeholder="목록에 노출될 짧은 설명을 입력하세요"><?= e($formData['summary']) ?></textarea>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">본문</label>
                            <div class="content-editor">
                                <div class="content-editor__toolbar">
                                    <button type="button">H</button>
                                    <button type="button">B</button>
                                    <button type="button">Link</button>
                                    <button type="button">List</button>
                                    <button type="button">Image</button>
                                </div>
                                <textarea class="content-editor__textarea" rows="14" placeholder="공지 본문을 입력하세요"><?= strip_tags((string)$formData['content']) ?></textarea>
                            </div>
                        </div>

                        <div class="admin-field">
                            <label class="admin-label">첨부파일</label>
                            <div class="content-upload-box">
                                <div class="content-upload-box__icon">
                                    <i class="ri-attachment-2"></i>
                                </div>
                                <div class="content-upload-box__body">
                                    <strong>파일 업로드 UI</strong>
                                    <p>실제 업로드 연동 전 데모 영역입니다.</p>
                                    <?php if ($formData['attachment_name'] !== ''): ?>
                                        <span class="content-upload-box__file"><?= e($formData['attachment_name']) ?></span>
                                    <?php else: ?>
                                        <span class="content-upload-box__file content-upload-box__file--empty">등록된 첨부파일 없음</span>
                                    <?php endif; ?>
                                </div>
                                <button type="button" class="admin-btn admin-btn--light admin-btn--sm">파일 선택</button>
                            </div>
                        </div>

                        <div class="content-toggle-row">
                            <label class="content-switch-card">
                                <span>
                                    <strong>상단 고정</strong>
                                    <small>중요 공지는 목록 상단에 우선 노출됩니다.</small>
                                </span>
                                <input type="checkbox" <?= $formData['is_pinned'] ? 'checked' : '' ?>>
                            </label>
                        </div>
                    </div>
                </section>

                <aside class="content-side-stack">
                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>게시 설정</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-side-metric">
                                <span>현재 상태</span>
                                <strong><?= e(admin_notice_status_label($formData['status'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>카테고리</span>
                                <strong><?= e(admin_notice_category_label($formData['category'])) ?></strong>
                            </div>
                            <div class="content-side-metric">
                                <span>상단 고정</span>
                                <strong><?= $formData['is_pinned'] ? '사용' : '미사용' ?></strong>
                            </div>
                        </div>
                    </section>

                    <section class="admin-card">
                        <div class="admin-card__head">
                            <h3>문서 정보</h3>
                        </div>
                        <div class="admin-card__body content-side-stack__body">
                            <div class="content-side-meta">
                                <span>생성일</span>
                                <strong><?= e($formData['created_at']) ?></strong>
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
                            <button type="button" class="admin-btn admin-btn--light">임시저장</button>
                            <button type="button" class="admin-btn admin-btn--primary">게시 저장</button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    </main>
</div>

<div class="content-form-bottom-bar">
    <div class="content-form-bottom-bar__meta">
        <strong><?= $isEdit ? '공지 수정 중' : '신규 공지 작성 중' ?></strong>
        <span>저장 액션은 현재 프론트 데모 상태입니다.</span>
    </div>
    <div class="content-form-bottom-bar__actions">
        <button
            type="button"
            class="admin-btn admin-btn--light"
            data-content-preview
            data-preview-title="<?= e($formData['title'] !== '' ? $formData['title'] : '공지 미리보기') ?>"
            data-preview-meta="<?= e($formData['author'] . ' · ' . ($formData['publish_at'] !== '' ? str_replace('T', ' ', $formData['publish_at']) : '발행일 미정')) ?>"
            data-preview-body="<?= e($formData['content'] !== '' ? $formData['content'] : '<p>본문 내용이 없습니다.</p>') ?>"
        >
            미리보기
        </button>
        <button type="button" class="admin-btn admin-btn--light">임시저장</button>
        <button type="button" class="admin-btn admin-btn--primary">게시 저장</button>
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