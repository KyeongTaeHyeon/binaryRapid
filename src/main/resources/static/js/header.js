function initHeader() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginUserName = localStorage.getItem('loginUserName');
  const adminIsTrue = localStorage.getItem('adminIsTrue') === 'true';

  const loggedOutEl = document.querySelector('.userLoggedOut');
  const loggedInEl = document.querySelector('.userLoggedIn');
  const adminLoggedInEl = document.querySelector('.adminLoggedIn');

  const loginUserNameSpan = document.getElementById('loginUserName');
  const adminLoginNameSpan = document.getElementById('loginName');

  if (isLoggedIn && loginUserName) {
    if (adminIsTrue) {
      // 관리자 로그인 상태
      if (adminLoggedInEl) adminLoggedInEl.classList.remove('hide');
      if (adminLoginNameSpan) adminLoginNameSpan.textContent = loginUserName;

      if (loggedInEl) loggedInEl.classList.add('hide');
      if (loggedOutEl) loggedOutEl.classList.add('hide');
    } else {
      // 일반 사용자 로그인 상태
      if (loggedInEl) loggedInEl.classList.remove('hide');
      if (loginUserNameSpan) loginUserNameSpan.textContent = loginUserName;

      if (adminLoggedInEl) adminLoggedInEl.classList.add('hide');
      if (loggedOutEl) loggedOutEl.classList.add('hide');
    }

    // 로그아웃 처리 (공통)
    const logoutBtns = document.querySelectorAll('#logoutBtn');
    logoutBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginUserName');
        localStorage.removeItem('adminIsTrue');
        sessionStorage.clear();
        alert('로그아웃 되었습니다.');
        window.location.href = '../index.html';
      });
    });
  } else {
    // 비로그인 상태
    if (loggedOutEl) loggedOutEl.classList.remove('hide');
    if (loggedInEl) loggedInEl.classList.add('hide');
    if (adminLoggedInEl) adminLoggedInEl.classList.add('hide');
  }
}
