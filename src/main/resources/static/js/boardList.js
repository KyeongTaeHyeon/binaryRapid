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
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get("category"); // URL에서 카테고리 읽기

    console.log("현재 경로:", path);

    // 1. 게시판 목록 페이지 로드
    const postContainer = document.getElementById("postNumber");
    if (postContainer) {
        // [수정] 목록 로드 후 URL에 카테고리가 있다면 필터 적용
        loadAndRenderList().then(() => {
            if (categoryFromUrl) {
                applyFilter(categoryFromUrl);
                // UI 활성화 처리
                const filterLinks = document.querySelectorAll(".filter a");
                filterLinks.forEach(link => {
                    const spanText = link.querySelector("span").innerText;
                    link.classList.toggle("active", spanText === categoryFromUrl);
                });
            }
        });
    }

    // [중요] 필터 클릭 이벤트 (식당신청 페이지 고려)
    const filterLinks = document.querySelectorAll(".filter a");
    filterLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // 기본 이동 막음
            const selectedCategory = link.querySelector("span").innerText;

            // 페이지 위치에 따라 다르게 동작
            if (path.includes("boardList3")) {
                // 식당신청 페이지에서 클릭하면 목록 페이지로 이동
                if (selectedCategory !== "식당신청") {
                    location.href = `/board/boardList?category=${encodeURIComponent(selectedCategory)}`;
                }
            } else {
                // 일반 목록 페이지에서는 기존 필터링 로직 실행
                filterLinks.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                applyFilter(selectedCategory);
            }
        });
    });

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

    // [추가] 식당신청(boardList3) 페이지용 카테고리 로드 로직 유지
    if (path.includes("boardList3")) {
        initCategorySelects();
    }
});

/* ================= 게시글 관련 함수 (기존 유지) ================= */

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
            body: formData
        });

        if (response.ok) {
            alert("게시글이 등록되었습니다.");
            location.href = "/board/boardList";
        } else {
            alert("등록에 실패했습니다.");
        }
    } catch (e) { console.error("네트워크 에러:", e); }
}

async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!postId) return;

    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            const label = (post.category === "A00") ? "자유게시판" : "식당인증";
            if (document.getElementById("mainCategoryTitle")) document.getElementById("mainCategoryTitle").innerText = label;
            if (document.getElementById("detailCategory")) document.getElementById("detailCategory").innerText = label;
            if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = post.title;
            if (document.getElementById("detailContent")) document.getElementById("detailContent").value = post.contents;
            if (document.getElementById("detailWriter")) document.getElementById("detailWriter").innerText = post.writerName || `사용자(${post.userId})`;
            if (document.getElementById("detailDate")) document.getElementById("detailDate").innerText = post.createDate ? post.createDate.substring(0, 10) : '';

            if (post.files && post.files.length > 0) renderFiles(post.files);
            fetchCommentList(postId);

            const isOwner = String(post.userId) === String(currentUserId);
            if(document.getElementById("editBtn")) document.getElementById("editBtn").style.display = isOwner ? "inline-block" : "none";
            if(document.getElementById("deleteBtn")) document.getElementById("deleteBtn").style.display = isOwner ? "inline-block" : "none";
        }
    } catch (error) { console.error("상세 로드 실패:", error); }
}

function renderFiles(files) {
    const contentArea = document.querySelector(".contentPost");
    if (!contentArea) return;
    const fileDiv = document.createElement("div");
    fileDiv.style.marginTop = "20px";
    fileDiv.style.textAlign = "center";
    files.forEach(file => {
        const img = document.createElement("img");
        img.src = `/api/board/file/display?path=${encodeURIComponent(file.fileAddr)}`;
        img.style.maxWidth = "100%";
        img.style.marginBottom = "10px";
        img.style.borderRadius = "8px";
        fileDiv.appendChild(img);
    });
    contentArea.appendChild(fileDiv);
}

/* ================= 리스트 및 필터 (핵심 수정) ================= */

async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        allPosts = await response.json();
        applyFilter(currentCategory);
    } catch (e) { console.error("목록 로드 에러:", e); }
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
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
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
    if (category === "식당신청") {
        location.href = "/boardList3";
        return;
    }
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

/* ================= 수정/삭제/댓글 (기존 유지) ================= */

async function handlePostUpdate(postId) {
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;
    const category = document.getElementById("boardCategory").value;
    const updateData = { id: parseInt(postId), title, contents, category, userId: currentUserId };
    try {
        const response = await fetch("/api/board/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });
        if (response.ok) { alert("수정 완료"); location.href = "/board/boardList"; }
    } catch (e) { console.error(e); }
}

async function deleteBoard(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/delete/${id}`, { method: "DELETE" });
        if (response.ok) { alert("삭제되었습니다."); location.href = "/board/boardList"; }
    } catch (e) { console.error(e); }
}

function goToEditPage(id){ location.href=`/board/boardEdit?id=${id}`; }

async function fetchCommentList(postId) {
    try {
        const response = await fetch(`/api/board/comment/list/${postId}`);
        if (response.ok) {
            const comments = await response.json();
            renderComments(comments);
        }
    } catch (e) { console.error(e); }
}

async function saveComment() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const commentInput = document.getElementById("commentInput");
    if (!commentInput?.value.trim()) { alert("내용을 입력해주세요."); return; }
    const commentDto = { id: parseInt(postId), comment: commentInput.value, userId: currentUserId };
    try {
        const response = await fetch("/api/board/comment/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentDto)
        });
        if (response.ok) { alert("댓글 등록 완료"); commentInput.value = ""; fetchCommentList(postId); }
    } catch (e) { console.error(e); }
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
        if (response.ok){ alert("댓글수정 완료"); location.reload(); }
    } catch (e) { console.error(e); }
}

async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, {method: "POST"});
        if (response.ok) { alert("삭제되었습니다."); location.reload(); }
    } catch (e) { console.error(e); }
}

/* ================= 식당신청 카테고리 로드 (기존 유지) ================= */

async function initCategorySelects() {
    try {
        const response = await fetch("/api/category/map");
        const categoryMap = await response.json();
        const config = { "category1": "region", "category2": "category", "category3": "shape", "category4": "thickness", "category5": "style", "category6": "kind", "category7": "rich", "category8": "richness" };
        Object.entries(config).forEach(([selectId, groupId]) => {
            const selectElement = document.getElementById(selectId);
            const items = categoryMap[groupId];
            if (selectElement && items) {
                items.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
                    selectElement.appendChild(option);
                });
            }
        });
    } catch (error) { console.error("카테고리 데이터 실패:", error); }
}