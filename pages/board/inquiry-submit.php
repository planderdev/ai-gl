<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /pages/board/inquiry.php');
    exit;
}

$category = trim($_POST['category'] ?? '');
$title = trim($_POST['title'] ?? '');
$content = trim($_POST['content'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$agree = isset($_POST['agree']) ? '1' : '';

if ($category === '' || $title === '' || $content === '' || $email === '' || $agree !== '1') {
    header('Location: /pages/board/inquiry.php');
    exit;
}

if (mb_strlen($title) < 3 || mb_strlen($content) < 10) {
    header('Location: /pages/board/inquiry.php');
    exit;
}

/* 파일 업로드 연동 전 임시 처리 */

/* 실제 저장 처리 대신 완료 페이지로 전달 */
$query = http_build_query([
    'category' => $category,
    'email' => $email,
]);

header('Location: /pages/board/inquiry-complete.php?' . $query);
exit;