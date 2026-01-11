import { LoadData } from './utils.js'; // news.json 데이터를 로드하는 유틸리티 함수 임포트

// ----------------- 전역 변수 선언 -----------------
let newsList = []; // news.json에서 로드될 뉴스 데이터를 저장할 배열
let currentFilter = 'all'; // 현재 선택된 필터 (초기값: 'all' - 전체)
let currentPage = 1; // 현재 페이지 번호 (초기값: 1)
const itemsPerPage = 5; // 한 페이지에 표시할 뉴스 항목 수



document.addEventListener('DOMContentLoaded', async () => {
    setupFilterEvents();
    try {
        await fetchNews();
    } catch (error) {
        console.error("뉴스 로드 실패:", error);
    }
});
const fetchNews = () => {
    const url = `/api/news?page=${currentPage}&size=${itemsPerPage}&tags=${currentFilter}`;

    LoadData(url).then((data) => {
        newsList = data.newsList;
        const totalItems = data.totalItems;

        showNewList(newsList); // 뉴스 목록 출력
        renderPaginationButtons(totalItems); // 페이징 버튼 생성
    });
};



// ----------------- 함수: 뉴스 목록 렌더링 -----------------
let showNewList = (data) => {
    /** @type {HTMLTemplateElement} */
    const newsTemplate = document.getElementById('newsTemplate'); // 템플릿 요소 가져오기
    const newsContainer = document.getElementById('postNumber'); // 뉴스가 표시될 컨테이너
    if (!newsContainer || !newsTemplate) return;
    newsContainer.innerHTML = ''; // 기존 뉴스 목록을 지우고 다시 렌더링

    // // 현재 페이지에 해당하는 뉴스만 슬라이스하여 표시 (페이지네이션)
    const startIndex = (currentPage - 1) * itemsPerPage;
    // const endIndex = startIndex + itemsPerPage;
    // const paginatedNews = filteredNews.slice(startIndex, endIndex);

    // 필터링 및 페이지네이션된 뉴스를 HTML로 변환하여 컨테이너에 추가
    data.forEach((news, index) => {
        // newsTemplate의 내용을 복제하여 사용
        const newsItem = newsTemplate.content.firstElementChild.cloneNode(true);
        // 뉴스 링크 설정 (links 속성이 없으면 기본값으로 '../index.html')
        newsItem.href = news.links || '../index.html';

        const newsNameDiv = newsItem.querySelector('.name');
        newsNameDiv.innerHTML = ''; // 기존 .name div의 내용을 모두 지우기


        let displayId =startIndex + index + 1;
        // 1. ID span 생성 및 추가
        const newsId = document.createElement('span');
        newsId.textContent = `${displayId}. `; // ID 뒤에 점과 공백 추가
        newsId.classList.add('news-id');
        newsNameDiv.appendChild(newsId);

        // 2. 새로운 tag-box 요소 생성 및 텍스트 설정 (태그에 따라 다른 텍스트와 클래스 적용)
        const tagBox = document.createElement('div');
        tagBox.classList.add('tag-box');
        if (news.tags === 'issue') {
            tagBox.textContent = '이슈';
        } else if (news.tags === 'years') {
            tagBox.textContent = '올해의 라멘';
            tagBox.classList.add('tag-box-years'); // '올해의 라멘' 태그에만 추가 CSS 클래스
        } else {
            tagBox.textContent = news.tags || '정보'; // 기타 태그는 그대로 표시
        }
        newsNameDiv.appendChild(tagBox);

        // 3. 제목 span 생성 및 추가
        const newsTitle = document.createElement('span');
        newsTitle.textContent = news.title || 'No Title'; // 제목이 없으면 'No Title'
        newsTitle.classList.add('title-text');
        newsNameDiv.appendChild(newsTitle);

        newsContainer.appendChild(newsItem); // 최종적으로 뉴스 아이템을 컨테이너에 추가

        const article = newsItem.querySelector('article');
        requestAnimationFrame(() => {
            gsap.fromTo(
                article,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            );
        });
    });

};

