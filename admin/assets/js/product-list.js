document.addEventListener('DOMContentLoaded', function () {
  const checkAll = document.querySelector('.js-check-all');
  const rowChecks = document.querySelectorAll('.js-row-check');
  const rowChecksMobile = document.querySelectorAll('.js-row-check-mobile');
  const bulkActionButtons = document.querySelectorAll('.js-bulk-action');
  const bulkBar = document.querySelector('.js-bulkbar');
  const bulkCount = document.querySelector('.js-bulk-count');
  const filterToggle = document.querySelector('.js-filter-toggle');
  const filterAdvanced = document.querySelector('.js-filter-advanced');
  const menuToggles = document.querySelectorAll('.js-row-menu-toggle');

  function getDesktopChecks() {
    return Array.from(document.querySelectorAll('.js-row-check'));
  }

  function getMobileChecks() {
    return Array.from(document.querySelectorAll('.js-row-check-mobile'));
  }

  function getAllChecks() {
    return [...getDesktopChecks(), ...getMobileChecks()];
  }

  function getUniqueCheckedIds() {
    return Array.from(
      new Set(
        getAllChecks()
          .filter(function (checkbox) {
            return checkbox.checked;
          })
          .map(function (checkbox) {
            return checkbox.value;
          })
      )
    );
  }

  function syncCheckAllState() {
    if (!checkAll) return;

    const desktopChecks = getDesktopChecks();

    if (!desktopChecks.length) {
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }

    const checkedCount = desktopChecks.filter(function (checkbox) {
      return checkbox.checked;
    }).length;

    checkAll.checked = checkedCount > 0 && checkedCount === desktopChecks.length;
    checkAll.indeterminate = checkedCount > 0 && checkedCount < desktopChecks.length;
  }

  function syncBulkBar() {
    const ids = getUniqueCheckedIds();
    const checkedCount = ids.length;

    if (bulkActionButtons.length) {
      bulkActionButtons.forEach(function (button) {
        button.disabled = checkedCount === 0;
      });
    }

    if (bulkCount) {
      bulkCount.textContent = String(checkedCount);
    }

    if (bulkBar) {
      bulkBar.hidden = checkedCount === 0;
    }

    syncCheckAllState();
  }

  function syncPairs(changedCheckbox, selector) {
    const targetValue = changedCheckbox.value;

    document.querySelectorAll(selector).forEach(function (checkbox) {
      if (checkbox.value === targetValue && checkbox !== changedCheckbox) {
        checkbox.checked = changedCheckbox.checked;
      }
    });
  }

  function closeAllMenus(exceptMenu) {
    document.querySelectorAll('.js-row-menu').forEach(function (menu) {
      if (exceptMenu && menu === exceptMenu) return;
      menu.classList.remove('is-open');

      const toggle = menu.querySelector('.js-row-menu-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (checkAll) {
    checkAll.addEventListener('change', function () {
      rowChecks.forEach(function (checkbox) {
        checkbox.checked = checkAll.checked;
      });
      syncBulkBar();
    });
  }

  rowChecks.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      syncPairs(checkbox, '.js-row-check-mobile');
      syncBulkBar();
    });
  });

  rowChecksMobile.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      syncPairs(checkbox, '.js-row-check');
      syncBulkBar();
    });
  });

  if (bulkActionButtons.length) {
    bulkActionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const ids = getUniqueCheckedIds();
        const action = button.dataset.bulkAction || '';

        if (!ids.length) return;

        if (action === 'delete') {
          if (!confirm('선택한 상품을 삭제하시겠습니까?')) {
            return;
          }
        }

        alert(
          '벌크 액션 연결 전 데모 상태입니다.\n\n' +
          '액션: ' + action + '\n' +
          '선택된 상품 ID: ' + ids.join(', ')
        );
      });
    });
  }

  if (filterToggle && filterAdvanced) {
    filterToggle.addEventListener('click', function () {
      const isOpen = filterAdvanced.classList.toggle('is-open');
      filterToggle.classList.toggle('is-active', isOpen);
      filterToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  menuToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();

      const menu = toggle.closest('.js-row-menu');
      const isOpen = menu.classList.contains('is-open');

      closeAllMenus(menu);

      if (!isOpen) {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function () {
    closeAllMenus();
  });

  document.querySelectorAll('.js-row-menu-dropdown').forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  });

  syncBulkBar();
});