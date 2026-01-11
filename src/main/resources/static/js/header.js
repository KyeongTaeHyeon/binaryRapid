/**
 * header.js - 최신 JWT 인증 방식 + 중복 실행 방어
 */
(function() {
  // 1. 중복 실행 방지 (이미 실행 중이라면 종료)
  if (window.isHeaderInitialized) return;
  window.isHeaderInitialized = true;

  function initHeader() {
    const accessToken = localStorage.getItem("accessToken");
    const guestBox = document.getElementById("guestBox");
    const loginBox = document.getElementById("loginBox");

    // 2. DOM 로드 대기 (common.js가 동적으로 불러올 때를 대비)
    if (!guestBox || !loginBox) {
      requestAnimationFrame(initHeader);
      return;
    }

    // 3. 토큰이 없으면 즉시 비로그인 UI 출력 (리다이렉트 금지)
    if (!accessToken) {
      renderGuestUI();
      return;
    }

    // 4. 세션 스토리지 캐시 확인 (새로고침 시 API 호출 방지)
    const cachedUser = sessionStorage.getItem("cachedUser");
    if (cachedUser) {
      renderUserUI(JSON.parse(cachedUser));
      return;
    }

    // 5. 서버에 유저 정보 요청
    fetch("/user/me", {
      method: "GET",
      headers: { "Authorization": "Bearer " + accessToken }
    })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("인증 실패");
        })
        .then(res => {
          const userData = res.data;
          sessionStorage.setItem("cachedUser", JSON.stringify(userData));
          renderUserUI(userData);
        })
        .catch(err => {
          console.error("Header Auth Error:", err);
          // 인증 실패 시 세션만 비우고 UI만 변경 (홈으로 보내지 않음!)
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("cachedUser");
          renderGuestUI();
        });
  }

  function renderUserUI(userData) {
    const userNickname = document.getElementById("userNickname");
    const mypageLink = document.getElementById("mypageLink");
    const guestBox = document.getElementById("guestBox");
    const loginBox = document.getElementById("loginBox");

    if (userNickname) userNickname.innerText = userData.nickName;

    if (mypageLink) {
      // 절대 경로를 사용하여 경로 꼬임 방지
      if (userData.role === 'ADMIN') {
        mypageLink.innerText = "관리자 페이지";
        mypageLink.href = "/admin/users";
      } else {
        mypageLink.innerText = "마이 페이지";
        mypageLink.href = "/login/user/boardList";
      }
    }

    guestBox.style.display = "none";
    loginBox.style.display = "flex";
  }

  function renderGuestUI() {
    const guestBox = document.getElementById("guestBox");
    const loginBox = document.getElementById("loginBox");
    if(guestBox) guestBox.style.display = "flex";
    if(loginBox) loginBox.style.display = "none";
  }

  // 로그아웃 이벤트 (이미 등록되어 있는지 확인 후 등록)
  if (!window.isLogoutBound) {
    document.addEventListener("click", function(e) {
      if (e.target && e.target.id === "logoutBtn") {
        if (confirm("로그아웃 하시겠습니까?")) {
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("cachedUser");
          location.href = "/"; // 로그아웃 시에만 홈으로 보냄
        }
      }
    });
    window.isLogoutBound = true;
  }

  // 즉시 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();