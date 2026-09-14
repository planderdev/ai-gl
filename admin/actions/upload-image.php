<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/media/media-helper.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '잘못된 요청입니다.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$type = $_POST['type'] ?? 'temp';
$type = in_array($type, ['products', 'events', 'temp'], true) ? $type : 'temp';

if (empty($_FILES['image'])) {
    echo json_encode([
        'success' => false,
        'message' => '업로드할 파일이 없습니다.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$imageUrl = admin_move_uploaded_image($_FILES['image'], $type);

if (!$imageUrl) {
    echo json_encode([
        'success' => false,
        'message' => '이미지 업로드에 실패했습니다.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'success' => true,
    'url' => $imageUrl,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;