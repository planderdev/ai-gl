document.addEventListener('DOMContentLoaded', function () {
    initCustomerTabs();
    initCustomerModals();
    initCustomerDrawers();
    initCustomerCreateForm();
  });
  
  function initCustomerTabs() {
    const tabWrap = document.querySelector('[data-customer-tabs]');
    if (!tabWrap) return;
  
    const buttons = tabWrap.querySelectorAll('[data-customer-tab]');
    const panels = document.querySelectorAll('[data-customer-panel]');
  
    buttons.forEach((button) => {
      button.addEventListener('click', function () {
        const target = button.dataset.customerTab;
  
        buttons.forEach((item) => item.classList.remove('is-active'));
        panels.forEach((panel) => panel.classList.remove('is-active'));
  
        button.classList.add('is-active');
  
        const matchedPanel = document.querySelector('[data-customer-panel="' + target + '"]');
        if (matchedPanel) {
          matchedPanel.classList.add('is-active');
        }
      });
    });
  }
  
  function initCustomerModals() {
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButtons = document.querySelectorAll('[data-modal-close]');
  
    openButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const id = button.dataset.modalOpen;
        const modal = document.getElementById(id);
        if (!modal) return;
  
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-modal-open');
      });
    });
  
    closeButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const modal = button.closest('.customer-modal');
        if (!modal) return;
  
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-modal-open');
      });
    });
  }
  
  function initCustomerDrawers() {
    const openButtons = document.querySelectorAll('[data-drawer-open]');
    const closeButtons = document.querySelectorAll('[data-drawer-close]');
  
    openButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const id = button.dataset.drawerOpen;
        const drawer = document.getElementById(id);
        if (!drawer) return;
  
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-modal-open');
      });
    });
  
    closeButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const drawer = button.closest('.customer-drawer');
        if (!drawer) return;
  
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-modal-open');
      });
    });
  }
  
  function initCustomerCreateForm() {
    const bookingCountInput = document.querySelector('.js-customer-booking-count');
    const totalAmountInput = document.querySelector('.js-customer-total-amount');
    const avgAmountInput = document.querySelector('.js-customer-avg-amount');
  
    if (!bookingCountInput || !totalAmountInput || !avgAmountInput) return;
  
    function syncAverageAmount() {
      const bookingCount = parseInt(bookingCountInput.value || '0', 10);
      const totalAmount = parseInt(totalAmountInput.value || '0', 10);
  
      if (bookingCount > 0 && totalAmount > 0) {
        avgAmountInput.value = Math.floor(totalAmount / bookingCount);
      } else if (!avgAmountInput.dataset.userEdited) {
        avgAmountInput.value = 0;
      }
    }
  
    bookingCountInput.addEventListener('input', syncAverageAmount);
    totalAmountInput.addEventListener('input', syncAverageAmount);
  
    avgAmountInput.addEventListener('input', function () {
      avgAmountInput.dataset.userEdited = 'true';
    });
  }