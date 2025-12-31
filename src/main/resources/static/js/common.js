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
                console.error(`Failed to load ${url}:`, err);
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

window.addEventListener('DOMContentLoaded', () => {
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
                    if (typeof initSearch === 'function') initSearch();
                });
        } else {
            // 이미 서버에서 렌더링된 경우
            loadScript('/js/header.js').then(() => {
                if (typeof initHeader === 'function') initHeader();
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
