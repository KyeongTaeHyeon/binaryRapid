// ============================================================
// [설정] 덩어리 로딩 (Chunk Loading)
// ============================================================
let fetchSize = 120;
let viewSize = 8;

let totalElements = 0;
let currentDisplayPage = 0;
let currentBufferPage = -1;

let shopDataBuffer = [];

// ============================================================
// [1] 초기화
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    let initialFilterApplied = false;

    // 셀렉트 박스 초기값 동기화
    const sizeSelect = document.getElementById('pageSizeSelect');
    if (sizeSelect) viewSize = parseInt(sizeSelect.value);

    // 필터 헤더 애니메이션 (GSAP)
    document.querySelectorAll('.filterHeaderTitle').forEach(header => {
        header.addEventListener('click', function () {
            const groupWrap = this.nextElementSibling;
            if (!groupWrap) return;

            // 애니메이션 중복 실행 방지
            if (gsap.isTweening(groupWrap)) return;

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
                const h = groupWrap.offsetHeight;
                groupWrap.style.height = '0px';
                gsap.to(groupWrap, {
                    height: h, duration: 0.3, onComplete: () => {
                        groupWrap.style.height = 'auto';
                        groupWrap.classList.add('active');
                        this.innerHTML = this.innerHTML.replace('▲', '▼');
                    }
                });
            }
        });
    });

    // 필터 항목 클릭 위임
    document.addEventListener('click', function (event) {
        const li = event.target.closest('.filterContents li');
        if (!li || !document.contains(li)) return;
        handleFilterClick(li);
    });

    // 전체 삭제 버튼 위임
    document.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('.btn-clear-all');
        if (!clearBtn) return;
        e.preventDefault();

        document.querySelectorAll('.filterContents').forEach(ul => {
            ul.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        });

        updateSelectorTags();
        resetAndFetch();
    });

    // [개선됨] ramenId 필터 적용 로직 (MutationObserver 제거 -> Thymeleaf는 즉시 로딩됨)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const ramenIdRaw = urlParams.get('ramenId');

        if (ramenIdRaw) {
            const ramenId = ramenIdRaw.trim().replace(/ /g, '');
            console.log('Applying filter for:', ramenId);

            // G코드 변환 고려 (예: RM001 -> G001)
            const candidates = [ramenId, ramenId.replace(/^RM/, 'G')];
            let matched = null;

            for (const cand of candidates) {
                // 정확히 일치하는 data-value를 가진 li 찾기
                matched = document.querySelector(`.filterContents li[data-value="${cand}"]`);
                if (matched) break;
            }

            if (matched) {
                // 부모 영역의 '전체' 버튼 비활성화 먼저 수행
                const parent = matched.closest('.filterContents');
                if (parent) {
                    const allBtn = parent.querySelector('.filterAll');
                    if (allBtn) allBtn.classList.remove('active');
                }

                matched.classList.add('active');
                initialFilterApplied = true;
                updateSelectorTags();

                // URL 정리
                const url = new URL(window.location.href);
                url.searchParams.delete('ramenId');
                window.history.replaceState({}, document.title, url.pathname + url.search);
            }
        }
    } catch (e) {
        console.warn('Filter sync error:', e);
    }

    // 초기 데이터 로드 (필터 적용이 없었더라도 기본 데이터 로드)
    resetAndFetch();
});

