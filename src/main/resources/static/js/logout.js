  (function() {
  console.log("Header Script Loaded");

  function initHeader() {
  const accessToken = localStorage.getItem("accessToken");
  const guestBox = document.getElementById("guestBox");
  const loginBox = document.getElementById("loginBox");
  const userNickname = document.getElementById("userNickname");
  const mypageLink = document.getElementById("mypageLink");

  if (!guestBox || !loginBox) {
  requestAnimationFrame(initHeader);
  return;
}

  // 1. 토큰이 없으면 즉시 비로그인 UI 보여주고 종료
  if (!accessToken) {
  guestBox.style.display = "flex";
  loginBox.style.display = "none";
  sessionStorage.removeItem("cachedUser"); // 캐시 삭제
  return;
}

  // 2. 세션 스토리지에 캐시된 유저 데이터가 있는지 확인
  const cachedUser = sessionStorage.getItem("cachedUser");
  if (cachedUser) {
  console.log("캐시된 데이터 사용");
  renderUserMenu(JSON.parse(cachedUser));
  return;
}

  // 3. 캐시가 없으면 서버에 요청 (최초 1회)
  fetch("/user/me", {
  method: "GET",
  headers: { "Authorization": "Bearer " + accessToken }
})
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(res => {
  const userData = res.data;
  // 세션에 데이터 저장 (문자열로 변환)
  sessionStorage.setItem("cachedUser", JSON.stringify(userData));
  renderUserMenu(userData);
})
  .catch(error => {
  console.error("인증 실패:", error);
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("cachedUser");
  guestBox.style.display = "flex";
  loginBox.style.display = "none";
});

  // UI를 그리는 함수
  function renderUserMenu(userData) {
  if (userNickname) userNickname.innerText = userData.nickName;
  if (mypageLink) {
  if (userData.role === 'ADMIN') {
  mypageLink.innerText = "관리자 페이지";
  mypageLink.href = "/admin/users";
} else {
  mypageLink.innerText = "마이 페이지";
  mypageLink.href = "/login/userBoardList";
}
}
  guestBox.style.display = "none";
  loginBox.style.display = "flex";
}
}

  // 로그아웃 (캐시까지 삭제)
  document.addEventListener("click", function(e) {
  if (e.target && e.target.id === "logoutBtn") {
  if (confirm("로그아웃 하시겠습니까?")) {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("cachedUser"); // 세션 캐시 삭제
  location.href = "/";
}
}
});

  initHeader();
})();