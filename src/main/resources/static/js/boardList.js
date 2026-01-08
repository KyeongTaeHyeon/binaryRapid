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

    // 3. 게시글 등록 버튼
    const submitPostBtn = document.getElementById("submitPostBtn");
    if (submitPostBtn) {
        submitPostBtn.onclick = saveBoard;
    }

    // 4. 댓글 등록 버튼
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

/* ================= 게시글 관련 함수 ================= */

async function saveBoard() {
    const category = document.getElementById("boardCategory")?.value || "B01";
    const title = document.getElementById("postTitle")?.value;
    const contents = document.getElementById("postContent")?.value;

    if (!title?.trim() || !contents?.trim()) {
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

async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!postId) return;

    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = post.title;
            if (document.getElementById("detailContent")) document.getElementById("detailContent").value = post.contents;

            fetchCommentList(postId);

            // 본인 확인 후 수정/삭제 버튼 노출
            const isOwner = String(post.userId) === String(currentUserId);
            const editBtn = document.getElementById("editBtn");
            const delBtn = document.getElementById("deleteBtn");

            if(editBtn) {
                editBtn.style.display = isOwner ? "inline-block" : "none";
                editBtn.onclick = () => goToEditPage(postId);
            }
            if(delBtn) {
                delBtn.style.display = isOwner ? "inline-block" : "none";
                delBtn.onclick = () => deleteBoard(postId);
            }
        }
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

async function deleteBoard(id) {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/delete/${id}`, { method: "DELETE" });
        if (response.ok) {
            alert("삭제되었습니다.");
            location.href = "/board/boardList";
        }
    } catch (e) {
        console.error("삭제 실패:", e);
    }
}

function goToEditPage(id){
    location.href=`/board/boardEdit?id=${id}`;
}

/* ================= 댓글 관련 함수 ================= */

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

async function saveComment() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const commentInput = document.getElementById("commentInput");

    if (!commentInput?.value.trim()) {
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
            fetchCommentList(postId);
        }
    } catch (error) {
        console.error("댓글 저장 에러:", error);
    }
}

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

async function updateComment(id, seq){
    const newComment = prompt("수정할 내용을 입력하세요.");
    if (!newComment || !newComment.trim()) return;

    const updateDto = {
        id: id,
        commentSeq: seq,
        comment: newComment,
        userId: currentUserId
    };

    try {
        const response = await fetch("/api/board/comment/update", { // 앞에 / 추가
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(updateDto)
        });
        if (response.ok){
            alert("댓글수정이 완료되었습니다.");
            location.reload();
        }
    } catch (e) {
        console.error("댓글수정 실패:", e);
    }
}

async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, {
            method: "POST"
        });
        if (response.ok) {
            alert("삭제되었습니다.");
            location.reload();
        }
    } catch (e) {
        console.error("댓글 삭제 실패:", e);
    }
}