// ============================================================
// [2] 필터 동작
// ============================================================
function handleFilterClick(element) {
    const value = element.getAttribute('data-value');
    const parent = element.closest('.filterContents');
    const allBtn = parent.querySelector('.filterAll');
    const items = parent.querySelectorAll('li:not(.filterAll)');

    if (value === 'all') {
        // '전체' 클릭 시: 이미 active라도 끄지 않음 (최소 1개 유지 UX)
        // 다른 모든 개별 항목 해제 및 전체 활성화
        const isActive = element.classList.contains('active');

        if (isActive) {
            // 이미 켜져 있다면 -> 끄면서 하위 항목 모두 해제
            element.classList.remove('active');
            items.forEach(li => li.classList.remove('active'));
        } else {
            // 꺼져 있다면 -> 켜면서 하위 항목 모두 선택
            element.classList.add('active');
            items.forEach(li => li.classList.add('active'));
        }
    } else {
        // 개별 항목 클릭 시
        element.classList.toggle('active');

        // 현재 활성화된 개별 항목 개수 확인
        const activeCount = parent.querySelectorAll('li.active:not(.filterAll)').length;
        const totalCount = items.length;

        if (activeCount === totalCount) {
            // 모든 항목이 선택되었다면 -> '전체' 버튼도 활성화
            if (allBtn) allBtn.classList.add('active');
        } else {
            // 하나라도 선택이 해제되면 -> '전체' 버튼 비활성화
            if (allBtn) allBtn.classList.remove('active');
        }
    }

    updateSelectorTags();
    resetAndFetch();
}

// 전역 함수 연결
window.toggleFilter = function (btn) {
    const list = btn.closest('.filterList').querySelector('.filterContents');
    list.classList.toggle('collapsed');
    // 텍스트 변경 로직 단순화
    btn.innerHTML = list.classList.contains('collapsed') ? '...' : '접기 <br> ▲';
};

window.removeSpecificTag = function (val) {
    // 해당 value를 가진 모든 active 항목 해제 (여러 그룹에 같은 value가 있을 경우 대비)
    const targets = document.querySelectorAll(`.filterContents li[data-value="${val}"].active`);

    targets.forEach(target => {
        target.classList.remove('active');
    });

    updateSelectorTags();
    resetAndFetch();
};

function updateSelectorTags() {
    const list = document.querySelector('.selectorContents');
    const clearBtn = document.querySelector('.btn-clear-all');
    if (!list) return;

    list.innerHTML = '';
    const actives = document.querySelectorAll('.filterContents li.active:not(.filterAll)');

    if (clearBtn) clearBtn.style.display = actives.length > 0 ? 'block' : 'none';

    // 중복 태그 방지용 Set
    const addedValues = new Set();

    actives.forEach(li => {
        const val = li.getAttribute('data-value');
        const text = li.innerText;

        // 시각적으로 중복된 태그는 하나만 표시
        if (!addedValues.has(val)) {
            addedValues.add(val);
            const tag = document.createElement('li');
            tag.className = 'selectedTag';
            tag.innerHTML = `${text} <span class="removeTag" style="cursor:pointer; margin-left:8px; color:#ff4d4f;" onclick="removeSpecificTag('${val}')">×</span>`;
            list.appendChild(tag);
        }
    });
}

// ============================================================
// [3] 데이터 로딩 (Chunk Loading)
// ============================================================
function resetAndFetch() {
    currentDisplayPage = 0;
    currentBufferPage = -1;
    shopDataBuffer = [];
    loadDataForCurrentPage();
}

async function loadDataForCurrentPage() {
    const startIndex = currentDisplayPage * viewSize;
    const neededBufferPage = Math.floor(startIndex / fetchSize);

    // 버퍼 페이지가 변경되었을 때만 서버 요청
    if (neededBufferPage !== currentBufferPage) {
        await fetchChunkFromServer(neededBufferPage);
    } else {
        // 이미 버퍼에 데이터가 있으면 바로 렌더링
        renderView();
    }
}

