<?php
declare(strict_types=1);

require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/includes/helpers.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/admin/modules/product/product-storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . admin_url('pages/product/list.php'));
    exit;
}

$id = (int) ($_POST['id'] ?? 0);
$existing = $id > 0 ? admin_find_product($id) : null;

$productType = (string) ($_POST['product_type'] ?? $_POST['type'] ?? ($existing['type'] ?? 'golf_course'));
$productType = admin_product_allowed_type($productType);

$saveStatus = trim((string) ($_POST['save_status'] ?? 'draft'));
$status = trim((string) ($_POST['status'] ?? ($existing['status'] ?? 'draft')));

if ($saveStatus === 'publish') {
    $status = 'publish';
} elseif ($saveStatus === 'draft') {
    $status = 'draft';
}

$status = admin_product_allowed_status($status);

$basePrice = admin_product_int($_POST['base_price'] ?? 0, 0);
$salePrice = admin_product_int($_POST['sale_price'] ?? 0, 0);
$depositPrice = admin_product_int($_POST['deposit_price'] ?? 0, 0);

$remainingPriceInput = admin_product_int($_POST['remaining_price'] ?? 0, 0);
$remainingPrice = $remainingPriceInput > 0
    ? $remainingPriceInput
    : max(($salePrice > 0 ? $salePrice : $basePrice) - $depositPrice, 0);

$listPriceInput = admin_product_int($_POST['list_price'] ?? 0, 0);
$listPrice = $listPriceInput > 0 ? $listPriceInput : ($salePrice > 0 ? $salePrice : $basePrice);

$cardDiscountRate = trim((string) ($_POST['card_discount_rate'] ?? ''));
if ($cardDiscountRate === '' && $basePrice > 0 && $salePrice > 0 && $salePrice < $basePrice) {
    $cardDiscountRate = (string) round((($basePrice - $salePrice) / $basePrice) * 100) . '%';
}

$courseSummary = trim((string) ($_POST['course_summary'] ?? ''));
if ($courseSummary === '') {
    $yard = trim((string) ($_POST['yard'] ?? ''));
    $holes = trim((string) ($_POST['holes'] ?? ''));
    $par = trim((string) ($_POST['par'] ?? ''));

    $parts = [];
    if ($yard !== '') {
        $parts[] = $yard . ' yard';
    }
    if ($holes !== '') {
        $parts[] = $holes . '홀';
    }
    if ($par !== '') {
        $parts[] = 'Par ' . $par;
    }

    $courseSummary = implode(' / ', $parts);
}

$country = trim((string) ($_POST['country'] ?? ''));
$region = trim((string) ($_POST['region'] ?? ''));
$subRegion = trim((string) ($_POST['sub_region'] ?? ''));

$displayRegion = trim((string) ($_POST['display_region'] ?? ''));
if ($displayRegion === '') {
    $displayRegion = implode(' / ', array_filter([$country, $region]));
}

$breadcrumbCountry = trim((string) ($_POST['breadcrumb_country'] ?? ''));
if ($breadcrumbCountry === '') {
    $breadcrumbCountry = $country;
}

$breadcrumbRegion = trim((string) ($_POST['breadcrumb_region'] ?? ''));
if ($breadcrumbRegion === '') {
    $breadcrumbRegion = $region;
}

$themes = $_POST['themes'] ?? [];
if (!is_array($themes)) {
    $themes = [];
}
$themes = array_values(array_unique(array_filter(array_map('trim', $themes))));

$bookingType = trim((string) ($_POST['booking_type'] ?? 'instant'));
if ($bookingType === 'instant' && !in_array('실시간티타임', $themes, true)) {
    $themes[] = '실시간티타임';
}

$courseTags = $_POST['course_tags'] ?? [];
if (!is_array($courseTags)) {
    $courseTags = [];
}
$courseTags = array_values(array_unique(array_filter(array_map('trim', $courseTags))));

$teeTimeBand = $_POST['tee_time_band'] ?? [];
if (!is_array($teeTimeBand)) {
    $teeTimeBand = [];
}
$teeTimeBand = array_values(array_unique(array_filter(array_map('trim', $teeTimeBand))));

$airportName = trim((string) ($_POST['airport_name'] ?? ''));
$airportDistanceKm = (float) ($_POST['airport_distance_km'] ?? 0);
$airportTimeMin = (int) ($_POST['airport_time_min'] ?? 0);

