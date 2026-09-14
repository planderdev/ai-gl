document.addEventListener("DOMContentLoaded", function () {
    const sliders = document.querySelectorAll(".bucket-list-slider.swiper");
  
    sliders.forEach((slider) => {
      const section = slider.closest(".bucket-list-section");
      const prevEl = section.querySelector(".bucket-list-prev");
      const nextEl = section.querySelector(".bucket-list-next");
      const paginationEl = section.querySelector(".bucket-list-pagination");
  
      new Swiper(slider, {
        slidesPerView: "auto",
        spaceBetween: 16,
        slidesOffsetBefore: 16, // 👈 왼쪽 여백
  slidesOffsetAfter: 16,  // 👈 오른쪽도 맞추면 UX 더 좋음
        speed: 700,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        navigation: {
          prevEl: prevEl,
          nextEl: nextEl,
        },
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