<?php

// 견적·원가표 시스템(Next.js, quote/ 디렉터리) 주소 — 별도 배포이므로 새 탭으로 연다
$quoteSystemUrl = defined('QUOTE_SYSTEM_URL') ? QUOTE_SYSTEM_URL : 'https://ai-gl.vercel.app';

$adminMenu = [
    [
        'key' => 'dashboard',
        'label' => '대시보드',
        'icon' => 'ri-dashboard-line',
        'href' => admin_url('index.php'),
    ],
    [
        'key' => 'product',
        'label' => '상품관리',
        'icon' => 'ri-golf-ball-line',
        'children' => [
            [
                'label' => '전체 상품',
                'href' => admin_url('pages/product/list.php'),
            ],
            [
                'label' => '골프장 등록',
                'href' => admin_url('pages/product/create.php?type=golf_course'),
            ],
            [
                'label' => '패키지 등록',
                'href' => admin_url('pages/product/create.php?type=travel_package'),
            ],
            [
                'label' => '호텔 관리',
                'href' => admin_url('pages/hotel/list.php'),
            ],
            [
                'label' => '국가 관리',
                'href' => admin_url('pages/product/taxonomy.php?group=countries'),
            ],
            [
                'label' => '지역 관리',
                'href' => admin_url('pages/product/taxonomy.php?group=regions'),
            ],
            [
                'label' => '테마 관리',
                'href' => admin_url('pages/product/taxonomy.php?group=themes'),
            ],
            [
                'label' => '배지 관리',
                'href' => admin_url('pages/product/taxonomy.php?group=badges'),
            ],
        ],
    ],
    [
        'key' => 'event',
        'label' => '이벤트관리',
        'icon' => 'ri-megaphone-line',
        'children' => [
            [
                'label' => '이벤트 목록',
                'href' => admin_url('pages/event/list.php'),
            ],
            [
                'label' => '이벤트 등록',
                'href' => admin_url('pages/event/create.php'),
            ],
        ],
    ],
    [
        'key' => 'booking',
        'label' => '예약관리',
        'icon' => 'ri-calendar-check-line',
        'children' => [
            [
                'label' => '예약 목록',
                'href' => admin_url('pages/booking/list.php'),
            ],
            [
                'label' => '예약 캘린더',
                'href' => admin_url('pages/booking/calendar.php'),
            ],
            
[
    'label' => '예약 등록',
    'href' => admin_url('pages/booking/create.php'),
],
        ],
    ],
    [
        'key' => 'customer',
        'label' => '고객관리',
        'icon' => 'ri-user-3-line',
        'children' => [
            [
                'label' => '고객 목록',
                'href' => admin_url('pages/customer/list.php'),
            ],
            [
                'label' => '고객 등록',
                'href' => admin_url('pages/customer/create.php'),
            ],
        ],
    ],
    [
        'key' => 'content',
        'label' => '콘텐츠관리',
        'icon' => 'ri-file-list-3-line',
        'children' => [
            [
                'label' => '공지사항',
                'href' => admin_url('pages/content/notice-list.php'),
            ],
            [
                'label' => 'FAQ',
                'href' => admin_url('pages/content/faq-list.php'),
            ],
            [
                'label' => '배너관리',
                'href' => admin_url('pages/content/banner-list.php'),
            ],
        ],
    ],
    [
        'key' => 'quote',
        'label' => '견적 시스템',
        'icon' => 'ri-file-excel-2-line',
        'children' => [
            [
                'label' => '견적 대시보드',
                'href' => $quoteSystemUrl . '/',
                'external' => true,
            ],
            [
                'label' => '상품·원가표',
                'href' => $quoteSystemUrl . '/products',
                'external' => true,
            ],
            [
                'label' => '항공 운임',
                'href' => $quoteSystemUrl . '/fares',
                'external' => true,
            ],
            [
                'label' => '견적 마스터 데이터',
                'href' => $quoteSystemUrl . '/masters',
                'external' => true,
            ],
        ],
    ],
    [
        'key' => 'setting',
        'label' => '설정',
        'icon' => 'ri-settings-3-line',
        'children' => [
            [
                'label' => '기본 설정',
                'href' => admin_url('pages/setting/general.php'),
            ],
            [
                'label' => '결제 설정',
                'href' => admin_url('pages/setting/payment.php'),
            ],
            [
                'label' => '취소/환불 설정',
                'href' => admin_url('pages/setting/cancellation.php'),
            ],
            [
                'label' => 'API 설정',
                'href' => admin_url('pages/setting/api.php'),
            ],
        ],
    ],
];