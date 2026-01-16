/**
 * header.js - 인증 관리 및 페이지 접근 권한 제어 통합본
 */
(function () {
    // 1. 중복 로드 방지(바인딩만 1회)
    const alreadyBootstrapped = !!window.__headerBootstrapped;
    window.__headerBootstrapped = true;

    function initHeader() {
        const accessToken = localStorage.getItem("accessToken");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");

        // DOM 로드 대기 (header fragment가 늦게 붙는 경우)
        if (!guestBox || !loginBox) {
            requestAnimationFrame(initHeader);
            return;
        }

        const currentPath = window.location.pathname;

        // 1) 관리자 페이지 접근 제어 (cachedUser 기반)
        if (currentPath.startsWith("/admin")) {
            const cachedUser = JSON.parse(sessionStorage.getItem("cachedUser") || "{}");
            if (!accessToken || cachedUser.role !== "ADMIN") {
                alert("관리자 권한이 필요합니다.");
                window.location.href = "/";
                return;
            }
        }

        // 2) 세션 캐시 있으면 즉시 반영
        const cached = sessionStorage.getItem("cachedUser");
        if (cached) {
            try {
                renderUserUI(JSON.parse(cached));
                return;
            } catch (_) {
                sessionStorage.removeItem("cachedUser");
            }
        }

        // 3) accessToken이 있는 경우: Bearer + 쿠키 포함
        if (accessToken) {
            fetch("/user/me", {
                method: "GET",
                headers: {"Authorization": "Bearer " + accessToken},
                credentials: "include"
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("인증 실패");
                })
                .then(res => {
                    const userData = res.data;
                    sessionStorage.setItem("cachedUser", JSON.stringify(userData));
                    renderUserUI(userData);

                    if (currentPath.startsWith("/admin") && userData.role !== "ADMIN") {
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

            return;
        }

        // 4) accessToken이 없는 경우(현재 재현 케이스):
        //    => HttpOnly 쿠키 기반으로 /user/me를 시도해서 성공하면 로그인 UI로 전환
        fetch("/user/me", {
            method: "GET",
            credentials: "include"
        })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("cookie auth failed");
            })
            .then(res => {
                const userData = res.data;
                if (!userData) throw new Error("no user data");
                sessionStorage.setItem("cachedUser", JSON.stringify(userData));
                renderUserUI(userData);
            })
            .catch(() => {
                renderGuestUI();
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
            logoutBtn.onclick = function (e) {
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
        if (guestBox) guestBox.style.display = "flex";
        if (loginBox) loginBox.style.display = "none";
    }

    // ✅ 외부(common.js 등)에서 토큰 저장 직후 헤더를 다시 그릴 수 있도록 노출
    window.initHeader = initHeader;

    // 초기화 실행
    if (document.readyState === 'loading') {
        if (!alreadyBootstrapped) {
            document.addEventListener('DOMContentLoaded', initHeader);
        }
    } else {
        initHeader();
    }
})();
