/**
 * header.js - 인증 관리 및 페이지 접근 권한 제어 통합본
 */
(function () {
    // 전역 함수로 노출 (common.js 등에서 호출 가능하도록)
    window.initHeader = initHeader;

    function initHeader() {
        const accessToken = localStorage.getItem("accessToken");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");

        // DOM 요소가 아직 없으면 대기 (최대 10초)
        if (!guestBox || !loginBox) {
            if (!window._headerRetryCount) window._headerRetryCount = 0;
            if (window._headerRetryCount++ < 100) {
                requestAnimationFrame(initHeader);
            } else {
                console.error("header.js: guestBox or loginBox not found after retries.");
            }
            return;
        }
        
        // 요소 찾음 - 재시도 카운트 초기화
        window._headerRetryCount = 0;

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
                // 캐시가 있어도 토큰 유효성 검증을 위해 백그라운드에서 /user/me 호출 가능
                // 여기서는 캐시 우선 사용하고 종료
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
                    console.warn("토큰 인증 실패, 로그아웃 처리:", err);
                    localStorage.removeItem("accessToken");
                    sessionStorage.removeItem("cachedUser");
                    renderGuestUI();
                    if (currentPath.startsWith("/admin")) window.location.href = "/";
                });

            return;
        }

        // 4) accessToken이 없는 경우:
        //    => 쿠키에 'accessToken'이 있는지 확인 후 요청 (불필요한 401 방지)
        if (document.cookie.includes("accessToken=")) {
            fetch("/user/me", {
                method: "GET",
                credentials: "include"
            })
                .then(res => {
                    if (res.ok) return res.json();
                    return null;
                })
                .then(res => {
                    if (res && res.data) {
                        const userData = res.data;
                        sessionStorage.setItem("cachedUser", JSON.stringify(userData));
                        renderUserUI(userData);
                    } else {
                        renderGuestUI();
                    }
                })
                .catch(() => {
                    renderGuestUI();
                });
        } else {
            // 토큰도 없고 쿠키도 없으면 바로 게스트 UI 렌더링
            renderGuestUI();
        }
    }

    function renderUserUI(userData) {
        const userNickname = document.getElementById("userNickname");
        const mypageLink = document.getElementById("mypageLink");
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");
        const logoutBtn = document.getElementById("logoutBtn");

        if (userNickname) {
            userNickname.innerText = userData.nickName || userData.name || "사용자";
        }

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
            logoutBtn.onclick = null;
            logoutBtn.onclick = async function (e) {
                e.preventDefault();

                if (confirm("로그아웃 하시겠습니까?")) {
                    try {
                        await fetch('/user/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
                    } catch (err) {
                        console.warn('서버 로그아웃 호출 실패:', err);
                    }

                    try {
                        localStorage.removeItem('accessToken');
                    } catch (_) {
                    }
                    try {
                        localStorage.removeItem('refreshToken');
                    } catch (_) {
                    }
                    try {
                        sessionStorage.removeItem('cachedUser');
                    } catch (_) {
                    }

                    window.location.href = "/";
                }
            };
            logoutBtn.dataset.bound = '1';
        }

        if (guestBox) guestBox.style.display = "none";
        if (loginBox) loginBox.style.display = "flex";
    }

    function renderGuestUI() {
        const guestBox = document.getElementById("guestBox");
        const loginBox = document.getElementById("loginBox");
        if (guestBox) guestBox.style.display = "flex";
        if (loginBox) loginBox.style.display = "none";
    }

    // 자동 실행 (DOM 로드 시)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
             // common.js 등에서 이미 호출했을 수 있으므로 체크
             if (!window._headerInitCalled) {
                 window._headerInitCalled = true;
                 initHeader();
             }
        });
    } else {
         if (!window._headerInitCalled) {
             window._headerInitCalled = true;
             initHeader();
         }
    }
})();
