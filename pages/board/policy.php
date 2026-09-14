<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/data/policy-data.php';

$activeTab = $_GET['tab'] ?? 'terms';

/* 유효한 탭만 허용 */
$tabKeys = array_column($policyTabs, 'key');
if (!in_array($activeTab, $tabKeys, true)) {
    $activeTab = 'terms';
}

$currentPolicy = null;
foreach ($policyTabs as $tab) {
    if (($tab['key'] ?? '') === $activeTab) {
        $currentPolicy = $tab;
        break;
    }
}

if (!$currentPolicy && !empty($policyTabs)) {
    $currentPolicy = $policyTabs[0];
    $activeTab = $currentPolicy['key'] ?? 'terms';
}

$pageTitle = '이용약관';
$pageDescription = '이용약관, 개인정보처리방침, 마케팅 수신 동의 내용을 확인하세요.';
$pageKeywords = '이용약관, 개인정보처리방침, 정책';
$pageUrl = 'https://ai-gl.ai/pages/board/policy.php';

$pageCss = [
    'assets/css/pages/board/policy.css',
];
 
include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/header.php';
?>

<main class="pl-page">
    <div class="container">
        <div class="pl-wrap">

            <section class="pl-hero">
                <p class="pl-eyebrow">POLICY</p>
                <h1 class="pl-title">이용약관</h1>
                <p class="pl-desc">
                    서비스 이용에 필요한 약관과 정책 내용을 확인하실 수 있어요.
                    주요 변경 사항이나 버전 정보는 각 탭에서 확인해주세요.
                </p>

                <?php if ($currentPolicy): ?>
                    <div class="pl-meta">
                        <span class="pl-meta__item">
                        <span class="material-symbols-rounded">
file_copy
</span>
                            <?= htmlspecialchars($currentPolicy['label'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                        </span>

                        <?php if (!empty($currentPolicy['version'])): ?>
                            <span class="pl-meta__item">
                            <span class="material-symbols-rounded">
history
</span>
                                <?= htmlspecialchars($currentPolicy['version'], ENT_QUOTES, 'UTF-8') ?>
                            </span>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </section>

            <nav class="pl-tabs" aria-label="정책 탭">
                <?php foreach ($policyTabs as $tab): ?>
                    <a
                        href="?tab=<?= urlencode($tab['key']) ?>"
                        class="pl-tab <?= $activeTab === $tab['key'] ? 'active' : '' ?>"
                        aria-current="<?= $activeTab === $tab['key'] ? 'page' : 'false' ?>"
                    >
                        <?= htmlspecialchars($tab['label'], ENT_QUOTES, 'UTF-8') ?>
                    </a>
                <?php endforeach; ?>
            </nav>

            <section class="pl-content-wrap">
                <?php if ($currentPolicy): ?>
                    <div class="pl-content">
                        <div class="pl-version">
                            <span class="pl-version__title">
                                <?= htmlspecialchars($currentPolicy['label'] ?? '', ENT_QUOTES, 'UTF-8') ?>
                            </span>

                            <?php if (!empty($currentPolicy['version'])): ?>
                                <span class="pl-version__badge">
                                    <?= htmlspecialchars($currentPolicy['version'], ENT_QUOTES, 'UTF-8') ?>
                                </span>
                            <?php endif; ?>
                        </div>

                        <div class="pl-scroll">
                            <?= $currentPolicy['content'] ?? '' ?>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="pl-empty">
                        <div class="pl-empty__icon">
                        <span class="material-symbols-rounded">
warning
</span>
                        </div>
                        <strong class="pl-empty__title">표시할 정책 내용이 없습니다.</strong>
                        <p class="pl-empty__desc">관리자에서 정책 데이터를 확인해주세요.</p>
                    </div>
                <?php endif; ?>
            </section>

        </div>
    </div>
</main>

<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/footer.php'; ?>