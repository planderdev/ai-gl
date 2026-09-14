<?php

if (!function_exists('admin_upload_base_dir')) {
    function admin_upload_base_dir(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/uploads';
    }
}

if (!function_exists('admin_upload_base_url')) {
    function admin_upload_base_url(): string
    {
        return '/admin/uploads';
    }
}

if (!function_exists('admin_ensure_upload_dir')) {
    function admin_ensure_upload_dir(string $subDir): string
    {
        $subDir = trim($subDir, '/');
        $targetDir = admin_upload_base_dir() . '/' . $subDir;

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        return $targetDir;
    }
}

if (!function_exists('admin_move_uploaded_image')) {
    function admin_move_uploaded_image(array $file, string $subDir = 'temp'): ?string
    {
        if (
            empty($file['tmp_name']) ||
            !is_uploaded_file($file['tmp_name']) ||
            !empty($file['error'])
        ) {
            return null;
        }

        $allowedMimeTypes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset($allowedMimeTypes[$mimeType])) {
            return null;
        }

        $extension = $allowedMimeTypes[$mimeType];
        $fileName = uniqid('img_', true) . '.' . $extension;

        $targetDir = admin_ensure_upload_dir($subDir);
        $targetPath = $targetDir . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return null;
        }

        return admin_upload_base_url() . '/' . trim($subDir, '/') . '/' . $fileName;
    }
}

if (!function_exists('admin_delete_uploaded_file_by_url')) {
    function admin_delete_uploaded_file_by_url(string $url): void
    {
        if ($url === '') {
            return;
        }

        $baseUrl = admin_upload_base_url();
        if (strpos($url, $baseUrl) !== 0) {
            return;
        }

        $relativePath = substr($url, strlen($baseUrl));
        $fullPath = admin_upload_base_dir() . $relativePath;

        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}