// 구글
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

// 로컬
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('loginErrorMsg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    const requestData = {
      id: document.getElementById('userName').value.trim(),
      password: document.getElementById('password').value.trim()
    };

    if (!requestData.id || !requestData.password) {
      errorMsg.textContent = '아이디와 비밀번호를 입력하세요.';
      errorMsg.style.display = 'block';
      return;
    }

    fetch('/user/LocalSignin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      credentials: 'same-origin'
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(msg => {
            throw new Error(msg);
          });
        }
      })
      .then(() => {
        window.location.href = '/';
      })
      .catch(error => {
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
      });
  });
});
