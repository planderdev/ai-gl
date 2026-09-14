document.addEventListener('DOMContentLoaded', function () {

    const mobileTrigger = document.getElementById('tbSearchMobileTrigger');
    const mobileModal = document.getElementById('tbSearchMobileModal');
    const mobileClose = document.getElementById('tbSearchMobileClose');
    const mobileSubmit = document.getElementById('tbSearchMobileSubmit');
  
    const mobileDestinationInput = document.getElementById('mobileDestinationInput');
    const mobileDestinationReset = document.getElementById('mobileDestinationReset');
    const mobileSummary = document.getElementById('tbSearchMobileSummary');
  
    const desktopDestinationInput = document.getElementById('destinationInput');
    const desktopDateValue = document.getElementById('dateValue');
    const desktopPersonValue = document.getElementById('personValue');
    const desktopSearchBtn = document.getElementById('heroSearchBtn');
  
    const mobilePersonButtons = document.querySelectorAll('.tb-search-mobile-person');
    const mobileDestinationButtons = document.querySelectorAll('[data-mobile-destination]');
  
    const mobileDateSummary = document.getElementById('mobileDateSummary');
    const calendarEl = document.getElementById('mobileCalendar');
  
    let selectedMobileDate = '';
    let selectedMobileDateLabel = '';
    let selectedMobilePerson = '';
  
    if (!mobileTrigger || !mobileModal) return;
  
    /* ======================
       모달 열기/닫기
    ====================== */
    function openMobileSearch() {
      mobileModal.classList.add('is-open');
      mobileModal.setAttribute('aria-hidden', 'false');
      mobileTrigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-search-mobile-open');
    }
  
    function closeMobileSearch() {
      mobileModal.classList.remove('is-open');
      mobileModal.setAttribute('aria-hidden', 'true');
      mobileTrigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-search-mobile-open');
    }
  
    /* ======================
       요약 텍스트
    ====================== */
    function updateMobileSummary() {
      const destinationText = mobileDestinationInput && mobileDestinationInput.value.trim()
        ? mobileDestinationInput.value.trim()
        : '지역 선택';
  
      const dateText = selectedMobileDateLabel || '날짜 선택';
      const personText = selectedMobilePerson || '인원 선택';
  
      if (mobileSummary) {
        mobileSummary.textContent = `${destinationText} · ${dateText} · ${personText}`;
      }
    }
  
    /* ======================
       PC 동기화
    ====================== */
    function syncToDesktop() {
      const destinationValue = mobileDestinationInput ? mobileDestinationInput.value.trim() : '';
  
      if (desktopDestinationInput) {
        desktopDestinationInput.value = destinationValue;
        desktopDestinationInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
  
      if (desktopDateValue && selectedMobileDateLabel) {
        desktopDateValue.textContent = selectedMobileDateLabel;
      }
  
      if (desktopPersonValue && selectedMobilePerson) {
        desktopPersonValue.textContent = selectedMobilePerson;
      }
    }
  
    /* ======================
       이벤트
    ====================== */
    mobileTrigger.addEventListener('click', openMobileSearch);
  
    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobileSearch);
    }
  
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileSearch();
    });
  
    /* ======================
       지역 선택
    ====================== */
    if (mobileDestinationReset && mobileDestinationInput) {
      mobileDestinationReset.addEventListener('click', function () {
        mobileDestinationInput.value = '';
        mobileDestinationButtons.forEach(btn => btn.classList.remove('is-active'));
        updateMobileSummary();
      });
    }
  
    if (mobileDestinationInput) {
      mobileDestinationInput.addEventListener('input', function () {
        mobileDestinationButtons.forEach(btn => btn.classList.remove('is-active'));
        updateMobileSummary();
      });
    }
  
    mobileDestinationButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const value = button.getAttribute('data-mobile-destination') || '';
  
        if (mobileDestinationInput) {
          mobileDestinationInput.value = value;
        }
  
        mobileDestinationButtons.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
  
        updateMobileSummary();
      });
    });
  
    /* ======================
       인원 선택
    ====================== */
    mobilePersonButtons.forEach(function (button) {
      if (button.classList.contains('is-active')) {
        selectedMobilePerson = button.getAttribute('data-mobile-person') || '';
      }
  
      button.addEventListener('click', function () {
        mobilePersonButtons.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
  
        selectedMobilePerson = button.getAttribute('data-mobile-person') || '';
        updateMobileSummary();
      });
    });
  
    /* ======================
       ⭐ 달력 (핵심)
    ====================== */
    if (calendarEl && window.flatpickr) {
  
      flatpickr.localize(flatpickr.l10ns.ko);
  
      flatpickr(calendarEl, {
        inline: true,
        mode: 'range',
        minDate: 'today',
        locale: 'ko',
  
        onChange: function (selectedDates) {
  
          if (selectedDates.length === 2) {
  
            const start = selectedDates[0];
            const end = selectedDates[1];
  
            const format = (d) =>
              `${d.getMonth() + 1}.${d.getDate()}`;
  
            selectedMobileDateLabel =
              `${format(start)} ~ ${format(end)}`;
  
            if (mobileDateSummary) {
              mobileDateSummary.textContent = selectedMobileDateLabel;
            }
  
            updateMobileSummary();
          }
        }
      });
    }
  
    /* ======================
       검색 실행
    ====================== */
    if (mobileSubmit) {
      mobileSubmit.addEventListener('click', function () {
        syncToDesktop();
        closeMobileSearch();
  
        if (desktopSearchBtn) {
          desktopSearchBtn.click();
        }
      });
    }
  
    updateMobileSummary();
  
    window.addEventListener('resize', function () {
      if (window.innerWidth > 767) {
        closeMobileSearch();
      }
    });
  
  });