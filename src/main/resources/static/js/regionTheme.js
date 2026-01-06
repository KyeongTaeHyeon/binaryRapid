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

// [핵심] 하단 X 클릭 시 상단 상태를 완벽하게 강제 복구하는 함수
window.removeSpecificTag = function (val) {
    // console.log("태그 삭제 실행: ", val);
    // 1. 상단 li 중 data-value가 삭제하려는 값(val)과 같은 것을 찾음
    const targetFilter = document.querySelector(`.filterContents li[data-value="${val}"]`);

    if (targetFilter) {
        // 개별 항목 불을 끔
        targetFilter.classList.remove('active');

        // 2. 해당 아이템이 속한 그룹(줄) 내에 현재 켜져 있는 '일반 항목' 개수 파악
        const parentList = targetFilter.closest('.filterContents');
        const filterAllButton = parentList.querySelector('li.filterAll');

        if (filterAllButton) {
            filterAllButton.classList.remove('active');
        }
    }

    // UI 및 데이터 최신화
    updateSelectorTags();
    fetchFilteredData();
};

document.addEventListener('DOMContentLoaded', () => {
    // console.log("필터 시스템 연동 시작");
    // 헤더 접기/펴기 (애니메이션)
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
                        this.innerHTML = this.innerHTML.replace('▼', '▲');
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
                        this.innerHTML = this.innerHTML.replace('▲', '▼');
                    }
                });
            }
        });
    });

    // 상단 필터 클릭 (일괄 선택 및 개별 토글 연동)
    document.querySelectorAll('.filterContents li').forEach(item => {
        item.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            const parent = this.closest('.filterContents');
            const allBtn = parent.querySelector('.filterAll');
            const eachItems = parent.querySelectorAll('li:not(.filterAll)');

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

                // 줄 전체가 켜지면 '전체' 버튼도 켜고, 아니면 '전체' 버튼만 끔
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

    // 전체 삭제 (모든 줄 초기화 및 버튼 숨김)
    const clearAllBtn = document.querySelector('.btn-clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function () {
            document.querySelectorAll('.filterContents li').forEach(li => {
                li.classList.remove('active');
            });

            updateSelectorTags();
            fetchFilteredData();
        });
    }
});

function updateSelectorTags() {
    const selectorList = document.querySelector('.selectorContents');
    const clearAllBtn = document.querySelector('.btn-clear-all');
    if (!selectorList) return;

    selectorList.innerHTML = '';
    const activeFilters = document.querySelectorAll('.filterContents li.active:not(.filterAll)');

    // 태그가 하나라도 있으면 전체삭제 버튼 노출
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
        const key = li.getAttribute('data-title');
        const val = li.getAttribute('data-value');
        params.append(key, val);
    });

    //console.log("서버 전송: ", `/shop/filter?${params.toString()}`);

    try {
        const response = await fetch(`/shop/filter?${params.toString()}`);
        if (response.ok) {
            const html = await response.text();
            const contentList = document.getElementById('contentList');
            if (contentList) contentList.innerHTML = html;
        }
    } catch (err) {
        console.error("데이터 조회 실패:", err);
    }
}
