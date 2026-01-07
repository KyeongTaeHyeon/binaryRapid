// regionTheme.js - 전체 덮어쓰기

// 현재 페이지 상태 관리 변수
let currentPage = 0;

// [1] 전역 등록: 접기/펴기 핸들러
window.toggleFilter = function (btn) {
    const container = btn.closest('.filterList');
    const list = container.querySelector('.filterContents');
    if (list.classList.contains('collapsed')) {
        list.classList.remove('collapsed');
        btn.innerHTML = '접기 <br> ▲';
    } else {
        list.classList.add('collapsed');
        btn.innerHTML = '...';
    }
};

// [2] 전역 등록: 하단 태그 삭제 핸들러
window.removeSpecificTag = function (val) {
    // console.log("태그 삭제 실행: ", val);

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

    // 태그 삭제 시에도 페이지는 0으로 초기화 (검색 결과가 달라지므로)
    currentPage = 0;
    updateSelectorTags();
    fetchFilteredData();
};

// [3] 전역 등록: 페이지 변경 핸들러 (HTML th:onclick에서 호출)
window.changePage = function (page) {
    // console.log("페이지 이동 요청:", page);
    currentPage = page;
    fetchFilteredData(); // 기존 필터 조건 + 바뀐 페이지로 요청

    // 화면 상단으로 스크롤 이동 (선택사항)
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
        contentWrapper.scrollIntoView({behavior: 'smooth'});
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("스크립트 실행: 필터 및 페이징 연동 완료");

    // 1. 헤더 접기/펴기
    document.querySelectorAll('.filterHeaderTitle').forEach(header => {
        header.addEventListener('click', function () {
            const groupWrap = this.nextElementSibling;
            if (!groupWrap) return;
            const isActive = groupWrap.classList.contains('active');
            if (isActive) {
                gsap.to(groupWrap, {
                    height: 0, duration: 0.3, onComplete: () => {
                        groupWrap.style.display = 'none';
                        groupWrap.classList.remove('active');
                        this.innerHTML = this.innerHTML.replace('▲', '▼');
                    }
                });
            } else {
                groupWrap.style.display = 'block';
                groupWrap.style.height = 'auto';
                const targetHeight = groupWrap.offsetHeight;
                groupWrap.style.height = '0px';
                gsap.to(groupWrap, {
                    height: targetHeight, duration: 0.3, onComplete: () => {
                        groupWrap.style.height = 'auto';
                        groupWrap.classList.add('active');
                        this.innerHTML = this.innerHTML.replace('▼', '▲');
                    }
                });
            }
        });
    });

    // 2. 상단 필터 클릭
    document.querySelectorAll('.filterContents li').forEach(item => {
        item.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            const parent = this.closest('.filterContents');
            const allBtn = parent.querySelector('.filterAll');
            const eachItems = parent.querySelectorAll('li:not(.filterAll)');

            // 필터 클릭 시 페이지는 무조건 0(첫 페이지)으로 초기화
            currentPage = 0;

            if (value === 'all') {
                const isAlreadyAllActive = this.classList.contains('active');
                if (!isAlreadyAllActive) {
                    this.classList.add('active');
                    eachItems.forEach(li => li.classList.add('active'));
                } else {
                    this.classList.remove('active');
                    eachItems.forEach(li => li.classList.remove('active'));
                }
            } else {
                this.classList.toggle('active');
                const activeCount = parent.querySelectorAll('li.active:not(.filterAll)').length;
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
            currentPage = 0; // 페이지 초기화
            updateSelectorTags();
            fetchFilteredData();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const ramenId = urlParams.get('ramenId')?.trim().replace(/ /g, '');

    if (ramenId) {
        // data-value가 ramenId와 일치하는 요소를 찾음
        const targetItem = document.querySelector(`.filterContents li[data-value="${category}"]`);

        if (targetItem) {
            targetItem.click();
        }
    }
});

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

async function fetchFilteredData() {
    const params = new URLSearchParams();

    document.querySelectorAll('.filterContents li.active:not(.filterAll)').forEach(li => {
        params.append(li.getAttribute('data-title'), li.getAttribute('data-value'));
    });

    params.append('page', currentPage);

    try {
        const response = await fetch(`/shop/filter?${params.toString()}`);
        if (response.ok) {
            const html = await response.text();

            const contentWrapper = document.getElementById('contentWrapper');
            if (contentWrapper) {
                contentWrapper.outerHTML = html;
            }
        }
    } catch (error) {
        console.error("데이터 조회 실패:", error);
    }
}
