function initHeaderUI() {
    const megaTriggers = document.querySelectorAll('[data-mega-trigger]');
    const megaPanelsWrap = document.getElementById('megaPanelsWrap');
    const megaPanels = document.querySelectorAll('[data-mega-panel]');
    const siteHeader = document.getElementById('siteHeader');
  
    function openMegaPanel(key) {
      if (!megaPanelsWrap) return;
  
      megaPanelsWrap.classList.add('is-open');
  
      megaPanels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.megaPanel === key);
      });
  
      megaTriggers.forEach((trigger) => {
        trigger.classList.toggle('is-active', trigger.dataset.megaTrigger === key);
      });
    }
  
    function closeMegaPanel() {
      if (!megaPanelsWrap) return;
  
      megaPanelsWrap.classList.remove('is-open');
      megaPanels.forEach((panel) => panel.classList.remove('is-active'));
      megaTriggers.forEach((trigger) => trigger.classList.remove('is-active'));
    }
  
    megaTriggers.forEach((trigger) => {
      trigger.addEventListener('mouseenter', function () {
        if (window.innerWidth <= 767) return;
        openMegaPanel(this.dataset.megaTrigger);
      });
  
      trigger.addEventListener('click', function () {
        if (window.innerWidth <= 767) return;
        openMegaPanel(this.dataset.megaTrigger);
      });
    });
  
    if (siteHeader) {
      siteHeader.addEventListener('mouseleave', function () {
        if (window.innerWidth <= 767) return;
        closeMegaPanel();
      });
    }
  
    function bindMegaTabs(scope) {
      const wrappers = document.querySelectorAll(scope);
  
      wrappers.forEach((wrapper) => {
        const buttons = wrapper.querySelectorAll('.mega-category');
        const panels = wrapper.querySelectorAll('.mega-country-panel');
  
        if (!buttons.length || !panels.length) return;
  
        buttons.forEach((button) => {
          const activate = () => {
            const targetId = button.dataset.target;
            if (!targetId) return;
  
            buttons.forEach((btn) => btn.classList.remove('is-active'));
            panels.forEach((panel) => panel.classList.remove('is-active'));
  
            button.classList.add('is-active');
  
            let targetPanel = null;
  
            if (window.CSS && typeof window.CSS.escape === 'function') {
              targetPanel = wrapper.querySelector('#' + CSS.escape(targetId));
            } else {
              targetPanel = wrapper.querySelector('#' + targetId);
            }
  
            if (targetPanel) {
              targetPanel.classList.add('is-active');
            } else {
              const globalTarget = document.getElementById(targetId);
              if (globalTarget) {
                globalTarget.classList.add('is-active');
              }
            }
          };
  
          button.addEventListener('mouseenter', function () {
            if (window.innerWidth <= 767) return;
            activate();
          });
  
          button.addEventListener('click', function () {
            if (window.innerWidth <= 767) return;
            activate();
          });
        });
      });
    }
  
    bindMegaTabs('.mega-panel');
    bindMegaTabs('.all-menu-mega-box');
  
    const allMenuOpen = document.getElementById('allMenuOpen');
    const allMenuClose = document.getElementById('allMenuClose');
    const allMenuOverlay = document.getElementById('allMenuOverlay');
  
    function resetMobileAccordions() {
      if (window.innerWidth > 767) return;
  
      const accordionItems = document.querySelectorAll('.mobile-menu-accordion__item');
  
      accordionItems.forEach((item) => {
        const trigger = item.querySelector('[data-accordion-trigger]');
        const panel = item.querySelector('.mobile-menu-accordion__panel');
  
        item.classList.remove('is-open');
  
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
  
        if (panel) {
          panel.hidden = true;
        }
      });
    }
  
    function openAllMenu() {
      if (!allMenuOverlay) return;
      resetMobileAccordions();
      allMenuOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  
    function closeAllMenu() {
      if (!allMenuOverlay) return;
      allMenuOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  
    if (allMenuOpen) {
      allMenuOpen.addEventListener('click', openAllMenu);
    }
  
    if (allMenuClose) {
      allMenuClose.addEventListener('click', closeAllMenu);
    }
  
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMegaPanel();
        closeAllMenu();
      }
    });
  
    function initMobileMenuAccordion() {
      const accordionGroups = document.querySelectorAll('.mobile-menu-accordion');
      if (!accordionGroups.length) return;
  
      accordionGroups.forEach((group) => {
        const items = group.querySelectorAll('.mobile-menu-accordion__item');
  
        items.forEach((item) => {
          const trigger = item.querySelector('[data-accordion-trigger]');
          const panel = item.querySelector('.mobile-menu-accordion__panel');
  
          if (!trigger || !panel) return;
  
          if (trigger.dataset.bound === 'true') return;
          trigger.dataset.bound = 'true';
  
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
  
          trigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
  
            if (window.innerWidth > 767) return;
  
            const isOpen = item.classList.contains('is-open');
  
            items.forEach((otherItem) => {
              const otherTrigger = otherItem.querySelector('[data-accordion-trigger]');
              const otherPanel = otherItem.querySelector('.mobile-menu-accordion__panel');
  
              otherItem.classList.remove('is-open');
  
              if (otherTrigger) {
                otherTrigger.setAttribute('aria-expanded', 'false');
              }
  
              if (otherPanel) {
                otherPanel.hidden = true;
              }
            });
  
            if (!isOpen) {
              item.classList.add('is-open');
              trigger.setAttribute('aria-expanded', 'true');
              panel.hidden = false;
            }
          });
        });
      });
    }
  
    initMobileMenuAccordion();
  
    if (allMenuOverlay) {
      allMenuOverlay.addEventListener('click', function (e) {
        if (e.target === allMenuOverlay) {
          closeAllMenu();
        }
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderUI();
  
    const menu = document.querySelector('.js-user-menu');
    const trigger = document.querySelector('.js-user-menu-trigger');
    const dropdown = document.querySelector('.js-user-menu-dropdown');
    const dim = document.querySelector('.js-user-menu-dim');
  
    if (menu && trigger && dropdown) {
      const isMobile = () => window.innerWidth <= 767;
  
      function openUserMenu() {
        menu.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
  
        if (isMobile()) {
          document.body.style.overflow = 'hidden';
        }
      }
  
      function closeUserMenu() {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
  
        if (isMobile()) {
          document.body.style.overflow = '';
        }
      }
  
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
  
        if (menu.classList.contains('is-open')) {
          closeUserMenu();
        } else {
          openUserMenu();
        }
      });
  
      if (dim) {
        dim.addEventListener('click', function () {
          closeUserMenu();
        });
      }
  
      document.addEventListener('click', function (e) {
        if (isMobile()) return;
  
        if (!menu.contains(e.target)) {
          closeUserMenu();
        }
      });
  
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeUserMenu();
        }
      });
  
      window.addEventListener('resize', function () {
        closeUserMenu();
      });
    }
  });