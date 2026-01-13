// boardWrite.js

// [추가] 서버에서 가져온 용량 제한을 저장할 변수 (기본값: 안전하게 1MB로 시작)
let serverMaxFileSize = 1 * 1024 * 1024;

document.addEventListener("DOMContentLoaded", function () {

    // [추가] 페이지 로드 시, 서버에 설정된 파일 용량 제한 값을 가져온다.
    fetch('/api/board/config')
        .then(response => response.json())
        .then(config => {
            if (config && config.maxFileSize) {
                serverMaxFileSize = config.maxFileSize;
                console.log("서버 파일 용량 설정 로드 완료:", serverMaxFileSize + " bytes");
            }
        })
        .catch(err => console.error("설정 로드 실패(기본값 사용):", err));


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
            // formData.append("userId", currentUserId);

            // 4. 파일 용량 체크 (서버에서 가져온 값 사용)
            if (fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];

                    // 가져온 serverMaxFileSize 변수와 비교
                    if (file.size > serverMaxFileSize) {
                        // 보기 좋게 MB 단위로 변환해서 메시지 출력
                        const limitMB = Math.floor(serverMaxFileSize / (1024 * 1024));
                        alert(`첨부파일은 개당 ${limitMB}MB를 초과할 수 없습니다.\n(${file.name})`);
                        return;
                    }

                    formData.append("files", file);
                }
            }

            // 5. 전송
            fetch('/api/board/write', {
                method: 'POST',
                body: formData
            })
                .then(response => {
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
