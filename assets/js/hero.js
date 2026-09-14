function initHeroSlider() {
    const heroSliderEl = document.getElementById('heroSlider');
  
    if (!heroSliderEl || typeof Swiper === 'undefined') return;
  
    const resetHeroMotion = (swiper) => {
      swiper.slides.forEach((slide) => {
        slide.classList.remove('is-animated');
      });
    };
  
    const updateHeroMotion = (swiper) => {
      const activeSlide = swiper.slides[swiper.activeIndex];
      if (activeSlide) {
        activeSlide.classList.add('is-animated');
      }
    };
  
    new Swiper(heroSliderEl, {
      loop: true,
      speed: 1200,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.hero-next',
        prevEl: '.hero-prev',
      },
      pagination: {
        el: '.hero-pagination',
        clickable: true,
      },
      on: {
        init(swiper) {
          updateHeroMotion(swiper);
        },
        slideChangeTransitionStart(swiper) {
          resetHeroMotion(swiper);
          updateHeroMotion(swiper);
        },
      },
    });
  }