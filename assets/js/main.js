document.addEventListener('DOMContentLoaded', function () {
    if (typeof initBookingUI === 'function') {
      initBookingUI();
    }
  
    if (typeof initHeroSlider === 'function') {
      initHeroSlider();
    }
  
    if (typeof initHeaderUI === 'function') {
      initHeaderUI();
    }
  });