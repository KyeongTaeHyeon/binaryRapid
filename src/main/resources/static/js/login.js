// 구글
// 1. 커스텀 버튼 클릭 시 구글 창 띄우는 함수
function openGoogleSignIn() {
    google.accounts.id.prompt();
}

// 2. 구글 로그인 성공 시 실행되는 콜백 함수
// ⚠️ 중복 선언되어 마지막 함수가 앞의 저장 로직을 덮어쓰고 있었음
// - 헤더는 localStorage의 accessToken을 보고 로그인 여부를 판단하므로 localStorage로 통일
function handleCredentialResponse(response) {
    const token = response.credential; // 구글이 준 JWT 토큰
    const payload = JSON.parse(atob(token.split('.')[1])); // 토큰 해석

    console.log("구글 로그인 사용자:", payload);

    // (임시) 프론트에서만 로그인 상태 유지
    localStorage.setItem('userName', payload.name);
    localStorage.setItem('userEmail', payload.email);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accessToken', token);

    // 헤더 즉시 반영(스크립트 로딩 타이밍 이슈 보완)
    try {
        if (typeof window.initHeader === 'function') window.initHeader();
    } catch (_) {
    }

    window.location.href = '/';
}

// 로컬 로그인 처리
document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.getElementById('btnLogin');
    const errorMsg = document.getElementById('loginErrorMsg');

    // 엔터 키 입력 시 실행
    const inputs = document.querySelectorAll('#loginFormContainer input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData),
            credentials: 'same-origin'
        })
            .then(async (response) => {
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || '로그인에 실패했습니다.');
                }

                return result.data;
            })
            .then((data) => {
                console.log('로그인 성공 데이터:', data);

                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem('isLoggedIn', 'true');

                    // ✅ 저장 직후 헤더를 즉시 갱신(첫 로그인에서 2번 눌러야 하는 현상 방지)
                    // - header.js가 뒤늦게 로드되더라도 common.js가 나중에 한번 더 initHeader를 호출합니다.
                    try {
                        if (typeof window.initHeader === 'function') window.initHeader();
                    } catch (_) {
                    }

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
