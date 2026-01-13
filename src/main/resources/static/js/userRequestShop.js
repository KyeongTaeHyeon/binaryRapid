/**
 * userRequestShop.js - 깔끔한 필터링 및 페이징 통합본
 */
let reqPosts = [];
let REQ_PER_PAGE = 10;
let reqPage = 1;
let reqUserId = null;

let reqFilters = { title: '', start: '', end: '' };

const reqTable = document.querySelector('#userRequestMain');
const reqList = document.querySelector(".page-list");

// 1. 초기 데이터 로드
async function initReqPage() {
    try {
        if (!reqUserId) {
            const res = await authFetch('/user/me');
            const json = await res.json();
            reqUserId = json.data.userId;
        }
        await fetchReqData();
    } catch (e) { console.error("초기화 실패", e); }
}

// 2. 서버 통신
async function fetchReqData() {
    const url = `/user/api/my/reqShopList?userId=${reqUserId}&title=${reqFilters.title}&startDate=${reqFilters.start}&endDate=${reqFilters.end}`;
    const res = await authFetch(url);
    if (res.ok) {
        reqPosts = await res.json();
        reqPage = 1;
        renderReqUI();
    }
}

// 3. UI 렌더링
function renderReqUI() {
    if (!reqTable) return;
    reqTable.innerHTML = '';

    const startIdx = (reqPage - 1) * REQ_PER_PAGE;
    const pagedData = reqPosts.slice(startIdx, startIdx + REQ_PER_PAGE);

    if (pagedData.length === 0) {
        reqTable.innerHTML = '<tr><td colspan="6" style="text-align:center;">데이터가 없습니다.</td></tr>';
        return;
    }

    pagedData.forEach((post, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${startIdx + i + 1}</td>
            <td style="cursor:pointer; color:#007bff;" onclick="location.href='/user/board/detail/${post.id}'">${post.title}</td>
            <td>${post.category === 'B00' ? '식당인증' : '기타'}</td>
            <td>식당신청</td>
            <td>본인</td>
            <td>${post.createDate ? post.createDate.split('T')[0] : '-'}</td>
        `;
        reqTable.appendChild(tr);
    });
    renderReqPager();
}

// 4. 페이지네이션
function renderReqPager() {
    if (!reqList) return;
    const total = Math.ceil(reqPosts.length / REQ_PER_PAGE) || 1;
    reqList.innerHTML = "";

    document.querySelector(".page-btn.prev").onclick = () => { if(reqPage > 1) { reqPage--; renderReqUI(); }};
    document.querySelector(".page-btn.next").onclick = () => { if(reqPage < total) { reqPage++; renderReqUI(); }};

    for (let i = 1; i <= total; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === reqPage ? 'active' : ''}`;
        li.innerHTML = `<button>${i}</button>`;
        li.onclick = () => { reqPage = i; renderReqUI(); };
        reqList.appendChild(li);
    }
}

// 5. 이벤트 바인딩
document.addEventListener('DOMContentLoaded', () => {
    // 제목 검색 (클릭/엔터)
    const sBtn = document.getElementById('reqSearchBtn');
    const sInput = document.getElementById('reqSearchInput');
    const doSearch = () => { reqFilters.title = sInput.value.trim(); fetchReqData(); };

    if(sBtn) sBtn.onclick = doSearch;
    if(sInput) sInput.onkeydown = (e) => { if(e.key === 'Enter') doSearch(); };

    // 날짜 검색
    const dBtn = document.getElementById('reqDateBtn');
    if(dBtn) dBtn.onclick = () => {
        reqFilters.start = document.getElementById('reqStart').value;
        reqFilters.end = document.getElementById('reqEnd').value;
        fetchReqData();
    };

    // 개수 선택
    const sel = document.getElementById('req_sarray_numbers');
    if(sel) sel.onchange = () => { REQ_PER_PAGE = parseInt(sel.value); reqPage = 1; renderReqUI(); };

    initReqPage();
});