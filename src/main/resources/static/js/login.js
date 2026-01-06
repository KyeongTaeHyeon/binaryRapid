function handleCredentialResponse(response) {
  // response.credential에 구글 JWT 토큰이 담김
  alert('Google ID Token: ' + response.credential);
  console.log('Google ID Token:', response.credential);
  // 실제 서비스에서는 이 토큰을 서버로 보내 인증 처리

  const token = response.credential;

  // JWT 디코딩 (base64 디코딩 방식)
  const payload = JSON.parse(atob(token.split('.')[1]));

  const userName = payload.name; // 사용자의 이름
  const userEmail = payload.email;

  // 테스트용 localStorage에 저장
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginUserName', userName);

  // 세션 스토리지에 저장
  sessionStorage.setItem('userName', userName);
  sessionStorage.setItem('userEmail', userEmail);
  sessionStorage.setItem('isLoggedIn', 'true');

  // index.html로 리디렉션
  window.location.href = '../index.html';
}

// 로컬 로그인 관련 js
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const inputId = document.getElementById('userName').value.trim();
  const inputPw = document.getElementById('password').value.trim();

  const savedData = localStorage.getItem('userRegistForm');

  if (!savedData) {
    alert('등록된 계정이 없습니다. 회원가입을 먼저 해주세요.');
    return;
  }

  const userData = JSON.parse(savedData);

  if (userData.userName !== inputId) {
    alert('존재하지 않는 아이디입니다.');
    return;
  }

  if (userData.userPassword !== inputPw) {
    alert('비밀번호가 틀렸습니다.');
    return;
  }

  // 테스트용 로컬스토리지 로그인 상태 저장
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginUserName', inputId);

  // 로그인 성공
  alert(`${userData.userNickName}님 환영합니다!`);
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('loginUserName', inputId);

  // 예시로 메인 페이지로 이동
  window.location.href = '../index.html';
});
