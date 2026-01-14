// ✅ 1. 전역 변수 및 세션 로직
// 우선순위: 서버 렌더링(Thymeleaf)에서 내려준 값(window.isLogin / window.loginUserId)
// 이유: localStorage/sessionStorage는 로그아웃/계정 전환 시 stale 값이 남아 다른 사용자로 표시되는 문제가 발생할 수 있음
let currentUserId = null;
const isLogin = (typeof window !== "undefined" && typeof window.isLogin === "boolean")
    ? window.isLogin
    : (localStorage.getItem("isLoggedIn") === "true");

// 1) 서버에서 내려준 loginUserId가 있으면 그 값을 최우선으로 사용
if (typeof window !== "undefined" && window.loginUserId != null && window.loginUserId !== 0) {
    currentUserId = window.loginUserId;
} else {
    // 2) fallback: 세션에 cachedUser가 있으면 그 값을 사용(기존 로직 유지)
    try {
        const sessionData = sessionStorage.getItem("cachedUser");
        if (sessionData) {
            const currentUser = JSON.parse(sessionData);
            currentUserId = currentUser.userId;
        }
    } catch (e) {
        console.error("세션 데이터 파싱 실패:", e);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    // UI 제어 (로그인 여부에 따른 댓글창 노출)
    const commentInputSection = document.getElementById("commentInputSection");
    const loginMessage = document.getElementById("loginMessage");

    if (isLogin && currentUserId) {
        if (commentInputSection) commentInputSection.style.setProperty("display", "flex", "important");
        if (loginMessage) loginMessage.style.display = "none";
    }

    // --- 페이지 구분 및 초기화 ---
    const updatePostBtn = document.getElementById('updatePostBtn');
    // [목록으로 버튼 이동]
    const goListBtn = document.getElementById("goListBtn");
    if (goListBtn) {
        goListBtn.onclick = () => {
            location.href = "/board/boardList";
        };
    }

    if (updatePostBtn) {
        // [수정 페이지 로직]
        if (postId) loadPostDataForEdit(postId);
        updatePostBtn.onclick = (e) => {
            e.preventDefault();
            handlePostUpdate(postId);
        };
    } else if (postId) {
        // [상세 페이지 로직]
        initDetailPage(postId);
    }

    // 댓글 등록 버튼 이벤트
    const commentSubmitBtn = document.getElementById("commentSubmit");
    if (commentSubmitBtn) {
        commentSubmitBtn.onclick = saveComment;
    }
});

/* ================= 게시글 상세보기 및 삭제 로직 ================= */
async function initDetailPage(postId) {
    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        if (!response.ok) return;
        const post = await response.json();

        const isOwner = currentUserId && String(post.userId) === String(currentUserId);

        // 데이터 바인딩
        if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = post.title;
        if (document.getElementById("detailContent")) document.getElementById("detailContent").innerText = post.contents;
        if (document.getElementById("detailWriter")) document.getElementById("detailWriter").innerText = post.writerName || `사용자(${post.userId})`;
        if (document.getElementById("detailDate")) {
            document.getElementById("detailDate").innerText = post.createDate ? post.createDate.substring(0, 10) : 'YYYY-MM-DD';
        }

        renderGallery(post.files || []);

        // 수정/삭제 버튼 제어
        const editBtn = document.getElementById("editBtn");
        const deleteBtn = document.getElementById("deleteBtn");

        if (editBtn) {
            if (isOwner) {
                editBtn.style.display = "inline-flex";
                editBtn.onclick = () => location.href = `/board/boardEdit?id=${postId}`;
            } else {
                editBtn.style.display = "none";
            }
        }

        if (deleteBtn) {
            if (isOwner) {
                deleteBtn.style.display = "inline-flex";
                deleteBtn.onclick = () => deleteBoard(postId);
            } else {
                deleteBtn.style.display = "none";
            }
        }

        fetchCommentList(postId);
    } catch (e) {
        console.error("데이터 로드 오류:", e);
    }
}

