// ============================================================
// [설정] 덩어리 로딩 (Chunk Loading)
// ============================================================
let fetchSize = 120; // 서버에서 120개씩 가져옴
let viewSize = 8;    // 화면에는 8개씩 보여줌

let totalElements = 0;      // 전체 데이터 개수
let currentDisplayPage = 0; // 현재 보고 있는 페이지
let currentBufferPage = -1; // 메모리에 저장된 덩어리 번호

let shopDataBuffer = [];    // 데이터 저장소

// ============================================================
// [1] 초기화
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    let initialFilterApplied = false; // 최초 진입시 ramenId로 필터 적용 여부

    // 셀렉트 박스 초기값 동기화
    const sizeSelect = document.getElementById('pageSizeSelect');
    if (sizeSelect) viewSize = parseInt(sizeSelect.value);

    // 필터 헤더 애니메이션 (GSAP)
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

    // 필터 항목 클릭: 이벤트 위임으로 처리 (동적 생성/내부 클릭 대응)
    // 문서 레벨 이벤트 위임: 언제든지 filter li 클릭을 잡도록 함
    document.addEventListener('click', function (event) {
        const li = event.target.closest('.filterContents li');
        if (!li) return; // filter 항목이 아님
        // li가 실제로 필터 영역 내부인지 확인
        if (!document.contains(li)) return;
        handleFilterClick(li);
    });

    // 전체 삭제 버튼: 문서 레벨 위임 (동적 버튼에도 동작)
    document.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('.btn-clear-all');
        if (!clearBtn) return;
        e.preventDefault();
        e.stopPropagation();

        // 모든 필터 비활성화
        document.querySelectorAll('.filterContents li').forEach(li => li.classList.remove('active'));
        // 전체 버튼 상태도 정리
        document.querySelectorAll('.filterContents .filterAll').forEach(btn => btn.classList.remove('active'));

        updateSelectorTags();
        resetAndFetch();
    });

    // ramenId가 있으면 필터 UI/로직에 적용
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const ramenIdRaw = urlParams.get('ramenId');
        const ramenId = ramenIdRaw ? ramenIdRaw.trim().replace(/ /g, '') : null;

        if (ramenId) {
            console.log('ramenId: ' + ramenId);
            // 가능한 매칭 후보들: 원본(ramenId), 변환된(G코드)
            const candidates = [ramenId, ramenId.replace(/^RM/, 'G')];
            let matched = null;
            for (const cand of candidates) {
                const el = document.querySelector(`.filterContents li[data-value="${cand}"]`);
                if (el) {
                    matched = el;
                    break;
                }
            }

            if (matched) {
                // 직접 class 추가하지 않고 handleFilterClick 호출로 일관된 동작 보장
                if (!matched.classList.contains('active')) {
                    handleFilterClick(matched);
                }
                initialFilterApplied = true;

                // URL에서 ramenId 제거 (한 번 적용했으므로 주소창만 정리)
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('ramenId');
                    window.history.replaceState({}, document.title, url.pathname + url.search);
                } catch (e) {
                    // ignore history errors
                }
            } else {
                // matched가 아직 없으면 DOM이 늦게 렌더링된 것일 수 있으므로 관찰자 등록
                const observerTarget = document.querySelector('.filterContents');
                if (observerTarget) {
                    const mo = new MutationObserver((mutations, obs) => {
                        for (const cand of candidates) {
                            const el = document.querySelector(`.filterContents li[data-value="${cand}"]`);
                            if (el) {
                                if (!el.classList.contains('active')) handleFilterClick(el);
                                initialFilterApplied = true;
                                try {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('ramenId');
                                    window.history.replaceState({}, document.title, url.pathname + url.search);
                                } catch (e) {
                                }
                                obs.disconnect();
                                return;
                            }
                        }
                    });
                    mo.observe(document.body, {childList: true, subtree: true});
                }
            }
        }
    } catch (e) {
        console.warn('Failed to sync ramenId to filters', e);
    }

    // ★ 실행: 페이지 로드 즉시 데이터 요청 (ramenId로 이미 fetch했으면 중복 방지)
    if (!initialFilterApplied) resetAndFetch();
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
        const isActive = element.classList.contains('active');
        if (!isActive) {
            element.classList.add('active');
            items.forEach(li => li.classList.add('active'));
        } else {
            element.classList.remove('active');
            items.forEach(li => li.classList.remove('active'));
        }
    } else {
        element.classList.toggle('active');
        const activeCount = parent.querySelectorAll('li.active:not(.filterAll)').length;
        if (activeCount === items.length && allBtn) allBtn.classList.add('active');
        else if (allBtn) allBtn.classList.remove('active');
    }
    updateSelectorTags();
    resetAndFetch();
}

