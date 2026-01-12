// boardList.js

// const currentUserId = 1; // 테스트용 사용자 ID
const currentUserId = 2; // 테스트용 사용자 ID
let currentPage = 1;
const itemsPerPage = 10; // 게시글은 5개씩 출력
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

    // 필터 클릭 이벤트
    const filterLinks = document.querySelectorAll(".filter a");
    filterLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const selectedCategory = link.querySelector("span").innerText;

            if (path.includes("boardList3")) {
                if (selectedCategory !== "식당신청") {
                    location.href = `/board/boardList?category=${encodeURIComponent(selectedCategory)}`;
                }
            } else {
                filterLinks.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                applyFilter(selectedCategory);
            }
        });
    });

    // 2. 상세 페이지 로드
    if (path.includes("boardList2") || path.includes("/board/detail") || path.includes("boardDetail")) {
        initDetailPage();
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

    // 식당신청(boardList3) 페이지용 카테고리 로드 로직 유지
    if (path.includes("boardList3")) {
        initCategorySelects();
    }

    // [추가] 모달 바깥 배경 클릭 시 닫기 기능
    window.onclick = function (event) {
        const modal = document.getElementById("imageModal");
        if (event.target === modal) {
            modal.classList.remove("is-open");
        }
    }
});

/* ================= 게시글 관련 함수 ================= */

async function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!postId) return;

    try {
        const response = await fetch(`/api/board/detail/${postId}`);
        const post = await response.json();

        if (post) {
            const label = (post.category === "A00") ? "자유게시판" : "식당인증";

            // 텍스트 주입
            if (document.getElementById("mainCategoryTitle")) document.getElementById("mainCategoryTitle").innerText = label;
            if (document.getElementById("detailCategory")) document.getElementById("detailCategory").innerText = label;
            if (document.getElementById("detailTitle")) document.getElementById("detailTitle").innerText = post.title;

            // [변경] textarea가 div로 바뀌었으므로 value 대신 innerText 사용
            const contentEl = document.getElementById("detailContent");
            if (contentEl) {
                // 줄바꿈이나 공백을 유지하고 싶다면 innerText가 적절
                contentEl.innerText = post.contents;
            }

            if (document.getElementById("detailWriter")) document.getElementById("detailWriter").innerText = post.writerName || `사용자(${post.userId})`;
            if (document.getElementById("detailDate")) document.getElementById("detailDate").innerText = post.createDate ? post.createDate.substring(0, 10) : '';

            // 파일 렌더링
            if (post.files && post.files.length > 0) renderFiles(post.files);

            // 댓글 로드
            fetchCommentList(postId);

            // 작성자 본인 확인 후 버튼 표시
            const isOwner = String(post.userId) === String(currentUserId);
            const editBtn = document.getElementById("editBtn");
            const deleteBtn = document.getElementById("deleteBtn");

            if (editBtn) editBtn.style.display = isOwner ? "inline-block" : "none";
            if (deleteBtn) deleteBtn.style.display = isOwner ? "inline-block" : "none";
        }
    } catch (error) {
        console.error("상세 로드 실패:", error);
    }
}

// [수정됨] 파일 목록을 썸네일로 렌더링하고, 클릭 시 모달 띄우기
function renderFiles(files) {
    const galleryArea = document.getElementById("galleryArea");
    if (!galleryArea) return;

    galleryArea.innerHTML = "";

    files.forEach(file => {
        const img = document.createElement("img");
        // Controller의 displayFile 메서드 호출 URL
        const imgSrc = `/api/board/file/display?path=${encodeURIComponent(file.fileAddr)}`;

        img.src = imgSrc;
        img.className = "gallery-item"; // CSS 클래스 적용
        img.alt = "첨부이미지";

        // 클릭 시 모달 열기
        img.onclick = function () {
            openImageModal(imgSrc);
        };

        galleryArea.appendChild(img);
    });
}

// [추가] 모달 열기 함수
function openImageModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    if (modal && modalImg) {
        modal.classList.add("is-open");
        modal.style.zIndex = 199999999;
        modalImg.src = src;
    }
}

// [추가] 모달 닫기 함수
function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.classList.remove("is-open");
    }
}


/* ================= 리스트 및 필터 ================= */

async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        allPosts = await response.json();
        applyFilter(currentCategory);
    } catch (e) {
        console.error("목록 로드 에러:", e);
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
                    <a href="/board/boardDetail?id=${post.id}">${post.title}</a>
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
    const pageGroupSize = 10;
    const startPage = (Math.ceil(currentPage / pageGroupSize) - 1) * pageGroupSize + 1;
    let endPage = startPage + pageGroupSize - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
    }

    let html = "";
    if (startPage > 1) {
        html += `<li class="page-item prev"><button type="button" onclick="goToPage(${startPage - 1})">&lt;</button></li>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><button type="button" onclick="goToPage(${i})">${i}</button></li>`;
    }
    if (endPage < totalPages) {
        html += `<li class="page-item next"><button type="button" onclick="goToPage(${endPage + 1})">&gt;</button></li>`;
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

/* ================= 수정/삭제/댓글 ================= */

async function handlePostUpdate(postId) {
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;
    const category = document.getElementById("boardCategory").value;
    const updateData = {id: parseInt(postId), title, contents, category, userId: currentUserId};
    try {
        const response = await fetch("/api/board/update", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updateData)
        });
        if (response.ok) {
            alert("수정 완료");
            location.href = "/board/boardList";
        }
    } catch (e) {
        console.error(e);
    }
}

async function deleteBoard(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/delete/${id}`, {method: "DELETE"});
        if (response.ok) {
            alert("삭제되었습니다.");
            location.href = "/board/boardList";
        }
    } catch (e) {
        console.error(e);
    }
}

function goToEditPage(id) {
    location.href = `/board/boardEdit?id=${id}`;
}

async function fetchCommentList(postId) {
    try {
        const response = await fetch(`/api/board/comment/list/${postId}`);
        if (response.ok) {
            const comments = await response.json();
            renderComments(comments);
        }
    } catch (e) {
        console.error(e);
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
    const commentDto = {id: parseInt(postId), comment: commentInput.value, userId: currentUserId};
    try {
        const response = await fetch("/api/board/comment/write", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(commentDto)
        });
        if (response.ok) {
            alert("댓글 등록 완료");
            commentInput.value = "";
            fetchCommentList(postId);
        }
    } catch (e) {
        console.error(e);
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

async function updateComment(id, seq) {
    const newComment = prompt("수정할 내용을 입력하세요.");
    if (!newComment || !newComment.trim()) return;
    const updateDto = {id, commentSeq: seq, comment: newComment, userId: currentUserId};
    try {
        const response = await fetch("/api/board/comment/update", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updateDto)
        });
        if (response.ok) {
            alert("댓글수정 완료");
            location.reload();
        }
    } catch (e) {
        console.error(e);
    }
}

async function deleteComment(id, seq) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/comment/delete?id=${id}&commentSeq=${seq}`, {method: "POST"});
        if (response.ok) {
            alert("삭제되었습니다.");
            location.reload();
        }
    } catch (e) {
        console.error(e);
    }
}

async function initCategorySelects() {
    try {
        const response = await fetch("/api/category/map");
        const categoryMap = await response.json();
        const config = {
            "category1": "region", "category2": "category", "category3": "shape",
            "category4": "thickness", "category5": "style", "category6": "kind",
            "category7": "rich", "category8": "richness"
        };
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
    } catch (error) {
        console.error("카테고리 데이터 실패:", error);
    }
}
