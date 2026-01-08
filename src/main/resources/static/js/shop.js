// shop.js

// 현재 페이지 상태 관리 변수
let currentPage = 0;

// [1] 전역 등록: 접기/펴기 핸들러
window.toggleFilter = function (btn) {
    const container = btn.closest('.filterList');
    const list = container.querySelector('.filterContents');

    // 클래스 토글
    list.classList.toggle('collapsed');

    // 텍스트 변경
    if (!list.classList.contains('collapsed')) {
        btn.innerHTML = '접기 <br> ▲';
    } else {
        btn.innerHTML = '...';
    }
};

// [2] 전역 등록: 하단 태그 삭제 핸들러
window.removeSpecificTag = function (val) {
    // 해당 필터 찾아서 active 해제
    const targetFilter = document.querySelector(`.filterContents li[data-value="${val}"]`);
    if (targetFilter) {
        targetFilter.classList.remove('active');

        // 해당 그룹 전체 해제 시 '전체' 버튼 불 끄기
        const parentList = targetFilter.closest('.filterContents');
        const allBtn = parentList.querySelector('.filterAll');
        if (allBtn) {
            allBtn.classList.remove('active');
        }
    }

    // 태그 삭제 시 페이지 초기화 및 재조회
    currentPage = 0;
    updateSelectorTags();
    fetchFilteredData();
};

// [3] 전역 등록: 페이지 변경 핸들러 (HTML onclick에서 호출됨)
window.changePage = function (page) {
    currentPage = page;
    fetchFilteredData(); // 데이터 재요청

    // 화면 상단으로 스크롤 이동 (부드럽게)
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
        contentWrapper.scrollIntoView({behavior: 'smooth'});
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("스크립트 실행: CSR 방식 필터 및 페이징 연동 완료");

    // 1. 헤더 접기/펴기 애니메이션 (GSAP 사용)
    document.querySelectorAll('.filterHeaderTitle').forEach(header => {
        header.addEventListener('click', function () {
            const groupWrap = this.nextElementSibling;
            if (!groupWrap) return;
            const isActive = groupWrap.classList.contains('active');

            if (isActive) {
                // 접기
                gsap.to(groupWrap, {
                    height: 0, duration: 0.3, onComplete: () => {
                        groupWrap.style.display = 'none';
                        groupWrap.classList.remove('active');
                        this.innerHTML = this.innerHTML.replace('▼', '▲');
                    }
                });
            } else {
                // 펴기
                groupWrap.style.display = 'block';
                groupWrap.style.height = 'auto';
                const targetHeight = groupWrap.offsetHeight;
                groupWrap.style.height = '0px';
                gsap.to(groupWrap, {
                    height: targetHeight, duration: 0.3, onComplete: () => {
                        groupWrap.style.height = 'auto';
                        groupWrap.classList.add('active');
                        this.innerHTML = this.innerHTML.replace('▲', '▼');
                    }
                });
            }
        });
    });

    // 2. 상단 필터 항목 클릭 이벤트
    document.querySelectorAll('.filterContents li').forEach(item => {
        item.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            const parent = this.closest('.filterContents');
            const allBtn = parent.querySelector('.filterAll');
            const eachItems = parent.querySelectorAll('li:not(.filterAll)');

            // 필터 변경 시 페이지 초기화
            currentPage = 0;

            if (value === 'all') {
                // 전체 버튼 클릭 시
                const isAlreadyAllActive = this.classList.contains('active');
                if (!isAlreadyAllActive) {
                    this.classList.add('active');
                    eachItems.forEach(li => li.classList.add('active'));
                } else {
                    this.classList.remove('active');
                    eachItems.forEach(li => li.classList.remove('active'));
                }
            } else {
                // 개별 버튼 클릭 시
                this.classList.toggle('active');
                const activeCount = parent.querySelectorAll('li.active:not(.filterAll)').length;

                // 전부 선택되면 '전체' 버튼도 활성화
                if (activeCount === eachItems.length) {
                    if (allBtn) allBtn.classList.add('active');
                } else {
                    if (allBtn) allBtn.classList.remove('active');
                }
            }
            updateSelectorTags();
            fetchFilteredData();
        });
    });

    // 3. 전체 삭제 버튼
    const clearAllBtn = document.querySelector('.btn-clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function () {
            document.querySelectorAll('.filterContents li').forEach(li => {
                li.classList.remove('active');
            });
            currentPage = 0;
            updateSelectorTags();
            fetchFilteredData();
        });
    }

    // 4. URL 파라미터 처리 (메인에서 ramenId 타고 들어왔을 때)
    const urlParams = new URLSearchParams(window.location.search);
    const ramenId = urlParams.get('ramenId')?.trim().replace(/ /g, '');

    if (ramenId) {
        // 해당 필터 찾아서 강제 클릭 트리거
        const targetItem = document.querySelector(`.filterContents li[data-value="${ramenId.replace('RM', 'G')}"]`);

        if (targetItem) {
            targetItem.click();

            // 주소창 깔끔하게 정리 (새로고침 없이 파라미터 삭제)
            const url = new URL(window.location.href);
            url.searchParams.delete('ramenId');
            window.history.replaceState({}, document.title, url.pathname);
        }
    }
});

