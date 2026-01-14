// boardWrite.js

// [추가] 서버에서 가져온 용량 제한을 저장할 변수 (기본값: 안전하게 1MB로 시작)
let serverMaxFileSize = 1 * 1024 * 1024;
let serverMaxRequestSize = 20 * 1024 * 1024; // 총 요청(전체 파일 합) 제한 기본값
const sessionData = sessionStorage.getItem("cachedUser");
let loginUser = null;

// ✅ 서버(Thymeleaf)에서 내려준 loginUserId 우선 사용 (없으면 sessionStorage fallback)
let loginUserId = (typeof window !== "undefined" && window.loginUserId != null && window.loginUserId !== 0)
    ? window.loginUserId
    : null;

if (loginUserId == null && sessionData) {
    try {
        loginUser = JSON.parse(sessionData);
        loginUserId = loginUser?.userId ?? null;
    } catch (e) {
        console.error("세션 데이터 파싱 실패:", e);
    }
}

document.addEventListener("DOMContentLoaded", function () {

    // ✅ 비로그인 상태면 글쓰기 차단
    if (!loginUserId) {
        alert("로그인이 필요합니다.");
        location.href = "/login";
        return;
    }

    // [추가] 페이지 로드 시, 서버에 설정된 파일 용량 제한 값을 가져온다.
    fetch('/api/board/config')
        .then(response => response.json())
        .then(config => {
            if (config && config.maxFileSize) serverMaxFileSize = config.maxFileSize;
            if (config && config.maxRequestSize) serverMaxRequestSize = config.maxRequestSize;

            console.log("서버 파일 용량 설정 로드 완료:", {
                maxFileSize: serverMaxFileSize + " bytes",
                maxRequestSize: serverMaxRequestSize + " bytes"
            });
        })
        .catch(err => console.error("설정 로드 실패(기본값 사용):", err));


    // ✅ 이미지 미리보기 (글쓰기)
    const fileInputEl = document.getElementById("fileInput");
    const filePreviewArea = document.getElementById("filePreviewArea");
    const filePreviewList = document.getElementById("filePreviewList");
    const clearFilesBtn = document.getElementById("clearFilesBtn");

    function renderFilePreviews(files) {
        if (!filePreviewList) return;
        filePreviewList.innerHTML = "";

        const list = Array.from(files || []);
        if (list.length === 0) {
            if (filePreviewArea) filePreviewArea.style.display = "none";
            return;
        }

        if (filePreviewArea) filePreviewArea.style.display = "block";

        list.forEach((file) => {
            // 이미지 파일만
            if (!file || !file.type || !file.type.startsWith("image/")) return;

            const img = document.createElement("img");
            img.className = "gallery-item";
            img.alt = file.name;
            img.loading = "lazy";

            const url = URL.createObjectURL(file);
            img.src = url;

            // 메모리 누수 방지
            img.addEventListener("load", () => {
                try {
                    URL.revokeObjectURL(url);
                } catch (_) {
                }
            });

            filePreviewList.appendChild(img);
        });
    }

    // 초기엔 숨김
    if (filePreviewArea) filePreviewArea.style.display = "none";

    if (fileInputEl) {
        fileInputEl.addEventListener("change", (e) => {
            renderFilePreviews(e.target.files);
        });
    }

    if (clearFilesBtn && fileInputEl) {
        clearFilesBtn.addEventListener("click", () => {
            // input 초기화
            fileInputEl.value = "";
            renderFilePreviews([]);
        });
    }

    const submitBtn = document.getElementById('submitPostBtn');

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {

            // 1. 값 가져오기
            const category = document.getElementById('boardCategory').value;
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const fileInput = document.getElementById('fileInput');

            // 2. 유효성 검사
            if (!title.trim()) {
                alert("제목을 입력해주세요.");
                return;
            }
            if (!content.trim()) {
                alert("내용을 입력해주세요.");
                return;
            }

            // 3. FormData 생성
            const formData = new FormData();
            formData.append("category", category);
            formData.append("title", title);
            formData.append("contents", content);
            formData.append("userId", loginUserId);

            // 4. 파일 용량 체크 (서버에서 가져온 값 사용)
            // 4. 파일 용량 체크 (서버에서 가져온 값 사용)
            if (fileInput.files.length > 0) {
                let totalSize = 0;

                // 개별 체크 + 총합 계산
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    if (!file) continue;

                    totalSize += file.size;

                    if (file.size > serverMaxFileSize) {
                        const limitMB = Math.floor(serverMaxFileSize / (1024 * 1024));
                        alert(`첨부파일은 개당 ${limitMB}MB를 초과할 수 없습니다.\n(${file.name})`);
                        return;
                    }
                }

                // ✅ 총합 체크
                if (totalSize > serverMaxRequestSize) {
                    const limitMB = Math.floor(serverMaxRequestSize / (1024 * 1024));
                    const totalMB = Math.ceil(totalSize / (1024 * 1024));
                    alert(`첨부파일 총합은 ${limitMB}MB를 초과할 수 없습니다.\n(현재 총합: ${totalMB}MB)`);
                    return;
                }

                // 통과하면 append
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    if (!file) continue;
                    formData.append("files", file);
                }
            }

            // 5. 전송
            fetch('/api/board/write', {
                method: 'POST',
                headers: (typeof buildAuthHeaders === 'function') ? buildAuthHeaders() : undefined,
                credentials: 'include',
                body: formData
            })
                .then(response => {
                    if (response.status === 401 || response.status === 403) {
                        alert("로그인이 필요합니다.");
                        location.href = "/login";
                        return;
                    }

                    if (response.ok) {
                        alert("게시글이 등록되었습니다.");
                        location.href = '/board/boardList';
                    } else {
                        response.text().then(msg => {
                            alert("등록 실패: " + (msg || "다시 시도해주세요."));
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("서버 오류가 발생했습니다.");
                });
        });
    }
});
