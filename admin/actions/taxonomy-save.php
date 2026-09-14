<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/taxonomy/taxonomy-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/product/taxonomy.php'));
    exit;
}

$group = $_POST['group'] ?? 'countries';
$allowedGroups = ['countries', 'regions', 'themes', 'badges'];

if (!in_array($group, $allowedGroups, true)) {
    $group = 'countries';
}

$data = admin_get_taxonomy_all();
$items = $data[$group] ?? [];

$id = (int) ($_POST['id'] ?? 0);

$payload = [
    'id' => $id,
    'name' => trim($_POST['name'] ?? ''),
    'slug' => trim($_POST['slug'] ?? ''),
    'sort_order' => (int) ($_POST['sort_order'] ?? 0),
    'is_active' => (int) ($_POST['is_active'] ?? 1),
];

if ($group === 'regions') {
    $payload['country'] = trim($_POST['country'] ?? '');
}

if ($id > 0) {
    foreach ($items as $index => $item) {
        if ((int) ($item['id'] ?? 0) === $id) {
            $items[$index] = array_merge($item, $payload);
            break;
        }
    }
} else {
    $payload['id'] = admin_next_taxonomy_id($items);
    $items[] = $payload;
}

$data[$group] = array_values($items);
admin_save_taxonomy_all($data);

header('Location: ' . admin_url('pages/product/taxonomy.php?group=' . $group));
exit;