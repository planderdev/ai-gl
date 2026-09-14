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

$id = (int) ($_POST['id'] ?? 0);

$data = admin_get_taxonomy_all();
$items = $data[$group] ?? [];

$items = array_values(array_filter($items, function ($item) use ($id) {
    return (int) ($item['id'] ?? 0) !== $id;
}));

$data[$group] = $items;
admin_save_taxonomy_all($data);

header('Location: ' . admin_url('pages/product/taxonomy.php?group=' . $group));
exit;