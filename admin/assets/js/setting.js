document.addEventListener('DOMContentLoaded', function () {
    initSettingSecretToggle();
    initSettingPanels();
    initDepositFieldToggle();
    initModeCardState();
    initToast();
  
    function initSettingSecretToggle() {
      document.querySelectorAll('[data-toggle-secret]').forEach(function (button) {
        button.addEventListener('click', function () {
          const wrap = button.closest('.setting-secret-input');
          if (!wrap) return;
  
          const input = wrap.querySelector('input');
          const icon = button.querySelector('i');
          if (!input) return;
  
          const isPassword = input.getAttribute('type') === 'password';
          input.setAttribute('type', isPassword ? 'text' : 'password');
  
          if (icon) {
            icon.className = isPassword ? 'ri-eye-off-line' : 'ri-eye-line';
          }
        });
      });
    }
  
    function initSettingPanels() {
      const bankToggle = document.querySelector('[data-setting-toggle="bank"]');
      const bankPanel = document.querySelector('[data-setting-panel="bank"]');
  
      if (bankToggle && bankPanel) {
        const syncBankPanel = function () {
          const enabled = bankToggle.checked;
          bankPanel.classList.toggle('is-disabled', !enabled);
  
          bankPanel.querySelectorAll('input, select, textarea').forEach(function (field) {
            if (enabled) {
              field.removeAttribute('tabindex');
            } else {
              field.setAttribute('tabindex', '-1');
            }
          });
        };
  
        syncBankPanel();
        bankToggle.addEventListener('change', syncBankPanel);
      }
    }
  
    function initDepositFieldToggle() {
      const select = document.querySelector('[data-setting-deposit-select]');
      if (!select) return;
  
      const fields = document.querySelectorAll('[data-deposit-field]');
  
      const sync = function () {
        const value = select.value;
  
        fields.forEach(function (field) {
          const type = field.getAttribute('data-deposit-field');
          const input = field.querySelector('input');
  
          const visible =
            value !== 'none' &&
            ((value === 'fixed' && type === 'fixed') ||
              (value === 'percent' && type === 'percent'));
  
          field.style.display = visible ? '' : 'none';
  
          if (input) {
            input.disabled = !visible;
          }
        });
      };
  
      sync();
      select.addEventListener('change', sync);
    }
  
    function initModeCardState() {
      const options = document.querySelectorAll('.setting-mode-option');
      if (!options.length) return;
  
      const sync = function () {
        options.forEach(function (option) {
          const input = option.querySelector('input[type="radio"]');
          option.classList.toggle('is-active', !!(input && input.checked));
        });
      };
  
      sync();
  
      options.forEach(function (option) {
        const input = option.querySelector('input[type="radio"]');
        if (!input) return;
  
        input.addEventListener('change', sync);
      });
    }
  
    function initToast() {
      const toast = document.querySelector('[data-setting-toast]');
      if (!toast) return;
  
      const closeBtn = toast.querySelector('[data-setting-toast-close]');
  
      const removeToast = function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
  
        setTimeout(function () {
          toast.remove();
        }, 180);
      };
  
      if (closeBtn) {
        closeBtn.addEventListener('click', removeToast);
      }
  
      setTimeout(removeToast, 2800);
    }
  });