// 전역 함수 연결
window.toggleFilter = function (btn) {
    const list = btn.closest('.filterList').querySelector('.filterContents');
    list.classList.toggle('collapsed');
    btn.innerHTML = list.classList.contains('collapsed') ? '...' : '접기 <br> ▲';
};

window.removeSpecificTag = function (val) {
    const target = document.querySelector(`.filterContents li[data-value="${val}"]`);
    if (target) {
        target.classList.remove('active');
        // 전체버튼 처리
        const parent = target.closest('.filterContents');
        const allBtn = parent.querySelector('.filterAll');
        if (allBtn) allBtn.classList.remove('active');
    }
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

    actives.forEach(li => {
        const tag = document.createElement('li');
        tag.className = 'selectedTag';
        tag.innerHTML = `${li.innerText} <span class="removeTag" style="cursor:pointer; margin-left:8px; color:#ff4d4f;" onclick="removeSpecificTag('${li.getAttribute('data-value')}')">×</span>`;
        list.appendChild(tag);
    });
}

// ============================================================
// [3] 데이터 로딩 (핵심 로직)
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

    // 버퍼에 없으면 서버 요청
    if (neededBufferPage !== currentBufferPage) {
        await fetchChunkFromServer(neededBufferPage);
    }
    renderView();
}

async function fetchChunkFromServer(pageToFetch) {
    const params = new URLSearchParams();
    document.querySelectorAll('.filterContents li.active:not(.filterAll)').forEach(li => {
        params.append(li.getAttribute('data-title'), li.getAttribute('data-value'));
    });
    // 120개 요청
    params.append('page', pageToFetch);
    params.append('size', fetchSize);

    try {
        const res = await fetch(`/shop/filter?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();

            // 데이터 확보
            shopDataBuffer = data.content || [];

            // ★ 전체 개수 안전하게 확보 (숫자 안 나오는 버그 수정)
            if (data.totalElements !== undefined) {
                totalElements = Number(data.totalElements);
            } else {
                // 서버가 totalElements를 안 주면 그냥 가져온 개수로 설정
                totalElements = shopDataBuffer.length;
            }

            currentBufferPage = pageToFetch;
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

function renderView() {
    const contentList = document.getElementById('contentList');
    contentList.innerHTML = '';

    if (!shopDataBuffer || shopDataBuffer.length === 0) {
        contentList.innerHTML = '<div style="text-align: center; padding: 50px;">검색 결과가 없습니다.</div>';
        document.getElementById('contentNav').innerHTML = '';
        return;
    }

    const absoluteIndex = currentDisplayPage * viewSize;
    const bufferStartIndex = absoluteIndex % fetchSize;
    const bufferEndIndex = bufferStartIndex + viewSize;

    // 배열 범위 초과 방지
    const safeEnd = Math.min(bufferEndIndex, shopDataBuffer.length);
    const itemsToShow = shopDataBuffer.slice(bufferStartIndex, safeEnd);

    itemsToShow.forEach(shop => {
        let catHtml = '';
        if (shop.categories) {
            shop.categories.forEach(c => catHtml += `<li><span class="badge">${c.categoryName}</span></li>`);
        }
        const html = `
            <div class="contentItem">
                <a href="/shop/${shop.shopId}">
                    <div class="contentImage"><img src="${shop.imgUrl}" alt="${shop.shopName}"/></div>
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
    currentDisplayPage = 0;
    loadDataForCurrentPage();
};

window.changePage = function (pageNum) {
    if (pageNum < 0) return;
    const maxPage = Math.ceil(totalElements / viewSize) - 1;
    if (pageNum > maxPage) return;

    currentDisplayPage = pageNum;
    loadDataForCurrentPage();
};

function renderPagination() {
    const nav = document.getElementById('contentNav');
    // 안전장치: 전체 개수가 0이면 숨김
    if (!totalElements || totalElements <= 0) {
        nav.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalElements / viewSize);
    const pageBlock = 10;
    const startPage = Math.floor(currentDisplayPage / pageBlock) * pageBlock;
    const endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

    let html = '<div class="pagination-container"><nav class="pagination">';

    // 이전
    html += `<button class="pageBtn prev" ${currentDisplayPage === 0 ? 'disabled' : ''} 
             onclick="changePage(${currentDisplayPage - 1})">&lt;</button>`;

    // 숫자 (확실하게 루프 돌도록 수정)
    html += '<ul class="pageList">';
    for (let i = startPage; i <= endPage; i++) {
        const active = (i === currentDisplayPage) ? 'active' : '';
        html += `<li><button type="button" class="${active}" onclick="changePage(${i})">${i + 1}</button></li>`;
    }
    html += '</ul>';

    // 다음
    html += `<button class="pageBtn next" ${currentDisplayPage >= totalPages - 1 ? 'disabled' : ''} 
             onclick="changePage(${currentDisplayPage + 1})">&gt;</button>`;

    html += '</nav>';

    // 셀렉트 박스
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
