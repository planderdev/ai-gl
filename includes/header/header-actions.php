<div class="header-user js-user-menu">
    
    <button type="button" class="currency-btn">
        <img src="https://flagcdn.com/w20/kr.png" alt="KR">
        <span>KRW</span>
    </button>
 
    <div class="header-user__mypage">
        <button
            type="button"
            class="header-icon-link js-user-menu-trigger"
            aria-label="마이페이지"
            aria-expanded="false"
            aria-controls="headerUserMenuSheet"
        >
            <span class="material-symbols-rounded">person</span>
        </button>

        <div class="header-user-dropdown-dim js-user-menu-dim"></div>

        <div
            class="header-user-dropdown js-user-menu-dropdown"
            id="headerUserMenuSheet"
        >
            <div class="header-user-dropdown__mobile-handle" aria-hidden="true">
                <span></span>
            </div>

            <div class="header-user-dropdown__head">
                <strong>캐디스님</strong>
                <p>Cadys Premium</p>
            </div>

            <div class="header-user-dropdown__summary">
                <div>
                    <span>쿠폰</span>
                    <strong>3장</strong>
                </div>
                <div>
                    <span>마일리지</span>
                    <strong>18,000P</strong>
                </div>
            </div>

            <div class="header-user-dropdown__menu">
                <a href="/pages/mypage/index.php">마이페이지</a>
                <a href="/pages/mypage/travel.php">나의여행</a>
                <a href="/pages/mypage/coupons.php">보유쿠폰</a>
                <a href="/pages/mypage/mileage.php">마일리지</a>
                <a href="/pages/mypage/notifications.php">알림설정</a>
            </div>

            <div class="header-user-dropdown__footer">
                <a href="/logout.php">로그아웃</a>
            </div>
        </div>
    </div>

    <button type="button" class="header-icon-link all-menu-btn" id="allMenuOpen" aria-label="전체 메뉴 보기">
        <span class="material-symbols-rounded">menu</span>
    </button>

</div>