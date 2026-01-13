/**
 * userBoardList.js - 전체 통합 버전
 * 기능: 필터 누적, 카테고리 매핑(A00/B00), 날짜/제목 검색, 페이징(이전/다음), 개수 변경
 */

// 1. 전역 상태 관리
let allPosts = []; // 서버에서 받아온 전체 데이터를 저장
let currentPage = 1;
let ITEMS_PER_PAGE = 10;
const MAX_TITLE_LENGTH = 20;

// 검색 조건을 저장할 객체 (필터가 서로 유지되도록 함)
let filterParams = {
    category: '',
    title: '',
    startDate: '',
    endDate: ''
};

// 2. 유틸리티 함수
const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '-';
const truncateTitle = (title) => (title && title.length > MAX_TITLE_LENGTH) ? title.substring(0, MAX_TITLE_LENGTH) + '...' : title;

// 3. 페이지 이동 함수 (window 객체에 등록)
window.goToPage = (page) => {
    currentPage = page;
    showBoardList();
};

// 4. 게시글 삭제 함수
window.deleteBoard = async (boardId) => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/api/board/delete/${boardId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("accessToken")
            }
        });
        if (response.ok) {
            alert("삭제되었습니다.");
            loadBoardData();
        } else {
            alert("삭제에 실패했습니다.");
        }
    } catch (error) {
        console.error("삭제 요청 중 오류:", error);
    }
};

/**
 * 5. 서버 데이터 로드 함수 (API 호출)
 */
async function loadBoardData() {
    try {
        const params = new URLSearchParams();

        // 유효한 검색 조건만 파라미터에 추가
        if (filterParams.category) params.append('category', filterParams.category);
        if (filterParams.title) params.append('title', filterParams.title);
        if (filterParams.startDate) params.append('startDate', filterParams.startDate);
        if (filterParams.endDate) params.append('endDate', filterParams.endDate);

        console.log("--- 데이터 요청 시점 ---");
        const requestUrl = `/user/api/my/filter?${params.toString()}`;
        console.log("요청 URL:", requestUrl);

        const response = await authFetch(requestUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log("서버 응답 데이터 개수:", result.length);

        allPosts = Array.isArray(result) ? result : [];
        currentPage = 1; // 검색 시 항상 1페이지부터
        showBoardList(); // 화면 렌더링 호출
    } catch (e) {
        console.error('데이터 로드 실패:', e);
    }
}

/**
 * 6. 테이블 화면 렌더링
 */
function renderPosts(posts) {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;
    userTableBody.innerHTML = '';

    if (!posts || posts.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">조건에 맞는 게시글이 없습니다.</td></tr>`;
        return;
    }

    posts.forEach((post, index) => {
        const row = document.createElement('tr');

        // DB 코드(A00, B00)를 화면용 한글로 매핑
        let boardName = '기타';
        if (post.category === 'A00') boardName = '자유게시판';
        else if (post.category === 'B00') boardName = '식당인증';

        // 순번 계산
        const displayNum = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

        row.innerHTML = `
            <td>${displayNum}</td>
            <td>${boardName}</td>
            <td>
                <a href="/board/boardList2?id=${post.id}" style="color:inherit; text-decoration:none;">
                    ${truncateTitle(post.title)}
                </a>
            </td>
            <td>${formatDate(post.createDate)}</td>
            <td>
                <button class="delete-btn" onclick="deleteBoard(${post.id})" 
                        style="color:#ff4d4d; border:1px solid #ff4d4d; background:none; cursor:pointer; padding:2px 6px; border-radius:4px;">
                    삭제
                </button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

/**
 * 7. 페이징 계산 및 표시
 */
function showBoardList() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedPosts = allPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    renderPosts(paginatedPosts);
    renderPagination(allPosts.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const paginationList = document.querySelector('.page-list');
    if (!paginationList) return;

    paginationList.innerHTML = '';

    // 이전/다음 버튼 제어
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');

    if (prevBtn) {
        prevBtn.disabled = (currentPage === 1);
        prevBtn.onclick = () => { if (currentPage > 1) window.goToPage(currentPage - 1); };
    }

    if (nextBtn) {
        nextBtn.disabled = (currentPage === totalPages || totalPages === 0);
        nextBtn.onclick = () => { if (currentPage < totalPages) window.goToPage(currentPage + 1); };
    }

    // 숫자 버튼 생성
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button onclick="window.goToPage(${i})">${i}</button>`;
        paginationList.appendChild(li);
    }
}

/**
 * 8. 이벤트 리스너 설정
 */
document.addEventListener('DOMContentLoaded', () => {
    // [A] 카테고리 필터
    const cateBtn = document.querySelector('.board-search-button');
    if (cateBtn) {
        cateBtn.onclick = (e) => {
            e.preventDefault();
            const val = document.getElementById('cate').value;
            // HTML value -> DB Code 변환
            if(val === 'freeBoard') filterParams.category = 'A00';
            else if(val === 'restaurantCert') filterParams.category = 'B00';
            else filterParams.category = ''; // 전체
            loadBoardData();
        };
    }

    // [B] 제목 검색
    const titleBtn = document.querySelector('.title-search-button');
    if (titleBtn) {
        titleBtn.onclick = (e) => {
            e.preventDefault();
            filterParams.title = document.getElementById('searchInput').value;
            loadBoardData();
        };
    }

    // [C] 날짜 검색
    const dateForm = document.getElementById('managerSearchDate');
    if (dateForm) {
        dateForm.onsubmit = (e) => {
            e.preventDefault();
            filterParams.startDate = document.getElementById('start').value;
            filterParams.endDate = document.getElementById('end').value;
            loadBoardData();
        };
    }

    // [D] 페이지당 개수 변경
    const itemsPerPageSelect = document.getElementById('sarray_numbers');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.onchange = () => {
            ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
            currentPage = 1;
            showBoardList();
        };
    }

    // 첫 진입 시 데이터 로드
    loadBoardData();
});