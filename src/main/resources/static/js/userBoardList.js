// 1. 토큰 체크 (즉시 실행)
(function() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인 정보가 없습니다. 로그인 페이지로 이동합니다.");
    location.href = "/login";
    return;
  }
})();

let allPosts = [];
let currentPage = 1;
let ITEMS_PER_PAGE = 10;
const MAX_TITLE_LENGTH = 20;

// DOM 요소
const userTableBody = document.getElementById('userTableBody');
const paginationList = document.querySelector('.page-list');
const prevButton = document.querySelector('.page-btn.prev');
const nextButton = document.querySelector('.page-btn.next');
const itemsPerPageSelect = document.getElementById('sarray_numbers');

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
}

// 제목 제한
function truncateTitle(title, maxLength = MAX_TITLE_LENGTH) {
  if (!title) return '';
  return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
}

// 데이터 로드
async function loadBoardData() {
  try {
    const response = await Fetch('/user/api/my/board', { method: 'GET' });

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('데이터 로드 실패:', e);
    return [];
  }
}


// 게시글 삭제
async function deleteBoard(boardId) {
  if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

  try {
    const token = localStorage.getItem("accessToken");
    // BoardController의 @DeleteMapping("/delete/{id}") 경로 사용
    const response = await fetch(`/api/board/delete/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (response.ok) {
      alert("삭제되었습니다.");
      // 새로고침 대신 배열에서 제거 후 재렌더링
      allPosts = allPosts.filter(post => String(post.id) !== String(boardId));
      showBoardList();
    } else {
      alert("삭제 권한이 없거나 오류가 발생했습니다.");
    }
  } catch (error) {
    alert("서버 통신 오류");
  }
}

// 테이블 렌더링
function renderPosts(posts) {
  if (!userTableBody) return;
  userTableBody.innerHTML = '';

  if (posts.length === 0) {
    userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">작성한 게시글이 없습니다.</td></tr>`;
    return;
  }

  posts.forEach((post, index) => {
    const row = document.createElement('tr');

    let boardName = '기타';
    if (post.category === 'B00') boardName = '식당인증';
    else if (post.category === 'A00') boardName = '자유게시판';

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
            <button class="delete-btn" data-id="${post.id}" 
                    style="color:#ff4d4d; border:1px solid #ff4d4d; background:none; cursor:pointer; padding:2px 6px; border-radius:4px;">
                삭제
            </button>
        </td>
    `;
    userTableBody.appendChild(row);
  });

  // 버튼 이벤트 연결
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => deleteBoard(btn.dataset.id);
  });
}

// 페이징 처리
function showBoardList() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  renderPosts(paginatedPosts);
  renderPagination(allPosts.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (!paginationList) return;
  paginationList.innerHTML = '';

  if (prevButton) prevButton.disabled = (currentPage === 1);
  if (nextButton) nextButton.disabled = (currentPage === totalPages || totalPages === 0);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; showBoardList(); };
    li.appendChild(btn);
    paginationList.appendChild(li);
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  if (itemsPerPageSelect) {
    ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
    itemsPerPageSelect.onchange = () => {
      ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
      currentPage = 1;
      showBoardList();
    };
  }

  if (prevButton) prevButton.onclick = () => { if (currentPage > 1) { currentPage--; showBoardList(); } };
  if (nextButton) nextButton.onclick = () => {
    const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) { currentPage++; showBoardList(); }
  };

  allPosts = await loadBoardData();
  showBoardList();
});