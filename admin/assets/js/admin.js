document.addEventListener('DOMContentLoaded', function () {
    initAdminSidebarToggle();
    initAdminNavAccordion();
    initAdminUserMenu();
  
    function initAdminSidebarToggle() {
      const sidebar =
        document.getElementById('adminSidebar') ||
        document.querySelector('.js-admin-sidebar');
  
      const toggleButtons = document.querySelectorAll('.js-admin-sidebar-toggle');
  
      if (!sidebar || !toggleButtons.length) return;
  
      let overlay = document.querySelector('.admin-sidebar-overlay');
  
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'admin-sidebar-overlay';
        document.body.appendChild(overlay);
      }
  
      function openSidebar() {
        if (window.innerWidth > 1024) return;
  
        sidebar.classList.add('is-open');
        overlay.classList.add('is-active');
        document.body.classList.add('is-admin-sidebar-open');
  
        toggleButtons.forEach(function (button) {
          button.setAttribute('aria-expanded', 'true');
        });
      }
  
      function closeSidebar() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-active');
        document.body.classList.remove('is-admin-sidebar-open');
  
        toggleButtons.forEach(function (button) {
          button.setAttribute('aria-expanded', 'false');
        });
      }
  
      function closeUserMenu() {
        const menuWrap = document.querySelector('.js-admin-user-menu');
        const trigger = document.querySelector('.js-admin-user-menu-trigger');
  
        if (!menuWrap || !trigger) return;
  
        menuWrap.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
  
      function toggleSidebar() {
        if (window.innerWidth > 1024) return;
        sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
      }
  
      toggleButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          toggleSidebar();
        });
      });
  
      overlay.addEventListener('click', closeSidebar);
  
      window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
          closeSidebar();
        }
      });
  
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeSidebar();
          closeUserMenu();
        }
      });
    }
  
    function initAdminNavAccordion() {
      const navToggles = document.querySelectorAll('.js-admin-nav-toggle');
      if (!navToggles.length) return;
  
      navToggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          const group = toggle.closest('.admin-nav__group');
          if (!group) return;
  
          const willOpen = !group.classList.contains('is-open');
  
          navToggles.forEach(function (itemToggle) {
            const itemGroup = itemToggle.closest('.admin-nav__group');
            if (!itemGroup) return;
  
            itemGroup.classList.remove('is-open');
            itemToggle.setAttribute('aria-expanded', 'false');
          });
  
          if (willOpen) {
            group.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }
  
    function initAdminUserMenu() {
      const menuWrap = document.querySelector('.js-admin-user-menu');
      const trigger = document.querySelector('.js-admin-user-menu-trigger');
      const dropdown = document.querySelector('.js-admin-user-menu-dropdown');
  
      if (!menuWrap || !trigger || !dropdown) return;
  
      function openUserMenu() {
        menuWrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
  
      function closeUserMenu() {
        menuWrap.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
  
      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
  
        if (menuWrap.classList.contains('is-open')) {
          closeUserMenu();
        } else {
          openUserMenu();
        }
      });
  
      dropdown.addEventListener('click', function (event) {
        event.stopPropagation();
      });
  
      document.addEventListener('click', function () {
        closeUserMenu();
      });
  
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeUserMenu();
        }
      });
    }
  });