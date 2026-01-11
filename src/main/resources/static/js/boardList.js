// const currentUserId = 1; // 테스트용 사용자 ID
const currentUserId = 2; // 테스트용 사용자 ID
//const currentUserId = 3; // 테스트용 사용자 ID'
let currentPage = 1;
const itemsPerPage = 5;
let allPosts = [];
let filteredPosts = [];
let currentCategory = "전체";

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    console.log("현재 경로:", path);

    // 1. 게시판 목록 페이지 로드
    const postContainer = document.getElementById("postNumber");
    if (postContainer) {
        loadAndRenderList();
    }

    // 필터 기능
    const filterLinks = document.querySelectorAll(".filter a");
    filterLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const selectedCategory = link.querySelector("span").innerText;
            filterLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            applyFilter(selectedCategory);
        });
    });

    // 2. 상세 페이지 로드 (경로 체크 강화)
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

    // 6. 게시글 수정 버튼 (boardEdit.html 전용)
    const updatePostBtn = document.getElementById('updatePostBtn');
    if (updatePostBtn) {
        updatePostBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get("id");
            if (postId) {
                handlePostUpdate(postId);
            } else {
                alert("게시글 ID를 찾을 수 없습니다.");
            }
        });
    }

    // 7. 상세페이지 내의 수정/삭제 버튼 연결
    const editBtn = document.getElementById("editBtn");
    if (editBtn) {
        editBtn.onclick = () => {
            const urlParams = new URLSearchParams(window.location.search);
            goToEditPage(urlParams.get("id"));
        };
    }

    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const urlParams = new URLSearchParams(window.location.search);
            deleteBoard(urlParams.get("id"));
        };
    }
});

/* ================= 게시글 관련 함수 (파일 업로드 적용) ================= */

async function saveBoard() {
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;
    const category = document.getElementById("boardCategory").value;

    if (!title.trim() || !contents.trim()) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("contents", contents);
    formData.append("category", category);
    formData.append("userId", currentUserId);

    try {
        const response = await fetch("/api/board/write", {
            method: "POST",
            // headers는 절대 적지 마세요.
            body: formData
        });

        if (response.ok) {
            alert("게시글이 등록되었습니다.");
            location.href = "/board/boardList";
        } else {
            alert("등록에 실패했습니다. 서버 로그를 확인하세요.");
        }
    } catch (e) {
        console.error("네트워크 에러:", e);
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
            // 카테고리 텍스트 설정
            const label = (post.category === "A00") ? "자유게시판" : "식당인증";
            if (document.getElementById("mainCategoryTitle")) document.getElementById("mainCategoryTitle").innerText = label;
            if (document.getElementById("detailCategory")) document.getElementById("detailCategory").innerText = label;

            // 데이터 맵핑
            if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = post.title;
            if (document.getElementById("detailContent")) document.getElementById("detailContent").value = post.contents;
            if (document.getElementById("detailWriter")) document.getElementById("detailWriter").innerText = post.writerName || `사용자(${post.userId})`;
            if (document.getElementById("detailDate")) document.getElementById("detailDate").innerText = post.createDate ? post.createDate.substring(0, 10) : '';

            // --- [추가] 파일 목록 표시 로직 ---
            // 만약 서버의 BoardDto에 List<BoardFileDto> files 가 포함되어 있다면 사용
            if (post.files && post.files.length > 0) {
                renderFiles(post.files);
            }

            fetchCommentList(postId);

            // 본인 확인 버튼 권한
            const isOwner = String(post.userId) === String(currentUserId);
            if(document.getElementById("editBtn")) document.getElementById("editBtn").style.display = isOwner ? "inline-block" : "none";
            if(document.getElementById("deleteBtn")) document.getElementById("deleteBtn").style.display = isOwner ? "inline-block" : "none";
        }
    } catch (error) {
        console.error("상세 데이터 로드 실패:", error);
    }
}

// 상세페이지에서 이미지를 보여주는 함수
function renderFiles(files) {
    const contentArea = document.querySelector(".contentPost");
    if (!contentArea) return;

    const fileDiv = document.createElement("div");
    fileDiv.style.marginTop = "20px";
    fileDiv.style.textAlign = "center";

    files.forEach(file => {
        // 이미지 파일인 경우 화면에 출력
        const img = document.createElement("img");
        // 서버에서 파일을 내려주는 API 주소에 맞춰 설정 필요
        img.src = `/api/board/file/display?path=${encodeURIComponent(file.fileAddr)}`;
        img.style.maxWidth = "100%";
        img.style.marginBottom = "10px";
        img.style.borderRadius = "8px";
        fileDiv.appendChild(img);
    });

    contentArea.appendChild(fileDiv);
}

