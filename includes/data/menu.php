<?php

$menuData = [
    'gnb' => [
        ['label' => '티타임', 'key' => 'teetime', 'type' => 'mega'],
        ['label' => '패키지', 'key' => 'package', 'type' => 'mega'],
        ['label' => '테마 골프', 'key' => 'theme', 'url' => '/pages/product/pr-list'],
        ['label' => '특가', 'key' => 'special', 'url' => '/pages/special/list'],
        ['label' => '기획전', 'key' => 'event', 'url' => '/pages/product/pr-list'],
    ],

    'teetime' => [
        'promo' => [
            'title' => 'Best Event',
            'desc' => '지금 주목해야 할 특별한 이벤트',
            'image' => 'https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'url' => '/pages/product/pr-list',
        ],
        'categories' => [
            'asia' => '아시아',
            'europe' => '유럽',
            'africa' => '아프리카',
            'south-america' => '남아메리카',
            'north-america' => '북아메리카',
            'oceania' => '대양주',
        ],
        'countries' => [
            'asia' => [
                ['label' => '일본', 'url' => '/pages/product/pr-list?country=' . urlencode('일본')],
                ['label' => '대한민국', 'url' => '/pages/product/pr-list?country=' . urlencode('대한민국')],
                ['label' => '태국', 'url' => '/pages/product/pr-list?country=' . urlencode('태국')],
                ['label' => '중국', 'url' => '/pages/product/pr-list?country=' . urlencode('중국')],
                ['label' => '말레이시아', 'url' => '/pages/product/pr-list?country=' . urlencode('말레이시아')],
                ['label' => '인도', 'url' => '/pages/product/pr-list?country=' . urlencode('인도')],
                ['label' => '인도네시아', 'url' => '/pages/product/pr-list?country=' . urlencode('인도네시아')],
                ['label' => '베트남', 'url' => '/pages/product/pr-list?country=' . urlencode('베트남')],
                ['label' => '필리핀', 'url' => '/pages/product/pr-list?country=' . urlencode('필리핀')],
                ['label' => '대만', 'url' => '/pages/product/pr-list?country=' . urlencode('대만')],
            ],
            'europe' => [
                ['label' => '영국', 'url' => '/pages/product/pr-list?country=' . urlencode('영국')],
                ['label' => '스페인', 'url' => '/pages/product/pr-list?country=' . urlencode('스페인')],
                ['label' => '포르투갈', 'url' => '/pages/product/pr-list?country=' . urlencode('포르투갈')],
            ],
            'africa' => [
                ['label' => '남아프리카공화국', 'url' => '/pages/product/pr-list?country=' . urlencode('남아프리카공화국')],
                ['label' => '모로코', 'url' => '/pages/product/pr-list?country=' . urlencode('모로코')],
            ],
            'south-america' => [
                ['label' => '브라질', 'url' => '/pages/product/pr-list?country=' . urlencode('브라질')],
                ['label' => '아르헨티나', 'url' => '/pages/product/pr-list?country=' . urlencode('아르헨티나')],
            ],
            'north-america' => [
                ['label' => '미국', 'url' => '/pages/product/pr-list?country=' . urlencode('미국')],
                ['label' => '캐나다', 'url' => '/pages/product/pr-list?country=' . urlencode('캐나다')],
            ],
            'oceania' => [
                ['label' => '호주', 'url' => '/pages/product/pr-list?country=' . urlencode('호주')],
                ['label' => '뉴질랜드', 'url' => '/pages/product/pr-list?country=' . urlencode('뉴질랜드')],
            ],
        ],
    ],

    'package' => [
        'categories' => [
            'asia' => '아시아',
            'europe' => '유럽',
            'africa' => '아프리카',
            'north-america' => '북아메리카',
            'oceania' => '대양주',
        ],
        'countries' => [
            'asia' => [
                ['label' => '대한민국', 'url' => '/pages/product/pr-list?country=' . urlencode('대한민국')],
                ['label' => '일본', 'url' => '/pages/product/pr-list?country=' . urlencode('일본')],
                ['label' => '태국', 'url' => '/pages/product/pr-list?country=' . urlencode('태국')],
                ['label' => '중국', 'url' => '/pages/product/pr-list?country=' . urlencode('중국')],
                ['label' => '베트남', 'url' => '/pages/product/pr-list?country=' . urlencode('베트남')],
                ['label' => '필리핀', 'url' => '/pages/product/pr-list?country=' . urlencode('필리핀')],
            ],
            'europe' => [
                ['label' => '영국', 'url' => '/pages/product/pr-list?country=' . urlencode('영국')],
                ['label' => '스페인', 'url' => '/pages/product/pr-list?country=' . urlencode('스페인')],
            ],
            'africa' => [
                ['label' => '남아프리카공화국', 'url' => '/pages/product/pr-list?country=' . urlencode('남아프리카공화국')],
            ],
            'north-america' => [
                ['label' => '미국', 'url' => '/pages/product/pr-list?country=' . urlencode('미국')],
                ['label' => '캐나다', 'url' => '/pages/product/pr-list?country=' . urlencode('캐나다')],
            ],
            'oceania' => [
                ['label' => '호주', 'url' => '/pages/product/pr-list?country=' . urlencode('호주')],
                ['label' => '뉴질랜드', 'url' => '/pages/product/pr-list?country=' . urlencode('뉴질랜드')],
            ],
        ],
    ],

    'all_menu_links' => [
        [
            'title' => '테마 골프',
            'links' => [
                ['label' => '테마 골프', 'url' => '/pages/product/pr-list'],
            ],
        ],
        [
            'title' => '특가',
            'links' => [
                ['label' => '특가', 'url' => '/pages/special/list'],
            ],
        ],
        [
            'title' => '기획전',
            'links' => [
                ['label' => '기획전', 'url' => '/pages/product/pr-list'],
            ],
        ],
        [
            'title' => '마이페이지',
            'links' => [
                ['label' => '나의여행', 'url' => '/pages/mypage/travel'],
                ['label' => '내 정보', 'url' => '/pages/mypage/profile'],
                ['label' => '보유쿠폰', 'url' => '/pages/mypage/coupons'],
                ['label' => '마일리지', 'url' => '/pages/mypage/mileage'],
                ['label' => '알림설정', 'url' => '/pages/mypage/notifications'],
            ],
        ],
        [
            'title' => '고객문의',
            'links' => [
                ['label' => '1:1문의', 'url' => '/pages/support/inquiry'],
                ['label' => 'FAQ', 'url' => '/pages/support/faq'],
                ['label' => '공지사항', 'url' => '/pages/support/notice'],
            ],
        ],
    ],
];