// ----------------- 함수: 페이지네이션 버튼 렌더링 -----------------
let renderPaginationButtons = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage); // 전체 페이지 수 계산
    const paginationList = document.querySelector('.page-list'); // 페이지 번호 목록 (ul)
    if (!paginationList) return;
    paginationList.innerHTML = ''; // 기존 페이지 버튼 초기화

    // 이전 버튼 (prevButton) 로직
    const prevButton = document.querySelector('.page-btn.prev');
    if (prevButton) {
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--; // 페이지 감소
                fetchNews(); // 뉴스 목록 다시 렌더링
            }
        };
        prevButton.disabled = currentPage === 1; // 첫 페이지면 비활성화
    }

    // --- 페이지 번호 생성 및 생략 기호(…) 로직 ---
    const maxPageButtons = 10; // 화면에 표시할 최대 페이지 버튼 수
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // 만약 끝 페이지가 totalPages에 도달하여 10개를 채우지 못하는 경우,
    // 시작 페이지를 조정하여 뒤에서부터 10개의 페이지가 보이도록 함
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // 첫 페이지로 가는 생략 기호 (...) 표시 로직
    // startPage가 1보다 크면 첫 페이지 버튼 대신 ... 표시
    if (startPage > 1) {
        const ellipsisItem = document.createElement('li');
        ellipsisItem.classList.add('page-item', 'ellipsis');
        ellipsisItem.innerHTML = `<span>...</span>`;
        paginationList.appendChild(ellipsisItem);
    }

    // 계산된 범위 내의 페이지 번호 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage) {
            pageItem.classList.add('active'); // 현재 페이지 활성화
        }

        const pageButton = document.createElement('button');
        pageButton.textContent = i; // 버튼 텍스트는 페이지 번호
        pageButton.onclick = () => {
            currentPage = i; // 클릭된 페이지로 현재 페이지 설정
            fetchNews(); // 뉴스 목록 다시 렌더링
        };
        pageItem.appendChild(pageButton);
        paginationList.appendChild(pageItem);
    }

    // 마지막 페이지로 가는 생략 기호 (...) 및 마지막 페이지 번호 표시 로직
    // endPage가 totalPages보다 작으면 마지막 페이지 버튼 앞에 ... 표시
    if (endPage < totalPages) {
        const ellipsisItem = document.createElement('li');
        ellipsisItem.classList.add('page-item', 'ellipsis');
        ellipsisItem.innerHTML = `<span>...</span>`;
        paginationList.appendChild(ellipsisItem);

        // 마지막 페이지 번호 버튼 추가
        const lastPageItem = document.createElement('li');
        lastPageItem.classList.add('page-item');
        if (totalPages === currentPage) {
            // 마지막 페이지가 현재 페이지면 활성화
            lastPageItem.classList.add('active');
        }
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages; // 클릭 시 마지막 페이지로 이동
            fetchNews();
        };
        lastPageItem.appendChild(lastPageButton);
        paginationList.appendChild(lastPageItem);
    }
    // --- 페이지 번호 생성 및 생략 기호(…) 로직 끝 ---

    // 다음 버튼 (nextButton) 로직
    const nextButton = document.querySelector('.page-btn.next');
    if (nextButton) {
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++; // 페이지 증가
                fetchNews(); // 뉴스 목록 다시 렌더링
            }
        };
        nextButton.disabled = currentPage === totalPages; // 마지막 페이지면 비활성화
    }
};

// ----------------- 함수: 필터 이벤트 설정 -----------------
// 필터 링크(<a> 태그)에 클릭 이벤트를 추가하여 뉴스 목록을 필터링합니다.
let setupFilterEvents = () => {
    const filterLinks = document.querySelectorAll('.filter a'); // 모든 필터 링크 선택
    filterLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // <a> 태그의 기본 동작(페이지 이동) 방지

            // 모든 필터 링크에서 'active' 클래스 제거 (시각적 활성화 초기화)
            filterLinks.forEach((l) => {
                l.classList.remove('active');
            });

            // 클릭된 링크에만 'active' 클래스 추가 (시각적 활성화)
            link.classList.add('active');

            const span = link.querySelector('span');
            gsap.fromTo(
                span,
                { y: 18, scale: 0.92, opacity: 0.7 },
                {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 0.32,
                    ease: 'back.out(1.7)',
                }
            );

            // 클릭된 필터 텍스트에 따라 currentFilter 변수 업데이트
            const filterText = link.querySelector('span').textContent;
            if (filterText === '전체') {
                currentFilter = 'all';
            } else if (filterText === '라면 관련 이슈') {
                currentFilter = 'issue';
            } else if (filterText === '올해의 라멘') {
                currentFilter = 'years';
            }
            currentPage = 1; // 필터 변경 시 현재 페이지를 1로 리셋
            fetchNews(); // 새 필터로 뉴스 목록 다시 렌더링
        });
    });
};
