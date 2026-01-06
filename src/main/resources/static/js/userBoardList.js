// userBoardList.js

let allPosts = [];
let ITEMS_PER_PAGE = 10;
let currentPage = 1;

const userTableBody = document.getElementById('userTableBody');
const paginationList = document.querySelector('.page-list');
const prevButton = document.querySelector('.page-btn.prev');
const nextButton = document.querySelector('.page-btn.next');
const itemsPerPageSelect = document.getElementById('sarray_numbers');

let currentSearchType = '';
let currentSearchTitle = '';
let currentStartDate = '';
let currentEndDate = '';

const boardCategorySelect = document.getElementById('cate');
const searchInput = document.getElementById('searchInput');
const searchButtons = document.querySelectorAll('#managerSearch button');
const managerSearchDateForm = document.getElementById('managerSearchDate');
const startDateInput = document.getElementById('start');
const endDateInput = document.getElementById('end');
/**
 * 외부 JSON 파일을 비동기적으로 로드하는 함수
 * @param {string} url - JSON 파일의 경로
 * @returns {Promise<Array>} - 로드된 JSON 데이터 배열을 반환하는 Promise
 */
async function loadBoardData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} at ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading board data:', error);
    return [];
  }
}

/**
 * 게시글 목록을 테이블에 렌더링하는 함수
 * @param {Array} postsToDisplay - 현재 페이지에 표시할 게시글 데이터 배열
 */
function renderPostsToTable(postsToDisplay) {
  userTableBody.innerHTML = '';

  if (postsToDisplay.length === 0) {
    const noDataRow = document.createElement('tr');
    const noDataCell = document.createElement('td');
    noDataCell.colSpan = 4;
    noDataCell.textContent = '표시할 게시글이 없습니다.';
    noDataCell.style.textAlign = 'center';
    noDataRow.appendChild(noDataCell);
    userTableBody.appendChild(noDataRow);
    return;
  }

  // 변경: 렌더링 시점에 post.id 대신 순차적인 ID를 사용
  postsToDisplay.forEach((post, index) => {
    // index를 추가로 받습니다.
    const row = document.createElement('tr');

    let boardName = '';
    if (post.type && post.type.startsWith('B')) {
      boardName = '식당인증';
    } else if (post.type && post.type.startsWith('A')) {
      boardName = '자유게시판';
    } else {
      boardName = '기타';
    }

    // 현재 페이지의 첫 번째 항목이 1로 시작하도록 계산
    const displayId = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    row.innerHTML = `
            <td>${displayId}</td> <td>${boardName}</td>
            <td>${post.title}</td>
            <td>${post.time}</td>
        
        `;
    userTableBody.appendChild(row);
  });
}

/**
 * 페이지네이션 버튼을 렌더링하는 함수
 * @param {number} totalItems - 전체 게시글 수
 */
function renderPaginationButtons(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  paginationList.innerHTML = '';

  if (prevButton) {
    prevButton.disabled = currentPage === 1;
    prevButton.style.opacity = currentPage === 1 ? '0.5' : '1';
    prevButton.style.pointerEvents = currentPage === 1 ? 'none' : 'auto';
  }

  const maxPageButtons = 10;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  if (startPage > 1) {
    const firstPageItem = document.createElement('li');
    firstPageItem.classList.add('page-item');
    const firstPageButton = document.createElement('button');
    firstPageButton.textContent = 1;
    firstPageButton.onclick = () => {
      currentPage = 1;
      updatePostListAndPagination();
    };
    firstPageItem.appendChild(firstPageButton);
    paginationList.appendChild(firstPageItem);

    if (startPage > 2) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.classList.add('page-item', 'ellipsis');
      ellipsisItem.innerHTML = `<span>...</span>`;
      paginationList.appendChild(ellipsisItem);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement('li');
    pageItem.classList.add('page-item');
    if (i === currentPage) {
      pageItem.classList.add('active');
    }

    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => {
      currentPage = i;
      updatePostListAndPagination();
    };
    pageItem.appendChild(pageButton);
    paginationList.appendChild(pageItem);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisItem = document.createElement('li');
      ellipsisItem.classList.add('page-item', 'ellipsis');
      ellipsisItem.innerHTML = `<span>...</span>`;
      paginationList.appendChild(ellipsisItem);
    }

    const lastPageItem = document.createElement('li');
    lastPageItem.classList.add('page-item');
    if (totalPages === currentPage) {
      lastPageItem.classList.add('active');
    }
    const lastPageButton = document.createElement('button');
    lastPageButton.textContent = totalPages;
    lastPageButton.onclick = () => {
      currentPage = totalPages;
      updatePostListAndPagination();
    };
    lastPageItem.appendChild(lastPageButton);
    paginationList.appendChild(lastPageItem);
  }

  if (nextButton) {
    nextButton.disabled = currentPage === totalPages;
    nextButton.style.opacity = currentPage === totalPages ? '0.5' : '1';
    nextButton.style.pointerEvents =
      currentPage === totalPages ? 'none' : 'auto';
  }
}

/**
 * 현재 페이지에 해당하는 게시글 목록을 가져와 렌더링하고, 페이지네이션을 업데이트하는 주 함수
 */
