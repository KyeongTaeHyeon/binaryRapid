document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // ⭐ 기본 submit 차단

    // 유효성 검사
    if (!isUidOk || !isPassOk1 || !isPassOk2 || !isEmailOk) {
      alert('모든 정보를 정확히 입력해주세요.');
      return;
    }

    const requestData = {
      id: document.getElementById('userName').value,
      password: document.getElementById('userPassword').value,
      name: document.getElementById('name').value,
      nickName: document.getElementById('nickName').value,
      email: document.getElementById('userEmail').value,
      gender: document.getElementById('selGender').value,
      taste: document.getElementById('selPreference').value,
      birth: document.getElementById('selAge').value
    };

    try {
      const response = await fetch('/user/LocalSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || '회원가입 실패');
      }

      // 성공
      location.href = '/';

    } catch (err) {
      alert(err.message);
    }
  });
});
