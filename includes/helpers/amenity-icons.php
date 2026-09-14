<?php 

function getAmenityIcon($name) {
    switch ($name) {
        case '클럽하우스':
            return '<span class="material-symbols-rounded">apartment</span>';

        case '연회장':
            return '<span class="material-symbols-rounded">groups</span>';

        case '퍼팅 연습장':
            return '<span class="material-symbols-rounded">sports_golf</span>';

        case '프로샵':
            return '<span class="material-symbols-rounded">storefront</span>';

        case '레스토랑':
            return '<span class="material-symbols-rounded">restaurant</span>';

        case '탈의실':
            return '<span class="material-symbols-rounded">door_open</span>';

        case '락카':
            return '<span class="material-symbols-rounded">lock</span>';

        case '샤워실':
            return '<span class="material-symbols-rounded">shower</span>';

        case '사우나':
            return '<span class="material-symbols-rounded">whatshot</span>';

        case '주차장':
            return '<span class="material-symbols-rounded">local_parking</span>';

        case '와이파이':
            return '<span class="material-symbols-rounded">wifi</span>';

        case '픽업서비스':
            return '<span class="material-symbols-rounded">directions_car</span>';

        default:
            return '<span class="material-symbols-rounded">check_circle</span>';
    }
}
?>