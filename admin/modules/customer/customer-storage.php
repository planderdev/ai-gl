<?php

if (!function_exists('admin_customer_data_path')) {
    function admin_customer_data_path(): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . '/admin/data/customers.json';
    }
}

if (!function_exists('admin_get_customers')) {
    function admin_get_customers(): array
    {
        $path = admin_customer_data_path();

        if (!is_file($path)) {
            return [];
        }

        $json = file_get_contents($path);
        $data = json_decode($json, true);

        return is_array($data) ? $data : [];
    }
}

if (!function_exists('admin_get_customer_by_id')) {
    function admin_get_customer_by_id($id): ?array
    {
        foreach (admin_get_customers() as $customer) {
            if ((string) ($customer['id'] ?? '') === (string) $id) {
                return $customer;
            }
        }

        return null;
    }
}

if (!function_exists('admin_customer_grade_label')) {
    function admin_customer_grade_label(string $grade): string
    {
        return match ($grade) {
            'vip' => 'VIP',
            'gold' => 'Gold',
            'silver' => 'Silver',
            'bronze' => 'Bronze',
            default => '일반',
        };
    }
}

if (!function_exists('admin_customer_grade_class')) {
    function admin_customer_grade_class(string $grade): string
    {
        return match ($grade) {
            'vip' => 'admin-chip admin-chip--danger',
            'gold' => 'admin-chip admin-chip--warning',
            'silver' => 'admin-chip',
            'bronze' => 'admin-chip admin-chip--gray',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_customer_status_label')) {
    function admin_customer_status_label(string $status): string
    {
        return match ($status) {
            'active' => '활성',
            'inactive' => '휴면',
            'lead' => '리드',
            default => '미정',
        };
    }
}

if (!function_exists('admin_customer_status_class')) {
    function admin_customer_status_class(string $status): string
    {
        return match ($status) {
            'active' => 'admin-chip admin-chip--success',
            'inactive' => 'admin-chip admin-chip--gray',
            'lead' => 'admin-chip',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_customer_segment_label')) {
    function admin_customer_segment_label(string $segment): string
    {
        return match ($segment) {
            'high_value' => '고가치',
            'loyal' => '충성 고객',
            'new' => '신규',
            'risk' => '이탈 위험',
            default => '기타',
        };
    }
}

if (!function_exists('admin_customer_segment_class')) {
    function admin_customer_segment_class(string $segment): string
    {
        return match ($segment) {
            'high_value' => 'admin-chip admin-chip--danger',
            'loyal' => 'admin-chip admin-chip--success',
            'new' => 'admin-chip',
            'risk' => 'admin-chip admin-chip--warning',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_booking_item_status_label')) {
    function admin_booking_item_status_label(string $status): string
    {
        return match ($status) {
            'confirmed' => '예약확정',
            'paid' => '결제완료',
            'cancelled' => '취소',
            default => '상태확인',
        };
    }
}

if (!function_exists('admin_booking_item_status_class')) {
    function admin_booking_item_status_class(string $status): string
    {
        return match ($status) {
            'confirmed' => 'admin-chip admin-chip--success',
            'paid' => 'admin-chip',
            'cancelled' => 'admin-chip admin-chip--danger',
            default => 'admin-chip admin-chip--gray',
        };
    }
}

if (!function_exists('admin_customer_grade_options')) {
    function admin_customer_grade_options(): array
    {
        return [
            'vip' => 'VIP',
            'gold' => 'Gold',
            'silver' => 'Silver',
            'bronze' => 'Bronze',
        ];
    }
}

if (!function_exists('admin_customer_segment_options')) {
    function admin_customer_segment_options(): array
    {
        return [
            'high_value' => '고가치',
            'loyal' => '충성 고객',
            'new' => '신규',
            'risk' => '이탈 위험',
        ];
    }
}

if (!function_exists('admin_customer_segment_summary')) {
    function admin_customer_segment_summary(array $customers): array
    {
        $base = [
            'high_value' => [
                'key' => 'high_value',
                'label' => '고가치 고객',
                'desc' => '누적 결제액과 객단가가 높은 핵심 고객군',
                'icon' => 'ri-vip-crown-line',
                'count' => 0,
            ],
            'loyal' => [
                'key' => 'loyal',
                'label' => '충성 고객',
                'desc' => '재예약 빈도가 높고 이탈 위험이 낮은 고객군',
                'icon' => 'ri-heart-3-line',
                'count' => 0,
            ],
            'new' => [
                'key' => 'new',
                'label' => '신규 고객',
                'desc' => '첫 예약 이후 1~2회 이내의 온보딩 대상',
                'icon' => 'ri-user-add-line',
                'count' => 0,
            ],
            'risk' => [
                'key' => 'risk',
                'label' => '이탈 위험',
                'desc' => '최근 예약 공백이 길어 재활성화가 필요한 고객군',
                'icon' => 'ri-alarm-warning-line',
                'count' => 0,
            ],
        ];

        foreach ($customers as $customer) {
            $segment = (string) ($customer['segment'] ?? '');
            if (isset($base[$segment])) {
                $base[$segment]['count']++;
            }
        }

        return array_values($base);
    }
}

if (!function_exists('admin_customer_consult_logs')) {
    function admin_customer_consult_logs(array $customer): array
    {
        $name = (string) ($customer['name'] ?? '고객');
        $segment = (string) ($customer['segment'] ?? '');
        $marketing = !empty($customer['marketing']);
        $lastProduct = (string) ($customer['last_product'] ?? '최근 상품');

        $logs = [
            [
                'date' => '2026-03-28 14:10',
                'channel' => '전화',
                'manager' => '김지현',
                'type' => '예약상담',
                'summary' => $name . ' 고객이 ' . $lastProduct . ' 일정 변경 가능 여부를 문의했습니다.',
                'next_action' => '대체 일정 2안 문자 발송',
                'status' => 'done',
            ],
            [
                'date' => '2026-03-19 11:35',
                'channel' => '카카오톡',
                'manager' => '박수민',
                'type' => '견적안내',
                'summary' => '2인/4인 플레이 기준 견적표와 포함사항을 전달했습니다.',
                'next_action' => '응답 대기',
                'status' => 'pending',
            ],
        ];

        if ($segment === 'risk') {
            $logs[] = [
                'date' => '2026-02-14 16:40',
                'channel' => '문자',
                'manager' => 'CRM 자동화',
                'type' => '이탈방지',
                'summary' => '장기 미예약 고객 대상 리마인드 메시지를 발송했습니다.',
                'next_action' => '7일 후 반응 여부 체크',
                'status' => 'warning',
            ];
        }

        if ($marketing) {
            $logs[] = [
                'date' => '2026-01-22 10:00',
                'channel' => '이메일',
                'manager' => '마케팅팀',
                'type' => '캠페인',
                'summary' => '봄 시즌 특가 패키지 뉴스레터를 발송했습니다.',
                'next_action' => '클릭/전환 성과 확인',
                'status' => 'done',
            ];
        }

        usort($logs, fn($a, $b) => strcmp((string) $b['date'], (string) $a['date']));
        return $logs;
    }
}

if (!function_exists('admin_customer_campaign_history')) {
    function admin_customer_campaign_history(array $customer): array
    {
        $marketing = !empty($customer['marketing']);
        $segment = (string) ($customer['segment'] ?? '');

        $items = [
            [
                'date' => '2026-03-10',
                'title' => '봄 특가 패키지 안내',
                'channel' => '카카오 알림톡',
                'audience' => '세그먼트 타깃',
                'result' => $marketing ? '발송 완료' : '발송 제외',
                'result_class' => $marketing ? 'admin-chip admin-chip--success' : 'admin-chip admin-chip--gray',
            ],
            [
                'date' => '2026-02-03',
                'title' => '재예약 유도 쿠폰',
                'channel' => '문자',
                'audience' => '재방문 고객',
                'result' => ($segment === 'risk') ? '우선 발송' : '일반 발송',
                'result_class' => ($segment === 'risk') ? 'admin-chip admin-chip--warning' : 'admin-chip',
            ],
            [
                'date' => '2026-01-15',
                'title' => '신년 프로모션',
                'channel' => '이메일',
                'audience' => '전체 수신 동의자',
                'result' => $marketing ? '오픈 추적 중' : '미대상',
                'result_class' => $marketing ? 'admin-chip' : 'admin-chip admin-chip--gray',
            ],
        ];

        return $items;
    }
}

if (!function_exists('admin_customer_recommended_coupon')) {
    function admin_customer_recommended_coupon(array $customer): array
    {
        $segment = (string) ($customer['segment'] ?? '');
        $grade = (string) ($customer['grade'] ?? '');

        if ($segment === 'risk') {
            return [
                'title' => '재활성화 7% 쿠폰',
                'desc' => '최근 미예약 고객 대상. 유효기간 14일 권장',
                'badge' => '리텐션',
            ];
        }

        if ($grade === 'vip' || $grade === 'gold') {
            return [
                'title' => '프리미엄 업그레이드 혜택',
                'desc' => '객단가 상승 유도를 위한 상위 상품 전환형 제안',
                'badge' => '업셀',
            ];
        }

        return [
            'title' => '첫 재예약 5만원 할인',
            'desc' => '신규/일반 고객의 두 번째 예약 전환용',
            'badge' => '리오더',
        ];
    }
}

if (!function_exists('admin_customer_status_options')) {
    function admin_customer_status_options(): array
    {
        return [
            'active' => '활성',
            'inactive' => '휴면',
            'lead' => '리드',
        ];
    }
}

if (!function_exists('admin_save_customers')) {
    function admin_save_customers(array $customers): bool
    {
        $json = json_encode(array_values($customers), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents(admin_customer_data_path(), $json) !== false;
    }
}

if (!function_exists('admin_next_customer_id')) {
    function admin_next_customer_id(array $customers): int
    {
        $max = 1000;

        foreach ($customers as $customer) {
            $id = (int) ($customer['id'] ?? 0);
            if ($id > $max) {
                $max = $id;
            }
        }

        return $max + 1;
    }
}
