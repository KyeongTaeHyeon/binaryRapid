/**
 * userBoardList.js - 작성글 관리 통합 스크립트
 */

// 1. 전역 상태 관리
let allPosts = [];
let currentPage = 1;
let ITEMS_PER_PAGE = 10;
const MAX_TITLE_LENGTH = 20;

let filterParams = {
    category: '',
    title: '',
    startDate: '',
    endDate: ''
};

// 2. 유틸리티 함수
const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '-';
const truncateTitle = (title) => (title && title.length > MAX_TITLE_LENGTH) ? title.substring(0, MAX_TITLE_LENGTH) + '...' : title;

// 3. 모듈 스코프 탈출 (window 등록)
window.goToPage = (page) => {
    currentPage = page;
    showBoardList();
};

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
            alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    } catch (error) {
        console.error("삭제 요청 중 오류:", error);
    }
};

/**
 * 4. 데이터 로드 함수
 */
async function loadBoardData() {
    try {
        const { category, title, startDate, endDate } = filterParams;
        const query = `category=${category}&title=${encodeURIComponent(title)}&startDate=${startDate}&endDate=${endDate}`;
        
        console.log("데이터 요청 중:", query);
        
        // authFetch 호출
        const response = await authFetch(`/user/api/my/filter?${query}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // 서버 응답 로그 확인 (여기서 구조를 확인해야 합니다)
        const result = await response.json();
        console.log("실제 서버 응답값:", result);
        
        // 서버 응답 구조가 { data: [...] } 인지 그냥 [...] 인지에 따라 처리
        if (Array.isArray(result)) {
            allPosts = result;
        } else if (result.data && Array.isArray(result.data)) {
            allPosts = result.data;
        } else {
            allPosts = [];
        }
        
        currentPage = 1; 
        showBoardList();
    } catch (e) {
        console.error('데이터 로드 실패:', e);
        const userTableBody = document.getElementById('userTableBody');
        if (userTableBody) {
            userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">데이터 로딩 중 오류가 발생했습니다.</td></tr>`;
        }
    }
}

/**
 * 5. 렌더링 함수들
 */
function renderPosts(posts) {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;
    userTableBody.innerHTML = '';

    if (!posts || posts.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">작성한 게시글이 없습니다.</td></tr>`;
        return;
    }

    posts.forEach((post, index) => {
        const row = document.createElement('tr');
        let boardName = '기타';
        if (post.category === 'B00' || post.category === 'restaurantCert') boardName = '식당인증';
        else if (post.category === 'A00' || post.category === 'freeBoard') boardName = '자유게시판';

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
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages || totalPages === 0);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button onclick="goToPage(${i})">${i}</button>`;
        paginationList.appendChild(li);
    }
}

/**
 * 6. 초기 실행 및 이벤트 바인딩
 */
document.addEventListener('DOMContentLoaded', () => {
    // [검색 버튼들]
    const cateBtn = document.querySelector('.board-search-button');
    if (cateBtn) {
        cateBtn.onclick = (e) => {
            e.preventDefault();
            filterParams.category = document.getElementById('cate').value;
            loadBoardData();
        };
    }

    const titleBtn = document.querySelector('.title-search-button');
    if (titleBtn) {
        titleBtn.onclick = (e) => {
            e.preventDefault();
            filterParams.title = document.getElementById('searchInput').value;
            loadBoardData();
        };
    }

    const dateForm = document.getElementById('managerSearchDate');
    if (dateForm) {
        dateForm.onsubmit = (e) => {
            e.preventDefault();
            filterParams.startDate = document.getElementById('start').value;
            filterParams.endDate = document.getElementById('end').value;
            loadBoardData();
        };
    }

    // [페이징/개수 설정]
    const itemsPerPageSelect = document.getElementById('sarray_numbers');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.onchange = () => {
            ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
            currentPage = 1;
            showBoardList();
        };
    }

    loadBoardData(); // 초기 로드
});