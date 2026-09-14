function initBookingUI() {
    const destinationInput = document.getElementById('destinationInput');
    const destinationLayer = document.getElementById('destinationLayer');
  
    const dateTrigger = document.getElementById('dateTrigger');
    const dateValue = document.getElementById('dateValue');
  
    const personTrigger = document.getElementById('personTrigger');
    const personLayer = document.getElementById('personLayer');
    const personValue = document.getElementById('personValue');
  
    const heroSearchBtn = document.getElementById('heroSearchBtn');
  
    const dateModal = document.getElementById('dateModal');
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarCancelBtn = document.getElementById('calendarCancelBtn');
    const calendarConfirmBtn = document.getElementById('calendarConfirmBtn');
  
    let selectedDate = null;
    let tempSelectedDate = null;
    let currentViewDate = new Date();
  
    function closeAllLayers() {
      if (destinationLayer) destinationLayer.classList.remove('is-open');
      if (personLayer) personLayer.classList.remove('is-open');
    }
  
    function openDateModal() {
      if (!dateModal) return;
      tempSelectedDate = selectedDate;
      dateModal.classList.add('is-open');
      dateModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderCalendar(currentViewDate);
    }
  
    function closeDateModal() {
      if (!dateModal) return;
      dateModal.classList.remove('is-open');
      dateModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  
    if (destinationInput && destinationLayer) {
        destinationInput.addEventListener('focus', function () {
          if (window.innerWidth <= 767) {
            destinationLayer.classList.remove('is-open');
            return;
          }
      
          closeAllLayers();
          destinationLayer.classList.add('is-open');
        });
      
        destinationInput.addEventListener('click', function (e) {
          e.stopPropagation();
      
          if (window.innerWidth <= 767) {
            destinationLayer.classList.remove('is-open');
            return;
          }
      
          destinationLayer.classList.add('is-open');
        });
      
        destinationInput.addEventListener('input', function () {
          if (window.innerWidth <= 767) {
            destinationLayer.classList.remove('is-open');
            return;
          }
      
          destinationLayer.classList.add('is-open');
        });
      }
  
    if (personTrigger && personLayer) {
      personTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = personLayer.classList.contains('is-open');
        closeAllLayers();
        if (!isOpen) personLayer.classList.add('is-open');
      });
    }
  
    if (dateTrigger) {
      dateTrigger.addEventListener('click', function () {
        closeAllLayers();
        openDateModal();
      });
    }
  
    document.querySelectorAll('[data-destination]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (destinationInput) {
          destinationInput.value = this.dataset.destination;
        }
        if (destinationLayer) destinationLayer.classList.remove('is-open');
      });
    });
  
    document.querySelectorAll('[data-person]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (personValue) personValue.textContent = this.dataset.person;
        if (personLayer) personLayer.classList.remove('is-open');
      });
    });
  
    document.addEventListener('click', function (e) {
      const clickedInsideDestination =
        destinationLayer && destinationLayer.contains(e.target);
      const clickedDestinationInput =
        destinationInput && destinationInput.contains(e.target);
  
      const clickedInsidePerson =
        personLayer && personLayer.contains(e.target);
      const clickedPersonTrigger =
        personTrigger && personTrigger.contains(e.target);
  
      if (!clickedInsideDestination && !clickedDestinationInput && destinationLayer) {
        destinationLayer.classList.remove('is-open');
      }
  
      if (!clickedInsidePerson && !clickedPersonTrigger && personLayer) {
        personLayer.classList.remove('is-open');
      }
    });
  
    function formatDate(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  
    function isSameDate(a, b) {
      return (
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
      );
    }
  
    function renderCalendar(viewDate) {
      if (!calendarTitle || !calendarGrid) return;
  
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
  
      calendarTitle.textContent = `${year} ${month + 1}월`;
      calendarGrid.innerHTML = '';
  
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('button');
        empty.type = 'button';
        empty.className = 'calendar-date empty';
        empty.disabled = true;
        calendarGrid.appendChild(empty);
      }
  
      for (let day = 1; day <= lastDate; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
  
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-date';
        btn.textContent = day;
  
        if (date < today) {
          btn.classList.add('disabled');
          btn.disabled = true;
        }
  
        if (tempSelectedDate && isSameDate(date, tempSelectedDate)) {
          btn.classList.add('selected');
        }
  
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          tempSelectedDate = new Date(year, month, day);
          renderCalendar(currentViewDate);
        });
  
        calendarGrid.appendChild(btn);
      }
    }
  
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', function () {
        currentViewDate = new Date(
          currentViewDate.getFullYear(),
          currentViewDate.getMonth() - 1,
          1
        );
        renderCalendar(currentViewDate);
      });
    }
  
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', function () {
        currentViewDate = new Date(
          currentViewDate.getFullYear(),
          currentViewDate.getMonth() + 1,
          1
        );
        renderCalendar(currentViewDate);
      });
    }
  
    if (calendarCancelBtn) {
      calendarCancelBtn.addEventListener('click', function () {
        tempSelectedDate = selectedDate;
        closeDateModal();
      });
    }
  
    if (calendarConfirmBtn) {
      calendarConfirmBtn.addEventListener('click', function () {
        if (tempSelectedDate) {
          selectedDate = tempSelectedDate;
          if (dateValue) dateValue.textContent = formatDate(selectedDate);
        }
        closeDateModal();
      });
    }
  
    if (dateModal) {
      dateModal.addEventListener('click', function (e) {
        if (
          e.target.classList.contains('booking-modal') ||
          e.target.classList.contains('booking-modal-dim')
        ) {
          closeDateModal();
        }
      });
    }
  
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllLayers();
        closeDateModal();
      }
    });
  
    if (heroSearchBtn) {
      heroSearchBtn.addEventListener('click', function () {
        const destination = destinationInput ? destinationInput.value.trim() : '';
        const date = dateValue ? dateValue.textContent.trim() : '';
        const person = personValue ? personValue.textContent.trim() : '';
  
        alert(`검색 조건\n\n목적지: ${destination}\n날짜: ${date}\n인원: ${person}`);
      });
    }
  }