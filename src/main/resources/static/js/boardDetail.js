// ✅ 1. 전역 변수 및 세션 로직
let currentUserId = null;
const isLogin = (typeof window !== "undefined" && typeof window.isLogin === "boolean")
    ? window.isLogin
    : (localStorage.getItem("isLoggedIn") === "true");

if (typeof window !== "undefined" && window.loginUserId != null && window.loginUserId !== 0) {
    currentUserId = window.loginUserId;
} else {
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
    const isNotice = urlParams.get("type") === "notice"; // 공지사항 여부 확인

    const commentInputSection = document.getElementById("commentInputSection");
    const loginMessage = document.getElementById("loginMessage");

    if (isLogin && currentUserId) {
        if (commentInputSection) commentInputSection.style.setProperty("display", "flex", "important");
        if (loginMessage) loginMessage.style.display = "none";
    }

    const goListBtn = document.getElementById("goListBtn");
    if (goListBtn) {
        goListBtn.onclick = () => {
            location.href = "/board/boardList";
        };
    }

    if (postId) {
        if (isNotice) {
            initNoticeDetailPage(postId); // 공지사항 상세 로드
        } else {
            initDetailPage(postId); // 일반 게시글 상세 로드
        }
    }

    const commentSubmitBtn = document.getElementById("commentSubmit");
    if (commentSubmitBtn) {
        commentSubmitBtn.onclick = saveComment;
    }
});

/* ================= 공지사항 유형 헬퍼 함수 ================= */
function getNoticeTypeLabel(type) {
    switch(parseInt(type)) {
        case 1: return "일반";
        case 2: return "이벤트";
        case 3: return "긴급";
        case 4: return "기타";
        default: return "공지";
    }
}

function setNoticeTypeStyle(element, type) {
    if (!element) return;
    switch(parseInt(type)) {
        case 1: 
            element.style.backgroundColor = "#e6f7ff";
            element.style.color = "#1890ff";
            break;
        case 2: 
            element.style.backgroundColor = "#f6ffed";
            element.style.color = "#52c41a";
            break;
        case 3: 
            element.style.backgroundColor = "#fff1f0";
            element.style.color = "#ff4d4f";
            break;
        default: 
            element.style.backgroundColor = "#f5f5f5";
            element.style.color = "#666";
            break;
    }
}

/* ================= 공지사항 상세보기 로직 ================= */
async function initNoticeDetailPage(noticeId) {
    try {
        const response = await fetch(`/api/board/notices`);
        if (!response.ok) return;
        const notices = await response.json();
        const notice = notices.find(n => String(n.noticeId) === String(noticeId));

        if (!notice) {
            alert("존재하지 않는 공지사항입니다.");
            return;
        }

        // 데이터 바인딩
        if (document.getElementById("detailCategory")) {
            const cat = document.getElementById("detailCategory");
            cat.innerText = getNoticeTypeLabel(notice.noticeType);
            setNoticeTypeStyle(cat, notice.noticeType);
        }
        if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = notice.noticeTitle;
        if (document.getElementById("detailContent")) document.getElementById("detailContent").innerText = notice.noticeContent;
        if (document.getElementById("detailWriter")) document.getElementById("detailWriter").innerText = notice.nickName || '관리자';
        if (document.getElementById("detailDate")) {
            document.getElementById("detailDate").innerText = notice.noticeCreateAt || '';
        }

        // 공지사항은 수정/삭제 버튼 숨김
        if (document.getElementById("editBtn")) document.getElementById("editBtn").style.display = "none";
        if (document.getElementById("deleteBtn")) document.getElementById("deleteBtn").style.display = "none";
        
        // 공지사항은 댓글 섹션 전체 비활성화 (숨김)
        const commentSection = document.querySelector(".comment-section");
        if (commentSection) {
            commentSection.style.setProperty("display", "none", "important");
        }

    } catch (e) {
        console.error("공지사항 로드 오류:", e);
    }
}

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

    const postId = new URLSearchParams(window.location.search).get("id");

    gallery.style.display = "grid";
    gallery.innerHTML = "";

    files.forEach(f => {
        const seq = f?.fileSeq;
        const addr = f?.fileAddr;
        if (!seq && !addr) return;

        // 신버전(옵션B): API로 제공
        // 구버전(정적경로): /img/... 형태면 그대로 접근
        let src;
        if (typeof addr === "string" && addr.startsWith("/img/")) {
            src = addr;
        } else if (postId && seq) {
            src = `/api/board/file/${encodeURIComponent(postId)}/${encodeURIComponent(seq)}`;
        } else if (typeof addr === "string" && addr.startsWith("/")) {
            // 혹시라도 절대경로가 들어온 경우
            src = addr;
        } else if (typeof addr === "string" && addr.length > 0) {
            // 마지막 fallback: 기존 display API
            src = `/api/board/file/display?path=${encodeURIComponent(addr)}`;
        } else {
            return;
        }

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
