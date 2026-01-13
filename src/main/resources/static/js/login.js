// 구글
// 1. 커스텀 버튼 클릭 시 구글 창 띄우는 함수
function openGoogleSignIn() {
    google.accounts.id.prompt(); 
}

// 2. 구글 로그인 성공 시 실행되는 콜백 함수
function handleCredentialResponse(response) {
    const token = response.credential; // 구글이 준 JWT 토큰
    const payload = JSON.parse(atob(token.split('.')[1])); // 토큰 해석
    
    console.log("구글 로그인 사용자:", payload);

    // 임시로 세션/로컬 스토리지에 저장 (나중에 서버 검증 로직으로 대체 가능)
    localStorage.setItem('userName', payload.name);
    localStorage.setItem('userEmail', payload.email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accessToken', token); // 임시 토큰 저장

    window.location.href = '/'; // 메인으로 이동
}

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
          console.log('로그인 성공 데이터:', data);

          // [핵심 수정] 서버 DTO 필드명인 accessToken으로 저장
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // 구글 로그인과의 호환성을 위해 추가 (필요시)
            localStorage.setItem('isLoggedIn', 'true');

            window.location.href = '/';
          } else {
            alert("토큰을 수신하지 못했습니다.");
          }
        })
        .catch((error) => {
          errorMsg.textContent = error.message;
          errorMsg.style.display = 'block';
        });
  });
});