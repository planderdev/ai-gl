<?php include_once __DIR__ . '/helpers.php'; ?>
<?php
$defaultTitle = '캐디스 AI';
$defaultDescription = '기존에 경험하지 못한 AI와 함께하는 새로운 골프여행!';
$defaultUrl = 'https://ai-gl.ai/';
$ogImage = 'https://ai-gl.ai/assets/images/ogimage.jpg?v=20260701';
?>
<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) : $defaultTitle; ?></title>
    <meta name="description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : $defaultDescription; ?>" />
    <meta name="keywords" content="<?= isset($pageKeywords) ? htmlspecialchars($pageKeywords) : $defaultDescription; ?>" />
    <meta name="author" content="캐디스 AI" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="<?= isset($pageTitle) ? htmlspecialchars($pageTitle) : $defaultTitle; ?>" />
    <meta property="og:description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : $defaultDescription; ?>" />
    <meta property="og:image" content="<?= $ogImage; ?>" />
    <meta property="og:image:secure_url" content="<?= $ogImage; ?>" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="<?= isset($pageUrl) ? htmlspecialchars($pageUrl) : $defaultUrl; ?>" />
    <meta property="og:site_name" content="캐디스 AI" />
    <meta property="og:locale" content="ko_KR" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?= isset($pageTitle) ? htmlspecialchars($pageTitle) : $defaultTitle; ?>" />
    <meta name="twitter:description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : $defaultDescription; ?>" />
    <meta name="twitter:image" content="<?= $ogImage; ?>" />

    <link rel="icon" href="https://ai-gl.ai/assets/images/favicon.ico" type="image/x-icon" />

    <!-- 공통 CSS -->
    <?php include_once $_SERVER['DOCUMENT_ROOT'] . '/includes/assets/css-common.php'; ?>
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />

    <!-- 페이지 전용 CSS -->
    <?php if (!empty($pageCss) && is_array($pageCss)): ?>
        <?php foreach ($pageCss as $css): ?>
            <link rel="stylesheet" href="<?= asset($css); ?>" />
        <?php endforeach; ?>
    <?php endif; ?>

    <!-- 외부 폰트/아이콘 -->
    <link
        rel="stylesheet"
        as="style"
        crossorigin
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

    <link
        href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css"
        rel="stylesheet" />

    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</head>

<body>
    <div id="wrap">