/* ================= 공통 리스트 및 페이징 함수 ================= */

async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        const data = await response.json();
        allPosts = data;
        applyFilter("전체");
    } catch (e) {
        console.error("목롤 로드 중 에러:", e);
    }
}

function renderList(page) {
    const container = document.getElementById("postNumber");
    if (!container) return;

    const startIndex = (page - 1) * itemsPerPage;
    const pagePosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

    if (pagePosts.length > 0) {
        container.innerHTML = pagePosts.map(post => {
            let label = post.category === "B00" ? "식당인증" : "자유게시판";
            return `
            <div class="post">
                <div class="name">
                    <span class="tage">${label}</span>
                    <a href="/board/boardList2?id=${post.id}">${post.title}</a>
                </div>
                <div class="user">${post.writerName || '익명'}</div>
                <div class="userTime">${post.createDate ? post.createDate.substring(0, 10) : ''}</div>
            </div>`;
        }).join('');
    } else {
        container.innerHTML = "<p>게시글이 없습니다.</p>";
    }
}

function renderPagination() {
    const pageList = document.querySelector(".page-list");
    if (!pageList) return;

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button type="button" onclick="goToPage(${i})">${i}</button>
                 </li>`;
    }
    pageList.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderList(currentPage);
    renderPagination();
}

function applyFilter(category) {
    currentCategory = category;
    currentPage = 1;
    if (currentCategory === "전체") {
        filteredPosts = allPosts;
    } else {
        const code = (currentCategory === "자유게시판") ? "A00" : "B00";
        filteredPosts = allPosts.filter(p => p.category === code);
    }
    renderList(currentPage);
    renderPagination();
}

/* ================= 게시글 수정/삭제 관련 ================= */

async function handlePostUpdate(postId) {
    // 1. HTML 요소에서 값 가져오기
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;
    const category = document.getElementById("boardCategory").value;

    if (!title.trim() || !contents.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
    }

    // 2. 보낼 데이터 구성 (CamelCase 사용)
    const updateData = {
        id: parseInt(postId),
        title: title,
        contents: contents,
        category: category,
        userId: currentUserId // 전역 변수로 설정된 ID
    };

    console.log("보내는 데이터:", updateData);

    try {
        // 3. fetch 요청 (JSON 방식)
        const response = await fetch("/api/board/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // JSON임을 명시
            },
            body: JSON.stringify(updateData) // 객체를 문자열로 변환
        });

        if (response.ok) {
            alert("수정이 완료되었습니다.");
            location.href = "/board/boardList"; // 목록으로 이동
        } else {
            const errorMsg = await response.text();
            alert("수정 실패: " + errorMsg);
        }
    } catch (e) {
        console.error("네트워크 에러:", e);
        alert("서버와 통신 중 오류가 발생했습니다.");
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
        container.innerHTML = `<div style="color:#999; padding:20px; text-align:center;">등록된 댓글이 없습니다.</div>`;
        return;
    }

    container.innerHTML = comments.map(c => {
        const isOwner = String(c.userId) === String(currentUserId);
        return `
        <div class="comment-item">
            <div class="comment-left">
                <span class="comment-author">작성자${c.userId}</span>
                <span class="comment-divider">:</span>
                <span class="comment-text">${c.comment}</span>
            </div>
            <div class="comment-right">
                <span class="comment-date">${c.createDate ? c.createDate.substring(0, 10) : ''}</span>
                <div class="comment-btns">
                    ${isOwner ? `
                        <button class="editBtn" onclick="updateComment(${c.id}, ${c.commentSeq})">수정</button>
                        <button class="deleteBtn" onclick="deleteComment(${c.id}, ${c.commentSeq})">삭제</button>
                    ` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

async function updateComment(id, seq){
    const newComment = prompt("수정할 내용을 입력하세요.");
    if (!newComment || !newComment.trim()) return;

    const updateDto = { id, commentSeq: seq, comment: newComment, userId: currentUserId };

    try {
        const response = await fetch("/api/board/comment/update", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(updateDto)
        });
        if (response.ok){
            alert("댓글수정이 완료되었습니다.");
            location.reload();
        }
    } catch (e) { console.error(e); }
}

async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, { method: "POST" });
        if (response.ok) { alert("삭제되었습니다."); location.reload(); }
    } catch (e) { console.error(e); }
}