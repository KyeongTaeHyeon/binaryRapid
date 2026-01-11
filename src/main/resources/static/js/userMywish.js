/**
 * userMywish.js - 제목/이미지 상세페이지 링크 포함 최종본
 */
let allShops = [];
let ITEMS_PER_PAGE = 7;
let currentPage = 1;

const contentList = document.getElementById("contentList");
const contentItemTemplate = document.getElementById("contentItemTemplate");
const paginationList = document.querySelector(".page-list");
const prevButton = document.querySelector(".page-btn.prev");
const nextButton = document.querySelector(".page-btn.next");
const itemsPerPageSelect = document.getElementById("sarray_numbers");

// 1. 서버 데이터 로드
async function loadWishlistFromServer() {
    try {
        const response = await authFetch("/user/api/my/wishlist");
        if (!response.ok) throw new Error("로드 실패");
        allShops = await response.json();
        updateUI();
    } catch (error) {
        console.error("데이터 로드 오류:", error);
        contentList.innerHTML = '<p style="text-align:center; padding:50px;">데이터를 불러올 수 없습니다.</p>';
    }
}

// 2. 찜 삭제 요청
async function removeWish(shopId) {
    if (!confirm("찜 목록에서 삭제하시겠습니까?")) return;
    try {
        const response = await authFetch(`/user/api/my/wishlist?shopId=${shopId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            allShops = allShops.filter(s => s.shopId !== shopId);
            updateUI();
        }
    } catch (error) {
        alert("삭제 실패");
    }
}

// 3. 카드 렌더링 (제목 & 이미지 링크 추가)
/**
 * userMywish.js - 제목 클릭 시 이동 + 찜 취소 버튼 유지 버전
 */
function renderCards(shops) {
    contentList.innerHTML = "";
    if (shops.length === 0) {
        contentList.innerHTML = '<p style="text-align: center; padding: 50px;">찜한 가게가 없습니다.</p>';
        return;
    }

    shops.forEach((shop, index) => {
        const item = contentItemTemplate.content.firstElementChild.cloneNode(true);
        const displayId = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

        // 1. 기본 텍스트 매핑
        item.querySelector(".contentNumber").textContent = `${displayId}.`;
        item.querySelector(".contentDescription").textContent = shop.shopContent || "설명 없음";
        item.querySelector(".contentImageWrapper img").src = shop.imgUrl || "/img/default-image.png";

        // 2. [변경] 가게 제목 클릭 시 상세 페이지 이동 링크 설정
        const titleElement = item.querySelector(".contentTitle");
        titleElement.innerHTML = `
            <a href="/shop/${shop.shopId}" style="text-decoration: none; color: #333; font-weight: bold; cursor: pointer;">
                ${shop.shopName || "이름 없음"}
            </a>
        `;

        // 3. [변경] 기존 '사이트 바로가기' 버튼 제거 (템플릿에 존재한다면 숨김 또는 삭제)
        const siteLink = item.querySelector(".siteLink");
        if (siteLink) siteLink.remove();

        // 4. [유지] 찜 취소 버튼 생성 및 이벤트 바인딩
        const delBtn = document.createElement("button");
        delBtn.textContent = "찜 취소";
        delBtn.className = "siteLink"; // 기존 디자인 스타일 클래스 재활용
        delBtn.style.cssText = "background-color:#ffeded; color:#ff4d4d; margin-left:10px; cursor:pointer; border:none; padding: 5px 10px; border-radius: 4px;";
        delBtn.onclick = (e) => {
            e.preventDefault();
            removeWish(shop.shopId);
        };

        item.querySelector(".contentInfo").appendChild(delBtn);
        contentList.appendChild(item);
    });
}

// 4. UI 갱신 및 페이지네이션
function updateUI() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    renderCards(allShops.slice(start, start + ITEMS_PER_PAGE));
    renderPaginationButtons(allShops.length);
}

function renderPaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    paginationList.innerHTML = "";

    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; updateUI(); };
        li.appendChild(btn);
        paginationList.appendChild(li);
    }
}

// 5. 이벤트 리스너 초기화
document.addEventListener("DOMContentLoaded", () => {
    if (itemsPerPageSelect) {
        ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);
        itemsPerPageSelect.addEventListener("change", (e) => {
            ITEMS_PER_PAGE = parseInt(e.target.value);
            currentPage = 1;
            updateUI();
        });
    }
    loadWishlistFromServer();
});