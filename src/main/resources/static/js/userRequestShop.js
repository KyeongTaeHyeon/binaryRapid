/**
 * userRequestShop.js - tb_board 전용 페이지네이션 적용 버전
 */
let allPostsData = [];    // 전체 게시글 저장
let ITEMS_PER_PAGE = 5;   // 한 페이지당 표시 개수
let currentPage = 1;      // 현재 페이지

const contentEl = document.querySelector('#userRequestMain');    // <tbody>
const paginationList = document.querySelector(".page-list");     // 페이지 번호 <ul>
const prevButton = document.querySelector(".page-btn.prev");     // 이전 버튼
const nextButton = document.querySelector(".page-btn.next");     // 다음 버튼

// 1. 초기 데이터 로드 (me 호출 후 userId로 목록 조회)
async function init() {
    try {
        // [1단계] 내 정보에서 고유 번호(int) 가져오기
        const meRes = await authFetch('/user/me');
        if (!meRes.ok) throw new Error('유저 정보를 불러올 수 없습니다.');
        const result = await meRes.json();
        const myRealUserId = result.data.userId; 

        if (!myRealUserId) return;

        // [2단계] 확보한 숫자 ID로 tb_board 목록 호출
        const listRes = await authFetch(`/user/api/my/reqShopList?userId=${myRealUserId}`);
        if (listRes.ok) {
            allPostsData = await listRes.json();
            updateUI(); // UI 업데이트 호출
        }
    } catch (error) {
        console.error("에러 발생:", error);
        if (contentEl) contentEl.innerHTML = '<tr><td colspan="6" style="text-align:center;">데이터 로드 실패</td></tr>';
    }
}

// 2. UI 갱신 (현재 페이지 데이터만 잘라서 렌더링)
function updateUI() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    renderTable(allPostsData.slice(start, end));
    renderPaginationButtons(allPostsData.length);
}

// 3. 테이블 렌더링
function renderTable(posts) {
    if (!contentEl) return;
    contentEl.innerHTML = '';

    if (posts.length === 0) {
        contentEl.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">작성한 글이 없습니다.</td></tr>';
        return;
    }

    posts.forEach((post, index) => {
        const tr = document.createElement('tr');
        // 순번 계산
        const displayNum = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
        
        tr.innerHTML = `
            <td>${displayNum}</td>
            <td style="cursor:pointer; color:#007bff;" onclick="location.href='/user/board/detail/${post.id}'">
                ${post.title}
            </td>
            <td>${post.category || '일반'}</td>
            <td>${post.category || '게시글'}</td>
            <td>${post.writerName || '본인'}</td>
            <td>${new Date(post.createDate).toLocaleDateString()}</td>
        `;
        contentEl.appendChild(tr);
    });
}

// 4. 페이지네이션 버튼 생성 (userMywish.js 방식 참고)
function renderPaginationButtons(totalItems) {
    if (!paginationList) return;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    paginationList.innerHTML = "";

    // 이전/다음 버튼 상태 제어
    if (prevButton) prevButton.disabled = (currentPage === 1);
    if (nextButton) nextButton.disabled = (currentPage === totalPages);

    // 숫자 버튼 생성
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-link"; // 스타일링을 위해 클래스 추가
        btn.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            updateUI();
        };
        
        li.appendChild(btn);
        paginationList.appendChild(li);
    }
}

// 5. 이전/다음 버튼 이벤트 리스너 (한 번만 등록)
if (prevButton) {
    prevButton.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updateUI();
        }
    };
}

if (nextButton) {
    nextButton.onclick = (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(allPostsData.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            updateUI();
        }
    };
}

// 실행
init();