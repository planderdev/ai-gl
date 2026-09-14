document.addEventListener("DOMContentLoaded", function () {
    const sliders = document.querySelectorAll(".season-picks-slider.swiper");
  
    sliders.forEach((slider) => {
      const section = slider.closest(".season-picks-section");
      const paginationEl = section.querySelector(".season-picks-pagination");
  
      new Swiper(slider, {
        slidesPerView: "auto",
        spaceBetween: 18,
        speed: 700,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        pagination: {
          el: paginationEl,
          clickable: true,
        },
        breakpoints: {
          0: {
            spaceBetween: 14,
          },
          768: {
            spaceBetween: 18,
          },
          1200: {
            spaceBetween: 20,
          },
        },
      });
    });
  });