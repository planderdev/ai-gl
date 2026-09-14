document.addEventListener('DOMContentLoaded', function () {
    initContentEditorDemo();
    initContentPreviewModal();
    initContentStatusSwitch();
    initContentActionMenu();
  });
  
  function initContentEditorDemo() {
    const editors = document.querySelectorAll('.content-editor');
    if (!editors.length) return;
  
    editors.forEach(function (editor) {
      const buttons = editor.querySelectorAll('.content-editor__toolbar button');
      const textarea = editor.querySelector('.content-editor__textarea');
  
      if (!textarea) return;
  
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          textarea.focus();
        });
      });
    });
  }
  
  function initContentPreviewModal() {
    const modal = document.getElementById('contentPreviewModal');
    if (!modal) return;
  
    const titleEl = modal.querySelector('[data-preview-title]');
    const bodyEl = modal.querySelector('[data-preview-body]');
    const metaEl = modal.querySelector('[data-preview-meta]');
    const openButtons = document.querySelectorAll('[data-content-preview]');
    const closeButtons = modal.querySelectorAll('[data-content-preview-close]');
  
    openButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const title = button.dataset.previewTitle || '미리보기';
        const body = button.dataset.previewBody || '미리보기 내용이 없습니다.';
        const meta = button.dataset.previewMeta || '';
  
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = body;
        if (metaEl) metaEl.textContent = meta;
  
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-modal-open');
      });
    });
  
    closeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-modal-open');
      });
    });
  }
  
  function initContentStatusSwitch() {
    const buttons = document.querySelectorAll('[data-content-status-toggle]');
    if (!buttons.length) return;
  
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const current = button.dataset.statusCurrent || 'inactive';
        const type = button.dataset.statusType || 'default';
        let next = 'active';
  
        if (type === 'notice') {
          if (current === 'published') next = 'draft';
          else if (current === 'draft') next = 'published';
          else next = 'published';
        } else if (type === 'faq') {
          next = current === 'visible' ? 'hidden' : 'visible';
        } else if (type === 'banner') {
          next = current === 'active' ? 'inactive' : 'active';
        } else {
          next = current === 'active' ? 'inactive' : 'active';
        }
  
        button.dataset.statusCurrent = next;
  
        const label = button.querySelector('[data-status-label]');
        if (!label) return;
  
        if (type === 'notice') {
          label.textContent = next === 'published' ? '게시중' : '임시저장';
          button.classList.toggle('is-on', next === 'published');
        } else if (type === 'faq') {
          label.textContent = next === 'visible' ? '노출' : '비노출';
          button.classList.toggle('is-on', next === 'visible');
        } else if (type === 'banner') {
          label.textContent = next === 'active' ? '노출중' : '비활성';
          button.classList.toggle('is-on', next === 'active');
        }
      });
    });
  }
  
  function initContentActionMenu() {
    const menuButtons = document.querySelectorAll('[data-content-action-menu]');
    if (!menuButtons.length) return;
  
    menuButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        const wrap = button.closest('.content-action-dropdown');
        if (!wrap) return;
  
        document.querySelectorAll('.content-action-dropdown.is-open').forEach(function (item) {
          if (item !== wrap) item.classList.remove('is-open');
        });
  
        wrap.classList.toggle('is-open');
      });
    });
  
    document.addEventListener('click', function () {
      document.querySelectorAll('.content-action-dropdown.is-open').forEach(function (item) {
        item.classList.remove('is-open');
      });
    });
  }