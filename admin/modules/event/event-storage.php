<?php

if (!function_exists('admin_events_json_path')) {
    function admin_events_json_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/events.json';
    }
}

if (!function_exists('admin_get_events')) {
    function admin_get_events(): array
    {
        $jsonPath = admin_events_json_path();

        if (!file_exists($jsonPath)) {
            return [];
        }

        $contents = file_get_contents($jsonPath);
        if ($contents === false || trim($contents) === '') {
            return [];
        }

        $decoded = json_decode($contents, true);
        return is_array($decoded) ? $decoded : [];
    }
}

if (!function_exists('admin_save_events')) {
    function admin_save_events(array $events): bool
    {
        $jsonPath = admin_events_json_path();
        $json = json_encode($events, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($json === false) {
            return false;
        }

        return file_put_contents($jsonPath, $json) !== false;
    }
}

if (!function_exists('admin_find_event_by_id')) {
    function admin_find_event_by_id(int $id): ?array
    {
        $events = admin_get_events();

        foreach ($events as $event) {
            if ((int) ($event['id'] ?? 0) === $id) {
                return $event;
            }
        }

        return null;
    }
}

if (!function_exists('admin_next_event_id')) {
    function admin_next_event_id(array $events): int
    {
        $maxId = 0;

        foreach ($events as $event) {
            $currentId = (int) ($event['id'] ?? 0);
            if ($currentId > $maxId) {
                $maxId = $currentId;
            }
        }

        return $maxId + 1;
    }
}