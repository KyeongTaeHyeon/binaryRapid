let currentPage = 1;
const itemsPerPage = 10;
let allPosts = [];
let filteredPosts = [];
let currentCategory = "전체";
let noticePosts = []; // 공지사항 저장용

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
        // 공지사항 로드
        const noticeRes = await fetch("/api/board/notices");
        if (noticeRes.ok) {
            noticePosts = await noticeRes.json();
        }

        // 일반 게시글 로드
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

// 공지 유형 라벨 반환 함수 (JS용)
function getNoticeTypeLabel(type) {
    switch(parseInt(type)) {
        case 1: return "일반";
        case 2: return "이벤트";
        case 3: return "긴급";
        case 4: return "기타";
        default: return "공지";
    }
}

// 공지 유형별 색상 반환 함수
function getNoticeTypeStyle(type) {
    switch(parseInt(type)) {
        case 1: return "background-color: #e6f7ff; color: #1890ff;"; // 파랑
        case 2: return "background-color: #f6ffed; color: #52c41a;"; // 초록
        case 3: return "background-color: #fff1f0; color: #ff4d4f;"; // 빨강
        default: return "background-color: #f5f5f5; color: #666;";   // 회색
    }
}

/**
 * 현재 카테고리와 페이지에 맞는 통합 리스트 반환
 */
function getCombinedDisplayList() {
    let combined = [];
    
    // '전체' 카테고리일 때만 공지사항을 포함
    if (currentCategory === "전체") {
        const activeNotices = noticePosts.filter(n => n.noticeYN === 'Y').map(n => ({...n, isNotice: true}));
        combined = [...activeNotices, ...filteredPosts];
    } else {
        combined = filteredPosts;
    }
    
    return combined;
}

function renderList(page) {
    const container = document.getElementById("postNumber");
    if (!container) return;

    const combinedList = getCombinedDisplayList();
    const start = (page - 1) * itemsPerPage;
    const pageItems = combinedList.slice(start, start + itemsPerPage);

    let html = "";

    if (pageItems.length > 0) {
        html = pageItems.map(item => {
            if (item.isNotice) {
                // 공지사항 렌더링
                const typeLabel = getNoticeTypeLabel(item.noticeType);
                const typeStyle = getNoticeTypeStyle(item.noticeType);
                return `
                <div class="post notice-row" style="background-color: #fdf2f2;">
                    <div class="name">
                        <span class="tage" style="${typeStyle}">${typeLabel}</span>
                        <a href="/board/boardDetail?id=${item.noticeId}&type=notice" style="font-weight: bold;">${item.noticeTitle}</a>
                    </div>
                    <div class="user">${item.nickName || '관리자'}</div>
                    <div class="userTime">${item.noticeCreateAt || ''}</div>
                </div>`;
            } else {
                // 일반 게시글 렌더링
                let label = item.category === "B00" ? "식당인증" : "자유게시판";
                return `
                <div class="post">
                    <div class="name">
                        <span class="tage">${label}</span>
                        <a href="/board/boardDetail?id=${item.id}">${item.title}</a>
                    </div>
                    <div class="user">${item.writerName || '익명'}</div>
                    <div class="userTime">${item.createDate ? item.createDate.substring(0, 10) : ''}</div>
                </div>`;
            }
        }).join('');
    } else {
        html = "<p>게시글이 없습니다.</p>";
    }

    container.innerHTML = html;
}

function renderPagination() {
    const pageList = document.querySelector(".page-list");
    if (!pageList) return;
    
    const combinedList = getCombinedDisplayList();
    const totalPages = Math.ceil(combinedList.length / itemsPerPage) || 1;

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
