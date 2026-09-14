document.addEventListener("DOMContentLoaded", () => {
    const dateField = document.querySelector(".tb-search-field--date");
  
    if (!dateField) return;
  
    dateField.addEventListener("click", () => {
      console.log("날짜 선택 레이어 연결 예정");
    });
  });