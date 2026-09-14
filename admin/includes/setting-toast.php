<?php
$settingToastStatus = $_GET['status'] ?? '';
$settingToastMessage = $_GET['message'] ?? '';

if ($settingToastStatus && $settingToastMessage):
?>
    <div class="setting-toast setting-toast--<?= e($settingToastStatus) ?>" data-setting-toast>
        <div class="setting-toast__icon">
            <?php if ($settingToastStatus === 'success'): ?>
                <i class="ri-check-line"></i>
            <?php else: ?>
                <i class="ri-error-warning-line"></i>
            <?php endif; ?>
        </div>
        <div class="setting-toast__content">
            <strong class="setting-toast__title">
                <?= $settingToastStatus === 'success' ? '저장 완료' : '저장 실패' ?>
            </strong>
            <p class="setting-toast__desc"><?= e($settingToastMessage) ?></p>
        </div>
        <button type="button" class="setting-toast__close" data-setting-toast-close>
            <i class="ri-close-line"></i>
        </button>
    </div>
<?php endif; ?>