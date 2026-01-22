/**
 * userRequestShop.js - 지역, 작성자 컬럼 제거 버전
 */
let reqPosts = [];
let REQ_PER_PAGE = 10;
let reqPage = 1;

let reqFilters = {title: '', start: '', end: ''};

const reqTable = document.querySelector('#userRequestMain');
const reqList = document.querySelector(".page-list");

// 1. 초기 데이터 로드
async function initReqPage() {
    try {
        await fetchReqData();
    } catch (e) {
        console.error("초기화 실패", e);
    }
}

// 2. 서버 통신
async function fetchReqData() {
    const url = `/user/api/my/reqShopList?title=${reqFilters.title}&startDate=${reqFilters.start}&endDate=${reqFilters.end}`;
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
        reqTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">데이터가 없습니다.</td></tr>';
        return;
    }

    pagedData.forEach((post, i) => {
        // 디버깅용 로그: 실제 reqType 값 확인
        console.log(`Post ID: ${post.id}, reqType: '${post.reqType}'`);

        const tr = document.createElement('tr');

        // reqType: Y(승인), N(반려), D(대기, null포함), P(보류)
        // 주의: null 체크를 먼저 하고, 그 외에는 문자열 비교
        const reqType = post.reqType; 
        let statusContent = '';

        if (reqType === null || reqType === 'D') {
            // 승인 대기 상태일 때만 삭제 버튼 표시
            statusContent = `<button type="button" onclick="deleteReqShop('${post.id}')" 
                                     style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                                     삭제
                             </button>`;
        } else if (reqType === 'Y') {
            statusContent = '<span style="color: green; font-weight: bold;">완료</span>';
        } else if (reqType === 'N') {
            statusContent = '<span style="color: red; font-weight: bold;">반려</span>';
        } else if (reqType === 'P') {
            statusContent = '<span style="color: gray; font-weight: bold;">보류</span>';
        } else {
            statusContent = '-';
        }

        tr.innerHTML = `
            <td>${startIdx + i + 1}</td>
            <td style="cursor:pointer; color:#007bff;" onclick="location.href='/approval/detail?id=${post.id}'">${post.title}</td>
            <td>식당신청</td>
            <td>${post.createDate ? post.createDate.split('T')[0] : '-'}</td>
            <td>${statusContent}</td>
        `;
        reqTable.appendChild(tr);
    });
    renderReqPager();
}

// 삭제 기능 함수
async function deleteReqShop(shopId) {
    if (!confirm("가게 삭제 시 모든 정보가 삭제됩니다.\n정말 삭제하시겠습니까?")) return;

    try {
        const res = await authFetch(`/user/api/my/reqShop/${shopId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert("삭제되었습니다.");
            fetchReqData(); // 목록 새로고침
        } else {
            let msg = "삭제 실패";
            try {
                msg = await res.text();
            } catch (e) {
            }
            alert(msg);
        }
    } catch (e) {
        console.error("삭제 중 오류 발생", e);
        alert("오류가 발생했습니다.");
    }
}

// 4. 페이지네이션
function renderReqPager() {
    if (!reqList) return;
    const total = Math.ceil(reqPosts.length / REQ_PER_PAGE) || 1;
    reqList.innerHTML = "";

    const prevBtn = document.querySelector(".page-btn.prev");
    const nextBtn = document.querySelector(".page-btn.next");

    if (prevBtn) prevBtn.onclick = () => {
        if (reqPage > 1) {
            reqPage--;
            renderReqUI();
        }
    };
    if (nextBtn) nextBtn.onclick = () => {
        if (reqPage < total) {
            reqPage++;
            renderReqUI();
        }
    };

    for (let i = 1; i <= total; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === reqPage ? 'active' : ''}`;
        li.innerHTML = `<button>${i}</button>`;
        li.onclick = () => {
            reqPage = i;
            renderReqUI();
        };
        reqList.appendChild(li);
    }
}

// 5. 이벤트 바인딩
document.addEventListener('DOMContentLoaded', () => {
    const sBtn = document.getElementById('reqSearchBtn');
    const sInput = document.getElementById('reqSearchInput');
    const doSearch = () => {
        reqFilters.title = sInput.value.trim();
        fetchReqData();
    };

    if (sBtn) sBtn.onclick = doSearch;
    if (sInput) sInput.onkeydown = (e) => {
        if (e.key === 'Enter') doSearch();
    };

    const dBtn = document.getElementById('reqDateBtn');
    if (dBtn) dBtn.onclick = () => {
        reqFilters.start = document.getElementById('reqStart').value;
        reqFilters.end = document.getElementById('reqEnd').value;
        fetchReqData();
    };

    const sel = document.getElementById('req_sarray_numbers');
    if (sel) sel.onchange = () => {
        REQ_PER_PAGE = parseInt(sel.value);
        reqPage = 1;
        renderReqUI();
    };

    initReqPage();
});
