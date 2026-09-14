document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initSummaryPreview();
    initChecklist();
    initRepeaters();
    initCourseSummary();
    initPriceCalculator();
    initTypePanels();
    initCountryRegionFilter();
    initConsultOnlySync();
    initGalleryCoverSync();
    initItineraryTypeStyle();
    initFrontFilterFields();
    initHotelPresetSync();

  
    function initFrontFilterFields() {
        const countrySelect = document.querySelector('.js-front-country-select');
        const regionSelect = document.querySelector('.js-front-region-select');
        const displayRegionInput = document.querySelector('.js-display-region-input');
        const breadcrumbCountryInput = document.querySelector('.js-breadcrumb-country-input');
        const breadcrumbRegionInput = document.querySelector('.js-breadcrumb-region-input');
        const bookingTypeSelect = document.querySelector('.js-booking-type-select');
      
        if (!countrySelect || !regionSelect) return;
      
        const regionOptions = Array.from(regionSelect.querySelectorAll('option[data-country]'));
      
        function syncRegionOptions() {
          const country = countrySelect.value || '';
      
          regionOptions.forEach((option) => {
            const matched = option.dataset.country === country;
            option.hidden = !matched;
            option.disabled = !matched;
          });
      
          const selectedOption = regionSelect.options[regionSelect.selectedIndex];
          if (selectedOption && selectedOption.dataset.country && selectedOption.dataset.country !== country) {
            regionSelect.value = '';
          }
        }
      
        function syncDisplayFields() {
          const country = countrySelect.value || '';
          const region = regionSelect.value || '';
      
          if (displayRegionInput && displayRegionInput.value.trim() === '') {
            displayRegionInput.value = [country, region].filter(Boolean).join(' / ');
          }
      
          if (breadcrumbCountryInput && breadcrumbCountryInput.value.trim() === '') {
            breadcrumbCountryInput.value = country;
          }
      
          if (breadcrumbRegionInput && breadcrumbRegionInput.value.trim() === '') {
            breadcrumbRegionInput.value = region;
          }
        }
      
        function syncInstantTheme() {
          if (!bookingTypeSelect) return;
      
          const instantTheme = document.querySelector('input[name="themes[]"][value="실시간티타임"]');
          if (!instantTheme) return;
      
          if (bookingTypeSelect.value === 'instant') {
            instantTheme.checked = true;
          }
        }
      
        countrySelect.addEventListener('change', function () {
          syncRegionOptions();
          syncDisplayFields();
        });
      
        regionSelect.addEventListener('change', syncDisplayFields);
      
        if (bookingTypeSelect) {
          bookingTypeSelect.addEventListener('change', syncInstantTheme);
        }
      
        syncRegionOptions();
        syncDisplayFields();
        syncInstantTheme();
      }

      

      function initHotelPresetSync() {
        const presetSelect = document.querySelector('.js-hotel-preset-select');
        if (!presetSelect) return;
      
        const hotelIdInput = document.querySelector('.js-hotel-id-input');
        const nameField = document.querySelector('input[name="hotel_name"]');
        const checkinField = document.querySelector('input[name="hotel_checkin_out"]');
        const phoneField = document.querySelector('input[name="hotel_phone"]');
        const websiteField = document.querySelector('input[name="hotel_website"]');
        const addressField = document.querySelector('input[name="hotel_address"]');
        const descriptionField = document.querySelector('textarea[name="hotel_description"]');
        const galleryList = document.querySelector('.hotel-gallery-list');
        const addGalleryButton = document.querySelector('.js-add-gallery-block[data-gallery-target="hotel-gallery-list"]');
      
        function fillField(field, value) {
          if (!field) return;
          field.value = value || '';
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      
        function clearGallery() {
          if (!galleryList) return;
          galleryList.innerHTML = '';
        }
      
        function rebuildGallery(items) {
          if (!galleryList) return;
      
          clearGallery();
      
          const galleryItems = Array.isArray(items) && items.length
            ? items
            : [{ url: '', caption: '', alt: '', is_cover: 1 }];
      
          galleryItems.forEach((item) => {
            if (addGalleryButton) {
              addGalleryButton.click();
            }
      
            const block = galleryList.lastElementChild;
            if (!block) return;
      
            const hiddenUrl = block.querySelector('.js-gallery-url');
            const captionInput = block.querySelector('input[name*="[caption]"]');
            const altInput = block.querySelector('input[name*="[alt]"]');
            const coverRadio = block.querySelector('.js-gallery-cover');
            const coverHidden = block.querySelector('.js-gallery-cover-hidden');
            const preview = block.querySelector('.gallery-upload-row__preview');
      
            if (hiddenUrl) hiddenUrl.value = item.url || '';
            if (captionInput) captionInput.value = item.caption || '';
            if (altInput) altInput.value = item.alt || '';
            if (coverHidden) coverHidden.value = item.is_cover ? '1' : '0';
            if (coverRadio) coverRadio.checked = !!item.is_cover;
            if (preview) {
              preview.innerHTML = item.url
                ? `<img src="${item.url}" alt="${item.alt || '호텔 이미지'}">`
                : '미리보기';
            }
          });
      
          if (typeof reindexGalleryList === 'function') {
            reindexGalleryList(galleryList, 'hotel_gallery');
          }
        }
      
        function applySelectedHotel() {
          const selected = presetSelect.options[presetSelect.selectedIndex];
          if (!selected) return;
      
          const selectedId = selected.dataset.id || presetSelect.value || '0';
      
          if (hotelIdInput) {
            hotelIdInput.value = selectedId === '0' ? '0' : selectedId;
          }
      
          if (!presetSelect.value || presetSelect.value === '0') {
            return;
          }
      
          fillField(nameField, selected.dataset.name || '');
          fillField(checkinField, selected.dataset.checkinOut || '');
          fillField(phoneField, selected.dataset.phone || '');
          fillField(websiteField, selected.dataset.website || '');
          fillField(addressField, selected.dataset.address || '');
          fillField(descriptionField, selected.dataset.description || '');
      
          let gallery = [];
          try {
            gallery = JSON.parse(selected.dataset.gallery || '[]');
          } catch (error) {
            gallery = [];
          }
      
          rebuildGallery(gallery);
        }
      
        presetSelect.addEventListener('change', applySelectedHotel);
      
        if (presetSelect.value && presetSelect.value !== '0' && hotelIdInput && !hotelIdInput.value) {
          applySelectedHotel();
        }
      }

    function initTabs() {
      const wrap = document.querySelector('.js-product-tabs');
      if (!wrap) return;
  
      const buttons = wrap.querySelectorAll('[data-tab-target]');
      const panels = wrap.querySelectorAll('[data-tab-panel]');
      const currentTabInput = document.querySelector('.js-current-tab-input');
  
      buttons.forEach((button) => {
        button.addEventListener('click', function () {
          const target = button.dataset.tabTarget;
  
          buttons.forEach((btn) => btn.classList.remove('is-active'));
          panels.forEach((panel) => panel.classList.remove('is-active'));
  
          button.classList.add('is-active');
          const targetPanel = wrap.querySelector(`[data-tab-panel="${target}"]`);
          if (targetPanel) targetPanel.classList.add('is-active');
          if (currentTabInput) currentTabInput.value = target;
        });
      });
    }
  
    function initSummaryPreview() {
      const title = document.querySelector('.js-summary-title');
      const subtitle = document.querySelector('.js-summary-subtitle');
      const summary = document.querySelector('.js-summary-text');
      const badge = document.querySelector('.js-sidebar-badge-input');
      const status = document.querySelector('.js-summary-status-select');
      const salePrice = document.querySelector('.js-sale-price');
      const currency = document.querySelector('.js-currency-select');
      const country = document.querySelector('[name="country"]');
      const region = document.querySelector('[name="region"]');
      const hotel = document.querySelector('.js-hotel-input');
      const golf = document.querySelector('.js-golf-input');
      const airport = document.querySelector('.js-airport-input');
  
      const titleTarget = document.querySelector('.js-sidebar-preview-title');
      const summaryTarget = document.querySelector('.js-sidebar-preview-summary');
      const badgeTarget = document.querySelector('.js-sidebar-preview-badge');
      const regionTarget = document.querySelector('.js-sidebar-preview-region');
      const priceTarget = document.querySelector('.js-sidebar-preview-price');
      const statusTarget = document.querySelector('.js-summary-status-text');
  
      const detailTitle = document.querySelector('.js-detail-preview-title');
      const detailSubtitle = document.querySelector('.js-detail-preview-subtitle');
      const detailHotel = document.querySelector('.js-detail-preview-hotel');
      const detailGolf = document.querySelector('.js-detail-preview-golf');
      const detailAirport = document.querySelector('.js-detail-preview-airport');
      const detailItinerary = document.querySelector('.js-detail-preview-itinerary');
  
      function render() {
        if (titleTarget) titleTarget.textContent = title?.value?.trim() || '상품명을 입력하세요';
        if (summaryTarget) summaryTarget.textContent = summary?.value?.trim() || '상품 요약 문구가 여기에 표시됩니다.';
        if (badgeTarget) badgeTarget.textContent = badge?.value?.trim() || '라벨';
        if (regionTarget) {
          const regionText = [country?.value?.trim() || '', region?.value?.trim() || ''].filter(Boolean).join(' · ');
          regionTarget.textContent = regionText || '국가 · 지역';
        }
        if (priceTarget) {
          const price = parseInt(salePrice?.value || '0', 10);
          const currencyText = currency?.value || 'KRW';
          priceTarget.textContent = price > 0 ? `${price.toLocaleString()} ${currencyText}` : '가격 미입력';
        }
        if (statusTarget && status) {
          const labelMap = {
            draft: '임시저장',
            publish: '공개',
            hidden: '숨김',
            soldout: '판매중지'
          };
          statusTarget.textContent = labelMap[status.value] || '임시저장';
        }
  
        if (detailTitle) detailTitle.textContent = title?.value?.trim() || '상품명';
        if (detailSubtitle) detailSubtitle.textContent = subtitle?.value?.trim() || '서브타이틀';
        if (detailHotel) detailHotel.textContent = hotel?.value?.trim() || '-';
        if (detailGolf) detailGolf.textContent = golf?.value?.trim() || title?.value?.trim() || '-';
        if (detailAirport) detailAirport.textContent = airport?.value?.trim() || '-';
  
        const dayLabels = document.querySelectorAll('.itinerary-day input[name*="[day_label]"]');
        if (detailItinerary) {
          detailItinerary.textContent = dayLabels.length ? `${dayLabels.length}일차 구성` : '미입력';
        }
  
        updateTabMeta();
      }
  
      [title, subtitle, summary, badge, status, salePrice, currency, country, region, hotel, golf, airport].forEach((el) => {
        if (el) {
          el.addEventListener('input', render);
          el.addEventListener('change', render);
        }
      });
  
      render();
    }
  
    function initChecklist() {
      const items = document.querySelectorAll('.js-check-item');
      if (!items.length) return;
  
      function getFilled(targetName) {
        if (targetName === 'thumbnail') {
          const thumbInput = document.querySelector('.js-thumbnail-input');
          return !!thumbInput?.value?.trim();
        }
  
        if (targetName === 'itinerary_days') {
          return document.querySelectorAll('.itinerary-day').length > 0;
        }
  
        const field = document.querySelector(`[name="${targetName}"]`);
        return !!field?.value?.trim();
      }
  
      function render() {
        items.forEach((item) => {
          const target = item.dataset.checkTarget;
          const filled = getFilled(target);
          item.classList.toggle('is-complete', filled);
        });
      }
  
      document.addEventListener('input', render);
      document.addEventListener('change', render);
      render();
    }
  
    function moveElement(element, direction) {
      if (!element) return;
      const sibling = direction === 'up' ? element.previousElementSibling : element.nextElementSibling;
      if (!sibling) return;
  
      if (direction === 'up') {
        element.parentNode.insertBefore(element, sibling);
      } else {
        element.parentNode.insertBefore(sibling, element);
      }
    }
  
    function duplicateElement(element) {
      if (!element) return null;
      const clone = element.cloneNode(true);
  
      clone.querySelectorAll('input, textarea, select').forEach((field) => {
        if (field.type === 'file') {
          field.value = '';
        } else if (field.type === 'radio' || field.type === 'checkbox') {
          field.checked = false;
        } else if (field.classList.contains('js-gallery-cover-hidden')) {
          field.value = '0';
        }
      });
  
      element.parentNode.insertBefore(clone, element.nextSibling);
      return clone;
    }
  
    function reindexGalleryList(list, prefix) {
      const items = list.querySelectorAll('.gallery-block-item');
      items.forEach((item, index) => {
        const hiddenUrl = item.querySelector('.js-gallery-url');
        if (hiddenUrl) hiddenUrl.name = `${prefix}[${index}][url]`;
  
        const caption = item.querySelector('input[name*="[caption]"]');
        if (caption) caption.name = `${prefix}[${index}][caption]`;
  
        const alt = item.querySelector('input[name*="[alt]"]');
        if (alt) alt.name = `${prefix}[${index}][alt]`;
  
        const coverHidden = item.querySelector('.js-gallery-cover-hidden');
        if (coverHidden) coverHidden.name = `${prefix}[${index}][is_cover]`;
  
        const radio = item.querySelector('.js-gallery-cover');
        if (radio) {
          radio.dataset.itemIndex = String(index);
        }
      });
    }
  
    function reindexItinerary() {
      const days = document.querySelectorAll('.itinerary-day');
      days.forEach((day, dayIndex) => {
        const dayLabel = day.querySelector('input[name*="[day_label]"]');
        if (dayLabel) {
          dayLabel.name = `itinerary_days[${dayIndex}][day_label]`;
        }
  
        const items = day.querySelectorAll('.itinerary-item');
        items.forEach((item, itemIndex) => {
          const type = item.querySelector('select');
          const title = item.querySelector('input[name*="[title]"]');
          const meta = item.querySelector('input[name*="[meta]"]');
          const description = item.querySelector('textarea');
  
          if (type) type.name = `itinerary_days[${dayIndex}][items][${itemIndex}][type]`;
          if (title) title.name = `itinerary_days[${dayIndex}][items][${itemIndex}][title]`;
          if (meta) meta.name = `itinerary_days[${dayIndex}][items][${itemIndex}][meta]`;
          if (description) description.name = `itinerary_days[${dayIndex}][items][${itemIndex}][description]`;
        });
      });
    }
  
    function setItemTypeClass(item) {
      if (!item) return;
      const select = item.querySelector('.js-itinerary-type-select');
      const value = select?.value || '자유시간';
  
      item.classList.remove('is-move', 'is-golf', 'is-hotel', 'is-free');
  
      if (value === '이동') item.classList.add('is-move');
      else if (value === '골프') item.classList.add('is-golf');
      else if (value === '호텔') item.classList.add('is-hotel');
      else item.classList.add('is-free');
  
      const badge = item.querySelector('.itinerary-item__type-badge');
      if (badge) badge.textContent = value;
    }
  
    function initRepeaters() {
      document.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.js-remove-repeater-item');
        if (removeBtn) {
          const item = removeBtn.closest('.repeater-item') || removeBtn.closest('.itinerary-item') || removeBtn.closest('.itinerary-day');
          if (item) item.remove();
  
          document.querySelectorAll('.js-gallery-block').forEach((list) => {
            const prefix = list.classList.contains('hotel-gallery-list')
              ? 'hotel_gallery'
              : list.classList.contains('golf-gallery-list')
                ? 'golf_gallery'
                : 'gallery';
            reindexGalleryList(list, prefix);
          });
  
          reindexItinerary();
          updateTabMeta();
          return;
        }
  
        const addSimpleBtn = e.target.closest('.js-add-simple-repeater');
        if (addSimpleBtn) {
          const targetClass = addSimpleBtn.dataset.targetList;
          const inputName = addSimpleBtn.dataset.inputName;
          const list = document.querySelector(`.${targetClass}`);
          if (!list) return;
  
          const index = list.querySelectorAll('.repeater-item').length;
          const wrapper = document.createElement('div');
          wrapper.className = 'repeater-item repeater-item--inline';
  
          if (inputName === 'facilities') {
            wrapper.innerHTML = `
              <input type="text" name="facilities[${index}][label]" class="admin-input" placeholder="예: 클럽하우스">
              <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
            `;
          } else {
            wrapper.innerHTML = `
              <input type="text" name="${inputName}[${index}]" class="admin-input" placeholder="값 입력">
              <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
            `;
          }
  
          list.appendChild(wrapper);
          updateTabMeta();
          return;
        }
  
        const addGalleryBtn = e.target.closest('.js-add-gallery-block');
        if (addGalleryBtn) {
          const targetClass = addGalleryBtn.dataset.galleryTarget;
          const prefix = addGalleryBtn.dataset.galleryPrefix || 'gallery';
          const list = document.querySelector(`.${targetClass}`);
          if (!list) return;
  
          const index = list.querySelectorAll('.gallery-block-item').length;
          const wrapper = document.createElement('div');
          wrapper.className = 'repeater-item gallery-block-item';
          wrapper.innerHTML = `
            <div class="gallery-upload-row">
              <div class="gallery-upload-row__preview">미리보기</div>
              <div class="gallery-upload-row__fields">
                <input type="hidden" name="${prefix}[${index}][url]" class="js-gallery-url" value="">
                <div class="admin-form-grid admin-form-grid--2">
                  <div class="admin-field">
                    <label class="admin-label">캡션</label>
                    <input type="text" name="${prefix}[${index}][caption]" class="admin-input" value="">
                  </div>
                  <div class="admin-field">
                    <label class="admin-label">ALT</label>
                    <input type="text" name="${prefix}[${index}][alt]" class="admin-input" value="">
                  </div>
                </div>
                <label class="admin-switch-row">
                  <span>대표컷</span>
                  <input type="radio" name="${prefix}_cover" class="js-gallery-cover" data-cover-target="${prefix}" data-item-index="${index}">
                </label>
                <input type="hidden" name="${prefix}[${index}][is_cover]" value="0" class="js-gallery-cover-hidden">
                <div class="gallery-upload-row__actions">
                  <input type="file" class="js-image-upload" data-upload-type="product_gallery" data-target="gallery-item" accept="image/*">
                  <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-up">위로</button>
                  <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-gallery-move-down">아래로</button>
                  <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-gallery-item">복제</button>
                  <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
                </div>
              </div>
            </div>
          `;
          list.appendChild(wrapper);
          reindexGalleryList(list, prefix);
          updateTabMeta();
          return;
        }
  
        const duplicateGalleryBtn = e.target.closest('.js-duplicate-gallery-item');
        if (duplicateGalleryBtn) {
          const item = duplicateGalleryBtn.closest('.gallery-block-item');
          const list = duplicateGalleryBtn.closest('.js-gallery-block');
          if (!item || !list) return;
  
          duplicateElement(item);
          const prefix = list.classList.contains('hotel-gallery-list')
            ? 'hotel_gallery'
            : list.classList.contains('golf-gallery-list')
              ? 'golf_gallery'
              : 'gallery';
          reindexGalleryList(list, prefix);
          return;
        }
  
        const moveUpGalleryBtn = e.target.closest('.js-gallery-move-up');
        if (moveUpGalleryBtn) {
          const item = moveUpGalleryBtn.closest('.gallery-block-item');
          const list = moveUpGalleryBtn.closest('.js-gallery-block');
          moveElement(item, 'up');
          if (list) {
            const prefix = list.classList.contains('hotel-gallery-list')
              ? 'hotel_gallery'
              : list.classList.contains('golf-gallery-list')
                ? 'golf_gallery'
                : 'gallery';
            reindexGalleryList(list, prefix);
          }
          return;
        }
  
        const moveDownGalleryBtn = e.target.closest('.js-gallery-move-down');
        if (moveDownGalleryBtn) {
          const item = moveDownGalleryBtn.closest('.gallery-block-item');
          const list = moveDownGalleryBtn.closest('.js-gallery-block');
          moveElement(item, 'down');
          if (list) {
            const prefix = list.classList.contains('hotel-gallery-list')
              ? 'hotel_gallery'
              : list.classList.contains('golf-gallery-list')
                ? 'golf_gallery'
                : 'gallery';
            reindexGalleryList(list, prefix);
          }
          return;
        }
  
        const addDayBtn = e.target.closest('.js-add-day');
        if (addDayBtn) {
          const wrap = document.querySelector('.js-itinerary-days');
          if (!wrap) return;
  
          const day = document.createElement('div');
          day.className = 'itinerary-day';
          day.innerHTML = `
            <div class="itinerary-day__toolbar">
              <span class="itinerary-day__badge">DAY</span>
              <div class="itinerary-day__toolbar-actions">
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-move-day-up">위로</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-move-day-down">아래로</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-day">복제</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
              </div>
            </div>
            <div class="itinerary-day__head">
              <input type="text" class="admin-input" placeholder="예: 1일차">
              <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-add-item">항목 추가</button>
            </div>
            <div class="itinerary-items"></div>
          `;
          wrap.appendChild(day);
          reindexItinerary();
          updateTabMeta();
          return;
        }
  
        const duplicateDayBtn = e.target.closest('.js-duplicate-day');
        if (duplicateDayBtn) {
          const day = duplicateDayBtn.closest('.itinerary-day');
          if (!day) return;
          duplicateElement(day);
          reindexItinerary();
          return;
        }
  
        const moveDayUpBtn = e.target.closest('.js-move-day-up');
        if (moveDayUpBtn) {
          const day = moveDayUpBtn.closest('.itinerary-day');
          moveElement(day, 'up');
          reindexItinerary();
          return;
        }
  
        const moveDayDownBtn = e.target.closest('.js-move-day-down');
        if (moveDayDownBtn) {
          const day = moveDayDownBtn.closest('.itinerary-day');
          moveElement(day, 'down');
          reindexItinerary();
          return;
        }
  
        const addItemBtn = e.target.closest('.js-add-item');
        if (addItemBtn) {
          const day = addItemBtn.closest('.itinerary-day');
          const itemWrap = day?.querySelector('.itinerary-items');
          if (!day || !itemWrap) return;
  
          const item = document.createElement('div');
          item.className = 'itinerary-item is-free';
          item.innerHTML = `
            <div class="itinerary-item__topbar">
              <span class="itinerary-item__type-badge">자유시간</span>
              <div class="itinerary-item__topbar-actions">
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-move-item-up">위로</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-move-item-down">아래로</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-duplicate-item">복제</button>
                <button type="button" class="admin-btn admin-btn--light admin-btn--sm js-remove-repeater-item">삭제</button>
              </div>
            </div>
            <select class="admin-select js-itinerary-type-select">
              <option value="이동">이동</option>
              <option value="골프">골프</option>
              <option value="호텔">호텔</option>
              <option value="자유시간" selected>자유시간</option>
            </select>
            <input type="text" class="admin-input" placeholder="제목">
            <input type="text" class="admin-input" placeholder="시간 / 위치">
            <textarea class="admin-textarea" placeholder="설명"></textarea>
          `;
          itemWrap.appendChild(item);
          reindexItinerary();
          updateTabMeta();
          return;
        }
  
        const duplicateItemBtn = e.target.closest('.js-duplicate-item');
        if (duplicateItemBtn) {
          const item = duplicateItemBtn.closest('.itinerary-item');
          if (!item) return;
          duplicateElement(item);
          reindexItinerary();
          return;
        }
  
        const moveItemUpBtn = e.target.closest('.js-move-item-up');
        if (moveItemUpBtn) {
          const item = moveItemUpBtn.closest('.itinerary-item');
          moveElement(item, 'up');
          reindexItinerary();
          return;
        }
  
        const moveItemDownBtn = e.target.closest('.js-move-item-down');
        if (moveItemDownBtn) {
          const item = moveItemDownBtn.closest('.itinerary-item');
          moveElement(item, 'down');
          reindexItinerary();
        }
      });
  
      document.addEventListener('change', function (e) {
        const radio = e.target.closest('.js-gallery-cover');
        if (radio) {
          const prefix = radio.dataset.coverTarget;
          const list = radio.closest('.js-gallery-block');
          if (!list) return;
  
          list.querySelectorAll('.js-gallery-cover-hidden').forEach((hidden) => {
            hidden.value = '0';
          });
  
          const item = radio.closest('.gallery-block-item');
          const hidden = item?.querySelector('.js-gallery-cover-hidden');
          if (hidden) hidden.value = '1';
        }
  
        const typeSelect = e.target.closest('.js-itinerary-type-select');
        if (typeSelect) {
          setItemTypeClass(typeSelect.closest('.itinerary-item'));
        }
      });
    }
  
    function initCourseSummary() {
      const parts = document.querySelectorAll('.js-course-part');
      const summary = document.querySelector('.js-course-summary');
      if (!parts.length || !summary) return;
  
      function render() {
        const holes = document.querySelector('[name="holes"]')?.value?.trim() || '';
        const par = document.querySelector('[name="par"]')?.value?.trim() || '';
        const yard = document.querySelector('[name="yard"]')?.value?.trim() || '';
  
        const segments = [];
        if (yard) segments.push(`${yard} yard`);
        if (holes) segments.push(`${holes}홀`);
        if (par) segments.push(`Par ${par}`);
  
        if (!summary.dataset.userEdited || !summary.value.trim()) {
          summary.value = segments.join(' / ');
        }
      }
  
      summary.addEventListener('input', function () {
        summary.dataset.userEdited = 'true';
      });
  
      parts.forEach((part) => {
        part.addEventListener('input', render);
      });
  
      render();
    }
  
    function initPriceCalculator() {
      const base = document.querySelector('.js-base-price');
      const sale = document.querySelector('.js-sale-price');
      const deposit = document.querySelector('.js-deposit-price');
      const remaining = document.querySelector('.js-remaining-price');
      const discountTarget = document.querySelector('.js-summary-discount-text');
      const priceText = document.querySelector('.js-summary-price-text');
      const currency = document.querySelector('.js-currency-select');
  
      function render() {
        const basePrice = parseInt(base?.value || '0', 10);
        const salePrice = parseInt(sale?.value || '0', 10);
        const depositPrice = parseInt(deposit?.value || '0', 10);
        const currencyText = currency?.value || 'KRW';
  
        if (remaining) {
          remaining.value = salePrice > 0 && depositPrice >= 0 ? Math.max(salePrice - depositPrice, 0) : 0;
        }
  
        if (discountTarget) {
          if (basePrice > 0 && salePrice > 0 && salePrice < basePrice) {
            const rate = Math.round(((basePrice - salePrice) / basePrice) * 100);
            discountTarget.textContent = `${rate}%`;
          } else {
            discountTarget.textContent = '-';
          }
        }
  
        if (priceText) {
          priceText.textContent = salePrice > 0 ? `${salePrice.toLocaleString()} ${currencyText}` : '미입력';
        }
      }
  
      [base, sale, deposit, currency].forEach((el) => {
        if (el) {
          el.addEventListener('input', render);
          el.addEventListener('change', render);
        }
      });
  
      render();
    }
  
    function initTypePanels() {
      const type = document.querySelector('[name="product_type"]');
      const panels = document.querySelectorAll('.js-type-panel');
      if (!type || !panels.length) return;
  
      function render() {
        const value = type.value;
        panels.forEach((panel) => {
          const allow = (panel.dataset.typePanel || '').split(' ').includes(value);
          panel.style.display = allow ? '' : 'none';
        });
      }
  
      render();
    }
  
    function initCountryRegionFilter() {
      const countrySelect = document.querySelector('.js-country-select');
      const regionSelect = document.querySelector('.js-region-select');
  
      if (!countrySelect || !regionSelect) return;
  
      function filterRegions() {
        const selectedCountry = countrySelect.value;
        const options = Array.from(regionSelect.options);
  
        options.forEach((option, index) => {
          if (index === 0) {
            option.hidden = false;
            return;
          }
  
          const optionCountry = option.dataset.country || '';
          const visible = !selectedCountry || optionCountry === selectedCountry;
  
          option.hidden = !visible;
  
          if (!visible && option.selected) {
            regionSelect.value = '';
          }
        });
      }
  
      countrySelect.addEventListener('change', filterRegions);
      filterRegions();
    }
  
    function initConsultOnlySync() {
      const consultOnly = document.querySelector('[name="consult_only"]');
      const hidePrice = document.querySelector('[name="hide_price"]');
  
      if (!consultOnly || !hidePrice) return;
  
      function syncHidePrice() {
        if (consultOnly.checked) {
          hidePrice.checked = true;
        }
      }
  
      consultOnly.addEventListener('change', syncHidePrice);
      syncHidePrice();
    }
  
    function initGalleryCoverSync() {
      document.querySelectorAll('.js-gallery-block').forEach((list) => {
        const checked = list.querySelector('.js-gallery-cover:checked');
        if (checked) {
          const item = checked.closest('.gallery-block-item');
          const hidden = item?.querySelector('.js-gallery-cover-hidden');
          if (hidden) hidden.value = '1';
        }
      });
    }
  
    function initItineraryTypeStyle() {
      document.querySelectorAll('.itinerary-item').forEach((item) => setItemTypeClass(item));
    }
  
    function updateTabMeta() {
      const map = {
        basic: ['title', 'country', 'region'],
        location: ['address'],
        general: ['hotel_name', 'golf_intro'],
        price: ['sale_price'],
        availability: ['booking_open_start'],
        cancel: ['cancel_policy_type'],
        payment: ['payment_timing'],
        information: ['description']
      };
  
      document.querySelectorAll('.js-tab-meta').forEach((meta) => {
        const key = meta.dataset.tabMeta;
        const fields = map[key] || [];
        const total = fields.length;
        let complete = 0;
  
        fields.forEach((name) => {
          const field = document.querySelector(`[name="${name}"]`);
          if (field && field.value && String(field.value).trim() !== '') complete += 1;
        });
  
        if (key === 'information') {
          const dayCount = document.querySelectorAll('.itinerary-day').length;
          if (dayCount > 0) complete += 1;
        }
  
        if (total === 0) {
          meta.textContent = '';
          return;
        }
  
        meta.textContent = `${Math.min(complete, total)}/${total}`;
      });
    }
  });


  document.addEventListener('DOMContentLoaded', function () {
    initFacilityPicker();
  
    function initFacilityPicker() {
      const picker = document.querySelector('.js-facility-picker');
      if (!picker) return;
  
      const toggles = picker.querySelectorAll('.js-facility-toggle');
      const addButton = picker.querySelector('.js-add-custom-facility');
      const customList = picker.querySelector('.js-custom-facility-list');
  
      toggles.forEach(function (toggle) {
        syncFacilityToggle(toggle);
  
        toggle.addEventListener('change', function () {
          syncFacilityToggle(toggle);
        });
      });
  
      if (addButton && customList) {
        addButton.addEventListener('click', function () {
          let nextIndex = Number(addButton.dataset.nextIndex || 100);
  
          const item = document.createElement('div');
          item.className = 'facility-custom-item';
          item.innerHTML = `
            <input
              type="text"
              name="facilities[${nextIndex}][label]"
              class="admin-input"
              value=""
              placeholder="예: 키즈존, 수영장, 발렛파킹"
            >
            <button
              type="button"
              class="admin-btn admin-btn--light admin-btn--sm js-remove-custom-facility"
            >
              삭제
            </button>
          `;
  
          customList.appendChild(item);
          addButton.dataset.nextIndex = String(nextIndex + 1);
  
          const input = item.querySelector('input');
          if (input) input.focus();
        });
  
        customList.addEventListener('click', function (event) {
          const removeButton = event.target.closest('.js-remove-custom-facility');
          if (!removeButton) return;
  
          const item = removeButton.closest('.facility-custom-item');
          if (!item) return;
  
          const items = customList.querySelectorAll('.facility-custom-item');
          if (items.length === 1) {
            const input = item.querySelector('input');
            if (input) input.value = '';
            return;
          }
  
          item.remove();
        });
      }
  
      function syncFacilityToggle(toggle) {
        const card = toggle.closest('.facility-card');
        const index = toggle.dataset.targetIndex;
        const hidden = picker.querySelector(`.js-facility-hidden[data-target-index="${index}"]`);
  
        if (toggle.checked) {
          card?.classList.add('is-active');
          if (hidden) hidden.disabled = false;
        } else {
          card?.classList.remove('is-active');
          if (hidden) hidden.disabled = true;
        }
      }
    }
  });
  