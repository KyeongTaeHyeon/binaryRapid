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



// 로컬 로그인 처리
document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('btnLogin');
  const errorMsg = document.getElementById('loginErrorMsg');

  // 엔터 키 입력 시 실행
  const inputs = document.querySelectorAll('#loginFormContainer input');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') loginBtn.click();
    });
  });

  loginBtn.addEventListener('click', function () {
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

    // 서버로 비동기 로그인 요청
    fetch('/user/LocalSignin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
      credentials: 'same-origin'
    })
        .then(async (response) => {
          // 서버에서 전달한 JSON 결과(ApiResponse)를 먼저 읽습니다.
          const result = await response.json();

          if (!response.ok || !result.success) {
            // ApiResponse의 success가 false이거나 HTTP 상태코드가 에러일 때
            // ApiResponse에 담긴 message를 에러로 던집니다.
            throw new Error(result.message || '로그인에 실패했습니다.');
          }

          // 성공 시 결과 데이터(T data)를 다음 then으로 넘깁니다.
          return result.data;
        })
        .then((data) => {
          // 여기서 data는 ApiResponse의 'data' 필드에 담긴 UserResponseDto 혹은 Token 정보입니다.
          console.log('로그인 성공:', data);

          // JWT 토큰이 있다면 로컬 스토리지에 저장
          if (data.token) {
            localStorage.setItem('accessToken', data.token);
          }

          // 로그인 성공 시 메인 페이지로 이동
          window.location.href = '/';
        })
        .catch((error) => {
          // throw new Error()에서 던진 메시지가 여기 걸립니다.
          errorMsg.textContent = error.message;
          errorMsg.style.display = 'block';
        });
  });
});