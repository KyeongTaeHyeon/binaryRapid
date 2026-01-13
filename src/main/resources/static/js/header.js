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

        // DOM 로드 대기
        if (!guestBox || !loginBox) {
            requestAnimationFrame(initHeader);
            return;
        }

        // 현재 경로 확인
        const currentPath = window.location.pathname;

        // 2. 관리자 페이지 접근 제어 (HTML 로드 직후 실행)
        if (currentPath.startsWith("/admin")) {
            const cachedUser = JSON.parse(sessionStorage.getItem("cachedUser") || "{}");
            
            // 토큰이 없거나, 권한이 ADMIN이 아니면 퇴출
            if (!accessToken || cachedUser.role !== 'ADMIN') {
                alert("관리자 권한이 필요합니다.");
                window.location.href = "/"; 
                return;
            }
        }

        // 3. 비로그인 상태 UI 처리
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

        // 5. 서버에 최신 유저 정보 요청 (/user/me)
        fetch("/user/me", {
            method: "GET",
            headers: { "Authorization": "Bearer " + accessToken }
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("인증 실패");
        })
        .then(res => {
            const userData = res.data; // SelectUserResponseForJwtDto
            sessionStorage.setItem("cachedUser", JSON.stringify(userData));
            renderUserUI(userData);
            
            // 만약 관리자 페이지인데 서버에서 받아온 결과가 ADMIN이 아니면 뒤늦게라도 쫓아냄
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
            // 관리자 페이지에서 인증 에러 시 홈으로
            if (currentPath.startsWith("/admin")) window.location.href = "/";
        });
    }

    function renderUserUI(userData) {
        const userNickname = document.getElementById("userNickname");
        const mypageLink = document.getElementById("mypageLink");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");

        if (userNickname) userNickname.innerText = userData.nickName;

        if (mypageLink) {
            // ADMIN 여부에 따라 링크와 텍스트 변경
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

    // 로그아웃 이벤트 처리
    if (!window.isLogoutBound) {
        document.addEventListener("click", function(e) {
            if (e.target && e.target.id === "logoutBtn") {
                if (confirm("로그아웃 하시겠습니까?")) {
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("cachedUser");
                    window.location.href = "/";
                }
            }
        });
        window.isLogoutBound = true;
    }

    // 실행 시점 제어
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }
})();