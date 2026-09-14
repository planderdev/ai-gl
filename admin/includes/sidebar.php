<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/menu-data.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';

$currentUri = $_SERVER['REQUEST_URI'] ?? '';

if (!function_exists('admin_sidebar_resolve_href')) {
    function admin_sidebar_resolve_href(string $href): string
    {
        if ($href === '') {
            return '#';
        }

        if (preg_match('#^https?://#', $href)) {
            return $href;
        }

        if (strpos($href, '/admin/') === 0) {
            return $href;
        }

        return admin_url(ltrim($href, '/'));
    }
}

if (!function_exists('admin_sidebar_parse_url_parts')) {
    function admin_sidebar_parse_url_parts(string $url): array
    {
        $parts = parse_url($url);

        $path = isset($parts['path']) ? rtrim($parts['path'], '/') : '';
        $path = $path === '' ? '/' : $path;

        $queryParams = [];
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $queryParams);
            ksort($queryParams);
        }

        return [
            'path' => $path,
            'query' => $queryParams,
        ];
    }
}

if (!function_exists('admin_sidebar_is_current')) {
    function admin_sidebar_is_current(string $currentUri, string $targetHref): bool
    {
        $current = admin_sidebar_parse_url_parts($currentUri);
        $target = admin_sidebar_parse_url_parts($targetHref);

        if ($current['path'] !== $target['path']) {
            return false;
        }

        if (!empty($target['query'])) {
            return $current['query'] === $target['query'];
        }

        return true;
    }
}

if (!function_exists('admin_sidebar_has_current_child')) {
    function admin_sidebar_has_current_child(array $children, string $currentUri): bool
    {
        foreach ($children as $child) {
            $childHref = admin_sidebar_resolve_href((string) ($child['href'] ?? $child['url'] ?? ''));
            if (admin_sidebar_is_current($currentUri, $childHref)) {
                return true;
            }
        }

        return false;
    }
}
?>
<aside class="admin-sidebar js-admin-sidebar" id="adminSidebar" aria-label="관리자 사이드바">
    <div class="admin-sidebar__inner">
        <nav class="admin-nav" aria-label="관리자 메뉴">
            <?php foreach ($adminMenu as $menu): ?>
                <?php
                $hasChildren = !empty($menu['children']);
                $menuHref = admin_sidebar_resolve_href((string) ($menu['href'] ?? $menu['url'] ?? ''));
                $isCurrentParent = !$hasChildren && admin_sidebar_is_current($currentUri, $menuHref);
                $hasCurrentChild = $hasChildren ? admin_sidebar_has_current_child($menu['children'], $currentUri) : false;

                $isOpen = $hasCurrentChild;
                $isCurrentGroup = $isCurrentParent || $hasCurrentChild;
                ?>
                <div class="admin-nav__group <?= $isOpen ? 'is-open' : '' ?> <?= $isCurrentGroup ? 'is-current' : '' ?>">
                    <?php if ($hasChildren): ?>
                        <button
                            type="button"
                            class="admin-nav__parent js-admin-nav-toggle"
                            aria-expanded="<?= $isOpen ? 'true' : 'false' ?>"
                        >
                            <span class="admin-nav__parent-left">
                                <?php if (!empty($menu['icon'])): ?>
                                    <i class="<?= e($menu['icon']) ?>" aria-hidden="true"></i>
                                <?php endif; ?>
                                <span><?= e($menu['label']) ?></span>
                            </span>
                            <i class="ri-arrow-down-s-line admin-nav__arrow" aria-hidden="true"></i>
                        </button>

                        <div class="admin-nav__children">
                            <?php foreach ($menu['children'] as $child): ?>
                                <?php
                                $childHref = admin_sidebar_resolve_href((string) ($child['href'] ?? $child['url'] ?? ''));
                                $isChildCurrent = admin_sidebar_is_current($currentUri, $childHref);
                                ?>
                                <a
                                    href="<?= e($childHref) ?>"
                                    class="admin-nav__child <?= $isChildCurrent ? 'is-current' : '' ?>"
                                    <?= $isChildCurrent ? 'aria-current="page"' : '' ?>
                                    <?= !empty($child['external']) ? 'target="_blank" rel="noopener"' : '' ?>
                                >
                                    <?= e($child['label']) ?>
                                    <?php if (!empty($child['external'])): ?>
                                        <i class="ri-external-link-line admin-nav__external" aria-hidden="true"></i>
                                    <?php endif; ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <a
                            href="<?= e($menuHref) ?>"
                            class="admin-nav__single <?= $isCurrentParent ? 'is-current' : '' ?>"
                            <?= $isCurrentParent ? 'aria-current="page"' : '' ?>
                        >
                            <?php if (!empty($menu['icon'])): ?>
                                <i class="<?= e($menu['icon']) ?>" aria-hidden="true"></i>
                            <?php endif; ?>
                            <span><?= e($menu['label']) ?></span>
                        </a>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </nav>
    </div>
</aside>