document.addEventListener('DOMContentLoaded', () => {
  const navUserName = document.querySelector('#userName');
  const logInUser = localStorage.getItem('userRegistForm');
  const contentEl = document.querySelector('#userRequestMain');
  const paginationContainer = document.querySelector('#contentNav');

  // JSON 파일 경로
  const jsonFilePath = '/data/requestShop.json';
  const ITEMS_PER_PAGE = 5; // 한 페이지에 표시할 게시글 수
  let currentPage = 1; // 현재 페이지
  let allPostsData = []; // 모든 게시글 데이터

  // 유저 아이디 nav상단 출력
  if (logInUser) {
    const userObject = JSON.parse(logInUser);
    const parUserName = userObject.userName;

    if (parUserName) {
      navUserName.textContent = `${parUserName} 님`;
    }

    // JSON 파일을 비동기적으로 불러오기
    fetch(jsonFilePath)
      .then((response) => {
        // 응답이 성공적이지 않으면 에러 발생
        if (!response.ok) {
          throw new Error('JSON 파일을 불러오는 데 실패했습니다.');
        }
        return response.json();
      })
      .then((data) => {
        // 데이터가 정상적으로 로드되면 로그인한 유저의 글만 필터링
        allPostsData = data.filter((item) => item.userName === parUserName);
        updatePostListAndPagination();
      })
      .catch((error) => {
        console.error('Error loading JSON data:', error);
      });
  }

  // 게시글과 페이지네이션 갱신 함수
  function updatePostListAndPagination() {
    if (!contentEl) {
      console.warn(
        'WARNING: 게시글을 표시할 #userRequestMain 요소를 찾을 수 없습니다.'
      );
      return;
    }

    contentEl.innerHTML = ''; // 기존 게시글 모두 비우기
    paginationContainer.innerHTML = ''; // 페이지네이션 비우기

    // 페이지네이션 로직
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const postsToShow = allPostsData.slice(startIndex, endIndex); // 현재 페이지에 해당하는 게시글만 선택

    // 게시글 데이터 생성 및 추가
    if (postsToShow.length === 0) {
      const noPostMessage = document.createElement('p');
      noPostMessage.textContent = '표시할 게시글이 없습니다.';
      noPostMessage.style.textAlign = 'center';
      noPostMessage.style.padding = '20px';
      contentEl.appendChild(noPostMessage);
    } else {
      postsToShow.forEach((post, index) => {
        const tr = document.createElement('tr'); // tr 요소 생성
        tr.innerHTML = `
          <td>${startIndex + index + 1}</td>
          <td>${post.name}</td>
          <td>${post.region}</td>
          <td>${post.category}</td>
          <td>${post.userName}</td>
          <td>${post.creatAt}</td>
        `;
        contentEl.appendChild(tr); // 게시글 데이터 tr 추가
      });
    }

    // 페이지네이션 버튼 렌더링
    renderPaginationButtons(allPostsData.length);
  }

  // 페이지네이션 버튼 생성 함수
  function renderPaginationButtons(totalPosts) {
    const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE); // 총 페이지 수
    const paginationList = document.createElement('ul');
    paginationList.classList.add('page-list');

    // 첫 페이지 버튼
    if (currentPage > 1) {
      const prevButton = document.createElement('li');
      prevButton.innerHTML = `<button>&lt;</button>`;
      prevButton.addEventListener('click', () => {
        currentPage--;
        updatePostListAndPagination();
      });
      paginationList.appendChild(prevButton);
    }

    // 페이지 번호 버튼들
    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.classList.add('page-item');
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === currentPage) {
        pageItem.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        updatePostListAndPagination();
      });
      pageItem.appendChild(pageButton);
      paginationList.appendChild(pageItem);
    }

    // 마지막 페이지 버튼
    if (currentPage < totalPages) {
      const nextButton = document.createElement('li');
      nextButton.innerHTML = `<button>&gt;</button>`;
      nextButton.addEventListener('click', () => {
        currentPage++;
        updatePostListAndPagination();
      });
      paginationList.appendChild(nextButton);
    }

    paginationContainer.appendChild(paginationList);
  }
});
