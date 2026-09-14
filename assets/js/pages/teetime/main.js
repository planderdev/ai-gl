document.addEventListener('DOMContentLoaded', function () {
    if (typeof Swiper !== 'undefined') {
      const specialEl = document.querySelector('.tm-special-swiper');
      if (specialEl) {
        new Swiper(specialEl, {
          slidesPerView: 1.15,
          centeredSlides: false,
          initialSlide: 0,
          spaceBetween: 16,
          speed: 700,
          grabCursor: true,
          watchOverflow: true,
          navigation: {
            prevEl: '.tm-special-prev',
            nextEl: '.tm-special-next',
          },
          pagination: {
            el: '.tm-special-pagination',
            clickable: true,
          },
          breakpoints: {
            768: {
              slidesPerView: 2.2,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 4.2,
              spaceBetween: 24,
            },
          },
        });
      }
  
      const bucketEl = document.querySelector('.tm-bucket-swiper');
      if (bucketEl) {
        new Swiper(bucketEl, {
          slidesPerView: 1.15,
          spaceBetween: 16,
          speed: 700,
          grabCursor: true,
          watchOverflow: true,
          navigation: {
            prevEl: '.tm-bucket-prev',
            nextEl: '.tm-bucket-next',
          },
          pagination: {
            el: '.tm-bucket-pagination',
            clickable: true,
          },
          breakpoints: {
            768: {
              slidesPerView: 2.1,
              spaceBetween: 18,
            },
            1200: {
              slidesPerView: 3.15,
              spaceBetween: 20,
            },
          },
        });
      }
    }
  
    const featuredTabs = document.querySelectorAll('[data-tab-target]');
    const featuredPanels = document.querySelectorAll('[data-tab-panel]');
  
    if (featuredTabs.length && featuredPanels.length) {
      featuredTabs.forEach((tab) => {
        tab.addEventListener('click', function () {
          const target = this.getAttribute('data-tab-target');
  
          featuredTabs.forEach((btn) => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
          });
  
          featuredPanels.forEach((panel) => {
            panel.classList.remove('is-active');
          });
  
          this.classList.add('is-active');
          this.setAttribute('aria-selected', 'true');
  
          const activePanel = document.querySelector(`[data-tab-panel="${target}"]`);
          if (activePanel) {
            activePanel.classList.add('is-active');
          }
        });
      });
    }
  });