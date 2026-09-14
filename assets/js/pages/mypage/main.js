document.addEventListener('DOMContentLoaded', function () {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 40
      });
    }
  
    const profileForm = document.querySelector('.mp-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('회원 정보가 저장되었습니다.');
      });
    }
  
    const notificationSaveButton = document.querySelector('.mp-notification-save');
    if (notificationSaveButton) {
      notificationSaveButton.addEventListener('click', function () {
        alert('알림 설정이 저장되었습니다.');
      });
    }
  
    const noticeCards = document.querySelectorAll('.mp-notice-card.is-new');
    noticeCards.forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.remove('is-new');
  
        const newBadge = card.querySelector('.mp-notice-card__new');
        if (newBadge) {
          newBadge.remove();
        }
      });
    });
  
    function hideEmptyStateWhenContentExists(listSelector, itemSelector, emptySelector) {
      const lists = document.querySelectorAll(listSelector);
      const empty = document.querySelector(emptySelector);
  
      if (!lists.length || !empty) return;
  
      let hasItems = false;
  
      lists.forEach(function (list) {
        if (list.querySelector(itemSelector)) {
          hasItems = true;
        }
      });
  
      if (hasItems) {
        empty.hidden = true;
      } else {
        empty.hidden = false;
      }
    }
  
    hideEmptyStateWhenContentExists('.mp-trip-list', '.mp-trip-card', '.mp-empty--travel');
    hideEmptyStateWhenContentExists('.mp-coupon-list', '.mp-coupon-card', '.mp-empty--coupon');
    hideEmptyStateWhenContentExists('.mp-history-table', '.mp-history-table__row', '.mp-empty--mileage');
    hideEmptyStateWhenContentExists('.mp-toggle-list', '.mp-toggle-item', '.mp-empty--notification');
  
    const activeSidebarLink = document.querySelector('.mp-sidebar__link.is-active');
    if (activeSidebarLink && window.innerWidth <= 1100) {
      requestAnimationFrame(function () {
        activeSidebarLink.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      });
    }
  });