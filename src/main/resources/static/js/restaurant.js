let currentUserId = 2;
let currentPage = 1;
const itemsPerPage = 10;
let allApplications = [];

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // 1. 리스트 페이지 (Restaurant.html)
    if (path.includes("/restaurant/list")) {
        loadRestaurantList();
    }

    // 2. 상세 페이지 (RestaurantDetail.html)
    if (path.includes("/restaurant/detail")) {
        initRestaurantDetailPage();
    }

    // 3. 등록 버튼 연결
    const submitBtn = document.getElementById("submitPostBtn");
    if (submitBtn) submitBtn.onclick = saveRestaurant;

    // 4. 수정/삭제/목록 버튼 연결 (상세페이지 전용)
    setupDetailButtons();
});

/* 리스트 로드 및 출력 */
async function loadRestaurantList() {
    try {
        const response = await fetch("/api/restaurant/list");
        allApplications = await response.json();
        renderList(1);
    } catch (e) { console.error("리스트 로드 에러:", e); }
}

function renderList(page) {
    const container = document.getElementById("postNumber");
    if (!container) return;

    const start = (page - 1) * itemsPerPage;
    const pageData = allApplications.slice(start, start + itemsPerPage);

    container.innerHTML = pageData.map(item => `
        <div class="post">
            <div class="name">
                <span class="tage">신청</span>
                <a href="/restaurant/detail?id=${item.id}">${item.title}</a>
            </div>
            <div class="user">${item.writerName || '익명'}</div>
            <div class="userTime">${item.createDate ? item.createDate.substring(0, 10) : ''}</div>
        </div>
    `).join('');
    renderPagination();
}

/* 데이터 저장 (등록) */
async function saveRestaurant() {
    const title = document.getElementById("postTitle").value;
    const contents = document.getElementById("postContent").value;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("contents", contents);
    formData.append("userId", currentUserId);

    const response = await fetch("/api/restaurant/write", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        alert("식당 신청이 등록되었습니다.");
        location.href = "/restaurant/list";
    }
}

/* 상세 페이지 초기화 */
async function initRestaurantDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    const response = await fetch(`/api/restaurant/detail/${id}`);
    const data = await response.json();

    if (data) {
        document.getElementById("detailTitle").innerText = data.title;
        document.getElementById("detailContent").value = data.contents;
        document.getElementById("detailWriter").innerText = data.writerName || `사용자(${data.userId})`;

        // 본인 확인 후 수정/삭제 버튼 노출
        const isOwner = String(data.userId) === String(currentUserId);
        if(document.getElementById("editBtn")) document.getElementById("editBtn").style.display = isOwner ? "inline-block" : "none";
        if(document.getElementById("deleteBtn")) document.getElementById("deleteBtn").style.display = isOwner ? "inline-block" : "none";
    }
}