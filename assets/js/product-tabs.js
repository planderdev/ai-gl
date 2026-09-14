document.addEventListener("DOMContentLoaded", function () {
    const tabSections = document.querySelectorAll(".golf-tab-section");
  
    tabSections.forEach((section) => {
      const buttons = section.querySelectorAll(".golf-tab-btn");
      const panels = section.querySelectorAll(".golf-tab-panel");
  
      buttons.forEach((button) => {
        button.addEventListener("click", function () {
          const target = this.dataset.tab;
  
          buttons.forEach((btn) => btn.classList.remove("active"));
          panels.forEach((panel) => panel.classList.remove("active"));
  
          this.classList.add("active");
  
          const targetPanel = section.querySelector("#" + target);
          if (targetPanel) {
            targetPanel.classList.add("active");
          }
        });
      });
    });
  });