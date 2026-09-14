document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("tbList");
    if (!list) return;
  
    const cards = Array.from(list.querySelectorAll(".tb-card"));
  
    const regionInputs = document.querySelectorAll(".tb-filter-region");
    const themeInputs = document.querySelectorAll(".tb-filter-theme");
    const timeBandInputs = document.querySelectorAll(".tb-filter-time-band");
    const bookingTypeInputs = document.querySelectorAll(".tb-filter-booking-type");
    const courseTypeInputs = document.querySelectorAll(".tb-filter-course-type");
  
    const priceChips = document.querySelectorAll(".tb-price-chip[data-price]");
    const distanceChips = document.querySelectorAll(".tb-distance-chip[data-distance]");
    const visualButtons = document.querySelectorAll(".pr-visual-filter__btn");
  
    const resetButtons = document.querySelectorAll(".tb-filter__reset");
    const sortButtons = document.querySelectorAll(".tb-sort-btn");
    const visibleCount = document.getElementById("tbVisibleCount");
    const emptyState = document.getElementById("tbEmptyState");
    const keywordInput = document.getElementById("destinationInput");
  
    const filterToggles = document.querySelectorAll("[data-filter-toggle]");
  
    const filterModal = document.getElementById("tbFilterModal");
    const filterPanel = document.getElementById("tbFilter");
    const filterOpenButton = document.getElementById("tbFilterOpen");
    const filterCloseButtons = document.querySelectorAll("[data-filter-close]");
  
    let currentSort = "recommended";
    let currentPriceRange = "all";
    let currentDistanceRange = "all";
    let currentVisualTheme = null;
    let currentVisualDiscount = null;
  
    function getCheckedValues(nodeList) {
      return Array.from(nodeList)
        .filter((input) => input.checked)
        .map((input) => input.value);
    }
  
    function timeToNumber(value) {
      return Number(String(value || "").replace(":", ""));
    }
  
    function parseRange(rangeValue, defaultMin = 0, defaultMax = 999999999) {
      if (!rangeValue || rangeValue === "all") {
        return { min: defaultMin, max: defaultMax };
      }
  
      const [min, max] = String(rangeValue).split("-").map(Number);
  
      return {
        min: Number.isFinite(min) ? min : defaultMin,
        max: Number.isFinite(max) ? max : defaultMax,
      };
    }
  
    function sortCards() {
      const sorted = [...cards].sort((a, b) => {
        if (currentSort === "price-asc") {
          return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
        }
  
        if (currentSort === "time-asc") {
          return timeToNumber(a.dataset.firstTime) - timeToNumber(b.dataset.firstTime);
        }
  
        return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
      });
  
      sorted.forEach((card) => list.appendChild(card));
    }
  
    function filterCards() {
      const selectedRegions = getCheckedValues(regionInputs);
      const selectedThemes = getCheckedValues(themeInputs);
      const selectedTimeBands = getCheckedValues(timeBandInputs);
      const selectedBookingTypes = getCheckedValues(bookingTypeInputs);
      const selectedCourseTypes = getCheckedValues(courseTypeInputs);
  
      const keyword = (keywordInput?.value || "").trim().toLowerCase();
  
      const priceRange = parseRange(currentPriceRange);
      const distanceRange = parseRange(currentDistanceRange);
  
      let visible = 0;
  
      cards.forEach((card) => {
        const region = (card.dataset.region || "").trim();
        const theme = (card.dataset.theme || "").trim();
        const themeType = (card.dataset.themeType || "").trim();
        const discountRange = (card.dataset.discountRange || "").trim();
  
        const price = Number(card.dataset.price || 0);
        const airportDistance = Number(card.dataset.airportDistance || 0);
        const timeBand = (card.dataset.timeBand || "").trim();
        const bookingType = (card.dataset.bookingType || "").trim();
        const courseType = (card.dataset.courseType || "").trim();
  
        const name = (card.dataset.name || "").toLowerCase();
        const location = (card.dataset.location || "").toLowerCase();
  
        const matchRegion =
          selectedRegions.length === 0 || selectedRegions.includes(region);
  
        const matchTheme =
          selectedThemes.length === 0 || selectedThemes.includes(theme);
  
        const matchVisualTheme =
          currentVisualTheme === null || themeType === currentVisualTheme;
  
        const matchVisualDiscount =
          currentVisualDiscount === null || discountRange === currentVisualDiscount;
  
        const matchPrice =
          price >= priceRange.min && price <= priceRange.max;
  
        const matchDistance =
          airportDistance >= distanceRange.min &&
          airportDistance <= distanceRange.max;
  
        const matchTimeBand =
          selectedTimeBands.length === 0 || selectedTimeBands.includes(timeBand);
  
        const matchBookingType =
          selectedBookingTypes.length === 0 ||
          selectedBookingTypes.includes(bookingType);
  
        const matchCourseType =
          selectedCourseTypes.length === 0 ||
          selectedCourseTypes.includes(courseType);
  
        const matchKeyword =
          !keyword ||
          name.includes(keyword) ||
          location.includes(keyword) ||
          region.toLowerCase().includes(keyword) ||
          theme.toLowerCase().includes(keyword);
  
        const show =
          matchRegion &&
          matchTheme &&
          matchVisualTheme &&
          matchVisualDiscount &&
          matchPrice &&
          matchDistance &&
          matchTimeBand &&
          matchBookingType &&
          matchCourseType &&
          matchKeyword;
  
        card.hidden = !show;
  
        if (show) visible += 1;
      });
  
      if (visibleCount) visibleCount.textContent = String(visible);
      if (emptyState) emptyState.hidden = visible !== 0;
    }
  
    function applyAll() {
      sortCards();
      filterCards();
    }
  
    function syncVisualButtons() {
      visualButtons.forEach((button) => {
        const themeValue = button.dataset.themeVisual || null;
        const discountValue = button.dataset.discountVisual || null;
  
        const isThemeActive =
          themeValue !== null &&
          currentVisualTheme !== null &&
          themeValue === currentVisualTheme;
  
        const isDiscountActive =
          discountValue !== null &&
          currentVisualDiscount !== null &&
          discountValue === currentVisualDiscount;
  
        button.classList.toggle("is-active", isThemeActive || isDiscountActive);
      });
    }
  
    function resetAllFilters() {
      regionInputs.forEach((i) => {
        i.checked = false;
      });
  
      themeInputs.forEach((i) => {
        i.checked = false;
      });
  
      timeBandInputs.forEach((i) => {
        i.checked = false;
      });
  
      bookingTypeInputs.forEach((i) => {
        i.checked = false;
      });
  
      courseTypeInputs.forEach((i) => {
        i.checked = false;
      });
  
      if (keywordInput) {
        keywordInput.value = "";
      }
  
      currentSort = "recommended";
      currentPriceRange = "all";
      currentDistanceRange = "all";
      currentVisualTheme = null;
      currentVisualDiscount = null;
  
      sortButtons.forEach((btn) => btn.classList.remove("is-active"));
      document
        .querySelector('.tb-sort-btn[data-sort="recommended"]')
        ?.classList.add("is-active");
  
      priceChips.forEach((btn) => btn.classList.remove("is-active"));
      document
        .querySelector('.tb-price-chip[data-price="all"]')
        ?.classList.add("is-active");
  
      distanceChips.forEach((btn) => btn.classList.remove("is-active"));
      document
        .querySelector('.tb-distance-chip[data-distance="all"]')
        ?.classList.add("is-active");
  
      syncVisualButtons();
      applyAll();
    }
  
    function isMobileViewport() {
      return window.innerWidth <= 767;
    }
  
    function openFilterModal() {
      if (!filterModal || !filterPanel || !isMobileViewport()) return;
  
      filterModal.classList.add("is-open");
      filterPanel.classList.add("is-open");
      filterModal.setAttribute("aria-hidden", "false");
      filterOpenButton?.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-filter-modal-open");
    }
  
    function closeFilterModal() {
      if (!filterModal || !filterPanel) return;
  
      filterModal.classList.remove("is-open");
      filterPanel.classList.remove("is-open");
      filterModal.setAttribute("aria-hidden", "true");
      filterOpenButton?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-filter-modal-open");
    }
  
    function handleViewportChange() {
      if (!isMobileViewport()) {
        closeFilterModal();
      }
    }
  
    regionInputs.forEach((input) => input.addEventListener("change", applyAll));
    themeInputs.forEach((input) => input.addEventListener("change", applyAll));
    timeBandInputs.forEach((input) => input.addEventListener("change", applyAll));
    bookingTypeInputs.forEach((input) => input.addEventListener("change", applyAll));
    courseTypeInputs.forEach((input) => input.addEventListener("change", applyAll));
  
    keywordInput?.addEventListener("input", applyAll);
  
    priceChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        priceChips.forEach((btn) => btn.classList.remove("is-active"));
        chip.classList.add("is-active");
        currentPriceRange = chip.dataset.price || "all";
        applyAll();
      });
    });
  
    distanceChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        distanceChips.forEach((btn) => btn.classList.remove("is-active"));
        chip.classList.add("is-active");
        currentDistanceRange = chip.dataset.distance || "all";
        applyAll();
      });
    });
  
    visualButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const clickedThemeValue = btn.dataset.themeVisual || null;
        const clickedDiscountValue = btn.dataset.discountVisual || null;
  
        if (clickedThemeValue !== null) {
          currentVisualDiscount = null;
  
          if (currentVisualTheme === clickedThemeValue) {
            currentVisualTheme = null;
          } else {
            currentVisualTheme = clickedThemeValue;
          }
        }
  
        if (clickedDiscountValue !== null) {
          currentVisualTheme = null;
  
          if (currentVisualDiscount === clickedDiscountValue) {
            currentVisualDiscount = null;
          } else {
            currentVisualDiscount = clickedDiscountValue;
          }
        }
  
        syncVisualButtons();
        applyAll();
      });
    });
  
    sortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        sortButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        currentSort = button.dataset.sort || "recommended";
        applyAll();
      });
    });
  
    resetButtons.forEach((button) => {
      button.addEventListener("click", resetAllFilters);
    });
  
    filterToggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const group = toggle.closest(".tb-filter-group");
        if (!group) return;
        group.classList.toggle("is-collapsed");
      });
    });
  
    filterOpenButton?.addEventListener("click", openFilterModal);
  
    filterCloseButtons.forEach((button) => {
      button.addEventListener("click", closeFilterModal);
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeFilterModal();
      }
    });
  
    window.addEventListener("resize", handleViewportChange);
  
    document.addEventListener("tb:search", applyAll);
  
    syncVisualButtons();
    applyAll();
    handleViewportChange();
  });