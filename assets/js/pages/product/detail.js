document.addEventListener('DOMContentLoaded', function () {
    initDetailTabs();
    initAnchorScroll();
    initSliders();
    initBookingUI();
    initCourseModal();
    initStickyAnchorNav();
  });
  
  function initDetailTabs() {
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
  
  function initAnchorScroll() {
    const nav = document.querySelector('.ttd-anchor-nav');
    const links = Array.from(document.querySelectorAll('.ttd-anchor-nav__link[href^="#"]'));
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
      const headerOffset = getHeaderOffset();
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
  
  function getHeaderOffset() {
    const root = getComputedStyle(document.documentElement);
    const headerHeight = parseInt(root.getPropertyValue('--header-height'), 10);
    const mobileHeaderHeight = parseInt(root.getPropertyValue('--header-height-mobile'), 10);
  
    if (window.innerWidth <= 768 && !Number.isNaN(mobileHeaderHeight)) {
      return mobileHeaderHeight;
    }
  
    return Number.isNaN(headerHeight) ? 80 : headerHeight;
  }
  
  function initSliders() {
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
  
  function initBookingUI() {
    const bookingData = window.DetailBookingData || {};
    const courseYardageData = window.CourseYardageData || {};
  
    if (!bookingData || !bookingData.dates) return;
  
    const state = {
      dates: bookingData.dates || {},
      persons: Array.isArray(bookingData.persons) && bookingData.persons.length ? bookingData.persons : [1],
      selectedDate: null,
      selectedCourseType: 'OUT',
      selectedPerson: 1,
      selectedTee: null,
      currentMonth: null,
      currentYear: null,
      yardage: courseYardageData
    };
  
    if (state.persons.length) {
      state.selectedPerson = Number(state.persons[0]) || 1;
    }
  
    const selectedDateEl = document.getElementById('ttdSelectedDate');
    const selectedCourseEl = document.getElementById('ttdSelectedCourse');
    const selectedPersonEl = document.getElementById('ttdSelectedPerson');
  
    const pricingSection = document.getElementById('ttdPricingSection');
    const pricingEmpty = document.getElementById('ttdPricingEmpty');
    const pricingContent = document.getElementById('ttdPricingContent');
    const pricingPlayers = document.getElementById('ttdPricingPlayers');
    const pricingBadges = document.getElementById('ttdPricingBadges');
    const totalPriceEl = document.getElementById('ttdTotalPrice');
    const reserveBtn = document.getElementById('ttdReserveBtn');
    const resetBtn = document.getElementById('ttdPricingResetBtn');
  
    const summaryDateEl = document.getElementById('ttdSummaryDate');
    const summaryTimeEl = document.getElementById('ttdSummaryTime');
    const summaryCourseTypeEl = document.getElementById('ttdSummaryCourseType');
    const summaryPersonEl = document.getElementById('ttdSummaryPerson');
  
    const modal = document.getElementById('ttdBookingModal');
    const modalClose = document.getElementById('ttdModalClose');
    const modalCancel = document.getElementById('ttdBookingCancelBtn');
    const modalConfirm = document.getElementById('ttdBookingConfirmBtn');
    const modalTotalPrice = document.getElementById('ttdModalTotalPrice');
    const modalDim = modal ? modal.querySelector('.booking-modal-dim') : null;
  
    const calendarGrid = document.getElementById('ttdCalendarGrid');
    const calendarTitle = document.getElementById('ttdCalendarTitle');
    const prevMonthBtn = document.getElementById('ttdPrevMonthBtn');
    const nextMonthBtn = document.getElementById('ttdNextMonthBtn');
    const teeList = document.getElementById('ttdTeeList');
    const courseTypeButtons = document.querySelectorAll('.ttd-toggle-btn[data-course-type]');
    const personButtons = document.querySelectorAll('.ttd-person-option[data-person]');
  
    const openModalTriggers = [
      document.getElementById('ttdOpenBookingModal'),
      document.getElementById('ttdOpenBookingModalFromCourse'),
      document.getElementById('ttdOpenBookingModalFromPerson')
    ].filter(Boolean);
  
    const availableDateKeys = Object.keys(state.dates).sort();
    const firstDate = availableDateKeys[0];
    const firstDateObj = firstDate ? new Date(firstDate) : new Date();
  
    state.currentYear = firstDateObj.getFullYear();
    state.currentMonth = firstDateObj.getMonth();
  
    function formatNumber(num) {
      return new Intl.NumberFormat('ko-KR').format(Number(num || 0));
    }
  
    function formatPrice(num) {
      return `₩${formatNumber(num)}`;
    }
  
    function formatDateDisplay(dateStr) {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
  
    function normalizeTee(tee) {
      return {
        time: tee.time || tee.tee_time || tee.label || '-',
        courseType: tee.course_type || tee.courseType || state.selectedCourseType,
        badges: tee.badges || tee.tags || [],
        priceByPerson: tee.price_by_person || tee.priceByPerson || {}
      };
    }
  
    function getAvailableTees(dateStr, courseType) {
      const byDate = state.dates[dateStr];
      if (!byDate) return [];
      const rows = byDate[courseType] || [];
      return rows.map(normalizeTee);
    }
  
    function getSelectedTeePrice() {
      if (!state.selectedTee) return 0;
      const priceMap = state.selectedTee.priceByPerson || {};
      return Number(priceMap[state.selectedPerson] || 0);
    }
  
    function hasValidSelection() {
      return Boolean(state.selectedDate && state.selectedTee && getSelectedTeePrice() > 0);
    }
  
    function updateSelectedSummary() {
      if (selectedDateEl) {
        selectedDateEl.textContent = state.selectedDate ? formatDateDisplay(state.selectedDate) : '-';
        selectedDateEl.classList.toggle('is-placeholder', !state.selectedDate);
      }
  
      if (selectedCourseEl) {
        selectedCourseEl.textContent = state.selectedTee ? `${state.selectedTee.courseType} · ${state.selectedTee.time}` : '-';
        selectedCourseEl.classList.toggle('is-placeholder', !state.selectedTee);
      }
  
      if (selectedPersonEl) {
        selectedPersonEl.textContent = `${state.selectedPerson}인`;
        selectedPersonEl.classList.remove('is-placeholder');
      }
    }
  
    function renderPricing() {
      const valid = hasValidSelection();
      const price = getSelectedTeePrice();
  
      pricingSection?.classList.toggle('is-empty', !valid);
  
      if (pricingEmpty) pricingEmpty.hidden = valid;
      if (pricingContent) pricingContent.hidden = !valid;
      if (reserveBtn) reserveBtn.disabled = !valid;
      if (resetBtn) resetBtn.hidden = !valid;
  
      if (!valid) {
        if (totalPriceEl) totalPriceEl.textContent = formatPrice(0);
        if (modalTotalPrice) modalTotalPrice.textContent = formatPrice(0);
        return;
      }
  
      if (summaryDateEl) summaryDateEl.textContent = formatDateDisplay(state.selectedDate);
      if (summaryTimeEl) summaryTimeEl.textContent = state.selectedTee.time;
      if (summaryCourseTypeEl) summaryCourseTypeEl.textContent = state.selectedTee.courseType;
      if (summaryPersonEl) summaryPersonEl.textContent = `${state.selectedPerson}인`;
  
      if (pricingBadges) {
        pricingBadges.innerHTML = '';
        const badgeItems = [
          state.selectedTee.courseType,
          ...(Array.isArray(state.selectedTee.badges) ? state.selectedTee.badges : [])
        ].filter(Boolean);
  
        badgeItems.forEach((badge) => {
          const span = document.createElement('span');
          span.className = 'ttd-badge';
          span.textContent = badge;
          pricingBadges.appendChild(span);
        });
      }
  
      if (pricingPlayers) {
        pricingPlayers.innerHTML = '';
        const row = document.createElement('div');
        row.className = 'ttd-pricing__row';
        row.innerHTML = `
          <span>${state.selectedPerson}인 플레이 요금</span>
          <strong>${formatPrice(price)}</strong>
        `;
        pricingPlayers.appendChild(row);
      }
  
      if (totalPriceEl) totalPriceEl.textContent = formatPrice(price);
      if (modalTotalPrice) modalTotalPrice.textContent = formatPrice(price);
    }
  
    function renderTeeList() {
      if (!teeList) return;
  
      const tees = state.selectedDate ? getAvailableTees(state.selectedDate, state.selectedCourseType) : [];
      teeList.innerHTML = '';
  
      if (!tees.length) {
        const empty = document.createElement('div');
        empty.className = 'ttd-pricing__empty-card';
        empty.innerHTML = `
          <strong>선택 가능한 티타임이 없습니다</strong>
          <p>다른 날짜 또는 코스를 선택해 주세요.</p>
        `;
        teeList.appendChild(empty);
  
        state.selectedTee = null;
        renderPricing();
        updateSelectedSummary();
        return;
      }
  
      const currentTime = state.selectedTee?.time || null;
      let stillExists = false;
  
      tees.forEach((tee, index) => {
        const price = Number(tee.priceByPerson[state.selectedPerson] || 0);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ttd-tee-item';
        button.innerHTML = `
          <span class="ttd-tee-item__time">${tee.time}</span>
          <span class="ttd-tee-item__price">${price > 0 ? formatPrice(price) : '문의'}</span>
        `;
  
        if (currentTime && tee.time === currentTime) {
          state.selectedTee = tee;
          button.classList.add('is-active');
          stillExists = true;
        }
  
        button.addEventListener('click', () => {
          state.selectedTee = tee;
          teeList.querySelectorAll('.ttd-tee-item').forEach((item) => item.classList.remove('is-active'));
          button.classList.add('is-active');
          renderPricing();
          updateSelectedSummary();
        });
  
        teeList.appendChild(button);
  
        if (!currentTime && index === 0) {
          state.selectedTee = tee;
          button.classList.add('is-active');
          stillExists = true;
        }
      });
  
      if (!stillExists && tees.length) {
        state.selectedTee = tees[0];
        const firstButton = teeList.querySelector('.ttd-tee-item');
        if (firstButton) firstButton.classList.add('is-active');
      }
  
      renderPricing();
      updateSelectedSummary();
    }
  
    function renderCalendar() {
      if (!calendarGrid || !calendarTitle) return;
  
      calendarGrid.innerHTML = '';
  
      const year = state.currentYear;
      const month = state.currentMonth;
  
      calendarTitle.textContent = `${year}년 ${month + 1}월`;
  
      const firstDay = new Date(year, month, 1);
      const startDay = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
      for (let i = 0; i < startDay; i += 1) {
        const empty = document.createElement('button');
        empty.type = 'button';
        empty.className = 'calendar-day is-empty';
        empty.disabled = true;
        calendarGrid.appendChild(empty);
      }
  
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dateStr = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-');
  
        const isAvailable = Boolean(state.dates[dateStr]);
  
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = String(day);
  
        if (!isAvailable) {
          button.disabled = true;
        } else {
          button.classList.add('is-available');
        }
  
        if (state.selectedDate === dateStr) {
          button.classList.add('is-selected');
        }
  
        button.addEventListener('click', () => {
          if (!isAvailable) return;
  
          state.selectedDate = dateStr;
          state.selectedTee = null;
          renderCalendar();
          renderTeeList();
          renderPricing();
          updateSelectedSummary();
        });
  
        calendarGrid.appendChild(button);
      }
    }
  
    function openModal() {
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderCalendar();
      renderTeeList();
      renderPricing();
    }
  
    function closeModal() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  
    function resetSelection() {
      state.selectedDate = null;
      state.selectedTee = null;
      updateSelectedSummary();
      renderPricing();
      renderCalendar();
      renderTeeList();
    }
  
    openModalTriggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
    });
  
    modalClose?.addEventListener('click', closeModal);
    modalCancel?.addEventListener('click', closeModal);
    modalDim?.addEventListener('click', closeModal);
  
    modalConfirm?.addEventListener('click', () => {
      if (!hasValidSelection()) return;
      closeModal();
    });
  
    prevMonthBtn?.addEventListener('click', () => {
      state.currentMonth -= 1;
      if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear -= 1;
      }
      renderCalendar();
    });
  
    nextMonthBtn?.addEventListener('click', () => {
      state.currentMonth += 1;
      if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear += 1;
      }
      renderCalendar();
    });
  
    courseTypeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const courseType = button.getAttribute('data-course-type');
        if (!courseType) return;
  
        state.selectedCourseType = courseType;
        state.selectedTee = null;
  
        courseTypeButtons.forEach((btn) => {
          btn.classList.toggle('is-active', btn === button);
        });
  
        renderTeeList();
        renderPricing();
      });
    });
  
    personButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const person = Number(button.getAttribute('data-person') || '1');
        state.selectedPerson = person;
  
        personButtons.forEach((btn) => {
          btn.classList.toggle('is-active', btn === button);
        });
  
        renderTeeList();
        renderPricing();
        updateSelectedSummary();
      });
    });
  
    resetBtn?.addEventListener('click', resetSelection);
  
    reserveBtn?.addEventListener('click', () => {
      if (!hasValidSelection()) return;
      openModal();
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeCourseModal();
      }
    });
  
    updateSelectedSummary();
    renderPricing();
  
    window.__detailBookingState = state;
  }
  
  function initCourseModal() {
    const modal = document.getElementById('ttdCourseModal');
    const openBtn = document.getElementById('ttdOpenCourseModal');
    const closeBtn = document.getElementById('ttdCourseModalClose');
    const dim = modal ? modal.querySelector('.course-modal-dim') : null;
    const tabsWrap = document.getElementById('ttdCourseModalTabs');
    const subtabsWrap = document.getElementById('ttdCourseModalSubTabs');
    const tableWrap = document.getElementById('ttdCourseModalTableWrap');
    const data = window.CourseYardageData || {};
  
    if (!modal || !openBtn || !tabsWrap || !subtabsWrap || !tableWrap || !data || typeof data !== 'object') {
      return;
    }
  
    const state = {
      tab: null,
      subtab: null
    };
  
    const tabKeys = Object.keys(data);
    if (!tabKeys.length) return;
  
    state.tab = tabKeys[0];
    const firstSubKeys = Object.keys(data[state.tab] || {});
    state.subtab = firstSubKeys[0] || null;
  
    function openCourseModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      render();
    }
  
    function closeCourseModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  
    window.closeCourseModal = closeCourseModal;
  
    function renderTabs() {
      tabsWrap.innerHTML = '';
      tabKeys.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'course-modal-tab-btn' + (state.tab === key ? ' is-active' : '');
        btn.textContent = key;
        btn.addEventListener('click', () => {
          state.tab = key;
          const subKeys = Object.keys(data[state.tab] || {});
          state.subtab = subKeys[0] || null;
          render();
        });
        tabsWrap.appendChild(btn);
      });
    }
  
    function renderSubTabs() {
      subtabsWrap.innerHTML = '';
      const subData = data[state.tab] || {};
      const subKeys = Object.keys(subData);
  
      subKeys.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'course-modal-tab-btn' + (state.subtab === key ? ' is-active' : '');
        btn.textContent = key;
        btn.addEventListener('click', () => {
          state.subtab = key;
          renderTable();
          renderSubTabs();
        });
        subtabsWrap.appendChild(btn);
      });
    }
  
    function renderTable() {
      const rows = (data[state.tab] && data[state.tab][state.subtab]) || [];
      tableWrap.innerHTML = '';
  
      if (!Array.isArray(rows) || !rows.length) {
        tableWrap.innerHTML = `
          <div class="ttd-pricing__empty-card">
            <strong>표시할 코스 정보가 없습니다</strong>
          </div>
        `;
        return;
      }
  
      const keys = Object.keys(rows[0]);
      const table = document.createElement('table');
      table.className = 'course-yardage-table';
  
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      keys.forEach((key) => {
        const th = document.createElement('th');
        th.textContent = key;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
  
      const tbody = document.createElement('tbody');
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        keys.forEach((key) => {
          const td = document.createElement('td');
          td.textContent = row[key] ?? '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
  
      table.appendChild(thead);
      table.appendChild(tbody);
      tableWrap.appendChild(table);
    }
  
    function render() {
      renderTabs();
      renderSubTabs();
      renderTable();
    }
  
    openBtn.addEventListener('click', openCourseModal);
    closeBtn.addEventListener('click', closeCourseModal);
    dim?.addEventListener('click', closeCourseModal);
  }
  
  function closeCourseModal() {
    const modal = document.getElementById('ttdCourseModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }


  function initStickyAnchorNav() {
    const anchorNav = document.querySelector('.ttd-anchor-nav');
    if (!anchorNav) return;
  
    const stickyTop = parseFloat(getComputedStyle(anchorNav).top) || 0;
  
    function updateStickyState() {
      const rect = anchorNav.getBoundingClientRect();
      const isSticky = rect.top <= stickyTop + 1;
      anchorNav.classList.toggle('is-sticky', isSticky);
    }
  
    updateStickyState();
    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('resize', updateStickyState);
  }
  
 