$airportText = trim((string) ($_POST['airport_text'] ?? ''));
if ($airportText === '' && $airportName !== '' && $airportDistanceKm > 0 && $airportTimeMin > 0) {
    $airportText = $airportName . '에서 ' .
        rtrim(rtrim(number_format($airportDistanceKm, 1, '.', ''), '0'), '.') .
        'km · ' . $airportTimeMin . '분';
}

$legacyAirportDistance = trim((string) ($_POST['airport_distance'] ?? ''));
if ($legacyAirportDistance === '' && $airportDistanceKm > 0) {
    $legacyAirportDistance = rtrim(rtrim(number_format($airportDistanceKm, 1, '.', ''), '0'), '.') . 'km';
}

$legacyAirportTime = trim((string) ($_POST['airport_time'] ?? ''));
if ($legacyAirportTime === '' && $airportTimeMin > 0) {
    $legacyAirportTime = '차량 ' . $airportTimeMin . '분';
}

$legacyCourseType = trim((string) ($_POST['course_type'] ?? ''));
if ($legacyCourseType === '' && !empty($courseTags)) {
    $legacyCourseType = $courseTags[0];
}

$cardLabel = trim((string) ($_POST['card_label'] ?? ''));
if ($cardLabel === '') {
    foreach (['특가', '프리미엄', '베스트', '추천', '신규'] as $priorityLabel) {
        if (in_array($priorityLabel, $themes, true)) {
            $cardLabel = $priorityLabel;
            break;
        }
    }
}

$isRecommended = isset($_POST['is_recommended']) ? 1 : (in_array('추천', $themes, true) ? 1 : 0);
$isBest = isset($_POST['is_best']) ? 1 : (in_array('베스트', $themes, true) ? 1 : 0);
$isNew = isset($_POST['is_new']) ? 1 : (in_array('신규', $themes, true) ? 1 : 0);

