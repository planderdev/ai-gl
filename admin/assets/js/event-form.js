document.addEventListener('DOMContentLoaded', function () {
    initEventTabs();
    initEventRepeaters();
  
    function initEventTabs() {
      const wrap = document.querySelector('.js-event-form');
      if (!wrap) return;
  
      const buttons = document.querySelectorAll('.js-event-tabs [data-tab]');
      const panels = document.querySelectorAll('[data-tab-panel]');
  
      buttons.forEach((button) => {
        button.addEventListener('click', function () {
          const tab = button.dataset.tab;
  
          buttons.forEach((btn) => btn.classList.remove('is-active'));
          panels.forEach((panel) => panel.classList.remove('is-active'));
  
          button.classList.add('is-active');
  
          const target = document.querySelector(`[data-tab-panel="${tab}"]`);
          if (target) target.classList.add('is-active');
        });
      });
    }
  
    function addRepeaterItem(listSelector, templateSelector, name) {
      const list = document.querySelector(listSelector);
      const template = document.querySelector(templateSelector);
  
      if (!list || !template) return;
  
      const index = list.querySelectorAll(':scope > .repeater-item').length;
      const clone = template.content.firstElementChild.cloneNode(true);
  
      clone.querySelectorAll('[data-field]').forEach(function (field) {
        const key = field.dataset.field;
        field.name = `${name}[${index}][${key}]`;
        field.removeAttribute('data-field');
      });
  
      list.appendChild(clone);
    }
  
    function addSimpleTag(targetListSelector, name) {
      const list = document.querySelector(targetListSelector);
      if (!list) return;
  
      const index = list.querySelectorAll('.repeater-item').length;
      const item = document.createElement('div');
      item.className = 'repeater-item repeater-item--inline';
      item.innerHTML = `
        <input type="text" name="${name}[${index}]" class="admin-input" placeholder="항목 입력">
        <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
      `;
  
      list.appendChild(item);
    }
  
    function addVenueSpec(button) {
      const section = button.closest('.repeater-item');
      if (!section) return;
  
      const venueList = button.closest('.js-venue-section-list');
      const sectionIndex = venueList ? Array.from(venueList.children).indexOf(section) : 0;
      const specList = section.querySelector('.js-venue-spec-list');
      if (!specList) return;
  
      const specIndex = specList.querySelectorAll('.repeater-item').length;
      const item = document.createElement('div');
      item.className = 'repeater-item repeater-item--inline';
      item.innerHTML = `
        <input type="text" name="venue_sections[${sectionIndex}][specs][${specIndex}]" class="admin-input" placeholder="예: 18홀 / PAR 71">
        <button type="button" class="admin-btn admin-btn--light js-remove-repeater-item">삭제</button>
      `;
  
      specList.appendChild(item);
    }
  
    function initEventRepeaters() {
      document.addEventListener('click', function (e) {
        if (e.target.closest('.js-add-event-section')) {
          addRepeaterItem('.js-event-section-list', '#event-section-template', 'sections');
        }
  
        if (e.target.closest('.js-add-hero-gallery')) {
          addRepeaterItem('.js-hero-gallery-list', '#hero-gallery-template', 'hero_gallery');
        }
  
        if (e.target.closest('.js-add-featured-point')) {
          addRepeaterItem('.js-featured-point-list', '#featured-point-template', 'featured_points');
        }
  
        if (e.target.closest('.js-add-venue-section')) {
          addRepeaterItem('.js-venue-section-list', '#venue-section-template', 'venue_sections');
        }
  
        if (e.target.closest('.js-add-venue-spec')) {
          addVenueSpec(e.target.closest('.js-add-venue-spec'));
        }
  
        const simpleTagBtn = e.target.closest('.js-add-simple-tag');
        if (simpleTagBtn) {
          addSimpleTag(simpleTagBtn.dataset.targetList, simpleTagBtn.dataset.name);
        }
  
        if (e.target.closest('.js-remove-repeater-item')) {
          const item = e.target.closest('.repeater-item');
          if (item) item.remove();
        }
      });
    }
  });