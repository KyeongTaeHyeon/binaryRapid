// ============================================================
// [설정] 덩어리 로딩 (Chunk Loading)
// ============================================================
let fetchSize = 120;
let viewSize = 8;

let totalElements = 0;
let currentDisplayPage = 0;
let currentBufferPage = -1;

let shopDataBuffer = [];

const isAuthenticated = document.body.dataset.authenticated === 'true';
const loginUrl = document.body.dataset.loginUrl || '/login';

// ============================================================
// [0] liked 상태 버퍼 동기화 유틸
// ============================================================
function normalizeLiked(v) {
    return v === true || v === 1 || v === '1';
}

function updateBufferLiked(shopId, liked) {
    const idx = shopDataBuffer.findIndex(s => String(s.shopId) === String(shopId));
    if (idx !== -1) shopDataBuffer[idx].liked = !!liked;
}

function applyLikeUi(btn, liked) {
    const on = !!liked;
    btn.classList.toggle('active', on);
    btn.dataset.liked = String(on);
    btn.setAttribute('aria-pressed', String(on));
}

// ============================================================
// [1] 초기화
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    let initialFilterApplied = false;

    // 좋아요 클릭 위임
    document.addEventListener('click', (event) => {
        const btn = event.target.closest('.contentLike');
        if (!btn) return;

        if (!isAuthenticated) {
            alert('로그인 후 이용해주세요');
            window.location.href = loginUrl;
            return;
        }

        const shopId = btn.getAttribute('data-shop-id');
        if (!shopId) return;

        toggleWishlist(shopId, btn);
    });

    // 셀렉트 박스 초기값 동기화
    const sizeSelect = document.getElementById('pageSizeSelect');
    if (sizeSelect) viewSize = parseInt(sizeSelect.value, 10);

    // 필터 헤더 애니메이션 (GSAP)
    document.querySelectorAll('.filterHeaderTitle').forEach(header => {
        header.addEventListener('click', function () {
            const groupWrap = this.nextElementSibling;
            if (!groupWrap) return;

            if (typeof gsap !== 'undefined' && gsap.isTweening(groupWrap)) return;

            const isActive = groupWrap.classList.contains('active');
            if (isActive) {
                if (typeof gsap === 'undefined') {
                    groupWrap.style.display = 'none';
                    groupWrap.classList.remove('active');
                    this.innerHTML = this.innerHTML.replace('▼', '▲');
                    return;
                }
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

                if (typeof gsap === 'undefined') {
                    groupWrap.style.height = 'auto';
                    groupWrap.classList.add('active');
                    this.innerHTML = this.innerHTML.replace('▲', '▼');
                    return;
                }

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

    // ramenId 필터 적용
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const ramenIdRaw = urlParams.get('ramenId');

        if (ramenIdRaw) {
            const ramenId = ramenIdRaw.trim().replace(/ /g, '');
            const candidates = [ramenId, ramenId.replace(/^RM/, 'G')];
            let matched = null;

            for (const cand of candidates) {
                matched = document.querySelector(`.filterContents li[data-value="${cand}"]`);
                if (matched) break;
            }

            if (matched) {
                const parent = matched.closest('.filterContents');
                if (parent) {
                    const allBtn = parent.querySelector('.filterAll');
                    if (allBtn) allBtn.classList.remove('active');
                }

                matched.classList.add('active');
                initialFilterApplied = true;
                updateSelectorTags();

                const url = new URL(window.location.href);
                url.searchParams.delete('ramenId');
                window.history.replaceState({}, document.title, url.pathname + url.search);
            }
        }
    } catch (e) {
        console.warn('Filter sync error:', e);
    }

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
        const isActive = element.classList.contains('active');

        if (isActive) {
            element.classList.remove('active');
            items.forEach(li => li.classList.remove('active'));
        } else {
            element.classList.add('active');
            items.forEach(li => li.classList.add('active'));
        }
    } else {
        element.classList.toggle('active');

        const activeCount = parent.querySelectorAll('li.active:not(.filterAll)').length;
        const totalCount = items.length;

        if (activeCount === totalCount) {
            if (allBtn) allBtn.classList.add('active');
        } else {
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
    btn.innerHTML = list.classList.contains('collapsed') ? '...' : '접기 <br> ▲';
};

window.removeSpecificTag = function (val) {
    const targets = document.querySelectorAll(`.filterContents li[data-value="${val}"].active`);
    targets.forEach(target => target.classList.remove('active'));

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

    const addedValues = new Set();

    actives.forEach(li => {
        const val = li.getAttribute('data-value');
        const text = li.innerText;

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

    if (neededBufferPage !== currentBufferPage) {
        await fetchChunkFromServer(neededBufferPage);
    } else {
        renderView();
    }
}

async function fetchChunkFromServer(pageToFetch) {
    const params = new URLSearchParams();

    document.querySelectorAll('.filterContents li.active:not(.filterAll)').forEach(li => {
        params.append(li.getAttribute('data-title'), li.getAttribute('data-value'));
    });

    params.append('page', pageToFetch);
    params.append('size', fetchSize);

    try {
        const res = await fetch(buildUrl(`/shop/filter?${params.toString()}`));
        if (!res.ok) {
            console.error('Server responded with status:', res.status);
            return;
        }

        const data = await res.json();
        shopDataBuffer = (data.content || []).map(s => ({...s, liked: normalizeLiked(s.liked)}));
        totalElements = (data.totalElements !== undefined) ? Number(data.totalElements) : shopDataBuffer.length;

        currentBufferPage = pageToFetch;
        renderView();
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

function renderView() {
    const contentList = document.getElementById('contentList');
    if (!contentList) return;

    contentList.innerHTML = '';

    if (totalElements === 0 || !shopDataBuffer || shopDataBuffer.length === 0) {
        contentList.innerHTML = '<div style="text-align: center; padding: 50px;">검색 결과가 없습니다.</div>';
        const nav = document.getElementById('contentNav');
        if (nav) nav.innerHTML = '';
        return;
    }

    const absoluteIndex = currentDisplayPage * viewSize;
    const bufferStartIndex = absoluteIndex % fetchSize;
    const bufferEndIndex = bufferStartIndex + viewSize;

    const itemsToShow = shopDataBuffer.slice(bufferStartIndex, bufferEndIndex);

    itemsToShow.forEach(shop => {
        let catHtml = '';
        if (shop.categories) {
            shop.categories.forEach(c => catHtml += `<li><span class="badge">${c.categoryName}</span></li>`);
        }

        const imgDisplay = shop.imgUrl
            ? `<img src="${shop.imgUrl}" alt="${shop.shopName}"/>`
            : `<div class="no-image">No Image</div>`;

        const liked = normalizeLiked(shop.liked);
        const likeBtnHtml = isAuthenticated
            ? `<button class="contentLike ${liked ? 'active' : ''}" type="button" data-shop-id="${shop.shopId}" data-liked="${liked}" aria-pressed="${liked}"></button>`
            : '';

        const detailUrl = buildUrl(`/shop/${shop.shopId}`);
        const html = `
            <div class="contentItem">
                <a href="${detailUrl}">
                    <div class="contentImage">${imgDisplay}</div>
                    <div class="contentsInfo">
                        <div class="contentTitle">${shop.shopName}</div>
                        <div class="contentCategory"><ul class="categoryList">${catHtml}</ul></div>
                        <div class="contentDescription">${shop.shopContent || ''}</div>
                    </div>
                </a>
                ${likeBtnHtml}
            </div>`;

        contentList.insertAdjacentHTML('beforeend', html);
    });

    renderPagination();
}

// ============================================================
// [좋아요] 토글
// ============================================================
async function toggleWishlist(shopId, btn) {
    const prev = normalizeLiked(btn.dataset.liked);
    const next = !prev;

    // optimistic UI
    applyLikeUi(btn, next);
    updateBufferLiked(shopId, next);

    try {
        const res = await fetch(buildUrl(`/shop/${shopId}/wishlist`), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });

        if (res.status === 401) {
            // rollback optimistic UI
            applyLikeUi(btn, prev);
            updateBufferLiked(shopId, prev);
            alert('로그인 후 이용해주세요');
            window.location.href = loginUrl;
            return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const serverLiked = normalizeLiked(data.liked);

        applyLikeUi(btn, serverLiked);
        updateBufferLiked(shopId, serverLiked);
    } catch (e) {
        applyLikeUi(btn, prev);
        updateBufferLiked(shopId, prev);
        console.error('toggleWishlist error:', e);
    }
}

// ============================================================
// [4] 페이징 UI
// ============================================================
window.changePageSize = function (val) {
    viewSize = parseInt(val, 10);
    resetAndFetch();
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
    if (!nav) return;

    if (!totalElements || totalElements <= 0) {
        nav.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalElements / viewSize);
    const pageBlock = 10;
    const startPage = Math.floor(currentDisplayPage / pageBlock) * pageBlock;
    const endPage = Math.min(startPage + pageBlock - 1, totalPages - 1);

    let html = '<div class="pagination-container"><nav class="pagination">';

    html += `<button class="pageBtn prev" ${currentDisplayPage === 0 ? 'disabled' : ''}
             onclick="changePage(${currentDisplayPage - 1})">&lt;</button>`;

    html += '<ul class="pageList">';
    for (let i = startPage; i <= endPage; i++) {
        const active = (i === currentDisplayPage) ? 'active' : '';
        html += `<li><button type="button" class="${active}" onclick="changePage(${i})">${i + 1}</button></li>`;
    }
    html += '</ul>';

    html += `<button class="pageBtn next" ${currentDisplayPage >= totalPages - 1 ? 'disabled' : ''}
             onclick="changePage(${currentDisplayPage + 1})">&gt;</button>`;

    html += '</nav>';

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

function buildUrl(path) {
    // ex) /rapid/shop -> basePath = /rapid
    const pathname = window.location.pathname || '/';
    const basePath = pathname.startsWith('/shop') ? '' : (pathname.split('/')[1] ? `/${pathname.split('/')[1]}` : '');
    // basePath가 잘못 잡히는 케이스를 줄이기 위해, body data로 basePath가 있으면 그걸 우선
    const configuredBase = document.body.dataset.basePath || '';
    const prefix = configuredBase || basePath;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${prefix}${normalizedPath}`;
}
