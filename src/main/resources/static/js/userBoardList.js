// userBoardList.js

let allPosts = [];
let currentPage = 1;
let ITEMS_PER_PAGE = 10;
const MAX_TITLE_LENGTH = 20;

// DOM
const userTableBody = document.getElementById('userTableBody');
const paginationList = document.querySelector('.page-list');
const prevButton = document.querySelector('.page-btn.prev');
const nextButton = document.querySelector('.page-btn.next');
const itemsPerPageSelect = document.getElementById('sarray_numbers');

// ----------------- 날짜 포맷터 (yyyy-MM-dd) -----------------
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
}

// ----------------- 제목 길이 제한 -----------------
function truncateTitle(title, maxLength = MAX_TITLE_LENGTH) {
  if (!title) return '';
  return title.length > maxLength
    ? title.substring(0, maxLength) + '...'
    : title;
}

// ----------------- 게시글 로드 -----------------
async function loadBoardData() {
  try {
    const response = await fetch('/user/api/my/board');

    if (response.status === 401) {
      alert('로그인이 필요합니다.');
      location.href = '/';
      return [];
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('게시글 로딩 실패:', e);
    return [];
  }
}

// ----------------- 게시글 삭제 -----------------
async function deleteBoard(boardId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`/board/delete?id=${boardId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('삭제 실패');
    }

    alert('삭제되었습니다.');

    // 🔥 목록 다시 로드
    allPosts = await loadBoardData();
    currentPage = 1;
    showBoardList();
  } catch (e) {
    console.error(e);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

// ----------------- 테이블 렌더링 -----------------
function renderPosts(posts) {
  userTableBody.innerHTML = '';

  if (posts.length === 0) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">
          작성한 게시글이 없습니다.
        </td>
      </tr>
    `;
    return;
  }

  posts.forEach((post, index) => {
    const row = document.createElement('tr');

    let boardName = '기타';
    if (post.type?.startsWith('B')) boardName = '식당인증';
    else if (post.type?.startsWith('A')) boardName = '자유게시판';

    const displayId = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
    const shortTitle = truncateTitle(post.title);

    row.innerHTML = `
      <td>${displayId}</td>
      <td>${boardName}</td>
      <td>
        <a href="/board/view?id=${post.id}" title="${post.title}">
          ${shortTitle}
        </a>
      </td>
      <td>${formatDate(post.createDate)}</td>
      <td>
        <button class="delete-btn" data-id="${post.id}">
          삭제
        </button>
      </td>
    `;

    userTableBody.appendChild(row);
  });

  // 🔥 삭제 버튼 이벤트 바인딩
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const boardId = btn.dataset.id;
      deleteBoard(boardId);
    });
  });
}

// ----------------- 페이지 + 목록 갱신 -----------------
function showBoardList() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  renderPosts(paginatedPosts);
  renderPaginationButtons(allPosts.length);
}

// ----------------- 페이지네이션 버튼 -----------------
function renderPaginationButtons(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  paginationList.innerHTML = '';

  // prev
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      showBoardList();
    }
  };
  prevButton.disabled = currentPage === 1;

  const maxPageButtons = 10;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  if (startPage > 1) {
    paginationList.innerHTML += `
      <li class="page-item ellipsis"><span>...</span></li>
    `;
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (i === currentPage) li.classList.add('active');

    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      showBoardList();
    };

    li.appendChild(btn);
    paginationList.appendChild(li);
  }

  if (endPage < totalPages) {
    paginationList.innerHTML += `
      <li class="page-item ellipsis"><span>...</span></li>
    `;

    const lastLi = document.createElement('li');
    lastLi.classList.add('page-item');
    if (currentPage === totalPages) lastLi.classList.add('active');

    const lastBtn = document.createElement('button');
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      currentPage = totalPages;
      showBoardList();
    };

    lastLi.appendChild(lastBtn);
    paginationList.appendChild(lastLi);
  }

  // next
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      showBoardList();
    }
  };
  nextButton.disabled = currentPage === totalPages;
}

// ----------------- 초기 로드 -----------------
document.addEventListener('DOMContentLoaded', async () => {
  if (itemsPerPageSelect) {
    ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);

    itemsPerPageSelect.addEventListener('change', () => {
      ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
      currentPage = 1;
      showBoardList();
    });
  }

  allPosts = await loadBoardData();
  currentPage = 1;
  showBoardList();
});
