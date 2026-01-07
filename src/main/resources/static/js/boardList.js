// boardList.js
const currentUserId = 1; // 테스트용 사용자 ID

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // 1. 게시판 목록 로드
    if (document.getElementById("postNumber")) {
        loadAndRenderList();
    }

    // 2. 상세 페이지 로드
    if (path.includes("boardList2")) {
        initDetailPage();
    }

    // 3. ⭐ 글쓰기 등록 버튼 이벤트 (boardList4.html 용)
    const submitPostBtn = document.getElementById("submitPostBtn");
    if (submitPostBtn) {
        submitPostBtn.onclick = saveBoard; // 이 연결이 없으면 글쓰기가 안 됩니다.
    }

    // 4. 댓글 등록 버튼
    const commentSubmitBtn = document.getElementById("commentSubmit");
    if (commentSubmitBtn) {
        commentSubmitBtn.onclick = saveComment;
    }
});

/**
 * [게시글 저장] boardList4.html의 등록 버튼용
 */
async function saveBoard() {
    const category = document.getElementById("boardCategory").value;
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;

    if (!title.trim() || !contents.trim()) {
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
            const boardId = await response.json();
            alert("게시글이 등록되었습니다.");
            location.href = "/board/boardList";
        }
    } catch (e) {
        console.error("글 저장 에러:", e);
    }
}

/**
 * [상세 페이지 초기화] 수정/삭제 버튼 권한 체크 포함
 */
async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!postId) return;

    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            document.getElementById("detailTitle").innerText = post.title;
            document.getElementById("detailContent").value = post.contents;

            // ⭐ 게시글 수정/삭제 버튼 권한 체크
            const editBtn = document.getElementById("editBtn");
            const deleteBtn = document.getElementById("deleteBtn");

            // 데이터 타입이 다를 수 있으므로 String으로 변환해서 비교
            const isOwner = String(post.userId) === String(currentUserId);

            if (editBtn) editBtn.style.display = isOwner ? "inline-block" : "none";
            if (deleteBtn) deleteBtn.style.display = isOwner ? "inline-block" : "none";

            // 게시글 삭제 버튼 이벤트 연결
            if (deleteBtn) {
                deleteBtn.onclick = () => deleteBoard(postId);
            }

            fetchCommentList(postId);
        }
    } catch (e) { console.error(e); }
}

/**
 * [게시글 삭제]
 */
async function deleteBoard(id) {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/board/delete/${id}`, { method: "DELETE" });
    if (res.ok) {
        alert("삭제되었습니다.");
        location.href = "/board/boardList";
    }
}

/**
 * [댓글 수정] - DTO 필드명 commentSeq에 맞춰 수정
 */
async function updateComment(id, seq) {
    const newComment = prompt("수정할 내용을 입력하세요.");
    if (!newComment || !newComment.trim()) return;

    const updateDto = {
        id: id,
        commentSeq: seq, // ⭐ comment_seq가 아니라 DTO와 똑같은 camelCase로!
        comment: newComment,
        userId: currentUserId
    };

    const response = await fetch("/api/board/comment/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateDto)
    });

    if (response.ok) {
        alert("수정되었습니다.");
        location.reload();
    }
}

/**
 * [댓글 삭제]
 */
async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, {
        method: "POST"
    });
    if (response.ok) {
        alert("삭제되었습니다.");
        location.reload();
    }
}

// 나머지 목록 렌더링(loadAndRenderList) 등은 기존과 동일하게 유지...