function updatePostListAndPagination() {
  let filteredPosts = [...allPosts];

  // 1. 게시판 카테고리 필터링
  if (currentSearchType === 'A') {
    filteredPosts = filteredPosts.filter(
      (post) => post.type && post.type.startsWith('A')
    );
  } else if (currentSearchType === 'B') {
    filteredPosts = filteredPosts.filter(
      (post) => post.type && post.type.startsWith('B')
    );
  }

  // 2. 제목 검색 필터링
  if (currentSearchTitle) {
    const searchTerm = currentSearchTitle.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) => post.title && post.title.toLowerCase().includes(searchTerm)
    );
  }

  // 3. 날짜 범위 필터링
  if (currentStartDate && currentEndDate) {
    const start = new Date(currentStartDate);
    const end = new Date(currentEndDate);
    filteredPosts = filteredPosts.filter((post) => {
      if (!post.time) return false;
      const postDate = new Date(post.time);
      return postDate >= start && postDate <= end;
    });
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

  renderPostsToTable(postsToDisplay);
  renderPaginationButtons(filteredPosts.length);
}

// DOMContentLoaded 이벤트 발생 시 JSON 데이터를 로드하고 초기화
document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = localStorage.getItem('adminIsTrue') === 'true';
  const loginUserName = localStorage.getItem('loginUserName');
  const adminNickEl = document.getElementById('adminNick');

  if (isAdmin && loginUserName && adminNickEl) {
    adminNickEl.textContent = `관리자 ${loginUserName} 님`;
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updatePostListAndPagination();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      let totalFilteredPosts = allPosts;
      if (currentSearchType === 'A') {
        totalFilteredPosts = totalFilteredPosts.filter(
          (post) => post.type && post.type.startsWith('A')
        );
      } else if (currentSearchType === 'B') {
        totalFilteredPosts = totalFilteredPosts.filter(
          (post) => post.type && post.type.startsWith('B')
        );
      }
      if (currentSearchTitle) {
        const searchTerm = currentSearchTitle.toLowerCase();
        totalFilteredPosts = totalFilteredPosts.filter(
          (post) => post.title && post.title.toLowerCase().includes(searchTerm)
        );
      }
      if (currentStartDate && currentEndDate) {
        const start = new Date(currentStartDate);
        const end = new Date(currentEndDate);
        totalFilteredPosts = totalFilteredPosts.filter((post) => {
          if (!post.time) return false;
          const postDate = new Date(post.time);
          return postDate >= start && postDate <= end;
        });
      }

      const totalPages = Math.ceil(totalFilteredPosts.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        updatePostListAndPagination();
      }
    });
  }

  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', (event) => {
      ITEMS_PER_PAGE = parseInt(event.target.value);
      currentPage = 1;
      updatePostListAndPagination();
    });
  }

  if (boardCategorySelect) {
    boardCategorySelect.addEventListener('change', (event) => {
      const selectedValue = event.target.value;
      if (selectedValue === 'freeBoard') {
        currentSearchType = 'A';
      } else if (selectedValue === 'restaurantCert') {
        currentSearchType = 'B';
      } else {
        currentSearchType = '';
      }
      currentPage = 1;
      updatePostListAndPagination();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        currentSearchTitle = searchInput.value.trim();
        currentPage = 1;
        updatePostListAndPagination();
      }
    });
  }

  searchButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (searchInput && searchInput.value !== undefined) {
        currentSearchTitle = searchInput.value.trim();
      }
      currentPage = 1;
      updatePostListAndPagination();
    });
  });

  if (managerSearchDateForm) {
    managerSearchDateForm.addEventListener('submit', (event) => {
      event.preventDefault();

      currentStartDate = startDateInput.value;
      currentEndDate = endDateInput.value;

      if (
        currentStartDate &&
        currentEndDate &&
        new Date(currentStartDate) > new Date(currentEndDate)
      ) {
        alert('시작 날짜는 종료 날짜보다 늦을 수 없습니다.');
        return;
      }

      currentPage = 1;
      updatePostListAndPagination();
    });
  }

  loadBoardData('/data/userBoardList.json')
    .then((data) => {
      allPosts = data;

      // --- 여기! 렌더링 직전에 ID를 순차적으로 재할당합니다. ---
      // 이 방식은 초기 로드 시 전체 데이터에 순차 ID를 부여하고,
      // 렌더링 시에는 현재 페이지에서의 순서를 계산하여 사용합니다.
      // allPosts = data.map((post, index) => ({ ...post, id: index + 1 }));
      // 위 코드는 원본 데이터의 ID를 변경하므로,
      // 렌더링 시에만 순차 ID를 계산하는 방식으로 변경하겠습니다.

      if (itemsPerPageSelect) {
        ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
      }

      updatePostListAndPagination();
    })
    .catch((error) => {
      console.error('Failed to load userBoardList.json:', error);
      userTableBody.innerHTML =
        '<tr><td colspan="4" style="text-align:center; color:red;">게시글 데이터를 불러오는 데 실패했습니다.</td></tr>';
      paginationList.innerHTML = '';
      if (prevButton) prevButton.disabled = true;
      if (nextButton) nextButton.disabled = true;
      if (itemsPerPageSelect) itemsPerPageSelect.disabled = true;
    });
});
