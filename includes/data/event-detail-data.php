<?php
if (!function_exists('geteventDetailData')) {
    function geteventDetailData($id = 1)
    {
        $items = [
            1 => [
                'page_title' => '프리미엄 제주 골프 컬렉션',
                'page_description' => '제주 프리미엄 골프 프로모션 상세',
                'page_url' => 'https://ai-gl.ai/pages/event/detail.php?id=1',
                'breadcrumbs' => ['홈', '프로모션', '프리미엄 제주 골프 컬렉션'],

                'hero' => [
                    'category' => '골프 프로모션',
                    'title' => '프리미엄 제주 골프 컬렉션',
                    'description' => '바다와 오름, 리조트와 라운드를 함께 즐길 수 있는 제주 시즌 한정 프로모션입니다.',
                    'gallery' => [
                        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200', // 골프장 전경
                        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200', // 자연 경관
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200', // 호텔 외관
                        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200', // 리조트 창밖 풍경
                    ],
                ],

                'summary' => [
                    'status' => '진행중',
                    'badge' => 'PREMIUM',
                    'period' => '2026-03-25 - 2026-06-30',
                    'region' => '제주',
                    'target' => '골프 여행 / 커플 / 가족 / 소규모 모임',
                    'reservation' => '온라인 문의 및 상담 예약 가능',
                    'highlights' => ['호텔 연계', '조식 포함', '공항 접근성', '인기 코스'],
                    'primary_cta' => [
                        'label' => '프로모션 예약하기',
                        'url' => '/pages/product/pr-list',
                    ],
                    'secondary_cta' => [
                        'label' => '상담문의',
                        'url' => '/pages/contact/inquiry.php',
                    ],
                ],

                'package_overview' => [
                    'image' => 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800',
                    'eyebrow' => '3박 패키지',
                    'title' => '라구나랑코 GC 54홀 & 럭셔리 골프리조트 3박',
                    'discount' => '13%',
                    'price' => '₩ 761,500 ~',
                    'items' => [
                        [
                            'label' => '골프',
                            'lines' => [
                                '라구나랑코 3회 라운드, 캐디피 포함',
                                '리조트 내 골프장 이동 시 셔틀 제공',
                            ],
                        ],
                        [
                            'label' => '숙박',
                            'lines' => [
                                '리조트 3박',
                                '객실 타입은 일정과 인원에 따라 선택 가능',
                            ],
                        ],
                        [
                            'label' => '식사',
                            'lines' => [
                                '조식 포함',
                                '일정에 따라 석식 옵션 추가 가능',
                            ],
                        ],
                        [
                            'label' => '송영',
                            'lines' => [
                                '공항 ↔ 리조트 왕복 차량 포함',
                            ],
                        ],
                        [
                            'label' => '특전',
                            'lines' => [
                                '리조트 부대시설 이용 혜택',
                                '상담 후 맞춤 일정 조정 가능',
                            ],
                        ],
                    ],
                    'cta' => [
                        'label' => '예약하러 가기',
                        'url' => '/pages/contact/inquiry.php',
                    ],
                ],

                'content' => [
                    'tabs' => [
                        'overview' => [
                            'title' => '프로모션 소개',
                            'content' => [
                                '이번 프로모션은 인기 골프장과 숙박을 함께 묶어 보다 편하게 예약할 수 있도록 구성한 시즌 한정 상품입니다.',
                                '골프 일정만 따로 잡아야 하는 번거로움을 줄이고, 이동 동선과 숙소 만족도까지 함께 고려한 구성이라 처음 이용하는 고객도 부담 없이 선택하기 좋습니다.',
                            ],
                            'cards' => [
                                [
                                    'title' => '이런 분께 추천',
                                    'items' => [
                                        '숙소와 라운드를 한 번에 예약하고 싶은 분',
                                        '해외 또는 제주 골프 여행을 안정적으로 준비하고 싶은 분',
                                        '전체 일정의 완성도를 중요하게 보는 분',
                                    ],
                                ],
                                [
                                    'title' => '핵심 포인트',
                                    'items' => [
                                        '인기 코스 중심 구성',
                                        '숙소 연계로 이동 스트레스 감소',
                                        '상담을 통해 일정과 인원에 맞는 조정 가능',
                                    ],
                                ],
                                [
                                    'title' => '예약 전 체크',
                                    'items' => [
                                        '출발일에 따라 객실 및 티타임 가능 여부가 달라질 수 있습니다.',
                                        '주말 및 연휴 구간은 추가 요금이 반영될 수 있습니다.',
                                        '항공은 별도 진행 또는 맞춤 상담으로 연결 가능합니다.',
                                    ],
                                ],
                            ],
                        ],
                        'notice' => [
                            'title' => '유의사항',
                            'groups' => [
                                [
                                    'title' => '예약 안내',
                                    'items' => [
                                        '실시간 가능 여부에 따라 동일 상품이라도 가격이 달라질 수 있습니다.',
                                        '확정 전까지는 예약 요청 상태로 접수됩니다.',
                                        '단체 일정은 별도 상담 후 최종 확정됩니다.',
                                    ],
                                ],
                                [
                                    'title' => '변경 / 취소',
                                    'items' => [
                                        '출발일 임박 시 변경 및 취소 수수료가 발생할 수 있습니다.',
                                        '골프장과 숙소 정책이 각각 다를 수 있습니다.',
                                        '정확한 규정은 예약 시점 기준으로 안내됩니다.',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                'golf_section' => [
                    'title' => '라구나랑코 골프 클럽',
                    'description' => [
                        '해안선을 따라 조성된 코스로 자연 경관과 라운드 만족도를 함께 챙길 수 있는 대표 코스입니다.',
                        '전장과 코스 배치가 안정적이어서 초중급자부터 상급자까지 폭넓게 즐기기 좋습니다.',
                    ],
                    'side_image' => 'https://images.unsplash.com/photo-1500932334442-8761ee4810a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29sZnxlbnwwfHwwfHx8MA%3D%3D',
                    'main_image' => 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000',
                    'specs' => [
                        ['label' => '코스', 'value' => '18홀 / PAR 71'],
                        ['label' => '길이', 'value' => '6,900야드'],
                    ],
                ],

                'resort_section' => [
                    'title' => '앙사나 리조트',
                    'description' => [
                        '휴양과 골프를 함께 누릴 수 있는 리조트형 숙소입니다.',
                        '객실 컨디션, 조경, 수영장, 부대시설 밸런스가 좋아 커플과 가족 단위 고객 모두 만족도가 높은 편입니다.',
                    ],
                    'image' => 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1000',
                    'specs' => [
                        ['label' => '객실 타입', 'value' => '가든뷰 / 씨뷰 / 풀스위트 등'],
                        ['label' => '부대시설', 'value' => '수영장, 레스토랑, 스파, 피트니스'],
                        ['label' => '체크인/아웃', 'value' => '15:00 / 12:00'],
                    ],
                ],

                'room_guide' => [
                    'title' => '#룸 타입 안내',
                    'items' => [
                        [
                            'image' => 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600',
                            'title' => 'Garden Balcony',
                            'description' => '가든뷰 중심의 기본 객실 타입으로 편안한 휴식에 적합한 객실입니다.',
                        ],
                        [
                            'image' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600',
                            'title' => 'Seaview Junior Pool Suite',
                            'description' => '오션뷰와 프라이빗한 무드를 함께 즐길 수 있는 인기 객실입니다.',
                        ],
                        [
                            'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aG90ZWx8ZW58MHx8MHx8fDA%3D',
                            'title' => 'Seaview Skypool Two-bedroom',
                            'description' => '넓은 공간과 전망이 강점인 상위 객실로 가족 및 소규모 팀에 적합합니다.',
                        ],
                    ],
                ],

                'dining_guide' => [
                    'title' => '#식사 안내',
                    'items' => [
                        [
                            'image' => 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=600',
                            'title' => '조식',
                            'description' => '리조트 뷔페 레스토랑에서 제공되며 일정에 따라 운영 시간이 달라질 수 있습니다.',
                        ],
                        [
                            'image' => 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600',
                            'title' => '석식 [옵션 1 - 클럽하우스식]',
                            'description' => '클럽하우스 또는 지정 레스토랑에서 선택 가능한 석식 옵션입니다.',
                        ],
                        [
                            'image' => 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600',
                            'title' => '석식 [옵션 2 - 리조트식]',
                            'description' => '리조트 메인 레스토랑에서 제공되는 디너 코스로 구성 가능합니다.',
                        ],
                    ],
                ],

                'benefits' => [
                    [
                        'icon' => '01',
                        'title' => '인기 코스 중심 구성',
                        'description' => '후기가 좋은 주요 골프장을 중심으로 선택 폭을 넓혔습니다.',
                    ],
                    [
                        'icon' => '02',
                        'title' => '숙박 연계 편의성',
                        'description' => '라운드와 숙소를 함께 맞춰 일정 정리가 훨씬 수월합니다.',
                    ],
                    [
                        'icon' => '03',
                        'title' => '맞춤 상담 가능',
                        'description' => '인원수와 희망 일정에 따라 다른 조합으로도 제안 가능합니다.',
                    ],
                    [
                        'icon' => '04',
                        'title' => '여행 확장성',
                        'description' => '골프 외에도 미식, 휴식, 관광 일정까지 함께 구성하기 좋습니다.',
                    ],
                ],

                'region' => [
                    'title' => '추천 지역 안내',
                    'description' => [
                        '리조트형 숙소와 식음, 관광 인프라가 잘 갖춰져 있어 골프만 치고 끝나는 일정이 아니라 여행 전체 만족도를 높이기 좋습니다.',
                    ],
                    'points' => [
                        '이동 동선이 안정적이라 일정 운용이 편리함',
                        '라운드 후 휴식과 관광 연계가 쉬움',
                        '커플, 가족, 친구 모임 모두 소화 가능한 구성',
                    ],
                    'image' => 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhvdGVsfGVufDB8fDB8fHww',
                ],

                'related_products' => [
                    [
                        'url' => '/pages/event/detail.php?id=1',
                        'image' => 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=600',
                        'location' => '제주',
                        'title' => '제주 프리미엄 라운드 패키지',
                        'meta' => '36홀 · 리조트 연계 · 공항 접근 우수',
                        'tags' => [
                            ['label' => '추천', 'type' => 'green'],
                            ['label' => '인기', 'type' => 'blue'],
                        ],
                        'discount' => '12%',
                        'original_price' => '₩1,590,000',
                        'price' => '₩1,390,000~',
                    ],
                    [
                        'url' => '/pages/event/detail.php?id=2',
                        'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
                        'location' => '제주',
                        'title' => '제주 럭셔리 호캉스 & 라운드',
                        'meta' => '호텔 + 조식 + 라운드 구성',
                        'tags' => [
                            ['label' => '호텔', 'type' => 'purple'],
                        ],
                        'discount' => '10%',
                        'original_price' => '₩1,420,000',
                        'price' => '₩1,280,000~',
                    ],
                ],
            ],
        ];

        return $items[$id] ?? $items[1];
    }
}
?>