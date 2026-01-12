document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path.includes("approvalList")) {
        loadApprovalList();
    } else if (path.includes("approvalDetail")) {
        const id = new URLSearchParams(window.location.search).get("id");
        loadApprovalDetail(id);
    }
});
function renderList(data) {
    const listContent = document.getElementById("listContent");
    let html = "";

    data.forEach((item, index) => {
        html += `
        <div class="list-item">
            <div class="col-id">${index + 1}</div>
            <div class="col-name"><a href="/approvalDetail?id=${item.id}">${item.name}</a></div>
            <div class="col-writer">${item.writerName || '익명'}</div>
            <div class="col-date">${item.createDate.split('T')[0]}</div>
        </div>`;
    });
    listContent.innerHTML = html;
}
/** 목록 페이지 로직 */
async function loadApprovalList() {
    const listContent = document.getElementById("listContent");
    if (!listContent) return;

    try {
        const res = await fetch('/api/approval/list');

        // 서버 응답 확인용 (500 에러 방지)
        if (!res.ok) {
            throw new Error(`서버 에러: ${res.status}`);
        }

        const data = await res.json();

        // 1번부터 시작하는 번호 + 제목 앞 작은 이미지
        listContent.innerHTML = data.map((item, index) => `
            <div class="list-item">
                <div class="col-id">${index + 1}</div>
                <div class="col-name">
                    <img src="${item.mainImgUrl || '/images/no-image.png'}" class="list-thumb">
                    <a href="/approvalDetail?id=${item.id}">${item.name}</a>
                </div>
                <div class="col-writer">${item.writerName || '익명'}</div>
                <div class="col-date">${item.createDate ? item.createDate.split('T')[0] : '-'}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error("데이터 로드 실패:", error);
        listContent.innerHTML = '<div style="text-align:center; padding:20px;">데이터를 불러오는 중 오류가 발생했습니다.</div>';
    }
}
async function loadApprovalDetail(id) {
    if (!id) return;

    try {
        const res = await fetch(`/api/approval/detail/${id}`);
        if (!res.ok) throw new Error("데이터를 가져올 수 없습니다.");

        const data = await res.json();

        // 1. 기본 텍스트 정보 (ID 확인 필수)
        document.getElementById("shopName").innerText = data.name || "이름 없음";
        document.getElementById("shopAddress").innerText = data.address || "주소 정보가 없습니다.";
        document.getElementById("shopContent").innerText = data.content || "등록된 상세 내용이 없습니다.";
        document.getElementById("writerName").innerText = data.writerName || "익명";
        // 날짜 처리 (T 기준 자르기)
        document.getElementById("createDate").innerText = data.createDate ? data.createDate.split('T')[0] : "-";

        // 2. 필터/카테고리 (태그) 생성
        const tagSection = document.getElementById("detailTagsSection");
        if (data.categories && data.categories.length > 0) {
            tagSection.innerHTML = data.categories.map(cat => `<span class="tag-badge">${cat}</span>`).join('');
        } else {
            tagSection.innerHTML = "";
        }

        // 3. 이미지 처리
        const shopImg = document.getElementById("shopImage");
        if (data.images && data.images.length > 0) {
            // 메인 이미지가 있으면 메인으로, 없으면 첫 번째 이미지 사용
            const mainImg = data.images.find(i => i.mainImg === 'Y') || data.images[0];
            shopImg.src = mainImg.imgUrl;

            // 이미지 클릭 시 변경하고 싶다면 추가 (선택 사항)
            shopImg.title = `순번: ${mainImg.imgSeq}`;
        }

    } catch (error) {
        console.error("상세 정보 로드 실패:", error);
    }
}

/** 페이지 로드 시 경로에 따라 실행 */
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // 현재 URL 확인하여 함수 호출
    if (window.location.pathname.includes("approvalDetail") && id) {
        loadApprovalDetail(id);
    } else if (window.location.pathname.includes("approvalList")) {
        loadApprovalList();
    }
});