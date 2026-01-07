// ======================
// 구글 로그인 (유지)
// ======================
function handleCredentialResponse(response) {
  const token = response.credential;

  const payload = JSON.parse(atob(token.split('.')[1]));

  const userName = payload.name;
  const userEmail = payload.email;

  // 👉 실제 서비스에서는 이 토큰을 서버로 보내 검증해야 함
  sessionStorage.setItem('userName', userName);
  sessionStorage.setItem('userEmail', userEmail);
  sessionStorage.setItem('isLoggedIn', 'true');

  window.location.href = '/';
}

// ======================
// 로컬 로그인 AJAX 처리
// ======================
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const requestData = {
      id: document.getElementById('userName').value.trim(),
      password: document.getElementById('password').value.trim()
    };

    if (!requestData.id || !requestData.password) {
      alert('아이디와 비밀번호를 입력하세요.');
      return;
    }

    fetch('/user/LocalSignin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      credentials: 'same-origin' 
      /*프론트와 서버가 다른 도메인이면
        credentials: 'include'*/
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(msg => {
            throw new Error(msg || '로그인 실패');
          });
        }
        // ✅ JSON 파싱 ❌
        // 그냥 성공으로 처리
      })
      .then(() => {
        // 로그인 성공 → 서버 세션이 진짜 로그인 상태
        window.location.href = '/';
      })
      .catch(error => {
        alert(error.message);
      });
  });
});
