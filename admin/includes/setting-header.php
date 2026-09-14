<?php
if (!function_exists('admin_render_setting_header')) {
    function admin_render_setting_header(array $options = []): void
    {
        $title = (string) ($options['title'] ?? '설정');
        $desc = (string) ($options['desc'] ?? '');
        $chip = (string) ($options['chip'] ?? 'SETTINGS MANAGER');
        $active = (string) ($options['active'] ?? 'general');
        $metaCards = $options['meta_cards'] ?? [];

        $tabs = [
            'general' => ['label' => '기본 설정', 'icon' => 'ri-settings-3-line', 'url' => admin_url('pages/setting/general.php')],
            'payment' => ['label' => '결제 설정', 'icon' => 'ri-bank-card-line', 'url' => admin_url('pages/setting/payment.php')],
            'cancellation' => ['label' => '취소/환불', 'icon' => 'ri-refund-2-line', 'url' => admin_url('pages/setting/cancellation.php')],
            'api' => ['label' => 'API 설정', 'icon' => 'ri-plug-2-line', 'url' => admin_url('pages/setting/api.php')],
        ];
        ?>
        <div class="admin-page-head setting-page-head">
            <div class="setting-page-head__main">
                <span class="admin-chip admin-chip--primary"><?= e($chip) ?></span>
                <h1 class="admin-page-head__title"><?= e($title) ?></h1>
                <?php if ($desc !== ''): ?>
                    <p class="admin-page-head__desc"><?= e($desc) ?></p>
                <?php endif; ?>
            </div>

            <?php if (!empty($metaCards)): ?>
                <div class="setting-page-head__meta">
                    <?php foreach ($metaCards as $card): ?>
                        <div class="setting-badge-card <?= e($card['class'] ?? '') ?>">
                            <span class="setting-badge-card__label"><?= e($card['label'] ?? '') ?></span>
                            <strong class="setting-badge-card__value"><?= e($card['value'] ?? '') ?></strong>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <nav class="setting-tabs" aria-label="설정 탭">
            <?php foreach ($tabs as $key => $tab): ?>
                <a href="<?= e($tab['url']) ?>" class="setting-tabs__item <?= $active === $key ? 'is-active' : '' ?>">
                    <i class="<?= e($tab['icon']) ?>"></i>
                    <span><?= e($tab['label']) ?></span>
                </a>
            <?php endforeach; ?>
        </nav>
        <?php
    }
}