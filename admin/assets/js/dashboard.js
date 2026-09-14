document.addEventListener('DOMContentLoaded', function () {
    initDashboard();
  
    function initDashboard() {
      renderBarCharts();
      renderLineCharts();
      animateCounters();
      animateProgressBars();
      bindInteractiveStates();
    }
  
    function safeParseJSON(value, fallback) {
      if (!value) return fallback;
  
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (error) {
        return fallback;
      }
    }
  
    function formatNumber(value) {
      return (Number(value) || 0).toLocaleString('ko-KR');
    }
  
    function formatCounterValue(value, format) {
      const number = Number(value) || 0;
  
      if (format === 'currency') {
        return formatNumber(number);
      }
  
      return formatNumber(number);
    }
  
    function escapeHTML(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  
    function createEmptyState(message) {
      const empty = document.createElement('div');
      empty.className = 'dashboard-empty';
      empty.textContent = message;
      return empty;
    }
  
    function renderBarCharts() {
      document.querySelectorAll('.js-dashboard-bar-chart').forEach(function (chart) {
        const labels = safeParseJSON(chart.dataset.labels, []);
        const values = safeParseJSON(chart.dataset.values, []);
        const wrap = chart.querySelector('.dashboard-chart__bars');
  
        if (!wrap) return;
  
        wrap.innerHTML = '';
  
        if (!labels.length || !values.length) {
          chart.appendChild(createEmptyState('표시할 예약 데이터가 없습니다.'));
          return;
        }
  
        const normalizedValues = values.map(function (value) {
          return Math.max(0, Number(value) || 0);
        });
  
        const max = Math.max.apply(null, normalizedValues.concat([1]));
        const activeIndex = normalizedValues.indexOf(max);
  
        normalizedValues.forEach(function (value, index) {
          const percent = Math.max((value / max) * 100, value > 0 ? 8 : 0);
          const label = labels[index] || '';
          const item = document.createElement('div');
  
          item.className = 'dashboard-bar' + (index === activeIndex ? ' is-active' : '');
          item.setAttribute('role', 'img');
          item.setAttribute('aria-label', label + ' 예약 수 ' + formatNumber(value) + '건');
  
          item.innerHTML = `
            <div class="dashboard-bar__track">
              <div class="dashboard-bar__fill"></div>
            </div>
            <span class="dashboard-bar__label">${escapeHTML(label)}</span>
            <span class="dashboard-bar__value">${formatNumber(value)}</span>
          `;
  
          wrap.appendChild(item);
  
          const fill = item.querySelector('.dashboard-bar__fill');
          if (!fill) return;
  
          fill.style.height = '0%';
          fill.style.opacity = '0';
  
          requestAnimationFrame(function () {
            fill.style.opacity = '1';
            fill.style.transition =
              'height 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease';
            fill.style.height = percent + '%';
          });
  
          item.addEventListener('mouseenter', function () {
            item.classList.add('is-active');
          });
  
          item.addEventListener('mouseleave', function () {
            if (index !== activeIndex) {
              item.classList.remove('is-active');
            }
          });
        });
      });
    }
  
    function renderLineCharts() {
      document.querySelectorAll('.js-dashboard-line-chart').forEach(function (chart) {
        const labels = safeParseJSON(chart.dataset.labels, []);
        const values = safeParseJSON(chart.dataset.values, []);
        const wrap = chart.querySelector('.dashboard-chart__line');
  
        if (!wrap) return;
  
        wrap.innerHTML = '';
  
        if (!labels.length || !values.length) {
          chart.appendChild(createEmptyState('표시할 매출 데이터가 없습니다.'));
          return;
        }
  
        const normalizedValues = values.map(function (value) {
          return Math.max(0, Number(value) || 0);
        });
  
        const max = Math.max.apply(null, normalizedValues.concat([1]));
        const activeIndex = normalizedValues.indexOf(max);
  
        normalizedValues.forEach(function (value, index) {
          const label = labels[index] || '';
          const height = Math.max((value / max) * 180, value > 0 ? 24 : 10);
          const item = document.createElement('div');
  
          item.className = 'dashboard-line-col' + (index === activeIndex ? ' is-active' : '');
          item.setAttribute('role', 'img');
          item.setAttribute('aria-label', label + ' 매출 ' + formatNumber(value) + '원');
  
          item.innerHTML = `
            <div class="dashboard-line-col__stick"></div>
            <div class="dashboard-line-col__point"></div>
            <span class="dashboard-line-col__label">${escapeHTML(label)}</span>
            <span class="dashboard-line-col__value">${formatNumber(value)}</span>
          `;
  
          wrap.appendChild(item);
  
          const stick = item.querySelector('.dashboard-line-col__stick');
          const point = item.querySelector('.dashboard-line-col__point');
  
          if (stick) {
            stick.style.height = '0px';
            stick.style.opacity = '0';
          }
  
          if (point) {
            point.style.transform = 'scale(0.72)';
            point.style.opacity = '0';
            point.style.transition =
              'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease';
          }
  
          requestAnimationFrame(function () {
            if (stick) {
              stick.style.opacity = '1';
              stick.style.transition =
                'height 820ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease';
              stick.style.height = height + 'px';
            }
  
            if (point) {
              setTimeout(function () {
                point.style.opacity = '1';
                point.style.transform = 'scale(1)';
              }, 220 + index * 40);
            }
          });
  
          item.addEventListener('mouseenter', function () {
            item.classList.add('is-active');
          });
  
          item.addEventListener('mouseleave', function () {
            if (index !== activeIndex) {
              item.classList.remove('is-active');
            }
          });
        });
      });
    }
  
    function animateCounters() {
      const counters = document.querySelectorAll('.js-dashboard-counter');
      if (!counters.length) return;
  
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
  
            const element = entry.target;
            const targetValue = Number(element.dataset.value || 0);
            const format = element.dataset.format || 'number';
  
            animateCounter(element, targetValue, format);
            observer.unobserve(element);
          });
        },
        {
          threshold: 0.35,
        }
      );
  
      counters.forEach(function (counter) {
        observer.observe(counter);
      });
    }
  
    function animateCounter(element, targetValue, format) {
      const duration = 900;
      const start = performance.now();
  
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(targetValue * eased);
  
        element.textContent = formatCounterValue(value, format);
  
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = formatCounterValue(targetValue, format);
        }
      }
  
      requestAnimationFrame(update);
    }
  
    function animateProgressBars() {
      const targets = document.querySelectorAll(
        '.dashboard-status-row__bar span, .dashboard-region-row__bar span'
      );
  
      if (!targets.length) return;
  
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
  
            const el = entry.target;
            const targetWidth = el.style.width || '0%';
            el.dataset.targetWidth = targetWidth;
            el.style.width = '0%';
  
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                el.style.width = el.dataset.targetWidth || '0%';
              });
            });
  
            observer.unobserve(el);
          });
        },
        {
          threshold: 0.2,
        }
      );
  
      targets.forEach(function (el) {
        observer.observe(el);
      });
    }
  
    function bindInteractiveStates() {
      document.querySelectorAll('.dashboard-task-item, .dashboard-list-item, .dashboard-activity-item').forEach(function (item) {
        item.addEventListener('mouseenter', function () {
          item.style.transform = 'translateY(-1px)';
        });
  
        item.addEventListener('mouseleave', function () {
          item.style.transform = '';
        });
      });
    }
  });