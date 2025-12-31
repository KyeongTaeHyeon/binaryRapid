// userManagement.js

let allUsers = [];
let ITEMS_PER_PAGE = 10; // 초기값 10개 (HTML select의 기본값과 일치시킵니다)
let currentPage = 1;

const userTableBody = document.getElementById('userTableBody');
const paginationList = document.querySelector('.page-list');
const prevButton = document.querySelector('.page-btn.prev');
const nextButton = document.querySelector('.page-btn.next');
const itemsPerPageSelect = document.getElementById('sarray_numbers'); // select 요소 가져오기

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
 * 사용자 목록을 테이블에 렌더링하는 함수
 * @param {Array} users - 현재 페이지에 표시할 사용자 데이터 배열
 */
function renderUserList(users) {
  userTableBody.innerHTML = '';

  if (users.length === 0) {
    const noDataRow = document.createElement('tr');
    const noDataCell = document.createElement('td');
    noDataCell.colSpan = 7;
    noDataCell.textContent = '표시할 회원 정보가 없습니다.';
    noDataCell.style.textAlign = 'center';
    noDataRow.appendChild(noDataCell);
    userTableBody.appendChild(noDataRow);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    // JSON 데이터의 키 이름과 HTML <th>의 순서가 일치하는지 다시 확인해주세요.
    // 현재는 id, name, mail, type, age, sex, time 기준으로 되어 있습니다.
    row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.mail}</td>
            <td>${user.type}</td>
            <td>${user.age}</td>
            <td>${user.sex}</td>
            <td>${user.time}</td>
        `;
    userTableBody.appendChild(row);
  });
}

/**
 * 페이지네이션 버튼을 렌더링하는 함수
 * @param {number} totalItems - 전체 항목(회원) 수
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
      updateUserListAndPagination();
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
      updateUserListAndPagination();
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
      updateUserListAndPagination();
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
 * 현재 페이지에 해당하는 회원 목록을 가져와 렌더링하고, 페이지네이션을 업데이트하는 주 함수
 */
function updateUserListAndPagination() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const usersToDisplay = allUsers.slice(startIndex, endIndex);

  renderUserList(usersToDisplay);
  renderPaginationButtons(allUsers.length);
}

// DOMContentLoaded 이벤트 발생 시 JSON 데이터를 로드하고 초기화
document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = localStorage.getItem('adminIsTrue') === 'true';
  const loginUserName = localStorage.getItem('loginUserName');
  const adminNickEl = document.getElementById('adminNick');

  if (isAdmin && loginUserName && adminNickEl) {
    adminNickEl.textContent = `관리자 ${loginUserName} 님`;
  }

  // '이전'/'다음' 버튼에 이벤트 리스너 할당
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateUserListAndPagination();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        updateUserListAndPagination();
      }
    });
  }

  // 페이지당 항목 수 변경 드롭다운 이벤트 리스너
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', (event) => {
      ITEMS_PER_PAGE = parseInt(event.target.value);
      currentPage = 1;
      updateUserListAndPagination();
    });
  }

  // JSON 파일 로드
  loadBoardData('/data/manager.json')
    .then((data) => {
      allUsers = data;

      // 드롭다운의 현재 선택 값으로 ITEMS_PER_PAGE 초기화
      if (itemsPerPageSelect) {
        ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
      }

      updateUserListAndPagination();
    })
    .catch((error) => {
      console.error('Failed to load manager.json:', error);
      userTableBody.innerHTML =
        '<tr><td colspan="7" style="text-align:center; color:red;">회원 데이터를 불러오는 데 실패했습니다.</td></tr>';
      paginationList.innerHTML = '';
      if (prevButton) prevButton.disabled = true;
      if (nextButton) nextButton.disabled = true;
      if (itemsPerPageSelect) itemsPerPageSelect.disabled = true;
    });
});
