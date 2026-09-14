document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.nt-search input');
  
    input.addEventListener('focus', () => {
      input.classList.add('active');
    });
  });