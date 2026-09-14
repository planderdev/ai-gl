<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';

$pageTitle = $pageTitle ?? '캐디스 Admin';
$pageCss = $pageCss ?? [];
$bodyClass = $bodyClass ?? 'admin-body';
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?></title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css">

    <link rel="stylesheet" href="<?= e(asset_url('css/tokens.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_url('css/base.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_url('css/layout.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_url('css/components.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_url('css/utilities.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset_url('css/admin.css')) ?>">

    <?php foreach ($pageCss as $css): ?>
        <link rel="stylesheet" href="<?= e(asset_url('css/' . $css)) ?>">
    <?php endforeach; ?>
</head>
<body class="<?= e($bodyClass) ?>">