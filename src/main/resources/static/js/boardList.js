// boardList.js

const ITEMS_PER_PAGE = 5;
// 현재 로그인한 유저 정보 (추후 세션이나 LocalStorage에서 가져오도록 설정)
const currentUserId = 1;

document.addEventListener("DOMContentLoaded", function () {
    const currentPageFileName = window.location.pathname.split("/").pop();

    let detailViewTitleH1;
    let detailContentView;
    let detailButtons;

    // --- API 데이터 로드 함수 ---
    async function loadBoardData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            return null;
        }
    }

    // --- 페이지별 초기화 ---
    if (currentPageFileName === "boardList2.html") {
        initDetailPage();
    }

    // --- 상세 페이지 초기화 및 권한 제어 ---
    async function initDetailPage() {
        detailViewTitleH1 = document.querySelector(".creatPost .title h1");
        detailContentView = document.querySelector(".contentPost input");
        detailButtons = document.querySelector("#bTn");
        const commentListContainer = document.querySelector(".commentList");

        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("post_id");

        if (postId) {
            const post = await loadBoardData(`/api/board/detail/${postId}`);
            if (post) {
                // 1. 게시글 내용 렌더링
                if (detailViewTitleH1) detailViewTitleH1.textContent = post.title;
                if (detailContentView) {
                    detailContentView.value = post.content;
                    detailContentView.readOnly = true; // 기본적으로 읽기 전용
                }

                // 2. 게시글 수정/삭제 버튼 권한 제어
                const updateBtn = detailButtons?.querySelector("button:nth-child(2)");
                const deleteBtn = detailButtons?.querySelector("button:nth-child(3)");

                if (post.userId === currentUserId) {
                    // 작성자 본인인 경우
                    if (updateBtn) {
                        updateBtn.style.display = "inline-block";
                        updateBtn.onclick = () => enableEditMode(post);
                    }
                    if (deleteBtn) {
                        deleteBtn.style.display = "inline-block";
                        deleteBtn.onclick = () => deletePost(post.id);
                    }
                } else {
                    // 작성자가 아닌 경우 버튼 숨김
                    if (updateBtn) updateBtn.style.display = "none";
                    if (deleteBtn) deleteBtn.style.display = "none";
                }

                // 3. 댓글 목록 렌더링 (댓글 데이터가 포함되어 있다고 가정)
                // 만약 별도 API라면 loadBoardData(`/api/board/comment/list/${postId}`) 호출
                renderCommentList(post.id, commentListContainer);
            }
        }
    }

    // --- 게시글 수정 모드 전환 ---
    function enableEditMode(post) {
        detailContentView.readOnly = false;
        detailContentView.focus();

        const updateBtn = detailButtons.querySelector("button:nth-child(2)");
        updateBtn.textContent = "저장";
        updateBtn.onclick = async () => {
            const updatedData = {
                id: post.id,
                title: post.title,
                content: detailContentView.value,
                category: post.category
            };
            await updatePost(updatedData);
        };
    }

    // --- 댓글 리스트 렌더링 (본인 확인 포함) ---
    async function renderCommentList(postId, container) {
        if (!container) return;
        // 실제 운영시는 서버에서 댓글 목록을 가져오는 API 호출
        const comments = await loadBoardData(`/api/board/comment/list/${postId}`);

        container.innerHTML = "";
        if(!comments) return;

        comments.forEach(comment => {
            const isMyComment = comment.userId === currentUserId;
            const commentItem = document.createElement("div");
            commentItem.className = "commentItem";

            // 작성자 본인일 때만 수정/삭제 버튼 포함
            const actionButtons = isMyComment ? `
                <button class="editBtn" onclick="editCommentPrompt(${postId}, ${comment.commentSeq}, '${comment.comment}')">수정</button>
                <button class="deleteBtn" onclick="removeComment(${postId}, ${comment.commentSeq})">삭제</button>
            ` : "";

            commentItem.innerHTML = `
                <div class="commentTop">
                    <span class="commentUser">작성자(ID:${comment.userId})</span>
                    <span class="commentContent">${comment.comment}</span>
                    <button class="replyBtn" onclick="showReplyInput(${comment.commentSeq})">답글</button>
                    ${actionButtons}
                </div>
                <div id="replyInput-${comment.commentSeq}" class="replyInputArea" style="display:none; margin-left: 20px;">
                    <input type="text" placeholder="답글을 입력하세요" id="replyText-${comment.commentSeq}">
                    <button onclick="saveReply(${comment.commentSeq})">등록</button>
                </div>
            `;
            container.appendChild(commentItem);
        });
    }

    // --- 전역 함수 등록 (HTML onclick 대응) ---
    window.removeComment = async (id, seq) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        const res = await fetch(`/api/board/comment/delete/${id}/${seq}`, { method: "DELETE" });
        if (res.ok) location.reload();
    };

    window.editCommentPrompt = (id, seq, oldMsg) => {
        const newMsg = prompt("댓글 수정 내용을 입력하세요:", oldMsg);
        if (newMsg && newMsg !== oldMsg) {
            editComment(id, seq, newMsg);
        }
    };
});