$payload = [
    'id' => $id,
    'type' => $productType,
    'product_type' => $productType,
    'status' => $status,

    'sort_order' => $_POST['sort_order'] ?? 0,

    'title' => $_POST['title'] ?? '',
    'subtitle' => $_POST['subtitle'] ?? '',
    'summary' => $_POST['summary'] ?? '',
    'description' => $_POST['description'] ?? '',
    'highlight' => $_POST['highlight'] ?? '',

    'sku' => $_POST['sku'] ?? '',
    'country' => $country,
    'region' => $region,
    'sub_region' => $subRegion,
    'display_region' => $displayRegion,
    'breadcrumb_country' => $breadcrumbCountry,
    'breadcrumb_region' => $breadcrumbRegion,

    'theme' => !empty($themes) ? $themes[0] : '',
    'theme_visuals' => [],
    'themes' => $themes,
    'course_tags' => $courseTags,
    'tee_time_band' => $teeTimeBand,

    'badges' => $_POST['badges'] ?? [],
    'card_label' => $cardLabel,
    'card_price_from' => $_POST['card_price_from'] ?? '',
    'card_discount_rate' => $cardDiscountRate,

    'booking_type' => $bookingType,
    'price_type' => $_POST['price_type'] ?? 'per_person',
    'currency' => $_POST['currency'] ?? 'KRW',
    'price_label' => $_POST['price_label'] ?? '',
    'list_price' => $listPrice,
    'base_price' => $basePrice,
    'sale_price' => $salePrice,
    'deposit_price' => $depositPrice,
    'remaining_price' => $remainingPrice,
    'adult_price' => $_POST['adult_price'] ?? 0,
    'child_price' => $_POST['child_price'] ?? 0,
    'infant_price' => $_POST['infant_price'] ?? 0,
    'default_price' => $_POST['default_price'] ?? 0,
    'default_stock' => $_POST['default_stock'] ?? 0,
    'default_closed' => isset($_POST['default_closed']) ? 1 : 0,
    'price_policy_note' => $_POST['price_policy_note'] ?? '',

    'min_people' => $_POST['min_people'] ?? 1,
    'max_people' => $_POST['max_people'] ?? 4,
    'tee_time_text' => $_POST['tee_time_text'] ?? '',
    'tee_time_slots' => $_POST['tee_time_slots'] ?? [],

    'thumbnail' => $_POST['thumbnail'] ?? ($existing['thumbnail'] ?? ''),
    'gallery' => $_POST['gallery'] ?? [],
    'hotel_gallery' => $_POST['hotel_gallery'] ?? [],
    'golf_gallery' => $_POST['golf_gallery'] ?? [],

    'location_name' => $_POST['location_name'] ?? '',
    'address' => $_POST['address'] ?? '',
    'latitude' => $_POST['latitude'] ?? '',
    'longitude' => $_POST['longitude'] ?? '',
    'map_embed' => $_POST['map_embed'] ?? '',
    'google_map_url' => $_POST['google_map_url'] ?? '',
    'naver_map_url' => $_POST['naver_map_url'] ?? '',

    'airport_name' => $airportName,
    'airport_distance_km' => $airportDistanceKm,
    'airport_time_min' => $airportTimeMin,
    'airport_text' => $airportText,
    'airport_distance' => $legacyAirportDistance,
    'airport_time' => $legacyAirportTime,
    'transport_type' => $_POST['transport_type'] ?? '',

    'hotel_id' => (int) ($_POST['hotel_id'] ?? 0),
    'hotel_name' => $_POST['hotel_name'] ?? '',
    'hotel_checkin_out' => $_POST['hotel_checkin_out'] ?? '',
    'hotel_phone' => $_POST['hotel_phone'] ?? '',
    'hotel_website' => $_POST['hotel_website'] ?? '',
    'hotel_address' => $_POST['hotel_address'] ?? '',
    'hotel_description' => $_POST['hotel_description'] ?? '',

    'golf_name' => $_POST['golf_name'] ?? '',
    'golf_phone' => $_POST['golf_phone'] ?? '',
    'golf_address' => $_POST['golf_address'] ?? '',
    'course_type' => $legacyCourseType,
    'holes' => $_POST['holes'] ?? '',
    'par' => $_POST['par'] ?? '',
    'yard' => $_POST['yard'] ?? '',
    'course_summary' => $courseSummary,
    'golf_intro' => $_POST['golf_intro'] ?? '',
    'facilities' => $_POST['facilities'] ?? [],

    'included' => $_POST['included'] ?? '',
    'excluded' => $_POST['excluded'] ?? '',
    'notice' => $_POST['notice'] ?? '',
    'itinerary' => $_POST['itinerary'] ?? '',
    'itinerary_items' => $_POST['itinerary_items'] ?? [],
    'itinerary_days' => $_POST['itinerary_days'] ?? [],

    'availability_mode' => $_POST['availability_mode'] ?? 'always_open',
    'booking_open_start' => $_POST['booking_open_start'] ?? '',
    'booking_open_end' => $_POST['booking_open_end'] ?? '',
    'available_weekdays' => $_POST['available_weekdays'] ?? [],
    'availability_calendar' => $_POST['availability_calendar'] ?? [],
    'availability_notes' => $_POST['availability_notes'] ?? '',
    'auto_soldout' => isset($_POST['auto_soldout']) ? 1 : 0,

    'cancel_policy_type' => $_POST['cancel_policy_type'] ?? 'flexible',
    'cancel_free_days' => $_POST['cancel_free_days'] ?? '',
    'cancel_fee_percent' => $_POST['cancel_fee_percent'] ?? '',
    'cancel_notes' => $_POST['cancel_notes'] ?? '',
    'weather_policy' => $_POST['weather_policy'] ?? '',
    'noshow_policy' => $_POST['noshow_policy'] ?? '',
    'round_notice_items' => $_POST['round_notice_items'] ?? [],
    'weather_notice_items' => $_POST['weather_notice_items'] ?? [],
    'important_notice_items' => $_POST['important_notice_items'] ?? [],
    'cancel_refund_items' => $_POST['cancel_refund_items'] ?? [],

    'payment_methods' => $_POST['payment_methods'] ?? [],
    'payment_timing' => $_POST['payment_timing'] ?? 'prepaid',
    'payment_notes' => $_POST['payment_notes'] ?? '',
    'bank_name' => $_POST['bank_name'] ?? '',
    'bank_account' => $_POST['bank_account'] ?? '',
    'bank_holder' => $_POST['bank_holder'] ?? '',

    'consult_only' => isset($_POST['consult_only']) ? 1 : 0,
    'hide_price' => isset($_POST['hide_price']) ? 1 : 0,
    'is_recommended' => $isRecommended,
    'is_best' => $isBest,
    'is_new' => $isNew,
    'is_featured' => isset($_POST['is_featured']) ? 1 : 0,
    'expose_country' => isset($_POST['expose_country']) ? 1 : 0,
    'expose_theme' => isset($_POST['expose_theme']) ? 1 : (!empty($themes) ? 1 : 0),

    'related_product_ids' => $_POST['related_product_ids'] ?? [],
];

$saved = admin_upsert_product($payload);

header('Location: ' . admin_url('pages/product/edit.php?id=' . (int) ($saved['id'] ?? 0)));
exit;