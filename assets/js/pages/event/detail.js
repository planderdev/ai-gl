console.log('event detail.js loaded');

document.addEventListener('DOMContentLoaded', function () {
    safeRun(initEventStickyAnchorNav);
    safeRun(initEventDetailTabs);
    safeRun(initEventAnchorScroll);
    safeRun(initEventSliders);
  });
  
  function safeRun(fn) {
    try {
      if (typeof fn === 'function') fn();
    } catch (error) {
      console.error('[event detail init error]', error);
    }
  }
  
  function initEventDetailTabs() {
    const wrap = document.querySelector('[data-detail-tabs]');
    if (!wrap) return;
  
    const buttons = Array.from(wrap.querySelectorAll('[data-tab-target]'));
    const panels = Array.from(wrap.querySelectorAll('[data-tab-panel]'));
  
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab-target');
  
        buttons.forEach((btn) => {
          const active = btn === button;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
  
        panels.forEach((panel) => {
          const active = panel.getAttribute('data-tab-panel') === target;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      });
    });
  }
  
  function getEventHeaderOffset() {
    const root = getComputedStyle(document.documentElement);
    const headerHeight = parseInt(root.getPropertyValue('--header-height'), 10);
    const mobileHeaderHeight = parseInt(root.getPropertyValue('--header-height-mobile'), 10);
  
    if (window.innerWidth <= 768 && !Number.isNaN(mobileHeaderHeight)) {
      return mobileHeaderHeight;
    }
  
    return Number.isNaN(headerHeight) ? 88 : headerHeight;
  }
  
  function initEventAnchorScroll() {
    const nav = document.querySelector('.evd-anchor-nav');
    const links = Array.from(document.querySelectorAll('.evd-anchor-nav__link[href^="#"]'));
    if (!nav || !links.length) return;
  
    const sections = links
      .map((link) => {
        const id = link.getAttribute('href');
        const target = id ? document.querySelector(id) : null;
        return target ? { link, target } : null;
      })
      .filter(Boolean);
  
    if (!sections.length) return;
  
    let isClickScrolling = false;
    let clickScrollTimer = null;
  
    function getAnchorOffset() {
      const headerOffset = getEventHeaderOffset();
      const navTop = parseFloat(getComputedStyle(nav).top) || 0;
      return headerOffset + navTop + 16;
    }
  
    function setActiveLink(activeLink) {
      links.forEach((link) => {
        const isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
  
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
  
      if (activeLink) {
        const navRect = nav.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const currentScroll = nav.scrollLeft;
        const delta =
          (linkRect.left - navRect.left) -
          (navRect.width / 2 - linkRect.width / 2);
  
        nav.scrollTo({
          left: currentScroll + delta,
          behavior: 'smooth'
        });
      }
    }
  
    function getCurrentSection() {
      const offset = getAnchorOffset();
      const scrollY = window.scrollY;
      const triggerY = scrollY + offset + 1;
  
      let current = sections[0];
  
      for (const item of sections) {
        if (item.target.offsetTop <= triggerY) {
          current = item;
        } else {
          break;
        }
      }
  
      return current;
    }
  
    function syncActiveLink() {
      if (isClickScrolling) return;
      const current = getCurrentSection();
      if (current) {
        setActiveLink(current.link);
      }
    }
  
    links.forEach((link) => {
      link.addEventListener('click', function (e) {
        const id = link.getAttribute('href');
        const target = id ? document.querySelector(id) : null;
        if (!target) return;
  
        e.preventDefault();
  
        const y = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
  
        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
  
        setActiveLink(link);
  
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
  
        clickScrollTimer = window.setTimeout(() => {
          isClickScrolling = false;
          syncActiveLink();
        }, 500);
      });
    });
  
    let ticking = false;
  
    function onScroll() {
      if (ticking) return;
      ticking = true;
  
      window.requestAnimationFrame(() => {
        syncActiveLink();
        ticking = false;
      });
    }
  
    syncActiveLink();
  
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncActiveLink);
  }
  
  function initEventSliders() {
    const sliders = document.querySelectorAll('[data-slider]');
  
    sliders.forEach((slider) => {
      const track = slider.querySelector('[data-slider-track]');
      const prevBtn = slider.querySelector('[data-slider-prev]');
      const nextBtn = slider.querySelector('[data-slider-next]');
      const dotsWrap = slider.querySelector('[data-slider-dots]');
      const slides = Array.from(track ? track.children : []);
  
      if (!track || slides.length <= 1) {
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        return;
      }
  
      let currentIndex = 0;
      let isDown = false;
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startScrollLeft = 0;
      let dragDistance = 0;
  
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach((_, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'slider-dot' + (index === 0 ? ' is-active' : '');
          dot.addEventListener('click', () => goTo(index));
          dotsWrap.appendChild(dot);
        });
      }
  
      function getSlideWidth() {
        const first = slides[0];
        if (!first) return 0;
  
        const rect = first.getBoundingClientRect();
        const style = window.getComputedStyle(first);
        const marginRight = parseFloat(style.marginRight || '0');
  
        return rect.width + marginRight;
      }
  
      function clampIndex(index) {
        return Math.max(0, Math.min(index, slides.length - 1));
      }
  
      function updateDots(index) {
        if (!dotsWrap) return;
        Array.from(dotsWrap.children).forEach((dot, dotIndex) => {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
  
      function goTo(index, behavior = 'smooth') {
        const slideWidth = getSlideWidth();
        if (!slideWidth) return;
  
        currentIndex = clampIndex(index);
        track.scrollTo({
          left: slideWidth * currentIndex,
          behavior
        });
        updateDots(currentIndex);
      }
  
      function syncIndex() {
        const slideWidth = getSlideWidth();
        if (!slideWidth) return;
  
        const nextIndex = clampIndex(Math.round(track.scrollLeft / slideWidth));
        if (nextIndex !== currentIndex) {
          currentIndex = nextIndex;
          updateDots(currentIndex);
        }
      }
  
      function snapToNearest() {
        const slideWidth = getSlideWidth();
        if (!slideWidth) return;
  
        const moved = track.scrollLeft - startScrollLeft;
        const threshold = slideWidth * 0.16;
  
        let nextIndex = currentIndex;
  
        if (moved > threshold) {
          nextIndex = currentIndex + 1;
        } else if (moved < -threshold) {
          nextIndex = currentIndex - 1;
        }
  
        goTo(clampIndex(nextIndex), 'smooth');
      }
  
      function beginDrag(clientX, clientY) {
        isDown = true;
        isDragging = false;
        dragDistance = 0;
        startX = clientX;
        startY = clientY;
        startScrollLeft = track.scrollLeft;
  
        const slideWidth = getSlideWidth();
        currentIndex = slideWidth ? clampIndex(Math.round(track.scrollLeft / slideWidth)) : 0;
  
        track.classList.add('is-dragging');
      }
  
      function moveDrag(clientX, clientY) {
        if (!isDown) return false;
  
        const diffX = clientX - startX;
        const diffY = clientY - startY;
  
        if (!isDragging) {
          if (Math.abs(diffX) > 6 && Math.abs(diffX) > Math.abs(diffY)) {
            isDragging = true;
          } else if (Math.abs(diffY) > Math.abs(diffX)) {
            return false;
          }
        }
  
        if (!isDragging) return false;
  
        dragDistance = Math.abs(diffX);
        track.scrollLeft = startScrollLeft - diffX;
        return true;
      }
  
      function endDrag() {
        if (!isDown) return;
  
        isDown = false;
        track.classList.remove('is-dragging');
  
        if (isDragging) {
          snapToNearest();
        }
  
        requestAnimationFrame(() => {
          isDragging = false;
        });
      }
  
      prevBtn?.addEventListener('click', () => {
        goTo(currentIndex - 1);
      });
  
      nextBtn?.addEventListener('click', () => {
        goTo(currentIndex + 1);
      });
  
      track.addEventListener('scroll', syncIndex);
  
      track.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        beginDrag(e.clientX, e.clientY);
      });
  
      window.addEventListener('mousemove', (e) => {
        const moved = moveDrag(e.clientX, e.clientY);
        if (moved) {
          e.preventDefault();
        }
      });
  
      window.addEventListener('mouseup', endDrag);
      track.addEventListener('mouseleave', endDrag);
  
      track.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (!touch) return;
        beginDrag(touch.clientX, touch.clientY);
      }, { passive: true });
  
      track.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (!touch) return;
  
        const moved = moveDrag(touch.clientX, touch.clientY);
        if (moved) {
          e.preventDefault();
        }
      }, { passive: false });
  
      track.addEventListener('touchend', endDrag);
      track.addEventListener('touchcancel', endDrag);
  
      track.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
  
      track.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('click', (e) => {
          if (dragDistance > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      });
  
      window.addEventListener('resize', () => {
        goTo(currentIndex, 'auto');
      });
  
      goTo(0, 'auto');
    });
  }
  
  function initEventStickyAnchorNav() {
    const anchorNav = document.querySelector('.evd-anchor-nav');
    if (!anchorNav) return;
  
    function getStickyTop() {
      const topValue = getComputedStyle(anchorNav).top;
      const parsed = parseFloat(topValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  
    function updateStickyState() {
      const stickyTop = getStickyTop();
      const rect = anchorNav.getBoundingClientRect();
      const isSticky = Math.abs(rect.top - stickyTop) <= 2 || rect.top <= stickyTop;
  
      anchorNav.classList.toggle('is-sticky', isSticky);
    }
  
    updateStickyState();
  
    requestAnimationFrame(updateStickyState);
    setTimeout(updateStickyState, 50);
    setTimeout(updateStickyState, 150);
    window.addEventListener('load', updateStickyState);
    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('resize', updateStickyState);
  }