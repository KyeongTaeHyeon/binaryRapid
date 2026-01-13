let currentPage = 1;
const itemsPerPage = 10;
let allPosts = [];
let filteredPosts = [];
let currentCategory = "전체";

const isLoginList = localStorage.getItem("isLoggedIn") === "true";
let listUserId = null;
try {
    const sessionData = sessionStorage.getItem("cachedUser");
    if (sessionData) listUserId = JSON.parse(sessionData).userId;
} catch (e) {}

function requireLogin() {
    if (!isLoginList || !listUserId) {
        alert("로그인이 필요합니다.");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get("category");

    // ✅ 글쓰기 버튼 활성화 (id="writeBtn" 가정)
    const writeBtn = document.getElementById("writeBtn");
    if (writeBtn) {
        writeBtn.onclick = () => {
            if (requireLogin()) location.href = "/board/write";
        };
    }

    // 1. 목록 로드
    const postContainer = document.getElementById("postNumber");
    if (postContainer) {
        loadAndRenderList().then(() => {
            if (categoryFromUrl) applyFilter(categoryFromUrl);
        });
    }

    // 필터 이벤트
    const filterLinks = document.querySelectorAll(".filter a");
    filterLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const selected = link.querySelector("span").innerText;
            filterLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            applyFilter(selected);
        });
    });
});

async function loadAndRenderList() {
    try {
        const response = await fetch("/api/board/list");
        allPosts = await response.json();
        applyFilter(currentCategory);
    } catch (e) { console.error(e); }
}

function applyFilter(category) {
    currentCategory = category;
    currentPage = 1;
    if (category === "전체") {
        filteredPosts = allPosts;
    } else {
        const code = (category === "자유게시판") ? "A00" : "B00";
        filteredPosts = allPosts.filter(p => p.category === code);
    }
    renderList(currentPage);
    renderPagination();
}

function renderList(page) {
    const container = document.getElementById("postNumber");
    if (!container) return;
    const start = (page - 1) * itemsPerPage;
    const pagePosts = filteredPosts.slice(start, start + itemsPerPage);

    container.innerHTML = pagePosts.length > 0 ? pagePosts.map(post => {
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
    }).join('') : "<p>게시글이 없습니다.</p>";
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
    renderList(page);
    renderPagination();
}