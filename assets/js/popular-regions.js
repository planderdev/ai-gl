document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".popular-region-section");
  
    sections.forEach((section) => {
      const buttons = section.querySelectorAll(".popular-region-item");
      const panels = section.querySelectorAll(".popular-region-panel");
      const thumbGroups = section.querySelectorAll(".popular-region-mini-grid");
      const swiperMap = new Map();
  
      function initSwiper(panel) {
        if (swiperMap.has(panel)) return swiperMap.get(panel);
  
        const sliderEl = panel.querySelector(".popular-region-slider.swiper");
        const paginationEl = panel.querySelector(".popular-region-pagination");
        const prevEl = panel.querySelector(".popular-region-prev");
        const nextEl = panel.querySelector(".popular-region-next");
  
        if (!sliderEl) return null;
  
        const swiper = new Swiper(sliderEl, {
          slidesPerView: "auto",
          spaceBetween: 20,
          speed: 700,
          grabCursor: true,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          resistanceRatio: 0.85,
          navigation: {
            prevEl,
            nextEl,
          },
          pagination: {
            el: paginationEl,
            clickable: true,
          },
          breakpoints: {
            0: { spaceBetween: 14 },
            768: { spaceBetween: 18 },
            1200: { spaceBetween: 20 },
          },
        });
  
        swiperMap.set(panel, swiper);
        return swiper;
      }
  
      function activateRegion(regionId) {
        buttons.forEach((btn) => btn.classList.remove("active"));
        panels.forEach((panel) => panel.classList.remove("active"));
        thumbGroups.forEach((group) => group.classList.remove("active"));
  
        const activeButton = section.querySelector(`[data-region-id="${regionId}"]`);
        const activePanel = section.querySelector(`[data-region-panel="${regionId}"]`);
        const activeThumb = section.querySelector(`[data-thumb-group="${regionId}"]`);
  
        if (activeButton) activeButton.classList.add("active");
        if (activeThumb) activeThumb.classList.add("active");
  
        if (activePanel) {
          activePanel.classList.add("active");
  
          const swiper = initSwiper(activePanel);
          if (swiper) {
            requestAnimationFrame(() => {
              swiper.update();
              swiper.slideTo(0, 0);
            });
          }
        }
      }
  
      const firstPanel = section.querySelector(".popular-region-panel.active");
      if (firstPanel) {
        const swiper = initSwiper(firstPanel);
        if (swiper) {
          requestAnimationFrame(() => swiper.update());
        }
      }
  
      buttons.forEach((button) => {
        button.addEventListener("click", function () {
          activateRegion(this.dataset.regionId);
        });
      });
  
      window.addEventListener("resize", function () {
        swiperMap.forEach((swiper) => swiper.update());
      });
    });
  });