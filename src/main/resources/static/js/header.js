/**
 * header.js - 인증 관리 및 페이지 접근 권한 제어 통합본
 */
(function() {
    // 1. 중복 실행 방지
    if (window.isHeaderInitialized) return;
    window.isHeaderInitialized = true;

    function initHeader() {
        const accessToken = localStorage.getItem("accessToken");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");

        // DOM 로드 대기 (Thymeleaf 조각이 로드될 때까지 반복 확인)
        if (!guestBox || !loginBox) {
            requestAnimationFrame(initHeader);
            return;
        }

        const currentPath = window.location.pathname;

        // 2. 관리자 페이지 접근 제어
        if (currentPath.startsWith("/admin")) {
            const cachedUser = JSON.parse(sessionStorage.getItem("cachedUser") || "{}");
            if (!accessToken || cachedUser.role !== 'ADMIN') {
                alert("관리자 권한이 필요합니다.");
                window.location.href = "/"; 
                return;
            }
        }

        // 3. 비로그인 상태 UI
        if (!accessToken) {
            renderGuestUI();
            return;
        }

        // 4. 세션 캐시 확인
        const cachedUser = sessionStorage.getItem("cachedUser");
        if (cachedUser) {
            renderUserUI(JSON.parse(cachedUser));
            return;
        }

        // 5. 서버에 최신 유저 정보 요청
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
            
            if (currentPath.startsWith("/admin") && userData.role !== 'ADMIN') {
                alert("접근 권한이 없습니다.");
                window.location.href = "/";
            }
        })
        .catch(err => {
            console.error("인증 에러:", err);
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("cachedUser");
            renderGuestUI();
            if (currentPath.startsWith("/admin")) window.location.href = "/";
        });
    }

    function renderUserUI(userData) {
        const userNickname = document.getElementById("userNickname");
        const mypageLink = document.getElementById("mypageLink");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");
        const logoutBtn = document.getElementById("logoutBtn");

        if (userNickname) userNickname.innerText = userData.nickName;

        if (mypageLink) {
            if (userData.role === 'ADMIN') {
                mypageLink.innerText = "관리자 페이지";
                mypageLink.href = "/admin/users";
            } else {
                mypageLink.innerText = "마이 페이지";
                mypageLink.href = "/login/user/boardList";
            }
        }

        // 🔥 로그아웃 이벤트 중복 방지 로직
        if (logoutBtn) {
            // 기존에 할당된 모든 이벤트를 무효화 (null 처리 후 할당)
            logoutBtn.onclick = null; 
            logoutBtn.onclick = function(e) {
                e.preventDefault();
                e.stopImmediatePropagation(); // 다른 스크립트의 간섭을 즉시 중단시킴

                if (confirm("로그아웃 하시겠습니까?")) {
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("cachedUser");
                    // 메인 페이지로 이동하면서 새로고침 효과
                    window.location.href = "/";
                }
            };
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

    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }
})();