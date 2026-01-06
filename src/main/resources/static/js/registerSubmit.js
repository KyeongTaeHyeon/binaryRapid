// localStorage.js
document.addEventListener('DOMContentLoaded', function () {
  // 폼 제출 시 로컬 스토리지 저장
  document
    .querySelector('#registerForm')
    .addEventListener('submit', function (e) {
      // 유효성 검사
      if (!isUidOk || !isPassOk1 || !isPassOk2 || !isEmailOk) {
        alert('모든 정보를 정확히 입력해주세요.');
        e.preventDefault(); // 유효성 검사 실패시 폼 제출 막기
        return;
      }

      // 모든 입력값 가져오기
      const formData = {
        userName: document.querySelector('#userName').value,
        userPassword: document.querySelector('#userPassword').value,
        userPasswordCheck: document.querySelector('#userPasswordCheck').value,
        userEmail: document.querySelector('#userEmail').value,
        userNickName: document.querySelector('#nickName').value,
        selAge: document.querySelector('#selAge').value,
        selGender: document.querySelector('#selGender').value,
        selPreference: document.querySelector('#selPreference').value,
      };

      // 로컬 스토리지에 저장
      localStorage.setItem('userRegistForm', JSON.stringify(formData));

      console.log('userRegistForm', formData);

      // 폼을 제출하도록 허용
      // 만약 로컬 스토리지를 저장한 후 페이지 새로 고침이 필요하다면 아래 주석을 해제
      // window.location.reload();

      // index.html로 리디렉션
      e.preventDefault(); 
      window.location.href = '../login/login.html';

    });
});
