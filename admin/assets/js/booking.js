document.addEventListener('DOMContentLoaded', function () {
    initBookingFilter();
    initBookingCreateAutoFill();
    initBookingBulkActions();
    initBookingCalendar();
    initBookingEditHelpers();
  });
  
  function initBookingFilter() {
    const filterForm = document.querySelector('.booking-filter');
    if (!filterForm) return;
  
    filterForm.classList.add('is-ready');
  }
  
  function initBookingCreateAutoFill() {
    const productSelect = document.querySelector('.js-booking-product-select');
    const productTitleInput = document.querySelector('.js-booking-product-title');
    const totalPriceInput = document.querySelector('.js-booking-total-price');
    const paymentAmountInput = document.querySelector('.js-booking-payment-amount');
  
    if (!productSelect) return;
  
    function syncProductFields(forceFill) {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      const title = selectedOption ? (selectedOption.dataset.title || '') : '';
      const price = selectedOption ? (selectedOption.dataset.price || '') : '';
  
      if (productTitleInput) {
        productTitleInput.value = title;
      }
  
      if (totalPriceInput && (forceFill || totalPriceInput.value === '')) {
        totalPriceInput.value = price;
      }
  
      if (paymentAmountInput && (forceFill || paymentAmountInput.value === '')) {
        paymentAmountInput.value = price;
      }
    }
  
    productSelect.addEventListener('change', function () {
      syncProductFields(false);
    });
  
    if (productSelect.value && productTitleInput && productTitleInput.value === '') {
      syncProductFields(false);
    }
  }
  
  function initBookingBulkActions() {
    const checkAll = document.querySelector('.js-booking-check-all');
    const rowChecks = Array.from(document.querySelectorAll('.js-booking-row-check'));
    const toolbar = document.querySelector('.js-booking-bulk-toolbar');
    const countText = document.querySelector('.js-booking-selected-count');
    const hiddenInputsWrap = document.querySelector('.js-booking-bulk-hidden-inputs');
    const bulkActionInput = document.querySelector('.js-booking-bulk-action');
    const bulkTriggers = document.querySelectorAll('.js-booking-bulk-trigger');
    const bulkForm = document.querySelector('.js-booking-bulk-form');
  
    if (!rowChecks.length || !toolbar || !countText || !hiddenInputsWrap || !bulkActionInput || !bulkForm) {
      return;
    }
  
    function getCheckedValues() {
      return rowChecks
        .filter(function (checkbox) {
          return checkbox.checked;
        })
        .map(function (checkbox) {
          return checkbox.value;
        });
    }
  
    function syncToolbar() {
      const selectedValues = getCheckedValues();
      const count = selectedValues.length;
  
      countText.textContent = count + '건 선택됨';
      toolbar.classList.toggle('is-disabled', count === 0);
  
      hiddenInputsWrap.innerHTML = '';
  
      selectedValues.forEach(function (value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'booking_ids[]';
        input.value = value;
        hiddenInputsWrap.appendChild(input);
      });
  
      if (checkAll) {
        const total = rowChecks.length;
        checkAll.checked = total > 0 && count === total;
      }
    }
  
    if (checkAll) {
      checkAll.addEventListener('change', function () {
        rowChecks.forEach(function (checkbox) {
          checkbox.checked = checkAll.checked;
        });
        syncToolbar();
      });
    }
  
    rowChecks.forEach(function (checkbox) {
      checkbox.addEventListener('change', syncToolbar);
    });
  
    bulkTriggers.forEach(function (button) {
      button.addEventListener('click', function () {
        const action = button.dataset.action || '';
        const selectedValues = getCheckedValues();
  
        if (!action || !selectedValues.length) return;
  
        const actionLabelMap = {
          mark_paid: '선택한 예약을 일괄 결제완료 처리',
          mark_confirmed: '선택한 예약을 일괄 예약확정 처리',
          mark_cancelled: '선택한 예약을 일괄 취소 처리'
        };
  
        const confirmed = window.confirm((actionLabelMap[action] || '일괄 처리') + ' 하시겠습니까?');
        if (!confirmed) return;
  
        bulkActionInput.value = action;
        bulkForm.submit();
      });
    });
  
    syncToolbar();
  }
  
  function initBookingCalendar() {
    const calendar = document.querySelector('[data-booking-calendar]');
    if (!calendar) return;
  
    const selectedDay = calendar.querySelector('.booking-calendar-day.is-selected');
    if (!selectedDay) return;
  
    if (window.innerWidth <= 768) {
      selectedDay.scrollIntoView({
        block: 'nearest',
        inline: 'center'
      });
    }
  }
  
  function initBookingEditHelpers() {
    const statusSelect = document.querySelector('.js-booking-status-select');
    const cancelDateInput = document.querySelector('input[name="cancel_date"]');
  
    if (!statusSelect || !cancelDateInput) return;
  
    statusSelect.addEventListener('change', function () {
      if (statusSelect.value !== 'cancelled') return;
      if (cancelDateInput.value) return;
  
      const now = new Date();
      const pad = function (num) {
        return String(num).padStart(2, '0');
      };
  
      const formatted =
        now.getFullYear() +
        '-' + pad(now.getMonth() + 1) +
        '-' + pad(now.getDate()) +
        'T' + pad(now.getHours()) +
        ':' + pad(now.getMinutes());
  
      cancelDateInput.value = formatted;
    });
  }