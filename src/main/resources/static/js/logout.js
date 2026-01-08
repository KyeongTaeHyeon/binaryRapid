document.addEventListener('DOMContentLoaded', function () {
  const logoutButtons = document.querySelectorAll('.logoutBtn');

  if (logoutButtons.length === 0) return;

  logoutButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      fetch('/user/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('로그아웃 실패');
          }
        })
        .then(() => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = '/';
        })
        .catch(err => {
          alert(err.message);
        });
    });
  });
});
