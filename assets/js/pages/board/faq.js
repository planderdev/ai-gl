document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.fq-item');
    const input = document.querySelector('.fq-search input[name="q"]');
    const autoWrap = document.querySelector('.fq-autocomplete');
  
    let box = null;
  
    function closeAll(targetItem = null) {
      items.forEach((item) => {
        if (targetItem && item === targetItem) return;
  
        item.classList.remove('active');
  
        const button = item.querySelector('.fq-question');
        const answer = item.querySelector('.fq-answer');
  
        if (button) button.setAttribute('aria-expanded', 'false');
  
        if (answer) {
          answer.style.maxHeight = null;
          answer.hidden = true;
        }
      });
    }
  
    function openItem(item) {
      const button = item.querySelector('.fq-question');
      const answer = item.querySelector('.fq-answer');
  
      if (!button || !answer) return;
  
      closeAll(item);
  
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  
    function closeItem(item) {
      const button = item.querySelector('.fq-question');
      const answer = item.querySelector('.fq-answer');
  
      if (!button || !answer) return;
  
      item.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = null;
  
      setTimeout(() => {
        if (!item.classList.contains('active')) {
          answer.hidden = true;
        }
      }, 250);
    }
  
    items.forEach((item) => {
      const q = item.querySelector('.fq-question');
      const answer = item.querySelector('.fq-answer');
  
      if (!q || !answer) return;
  
      answer.hidden = true;
  
      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
  
        if (isActive) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });
  
    if (input && autoWrap && Array.isArray(FAQ_DATA)) {
      function removeBox() {
        if (box) {
          box.remove();
          box = null;
        }
      }
  
      function renderAutocomplete(keyword) {
        const normalized = keyword.trim().toLowerCase();
  
        if (!normalized) {
          removeBox();
          return;
        }
  
        const matched = FAQ_DATA.filter((f) => {
          const question = (f.question || '').toLowerCase();
          const answer = (f.answer || '').replace(/<[^>]*>/g, '').toLowerCase();
  
          return question.includes(normalized) || answer.includes(normalized);
        }).slice(0, 6);
  
        removeBox();
  
        if (!matched.length) return;
  
        box = document.createElement('div');
        box.className = 'fq-autocomplete-list';
  
        matched.forEach((item) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'fq-auto-item';
  
          button.innerHTML = `
            <span class="fq-auto-item__icon"><i class="ri-search-line"></i></span>
            <span class="fq-auto-item__text">${item.question}</span>
          `;
  
          button.addEventListener('click', () => {
            input.value = item.question;
            if (input.form) input.form.submit();
          });
  
          box.appendChild(button);
        });
  
        autoWrap.appendChild(box);
      }
  
      input.addEventListener('input', () => {
        renderAutocomplete(input.value);
      });
  
      input.addEventListener('focus', () => {
        if (input.value.trim()) {
          renderAutocomplete(input.value);
        }
      });
  
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.fq-hero__search')) {
          removeBox();
        }
      });
  
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          removeBox();
        }
      });
    }
  
    window.addEventListener('resize', () => {
      const activeItem = document.querySelector('.fq-item.active');
      if (!activeItem) return;
  
      const answer = activeItem.querySelector('.fq-answer');
      if (!answer) return;
  
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  });