document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.iq-form');
    if (!form) return;
  
    const titleInput = form.querySelector('[name="title"]');
    const contentInput = form.querySelector('[name="content"]');
    const agreeInput = form.querySelector('[name="agree"]');
    const fileInput = form.querySelector('[name="file"]');
    const fileName = document.querySelector('.iq-file__name');
  
    if (fileInput && fileName) {
      fileInput.addEventListener('change', function () {
        const selected = this.files && this.files[0] ? this.files[0].name : '선택된 파일 없음';
        fileName.textContent = selected;
      });
    }
  
    form.addEventListener('submit', function (e) {
      const title = titleInput ? titleInput.value.trim() : '';
      const content = contentInput ? contentInput.value.trim() : '';
  
      if (title.length < 3) {
        alert('제목을 3자 이상 입력해주세요.');
        if (titleInput) titleInput.focus();
        e.preventDefault();
        return;
      }
  
      if (content.length < 10) {
        alert('문의 내용을 10자 이상 입력해주세요.');
        if (contentInput) contentInput.focus();
        e.preventDefault();
        return;
      }
  
      if (agreeInput && !agreeInput.checked) {
        alert('개인정보 수집 및 이용 동의가 필요합니다.');
        agreeInput.focus();
        e.preventDefault();
      }
    });
  });