async function fetchChunkFromServer(pageToFetch) {
    const params = new URLSearchParams();

    // [중요] data-title이 실제 서버 파라미터 이름(예: region, category)과 일치해야 함
    document.querySelectorAll('.filterContents li.active:not(.filterAll)').forEach(li => {
        params.append(li.getAttribute('data-title'), li.getAttribute('data-value'));
    });

    params.append('page', pageToFetch);
    params.append('size', fetchSize);

    try {
        const res = await fetch(`/shop/filter?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();

            shopDataBuffer = data.content || [];

            if (data.totalElements !== undefined) {
                totalElements = Number(data.totalElements);
            } else {
                totalElements = shopDataBuffer.length;
            }

            currentBufferPage = pageToFetch;
            renderView(); // 데이터 수신 후 렌더링
        } else {
            console.error("Server responded with status:", res.status);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

function renderView() {
    const contentList = document.getElementById('contentList');
    contentList.innerHTML = '';

    // 데이터 없음 처리
    if (totalElements === 0 || !shopDataBuffer || shopDataBuffer.length === 0) {
        contentList.innerHTML = '<div style="text-align: center; padding: 50px;">검색 결과가 없습니다.</div>';
        document.getElementById('contentNav').innerHTML = '';
        return;
    }

    // 버퍼 내에서의 상대 인덱스 계산
    const absoluteIndex = currentDisplayPage * viewSize;
    const bufferStartIndex = absoluteIndex % fetchSize;
    const bufferEndIndex = bufferStartIndex + viewSize;

    const itemsToShow = shopDataBuffer.slice(bufferStartIndex, bufferEndIndex);

    itemsToShow.forEach(shop => {
        let catHtml = '';
        if (shop.categories) {
            shop.categories.forEach(c => catHtml += `<li><span class="badge">${c.categoryName}</span></li>`);
        }

        // 이미지 null 처리 추가
        const imgDisplay = shop.imgUrl ? `<img src="${shop.imgUrl}" alt="${shop.shopName}"/>` : `<div class="no-image">No Image</div>`;

        const html = `
            <div class="contentItem">
                <a href="/shop/${shop.shopId}">
                    <div class="contentImage">${imgDisplay}</div>
                    <div class="contentsInfo">
                        <div class="contentTitle">${shop.shopName}</div>
                        <div class="contentCategory"><ul class="categoryList">${catHtml}</ul></div>
                        <div class="contentDescription">${shop.shopContent || ''}</div>
                    </div>
                </a>
                <button class="contentLike" type="button"></button>
            </div>`;
        contentList.insertAdjacentHTML('beforeend', html);
    });

    renderPagination();
}

// ============================================================
// [4] 페이징 UI
// ============================================================
window.changePageSize = function (val) {
    viewSize = parseInt(val);
    resetAndFetch(); // 페이지 사이즈 변경 시 처음부터 다시 로드 권장
};

window.changePage = function (pageNum) {
    if (pageNum < 0) return;

    // 전체 페이지 수 계산
    const maxPage = Math.ceil(totalElements / viewSize) - 1;

    if (pageNum > maxPage) return;

    currentDisplayPage = pageNum;
    loadDataForCurrentPage();
};

function renderPagination() {
    const nav = document.getElementById('contentNav');
    if (!totalElements || totalElements <= 0) {
        nav.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalElements / viewSize);
    const pageBlock = 10;
    const startPage = Math.floor(currentDisplayPage / pageBlock) * pageBlock;
    const endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

    let html = '<div class="pagination-container"><nav class="pagination">';

    // 이전 버튼
    html += `<button class="pageBtn prev" ${currentDisplayPage === 0 ? 'disabled' : ''} 
             onclick="changePage(${currentDisplayPage - 1})">&lt;</button>`;

    html += '<ul class="pageList">';
    for (let i = startPage; i <= endPage; i++) {
        const active = (i === currentDisplayPage) ? 'active' : '';
        html += `<li><button type="button" class="${active}" onclick="changePage(${i})">${i + 1}</button></li>`;
    }
    html += '</ul>';

    // 다음 버튼
    html += `<button class="pageBtn next" ${currentDisplayPage >= totalPages - 1 ? 'disabled' : ''} 
             onclick="changePage(${currentDisplayPage + 1})">&gt;</button>`;

    html += '</nav>';

    // 보기 개수 셀렉트 박스
    const opts = [8, 16, 24, 32, 40];
    let optHtml = '';
    opts.forEach(o => {
        const selected = (o === viewSize) ? 'selected' : '';
        optHtml += `<option value="${o}" ${selected}>${o}개씩</option>`;
    });

    html += `<div class="page-size-control">
                <select id="pageSizeSelect" onchange="changePageSize(this.value)">
                    ${optHtml}
                </select>
             </div></div>`;

    nav.innerHTML = html;
}
