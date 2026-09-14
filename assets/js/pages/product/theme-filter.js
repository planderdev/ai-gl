document.addEventListener("DOMContentLoaded", function () {
    const visualButtons = document.querySelectorAll(".pr-visual-filter__btn");
    const list = document.getElementById("tbList");
  
    if (!visualButtons.length || !list) return;
  
    let activeThemeVisual = "";
  
    function getCards() {
      return Array.from(list.querySelectorAll(".tb-card"));
    }
  
    function getUrlThemeValue() {
      const params = new URLSearchParams(window.location.search);
      return params.get("themeVisual") || "";
    }
  
    function setUrlThemeValue(value) {
      const url = new URL(window.location.href);
  
      if (value) {
        url.searchParams.set("themeVisual", value);
      } else {
        url.searchParams.delete("themeVisual");
      }
  
      window.history.replaceState({}, "", url.toString());
    }
  
    function setActiveButton(value) {
      visualButtons.forEach((button) => {
        button.classList.toggle(
          "is-active",
          !!value && button.dataset.themeVisual === value
        );
      });
    }
  
    function applyVisualFilter() {
      const cards = getCards();
  
      cards.forEach((card) => {
        const cardThemeType = card.dataset.themeType || "";
        const isMatch = !activeThemeVisual || cardThemeType === activeThemeVisual;
  
        card.setAttribute("data-visual-match", isMatch ? "true" : "false");
      });
  
      updateVisibleCount();
      updateEmptyState();
    }
  
    function updateVisibleCount() {
      const visibleCountEl = document.getElementById("tbVisibleCount");
      if (!visibleCountEl) return;
  
      const visibleCards = getCards().filter((card) => {
        return (
          card.getAttribute("data-visual-match") !== "false" &&
          card.style.display !== "none" &&
          !card.hidden
        );
      });
  
      visibleCountEl.textContent = visibleCards.length;
    }
  
    function updateEmptyState() {
      const emptyState = document.getElementById("tbEmptyState");
      if (!emptyState) return;
  
      const hasVisible = getCards().some((card) => {
        return (
          card.getAttribute("data-visual-match") !== "false" &&
          card.style.display !== "none" &&
          !card.hidden
        );
      });
  
      emptyState.hidden = hasVisible;
    }
  
    function runAll() {
      setActiveButton(activeThemeVisual);
      applyVisualFilter();
    }
  
    visualButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const value = button.dataset.themeVisual || "";
  
        activeThemeVisual = activeThemeVisual === value ? "" : value;
  
        setUrlThemeValue(activeThemeVisual);
        runAll();
      });
    });
  
    // 기존 필터가 다시 돌 때마다 재적용
    document.addEventListener("tb:search", function () {
      applyVisualFilter();
    });
  
    document.addEventListener("tb:visual-filter-change", function () {
      applyVisualFilter();
    });
  
    // 다른 스크립트가 카드 display/hidden을 바꿔도 다시 덮어쓰기
    const observer = new MutationObserver(function () {
      applyVisualFilter();
    });
  
    observer.observe(list, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "hidden", "class"]
    });
  
    // 최초 진입
    activeThemeVisual = getUrlThemeValue();
    runAll();
  
    // 혹시 다른 스크립트가 DOMContentLoaded 직후 한 번 더 그리면 다시 적용
    requestAnimationFrame(() => applyVisualFilter());
    setTimeout(() => applyVisualFilter(), 50);
    setTimeout(() => applyVisualFilter(), 200);
  });