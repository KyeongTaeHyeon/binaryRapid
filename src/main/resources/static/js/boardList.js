const currentUserId = 1; // 테스트용 사용자 ID

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    console.log("현재 경로:", path);

    // 1. 게시판 목록 페이지 로드
    const postContainer = document.getElementById("postNumber");
    if (postContainer) {
        loadAndRenderList();
    }

    // 2. 상세 페이지 로드
    if (path.includes("boardList2") || path.includes("/board/boardList2") || path.includes("/board/detail")) {
        initDetailPage();
    }

    // 3. 댓글 등록 버튼 이벤트
    const commentSubmitBtn = document.getElementById("commentSubmit");
    if (commentSubmitBtn) {
        commentSubmitBtn.onclick = saveComment;
    }

    // 4. 목록으로 이동 버튼
    const goListBtn = document.getElementById("goListBtn");
    if (goListBtn) {
        goListBtn.onclick = () => {
            location.href = "/board/boardList";
        };
    }
});

/**
 * [목록 렌더링]
 */
async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        const data = await response.json();
        const container = document.getElementById("postNumber");

        if (data && data.length > 0) {
            let html = "";
            data.forEach(post => {
                let categoryName = post.category === "B00" ? "식당인증" : "자유게시판";
                html += `
                <div class="post">
                    <div class="name">
                        <span class="tage">${categoryName}</span>
                        <a href="/board/boardList2?id=${post.id}">${post.title}</a>
                    </div>
                    <div class="user">${post.writerName || '익명'}</div>
                    <div class="userTime">${post.createDate ? post.createDate.substring(0, 10) : ''}</div>
                </div>`;
            });
            container.innerHTML = html;
        }
    } catch (e) {
        console.error("목록 로드 중 에러:", e);
    }
}

/**
 * [상세 페이지 초기화] 게시글 정보와 댓글 목록을 로드합니다.
 */
// boardList.js 내의 initDetailPage 함수 수정본
async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    if (!postId) return;

    try {
        // 1. 게시글 본문 로드
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            // ... (기존 제목, 작성자 매핑 로직 생략) ...
            document.getElementById("detailContent").value = post.contents;

            // 2. ⭐ 댓글 목록을 "강제로" 따로 한 번 더 가져옵니다.
            fetchCommentList(postId);
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// [추가] 댓글 목록만 따로 가져오는 함수
async function fetchCommentList(postId) {
    try {
        // 컨트롤러에 이 주소가 있어야 합니다!
        const response = await fetch(`/api/board/comment/list/${postId}`);
        if (response.ok) {
            const comments = await response.json();
            renderComments(comments); // 화면에 그리기
        }
    } catch (e) {
        console.error("댓글 로드 실패:", e);
    }
}

/**
 * [댓글 목록 별도 로드] post 객체에 댓글이 없을 경우 호출
 */
async function fetchCommentList(postId) {
    try {
        const response = await fetch(`/api/board/comment/list/${postId}`);
        if (response.ok) {
            const comments = await response.json();
            renderComments(comments);
        }
    } catch (e) {
        console.error("댓글 목록 로드 실패:", e);
    }
}

/**
 * [댓글 저장]
 */
async function saveComment() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const commentInput = document.getElementById("commentInput");

    if (!commentInput.value.trim()) {
        alert("내용을 입력해주세요.");
        return;
    }

    const commentDto = {
        id: parseInt(postId),
        comment: commentInput.value,
        userId: currentUserId
    };

    try {
        const response = await fetch("/api/board/comment/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentDto)
        });

        if (response.ok) {
            alert("댓글이 등록되었습니다.");
            commentInput.value = "";
            location.reload();
        }
    } catch (error) {
        console.error("댓글 저장 에러:", error);
    }
}

/**
 * [댓글 목록 렌더링]
 */
function renderComments(comments) {
    const container = document.getElementById("detailCommentList");
    if (!container) return;

    if (!comments || comments.length === 0) {
        container.innerHTML = `<div style="color:#999; padding:10px;">등록된 댓글이 없습니다.</div>`;
        return;
    }

    container.innerHTML = comments.map(c => {
        // 본인 확인 (DTO의 userId와 현재 세션의 currentUserId 비교)
        const isOwner = String(c.userId) === String(currentUserId);

        // MyBatis camelCase 설정에 의해 comment_seq -> commentSeq로 전달됨
        const seq = c.commentSeq;

        return `
        <div class="commentItem" style="...">
            <div><strong>${c.userId}</strong>: ${c.comment}</div>
            <div class="commentBtns">
                ${isOwner ? `
                    <button onclick="updateComment(${c.id}, ${seq})">수정</button>
                    <button onclick="deleteComment(${c.id}, ${seq})">삭제</button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}