// ✅ 게시글 삭제 (서버 DELETE 메서드 대응)
async function deleteBoard(postId) {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
        const response = await fetch(`/api/board/delete/${postId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("게시글이 삭제되었습니다.");
            location.href = '/board/boardList';
        } else {
            alert("삭제에 실패했습니다.");
        }
    } catch (e) {
        console.error("삭제 통신 오류:", e);
    }
}

/* ================= 댓글 렌더링 (디자인 보정 버전) ================= */
function renderComments(comments) {
    const container = document.getElementById("detailCommentList");
    if (!container) return;

    container.innerHTML = comments.map(c => {
        const isCommentOwner = currentUserId && String(c.userId) === String(currentUserId);
        const commentDate = c.createDate ? c.createDate.substring(0, 10) : '';

        return `
        <div class="comment-item" style="border-bottom: 1px solid #eee; padding: 20px 0; display: block;">
            <div style="margin-bottom: 8px;">
                <strong style="font-size: 14px; color: #333;">${c.userName || '익명'}</strong>
                <span style="font-size: 12px; color: #999; margin-left: 10px;">${commentDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div id="text-view-${c.commentSeq}" style="font-size: 14px; color: #444; flex: 1; white-space: pre-line;">
                    ${c.comment}
                </div>
                ${isCommentOwner ? `
                    <div id="action-btns-${c.commentSeq}" style="margin-left: 20px; white-space: nowrap; display: flex; gap: 10px;">
                        <button onclick="showEditForm(${c.commentSeq})" style="color: #6aa9d6; border: none; background: none; cursor: pointer; font-size: 13px;">수정</button>
                        <button onclick="deleteComment(${c.id}, ${c.commentSeq})" style="color: #e57373; border: none; background: none; cursor: pointer; font-size: 13px;">삭제</button>
                    </div>
                ` : ''}
            </div>
            <div id="edit-view-${c.commentSeq}" style="display: none; margin-top: 10px;">
                <div style="border: 1px solid #a3cfe5; border-radius: 4px; padding: 10px;">
                    <textarea id="input-${c.commentSeq}" style="width: 100%; min-height: 60px; border: none; outline: none; resize: none; font-size: 14px;">${c.comment}</textarea>
                </div>
                <div style="text-align: right; margin-top: 8px;">
                    <button onclick="submitEdit(${c.id}, ${c.commentSeq})" style="background: #a3cfe5; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">완료</button>
                    <button onclick="cancelEdit(${c.commentSeq})" style="background: #ccc; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; margin-left: 5px;">취소</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

/* ================= 댓글 로직 ================= */
async function saveComment() {
    const postId = new URLSearchParams(window.location.search).get("id");
    const content = document.getElementById("commentInput").value;
    if (!content.trim()) return;

    const response = await fetch("/api/board/comment/write", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: postId, comment: content, userId: currentUserId})
    });
    if (response.ok) {
        document.getElementById("commentInput").value = "";
        fetchCommentList(postId);
    }
}

async function fetchCommentList(postId) {
    const response = await fetch(`/api/board/comment/list/${postId}`);
    if (response.ok) renderComments(await response.json());
}

function showEditForm(seq) {
    document.getElementById(`text-view-${seq}`).style.display = "none";
    document.getElementById(`action-btns-${seq}`).style.display = "none";
    document.getElementById(`edit-view-${seq}`).style.display = "block";
}

function cancelEdit(seq) {
    document.getElementById(`text-view-${seq}`).style.display = "block";
    document.getElementById(`action-btns-${seq}`).style.display = "flex";
    document.getElementById(`edit-view-${seq}`).style.display = "none";
}

async function submitEdit(id, seq) {
    const newComment = document.getElementById(`input-${seq}`).value;
    const response = await fetch("/api/board/comment/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: id, commentSeq: seq, comment: newComment, userId: currentUserId})
    });
    if (response.ok) fetchCommentList(id);
}

async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, {method: "POST"});
    if (response.ok) fetchCommentList(id);
}

/* ================= 게시글 수정 로직 ================= */
async function loadPostDataForEdit(postId) {
    const response = await fetch(`/api/board/detail/${postId}`);
    if (response.ok) {
        const post = await response.json();
        if (document.getElementById("boardCategory")) document.getElementById("boardCategory").value = post.category;
        if (document.getElementById("postTitle")) document.getElementById("postTitle").value = post.title;
        if (document.getElementById("postContent")) document.getElementById("postContent").value = post.contents;
    }
}

async function handlePostUpdate(postId) {
    const updateDto = {
        id: parseInt(postId),
        title: document.getElementById("postTitle").value,
        contents: document.getElementById("postContent").value,
        category: document.getElementById("boardCategory").value,
        userId: currentUserId
    };
    const response = await fetch("/api/board/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updateDto)
    });
    if (response.ok) {
        alert("게시글이 수정되었습니다.");
        location.href = `/board/boardDetail?id=${postId}`;
    }
}

function renderGallery(files) {
    const gallery = document.getElementById("galleryArea") || document.getElementById("gallerayArea");
    if (!gallery) return;

    if (!Array.isArray(files) || files.length === 0) {
        gallery.innerHTML = "";
        gallery.style.display = "none";
        return;
    }

    gallery.style.display = "grid";
    gallery.innerHTML = "";

    files.forEach(f => {
        const addr = f?.fileAddr;
        if (!addr) return;

        // addr가 '/upload/...' 처럼 '/'로 시작하면 그대로 사용
        // 아니면 display API로 감싸서 사용
        const src = (typeof addr === "string" && addr.startsWith("/"))
            ? addr
            : `/api/board/file/display?path=${encodeURIComponent(addr)}`;

        const img = document.createElement("img");
        img.className = "gallery-item";
        img.src = src;
        img.alt = "첨부 이미지";
        img.loading = "lazy";

        img.addEventListener("click", () => openImageModal(src));
        gallery.appendChild(img);
    });
}

function openImageModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    if (!modal || !modalImg) return;

    modalImg.src = src;
    modal.classList.add("is-open");

    // ✅ 배경(오버레이) 클릭 시 닫히도록 추가
    modal.onclick = (e) => {
        // 이미지 자체를 클릭한 게 아니면 닫기
        if (e.target === modal) {
            closeImageModal();
        }
    };
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    if (!modal || !modalImg) return;

    modal.classList.remove("is-open");
    modalImg.src = "";
}
