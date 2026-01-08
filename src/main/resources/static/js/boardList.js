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
    if (path.includes("boardList2") || path.includes("/board/detail")) {
        initDetailPage();
    }

    // 3. 게시글 등록 버튼 (boardList4)
    const submitPostBtn = document.getElementById("submitPostBtn");
    if (submitPostBtn) {
        submitPostBtn.onclick = saveBoard;
    }

    // 4. 댓글 등록 버튼 (boardList2)
    const commentSubmitBtn = document.getElementById("commentSubmit");
    if (commentSubmitBtn) {
        commentSubmitBtn.onclick = saveComment;
    }

    // 5. 목록으로 이동 버튼
    const goListBtn = document.getElementById("goListBtn");
    if (goListBtn) {
        goListBtn.onclick = () => {
            location.href = "/board/boardList";
        };
    }
});

/**
 * [게시글 저장]
 */
async function saveBoard() {
    const category = document.getElementById("boardCategory")?.value || "B01";
    const title = document.getElementById("postTitle")?.value;
    const contents = document.getElementById("postContent")?.value;

    if (!title || !title.trim() || !contents || !contents.trim()) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    const boardDto = {
        category: category,
        title: title,
        contents: contents,
        userId: currentUserId
    };

    try {
        const response = await fetch("/api/board/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(boardDto)
        });

        if (response.ok) {
            alert("게시글이 등록되었습니다.");
            location.href = "/board/boardList";
        }
    } catch (e) {
        console.error("글 저장 에러:", e);
    }
}

/**
 * [목록 렌더링]
 */
async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        const data = await response.json();
        const container = document.getElementById("postNumber");

        if (!container) return;

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
        } else {
            container.innerHTML = "<p>게시글이 없습니다.</p>";
        }
    } catch (e) {
        console.error("목록 로드 중 에러:", e);
    }
}

/**
 * [상세 페이지 초기화]
 */
async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!postId) return;

    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            // 상세 페이지 필드가 있다면 매핑 (ID 확인 필요)
            const detailTitle = document.getElementById("detailTitle");
            if (detailTitle) detailTitle.innerText = post.title;

            const detailContent = document.getElementById("detailContent");
            if (detailContent) detailContent.value = post.contents;

            fetchCommentList(postId);
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

/**
 * [댓글 목록 가져오기]
 */
async function fetchCommentList(postId) {
    try {
        const response = await fetch(`/api/board/comment/list/${postId}`);
        if (response.ok) {
            const comments = await response.json();
            renderComments(comments);
        }
    } catch (e) {
        console.error("댓글 로드 실패:", e);
    }
}

/**
 * [댓글 저장]
 */
async function saveComment() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const commentInput = document.getElementById("commentInput");

    if (!commentInput || !commentInput.value.trim()) {
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
            fetchCommentList(postId); // 페이지 새로고침 대신 목록만 새로고침
        }
    } catch (error) {
        console.error("댓글 저장 에러:", error);
    }
}

/**
 * [댓글 렌더링]
 */
function renderComments(comments) {
    const container = document.getElementById("detailCommentList");
    if (!container) return;

    if (!comments || comments.length === 0) {
        container.innerHTML = `<div style="color:#999; padding:10px;">등록된 댓글이 없습니다.</div>`;
        return;
    }

    container.innerHTML = comments.map(c => {
        const isOwner = String(c.userId) === String(currentUserId);
        const seq = c.commentSeq;

        return `
        <div class="commentItem" style="border-bottom:1px solid #eee; padding:10px;">
            <div><strong>익명(${c.userId})</strong>: ${c.comment}</div>
            <div class="commentBtns">
                ${isOwner ? `
                    <button onclick="updateComment(${c.id}, ${seq})">수정</button>
                    <button onclick="deleteComment(${c.id}, ${seq})">삭제</button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}