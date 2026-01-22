let depthCount = 0;

function loadHTML(selector, url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    return fetch('../' + url.replace('./', '')).then(
                        (response2) => {
                            if (response2.ok) {
                                depthCount = 1;
                                return response2.text();
                            } else {
                                throw new Error('Network response was not ok');
                            }
                        }
                    );
                }
            })
            .then((data) => {
                const container = document.querySelector(selector);
                if (!container) return;

                if (depthCount === 0) {
                    container.innerHTML = data;
                } else {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data;

                    const imgs = tempDiv.querySelectorAll('img');
                    imgs.forEach((img) => {
                        let src = img.getAttribute('src');
                        if (src.startsWith('./')) {
                            src = src.replace('./', '../'.repeat(depthCount));
                        } else if (src.startsWith('/')) {
                            src = src.replace('/', '../'.repeat(depthCount));
                        } else if (src.startsWith('img')) {
                            src = src.replace(
                                'img',
                                '../'.repeat(depthCount) + 'img'
                            );
                        }
                        img.setAttribute('src', src);
                    });

                    container.innerHTML = tempDiv.innerHTML;
                }

                resolve(); // HTML 삽입 완료
            })
            .catch((err) => {
                reject(err);
            });
    });
}

/**
 * JS 파일을 동적으로 로드 후 콜백 실행
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error: ${url}`));
        document.head.appendChild(script);
    });
}

// ✅ accessToken을 Authorization 헤더로 붙이는 공통 함수 (multipart/FormData에서도 사용)
function buildAuthHeaders(extra = {}) {
    const accessToken = localStorage.getItem("accessToken");
    return {
        ...(accessToken ? {"Authorization": `Bearer ${accessToken}`} : {}),
        ...extra
    };
}

// 인증 헤더가 포함된 공통 요청 함수 (자동 리프레시 포함)

async function authFetch(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    const headers = {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Content-Type': 'application/json',
        ...options.headers
    };

    let response = await fetch(url, {...options, headers});

    if (response.status === 401) {
        const isRefreshed = await refreshTokens();

        if (isRefreshed) {
            accessToken = localStorage.getItem("accessToken");
            headers['Authorization'] = `Bearer ${accessToken}`;
            return await fetch(url, {...options, headers});
        } else {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.clear();
            sessionStorage.clear();
            location.href = "/login";
            return response;
        }
    }
    return response;
}

// 리프레시 토큰으로 액세스 토큰 갱신
async function refreshTokens() {
    const refreshToken = localStorage.getItem("refreshToken");
    // UserController.java에서 요구하는 userId 추출 (캐시된 정보 활용)
    const cachedUser = JSON.parse(sessionStorage.getItem("cachedUser"));
    const userId = cachedUser ? cachedUser.userId : null;

    if (!refreshToken || !userId) return false;

    try {
        const response = await fetch("/user/refresh", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({userId, refreshToken})
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.accessToken) {
                localStorage.setItem("accessToken", result.data.accessToken);
                return true;
            }
        }
    } catch (e) {
        console.error("토큰 갱신 에러:", e);
    }
    return false;
}


// ✅ 로그인 리다이렉트(URL 파라미터)로 토큰이 넘어오는 경우,
// header.js 초기화(DOMContentLoaded)보다 먼저 토큰을 저장해야 헤더가 즉시 로그인 상태로 렌더링됩니다.
(function captureTokensFromUrlEarly() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');

        if (accessToken && refreshToken) {
            // 1) 토큰 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('isLoggedIn', 'true');

            // 2) cookie 동기화(서버 렌더링 isAuthenticated 반영 목적)
            document.cookie = `accessToken=${accessToken}; Path=/`;

            // 3) URL에서 토큰 파라미터 제거(현재 경로 유지)
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);

            // 4) 토큰 저장 직후 헤더 즉시 갱신(두 번째 로그인 필요 현상 제거)
            try {
                if (typeof window.initHeader === 'function') {
                    // header fragment가 이미 렌더되어 있거나 로딩 직후라면 바로 반영
                    window.initHeader();
                }
            } catch (_) {
            }
        }
    } catch (e) {
        // ignore
    }
})();

window.addEventListener('DOMContentLoaded', () => {
    // ✅ localStorage(accessToken) → cookie(accessToken) 동기화
    // header를 fetch로 innerHTML 주입하면 header.html 내부 <script>는 실행되지 않아서 common.js에서 처리한다.
    (function syncAccessTokenCookie() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('accessToken='));
            if (!hasCookie) {
                document.cookie = `accessToken=${token}; Path=/`;

                // 최초 1회만 새로고침해서 서버 렌더링(isAuthenticated)이 반영되게 함
                const reloaded = sessionStorage.getItem('tokenCookieSynced');
                if (!reloaded) {
                    sessionStorage.setItem('tokenCookieSynced', '1');
                    location.reload();
                }
            }
        } catch (e) {
            // ignore
        }
    })();

    // Thymeleaf 사용 시 아래 loadHTML은 불필요할 수 있으나, 
    // 기존 스크립트 의존성 유지를 위해 스크립트만 로드하도록 조정하거나
    // 이미 HTML이 존재하면 스크립트만 실행하도록 합니다.

    const header = document.querySelector('#header');
    if (header) {
        if (!header.innerHTML.trim()) {
            // header 삽입 → header.js 로드 → initHeader 실행
            loadHTML('#header', './includes/header.html')
                .then(() => loadScript('/js/header.js'))
                .then(() => {
                    if (typeof initHeader === 'function') initHeader();
                    bindHeaderActions();
                    if (typeof initSearch === 'function') initSearch();
                });
        } else {
            // 이미 서버에서 렌더링된 경우
            loadScript('/js/header.js').then(() => {
                if (typeof initHeader === 'function') initHeader();
                bindHeaderActions();
                if (typeof initSearch === 'function') initSearch();
            });
        }
    }

    const footer = document.querySelector('#footer');
    if (footer && !footer.innerHTML.trim()) {
        // footer는 별도 처리
        loadHTML('#footer', './includes/footer.html');
    }

    setTimeout(hideGoogleTranslateText, 500);
    setTimeout(hideGoogleTranslateText, 1000);
    setTimeout(hideGoogleTranslateText, 1500);
    setTimeout(hideGoogleTranslateText, 2000);
});

function hideGoogleTranslateText() {
    const skipTranslate = document.querySelector('.skiptranslate');
    if (!skipTranslate) return;

    if (skipTranslate) {
        skipTranslate.childNodes.forEach((node) => {
            if (
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.includes('에서 제공')
            ) {
                node.textContent = node.textContent.replace('에서 제공', '');
            }
        });
    }

    // 언어 선택 select 가져오기
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) return;

    // 언어 코드별 원하는 텍스트 정의
    const langText = {
        en: 'English',
        ko: '한국어',
        ja: '日本語',
        'zh-CN': '中文',
        // 필요시 추가
    };

    // 각 option의 value에 따라 텍스트 변경
    Array.from(combo.options).forEach((opt) => {
        if (langText[opt.value]) {
            opt.textContent = langText[opt.value];
        }
    });
}

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('goog-te-combo')) {
        setTimeout(hideGoogleTranslateText, 1000);
    }
});

// ✅ header fragment 로딩 방식(Thymeleaf 렌더/innerHTML 삽입)과 무관하게 마이페이지/로그아웃이 동작하도록 보장
function bindHeaderActions() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = '1';
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // 서버 로그아웃 API가 있으면 호출(없어도 프론트 정리는 진행)
            try {
                await fetch('/user/logout', {
                    method: 'POST',
                    headers: buildAuthHeaders(),
                    credentials: 'include'
                });
            } catch (_) {
                // ignore
            }

            // 프론트 토큰/세션 정리
            try {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('isLoggedIn');
            } catch (_) {
            }
            try {
                sessionStorage.removeItem('cachedUser');
                sessionStorage.removeItem('tokenCookieSynced');
            } catch (_) {
            }

            // 쿠키 만료
            document.cookie = 'accessToken=; Path=/; Max-Age=0';

            alert('로그아웃 되었습니다.');
            location.href = '/';
        });
    }
}

// ✅ 전역 유틸 노출(페이지별 module/일반 script 혼용 시 ReferenceError 방지)
try {
    if (typeof authFetch === 'function') window.authFetch = authFetch;
} catch (_) {
}
try {
    if (typeof buildAuthHeaders === 'function') window.buildAuthHeaders = buildAuthHeaders;
} catch (_) {
}
