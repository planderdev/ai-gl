document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("prList");
    const cards = Array.from(document.querySelectorAll(".pr-card"));
    const emptyState = document.getElementById("prEmptyState");
    const visibleCount = document.getElementById("prVisibleCount");
    const pagination = document.getElementById("prPagination");
    const categoryInputs = Array.from(document.querySelectorAll(".pr-filter-category"));
    const statusInputs = Array.from(document.querySelectorAll(".pr-filter-status"));
    const sortButtons = Array.from(document.querySelectorAll(".pr-sort-btn"));
    const resetButton = document.getElementById("prFilterReset");
  
    if (!list || !cards.length) return;
  
    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;
    let currentSort = "latest";
  
    function getCheckedValues(inputs) {
      return inputs.filter((input) => input.checked).map((input) => input.value);
    }
  
    function sortItems(items) {
      const sorted = [...items];
  
      if (currentSort === "title") {
        sorted.sort((a, b) => {
          const aTitle = (a.dataset.title || "").trim();
          const bTitle = (b.dataset.title || "").trim();
          return aTitle.localeCompare(bTitle, "ko");
        });
        return sorted;
      }
  
      if (currentSort === "ending") {
        sorted.sort((a, b) => {
          const aDate = new Date(a.dataset.endDate || "9999-12-31").getTime();
          const bDate = new Date(b.dataset.endDate || "9999-12-31").getTime();
          return aDate - bDate;
        });
        return sorted;
      }
  
      sorted.sort((a, b) => {
        const aOrder = Number(a.dataset.sortOrder || 0);
        const bOrder = Number(b.dataset.sortOrder || 0);
        return aOrder - bOrder;
      });
  
      return sorted;
    }
  
    function getFilteredCards() {
      const checkedCategories = getCheckedValues(categoryInputs);
      const checkedStatus = getCheckedValues(statusInputs);
  
      return cards.filter((card) => {
        const category = card.dataset.category || "";
        const status = card.dataset.status || "";
  
        const categoryMatch =
          checkedCategories.length === 0 || checkedCategories.includes(category);
  
        const statusMatch =
          checkedStatus.length === 0 || checkedStatus.includes(status);
  
        return categoryMatch && statusMatch;
      });
    }
  
    function renderPagination(totalPages) {
      pagination.innerHTML = "";
  
      if (totalPages <= 1) return;
  
      const prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.className = "pr-page-arrow";
      prevButton.textContent = "‹";
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage -= 1;
          render();
        }
      });
      pagination.appendChild(prevButton);
  
      for (let page = 1; page <= totalPages; page += 1) {
        const pageButton = document.createElement("button");
        pageButton.type = "button";
        pageButton.className = "pr-page-btn" + (page === currentPage ? " is-active" : "");
        pageButton.textContent = String(page);
        pageButton.addEventListener("click", function () {
          currentPage = page;
          render();
        });
        pagination.appendChild(pageButton);
      }
  
      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "pr-page-arrow";
      nextButton.textContent = "›";
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
          currentPage += 1;
          render();
        }
      });
      pagination.appendChild(nextButton);
    }
  
    function render() {
      const filteredCards = sortItems(getFilteredCards());
      const totalItems = filteredCards.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  
      if (currentPage > totalPages) currentPage = 1;
  
      cards.forEach((card) => {
        card.classList.add("is-hidden");
      });
  
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageItems = filteredCards.slice(startIndex, endIndex);
  
      pageItems.forEach((card) => {
        card.classList.remove("is-hidden");
      });
  
      if (visibleCount) {
        visibleCount.textContent = String(totalItems);
      }
  
      if (emptyState) {
        emptyState.hidden = totalItems !== 0;
      }
  
      renderPagination(totalPages);
    }
  
    sortButtons.forEach((button) => {
      button.addEventListener("click", function () {
        sortButtons.forEach((btn) => btn.classList.remove("is-active"));
        this.classList.add("is-active");
        currentSort = this.dataset.sort || "latest";
        currentPage = 1;
        render();
      });
    });
  
    [...categoryInputs, ...statusInputs].forEach((input) => {
      input.addEventListener("change", function () {
        currentPage = 1;
        render();
      });
    });
  
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        [...categoryInputs, ...statusInputs].forEach((input) => {
          input.checked = false;
        });
  
        currentSort = "latest";
        currentPage = 1;
  
        sortButtons.forEach((btn) => {
          btn.classList.remove("is-active");
          if (btn.dataset.sort === "latest") {
            btn.classList.add("is-active");
          }
        });
  
        render();
      });
    }
  
    render();
  });