// 선택된 태그 하단에 표시하는 함수
function updateSelectorTags() {
    const selectorList = document.querySelector('.selectorContents');
    const clearAllBtn = document.querySelector('.btn-clear-all');
    if (!selectorList) return;

    selectorList.innerHTML = '';
    const activeFilters = document.querySelectorAll('.filterContents li.active:not(.filterAll)');

    if (clearAllBtn) {
        clearAllBtn.style.display = (activeFilters.length > 0) ? 'block' : 'none';
    }

    activeFilters.forEach(activeItem => {
        const tagLi = document.createElement('li');
        tagLi.className = 'selectedTag';
        tagLi.innerHTML = `
            ${activeItem.innerText} 
            <span class="removeTag" style="cursor:pointer; margin-left:8px; color:#ff4d4f; font-weight:bold;" 
                  onclick="removeSpecificTag('${activeItem.getAttribute('data-value')}')">×</span>
        `;
        selectorList.appendChild(tagLi);
    });
}

// ★★★ [핵심] 데이터를 가져와서 화면을 그리는 함수 ★★★
async function fetchFilteredData() {
    const params = new URLSearchParams();

    // 활성화된 필터 수집
    document.querySelectorAll('.filterContents li.active:not(.filterAll)').forEach(li => {
        params.append(li.getAttribute('data-title'), li.getAttribute('data-value'));
    });

    // 현재 페이지 추가
    params.append('page', currentPage);

    try {
        // 1. 서버에 데이터(JSON) 요청
        const response = await fetch(`/shop/filter?${params.toString()}`);

        if (response.ok) {
            // 2. JSON 데이터 파싱
            const data = await response.json();

            // 3. 리스트 그리기
            renderContentList(data.content);

            // 4. 페이징 그리기 (10개 단위)
            renderPagination(data);
        }
    } catch (error) {
        console.error("데이터 조회 실패:", error);
    }
}

// [리스트 렌더링 함수] JSON 데이터를 받아서 HTML로 만듦
function renderContentList(shopList) {
    const contentList = document.getElementById('contentList');
    contentList.innerHTML = ''; // 기존 내용 삭제

    // 데이터가 없을 때 처리
    if (!shopList || shopList.length === 0) {
        contentList.innerHTML = '<div style="text-align: center; padding: 50px;">검색 결과가 없습니다.</div>';
        return;
    }

    // 데이터 반복문
    shopList.forEach(shop => {
        // 카테고리 뱃지 HTML 생성
        let categoriesHtml = '';
        if (shop.categories) {
            shop.categories.forEach(cat => {
                categoriesHtml += `<li><span class="badge">${cat.categoryName}</span></li>`;
            });
        }

        // 아이템 HTML 생성
        const itemHtml = `
            <div class="contentItem">
                <a href="/shop/${shop.shopId}">
                    <div class="contentImage">
                        <img src="${shop.imgUrl}" alt="${shop.shopName}"/>
                    </div>
                    <div class="contentsInfo">
                        <div class="contentTitle">${shop.shopName}</div>
                        <div class="contentCategory">
                            <ul class="categoryList">${categoriesHtml}</ul>
                        </div>
                        <div class="contentDescription">${shop.shopContent || ''}</div>
                    </div>
                </a>
                <button class="contentLike" type="button"></button>
            </div>
        `;
        // 화면에 추가
        contentList.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// [페이징 렌더링 함수] 10개씩 페이지 번호 생성
function renderPagination(pageData) {
    const contentNav = document.getElementById('contentNav');
    contentNav.innerHTML = ''; // 기존 내용 삭제

    // 전체 페이지가 0이면 페이징 숨김
    if (pageData.totalPages === 0) return;

    const current = pageData.number; // 현재 페이지 (0부터 시작)
    const totalPages = pageData.totalPages;

    // 10개씩 보여주기 로직
    const pageBlock = 10;
    const startPage = Math.floor(current / pageBlock) * pageBlock;
    const endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

    let navHtml = '<nav class="pagination">';

    // [이전] 버튼
    // 0페이지면 비활성화
    const prevDisabled = (current === 0) ? 'disabled' : '';
    // 클릭하면 이전 페이지로 이동
    navHtml += `<button class="pageBtn prev" ${prevDisabled} 
                        onclick="changePage(${current - 1})">&lt;</button>`;

    navHtml += '<ul class="pageList">';

    // 페이지 번호 생성 (startPage ~ endPage)
    for (let i = startPage; i <= endPage; i++) {
        // ★ 현재 페이지와 i가 같으면 'active' 클래스 추가
        // 주의: i는 숫자형, current도 숫자형이어야 정확히 일치함
        const activeClass = (i === current) ? 'active' : '';

        navHtml += `
            <li>
                <button type="button" class="${activeClass}" onclick="changePage(${i})">
                    ${i + 1}
                </button>
            </li>
        `;
    }
    navHtml += '</ul>';

    // [다음] 버튼
    const nextDisabled = (current === totalPages - 1) ? 'disabled' : '';
    navHtml += `<button class="pageBtn next" ${nextDisabled} 
                        onclick="changePage(${current + 1})">&gt;</button>`;

    navHtml += '</nav>';

    // 화면에 삽입
    contentNav.innerHTML = navHtml;
}
