document.addEventListener("DOMContentLoaded", () => {
    const heroSearchBtn = document.getElementById("heroSearchBtn");
    const destinationInput = document.getElementById("destinationInput");
    const timeButtons = document.querySelectorAll(".tb-time-chip");
  
    if (heroSearchBtn) {
      heroSearchBtn.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("tb:search"));
      });
    }
  
    if (destinationInput) {
      destinationInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          document.dispatchEvent(new CustomEvent("tb:search"));
        }
      });
    }
  
    timeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest(".tb-card__times");
        if (!group) return;
  
        group.querySelectorAll(".tb-time-chip").forEach((item) => {
          item.classList.remove("is-active");
        });
  
        button.classList.add("is-active");
      });
    });
  
    if (typeof Swiper !== "undefined" && document.querySelector(".tb-best-product-slider")) {
        new Swiper(".tb-best-product-slider", {
          slidesPerView: 1,
          spaceBetween: 16,
          loop: true,
          navigation: {
            nextEl: ".tb-best-product__next",
            prevEl: ".tb-best-product__prev",
          },
          pagination: {
            el: ".tb-best-product__pagination",
            clickable: true,
          },
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
          },
        });
      }
  });