<?php

$myPageData = [
    'user' => [
        'name' => '캐디스',
        'grade' => 'Cadys Premium Member',
        'grade_label' => 'PREMIUM',
        'email' => 'cadys@example.com',
        'phone' => '010-1234-5678',
        'birth' => '0000.00.00',
        'address' => '제주특별자치도 제주시 전농로 119, 909호',
        'avatar_text' => 'SL',
    ],

    'summary' => [
        'tripCount' => 2,
        'couponCount' => 3,
        'mileage' => '18,000P',
        'unreadNotice' => 2,
    ],

    'menu' => [
        [
            'key' => 'dashboard',
            'label' => '마이페이지',
            'url' => '/pages/mypage/index.php',
            'icon' => 'ri-home-5-line',
        ],
        [
            'key' => 'travel',
            'label' => '나의 여행',
            'url' => '/pages/mypage/travel.php',
            'icon' => 'ri-luggage-cart-line',
        ],
        [
            'key' => 'profile',
            'label' => '내 정보',
            'url' => '/pages/mypage/profile.php',
            'icon' => 'ri-user-3-line',
        ],
        [
            'key' => 'coupons',
            'label' => '보유쿠폰',
            'url' => '/pages/mypage/coupons.php',
            'icon' => 'ri-coupon-3-line',
        ],
        [
            'key' => 'mileage',
            'label' => '마일리지',
            'url' => '/pages/mypage/mileage.php',
            'icon' => 'ri-coin-line',
        ],
        [
            'key' => 'notifications',
            'label' => '알림설정',
            'url' => '/pages/mypage/notifications.php',
            'icon' => 'ri-notification-3-line',
        ],
    ],

    'dashboard' => [
        'hero' => [
            'eyebrow' => 'My Page',
            'title' => '나의 여행과 혜택을\n한눈에 확인하세요',
            'desc' => '예약 일정, 쿠폰, 마일리지, 알림 설정까지 마이페이지에서 편리하게 관리할 수 있습니다.',
        ],
        'hero_stats' => [
            [
                'label' => '다가오는 여행',
                'value' => '1건',
                'icon' => 'ri-flight-takeoff-line',
            ],
            [
                'label' => '사용 가능한 쿠폰',
                'value' => '2장',
                'icon' => 'ri-coupon-2-line',
            ],
            [
                'label' => '보유 마일리지',
                'value' => '18,000P',
                'icon' => 'ri-coin-line',
            ],
        ],
        'quickLinks' => [
            [
                'title' => '다가오는 여행',
                'desc' => '출발 예정 여행 일정과 상세 내역 확인',
                'value' => '1건',
                'url' => '/pages/mypage/travel.php',
                'icon' => 'ri-calendar-check-line',
                'tone' => 'travel',
            ],
            [
                'title' => '사용 가능한 쿠폰',
                'desc' => '예약 시 바로 적용 가능한 쿠폰',
                'value' => '2장',
                'url' => '/pages/mypage/coupons.php',
                'icon' => 'ri-coupon-3-line',
                'tone' => 'coupon',
            ],
            [
                'title' => '보유 마일리지',
                'desc' => '결제 시 사용 가능한 적립 포인트',
                'value' => '18,000P',
                'url' => '/pages/mypage/mileage.php',
                'icon' => 'ri-coin-line',
                'tone' => 'mileage',
            ],
            [
                'title' => '알림 설정',
                'desc' => '예약, 혜택, 이벤트 알림 수신 설정',
                'value' => '2개 활성',
                'url' => '/pages/mypage/notifications.php',
                'icon' => 'ri-notification-3-line',
                'tone' => 'notification',
            ],
        ],
        'recentTrip' => [
            'status' => '예약완료',
            'badge' => 'D-18',
            'booking_no' => 'CD-260415-1024',
            'title' => '일본 후쿠오카 3박 4일 골프 패키지',
            'period' => '2026.04.15 ~ 2026.04.18',
            'people' => '성인 2인',
            'course' => '센추리 골프클럽',
            'hotel' => '더 블러썸 하카타 프리미어',
            'price' => '₩2,490,000',
            'thumb' => 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
            'url' => '/pages/mypage/travel.php',
        ],
        'noticeItems' => [
            [
                'title' => '후쿠오카 골프 패키지 출발 안내',
                'date' => '2026.03.26',
                'desc' => '출발 3일 전 준비사항과 바우처 확인이 필요합니다.',
                'type' => '예약',
                'is_new' => true,
            ],
            [
                'title' => '봄 시즌 한정 쿠폰이 발급되었습니다',
                'date' => '2026.03.24',
                'desc' => '해외 골프 상품 예약 시 사용할 수 있는 10% 할인 쿠폰입니다.',
                'type' => '혜택',
                'is_new' => true,
            ],
            [
                'title' => '알림 수신 설정이 저장되었습니다',
                'date' => '2026.03.18',
                'desc' => '예약 및 일정 알림을 정상적으로 받을 수 있습니다.',
                'type' => '시스템',
                'is_new' => false,
            ],
        ],
    ],

    'travel' => [
        'hero' => [
            'eyebrow' => 'My Travel',
            'title' => '나의 여행',
            'desc' => '예약한 여행과 지난 여행 내역을 한눈에 확인해보세요.',
        ],
        'items' => [
            [
                'status' => '예약완료',
                'badge' => 'D-18',
                'title' => '일본 후쿠오카 3박 4일 골프 패키지',
                'period' => '2026.04.15 ~ 2026.04.18',
                'people' => '성인 2인',
                'course' => '센추리 골프클럽',
                'hotel' => '더 블러썸 하카타 프리미어',
                'price' => '₩2,490,000',
                'thumb' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'url' => '#;',
            ],
            [
                'status' => '여행완료',
                'badge' => '완료',
                'title' => '태국 방콕 4박 5일 자유 골프',
                'period' => '2026.02.10 ~ 2026.02.14',
                'people' => '성인 4인',
                'course' => '알파인 골프 & 스포츠 클럽',
                'hotel' => '방콕 메리어트 마르퀴스',
                'price' => '₩4,180,000',
                'thumb' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                'url' => '#;',
            ],
        ],
    ],

    'profile' => [
        'hero' => [
            'eyebrow' => 'My Profile',
            'title' => '내 정보',
            'desc' => '회원 정보를 확인하고 수정할 수 있습니다.',
        ],
    ],

    'coupons' => [
        'hero' => [
            'eyebrow' => 'My Coupons',
            'title' => '보유쿠폰',
            'desc' => '사용 가능한 쿠폰과 만료된 쿠폰을 확인할 수 있습니다.',
        ],
        'items' => [
            [
                'name' => '신규 회원 웰컴 쿠폰',
                'desc' => '골프 패키지 예약 시 사용 가능',
                'discount' => '₩50,000',
                'expire' => '2026.04.30',
                'status' => '사용가능',
            ],
            [
                'name' => '봄 시즌 한정 쿠폰',
                'desc' => '해외 골프 상품 결제 시 적용',
                'discount' => '10%',
                'expire' => '2026.05.15',
                'status' => '사용가능',
            ],
            [
                'name' => '재구매 감사 쿠폰',
                'desc' => '3회 이상 예약 고객 전용',
                'discount' => '₩30,000',
                'expire' => '2026.03.10',
                'status' => '만료',
            ],
        ],
    ],

    'mileage' => [
        'hero' => [
            'eyebrow' => 'My Mileage',
            'title' => '마일리지',
            'desc' => '적립 및 사용 내역을 확인할 수 있습니다.',
        ],
        'current' => '18,000P',
        'history' => [
            [
                'type' => '적립',
                'title' => '후쿠오카 골프 패키지 예약 적립',
                'date' => '2026.03.20',
                'amount' => '+25,000',
            ],
            [
                'type' => '사용',
                'title' => '결제 시 마일리지 사용',
                'date' => '2026.02.10',
                'amount' => '-10,000',
            ],
            [
                'type' => '적립',
                'title' => '이벤트 참여 적립',
                'date' => '2026.01.15',
                'amount' => '+3,000',
            ],
        ],
    ],

    'notifications' => [
        'hero' => [
            'eyebrow' => 'Notification Settings',
            'title' => '알림설정',
            'desc' => '여행 일정과 혜택 알림 수신 여부를 설정할 수 있습니다.',
        ],
        'items' => [
            [
                'title' => '예약/결제 알림',
                'desc' => '예약 완료, 결제 확인, 취소 안내',
                'checked' => true,
            ],
            [
                'title' => '출발 일정 알림',
                'desc' => '여행 출발 전 일정 리마인드',
                'checked' => true,
            ],
            [
                'title' => '이벤트/프로모션 알림',
                'desc' => '특가 상품, 시즌 프로모션, 신규 혜택',
                'checked' => false,
            ],
            [
                'title' => '마케팅 정보 수신',
                'desc' => '문자 및 이메일을 통한 맞춤 추천 정보',
                'checked' => false,
            ],
        ],
    ],
];