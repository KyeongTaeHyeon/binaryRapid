// userMywish.js

let allShops = []; // 모든 가게 데이터를 저장할 배열
let ITEMS_PER_PAGE = 5; // 한 페이지에 표시할 항목 수 (화면 캡처에 맞게 5개로 조정)
let currentPage = 1; // 현재 페이지

const contentList = document.getElementById("contentList"); // 카드를 렌더링할 컨테이너
const contentItemTemplate = document.getElementById("contentItemTemplate"); // 카드 템플릿
const paginationList = document.querySelector(".page-list"); // 페이지네이션 ul 엘리먼트
const prevButton = document.querySelector(".page-btn.prev"); // 이전 페이지 버튼
const nextButton = document.querySelector(".page-btn.next"); // 다음 페이지 버튼
const itemsPerPageSelect = document.getElementById("sarray_numbers"); // 페이지당 항목 수 선택 select 박스

/**
 * 외부 JSON 파일을 비동기적으로 로드하는 함수
 * @param {string} url - JSON 파일의 경로
 * @returns {Promise<Array>} - 로드된 JSON 데이터 배열을 반환하는 Promise
 */
async function loadShopData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} at ${url}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading shop data:", error);
        return [];
    }
}

/**
 * 찜 목록을 카드 형태로 렌더링하는 함수
 * @param {Array} shopsToDisplay - 현재 페이지에 표시할 가게 데이터 배열
 */
function renderLikedShopsAsCards(shopsToDisplay) {
    contentList.innerHTML = ""; // 기존 내용 초기화

    if (shopsToDisplay.length === 0) {
        contentList.innerHTML =
            '<p style="text-align: center; padding: 50px;">찜한 가게가 없습니다.</p>';
        return;
    }

    shopsToDisplay.forEach((shop, index) => {
        // 템플릿에서 요소 복제
        const contentItem =
            contentItemTemplate.content.firstElementChild.cloneNode(true);

        // 페이지 내에서 순차적인 ID 부여 (1부터 시작)
        const displayId = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

        // 데이터 매핑
        contentItem.querySelector(
            ".contentNumber"
        ).textContent = `${displayId}.`; // 번호
        contentItem.querySelector(".contentTitle").textContent =
            shop.name || "이름 없음"; // 가게 이름

        // 분류 (Category 또는 Kind 사용)
        const contentCategory = contentItem.querySelector(".contentCategory");
        if (contentCategory) {
            // 'category' 필드가 있으면 사용, 없으면 'kind' 필드 사용
            contentCategory.textContent = shop.category
                ? shop.category
                : shop.kind
                ? shop.kind
                : "";
            if (!contentCategory.textContent) {
                // 내용이 없으면 숨김
                contentCategory.style.display = "none";
            } else {
                contentCategory.style.display = "";
            }
        }

        contentItem.querySelector(".contentImageWrapper img").src =
            shop.imageURL || "/img/default-image.png"; // 이미지 URL (기본 이미지 폴백)
        contentItem.querySelector(".contentImageWrapper img").alt = shop.name
            ? `${shop.name} 이미지`
            : "가게 이미지";

        // content 필드에서 '...'을 기준으로 자르거나, 개행 문자를 <br>로 변환
        let shopContent = shop.content || "설명 없음";
        if (shopContent.includes("・・・")) {
            shopContent = shopContent.split("・・・")[0].trim() + "・・・"; // '・・・' 앞부분만 표시
        }
        contentItem.querySelector(".contentDescription").textContent =
            shopContent; // 가게 상세 내용

        const siteLink = contentItem.querySelector(".siteLink");
        siteLink.href = shop.siteURL || "#"; // 사이트 URL
        if (!shop.siteURL || shop.siteURL === "#") {
            // URL이 없으면 링크 비활성화 또는 숨김
            siteLink.style.pointerEvents = "none";
            siteLink.style.opacity = "0.5";
            siteLink.textContent = "사이트 정보 없음"; // 텍스트 변경
        } else {
            siteLink.style.pointerEvents = "auto";
            siteLink.style.opacity = "1";
            siteLink.textContent = "사이트 바로가기";
        }

        contentList.appendChild(contentItem);
    });
}

/**
 * 페이지네이션 버튼을 렌더링하는 함수 (이전 코드와 동일)
 * @param {number} totalItems - 전체 찜한 가게 수
 */
function renderPaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    paginationList.innerHTML = "";

    if (prevButton) {
        prevButton.disabled = currentPage === 1;
        prevButton.style.opacity = currentPage === 1 ? "0.5" : "1";
        prevButton.style.pointerEvents = currentPage === 1 ? "none" : "auto";
    }

    const maxPageButtons = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
        const firstPageItem = document.createElement("li");
        firstPageItem.classList.add("page-item");
        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = 1;
        firstPageButton.onclick = () => {
            currentPage = 1;
            updateLikedShopListAndPagination();
        };
        firstPageItem.appendChild(firstPageButton);
        paginationList.appendChild(firstPageItem);

        if (startPage > 2) {
            const ellipsisItem = document.createElement("li");
            ellipsisItem.classList.add("page-item", "ellipsis");
            ellipsisItem.innerHTML = `<span>...</span>`;
            paginationList.appendChild(ellipsisItem);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");
        if (i === currentPage) {
            pageItem.classList.add("active");
        }

        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            updateLikedShopListAndPagination();
        };
        pageItem.appendChild(pageButton);
        paginationList.appendChild(pageItem);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsisItem = document.createElement("li");
            ellipsisItem.classList.add("page-item", "ellipsis");
            ellipsisItem.innerHTML = `<span>...</span>`;
            paginationList.appendChild(ellipsisItem);
        }

        const lastPageItem = document.createElement("li");
        lastPageItem.classList.add("page-item");
        if (totalPages === currentPage) {
            lastPageItem.classList.add("active");
        }
        const lastPageButton = document.createElement("button");
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages;
            updateLikedShopListAndPagination();
        };
        lastPageItem.appendChild(lastPageButton);
        paginationList.appendChild(lastPageButton);
    }

    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
        nextButton.style.opacity = currentPage === totalPages ? "0.5" : "1";
        nextButton.style.pointerEvents =
            currentPage === totalPages ? "none" : "auto";
    }
}

/**
 * 찜한 가게 목록을 가져와 렌더링하고, 페이지네이션을 업데이트하는 주 함수
 */
function updateLikedShopListAndPagination() {
    // localStorage에서 찜한 가게 ID 목록을 가져옴
    const likedShopIds = JSON.parse(
        localStorage.getItem("likedShopIds") || "[]"
    );

    // 전체 가게 데이터 (allShops)에서 찜한 ID와 일치하는 가게만 필터링
    const filteredLikedShops = allShops.filter(
        (shop) => likedShopIds.includes(String(shop.id)) // shop.id가 숫자일 수 있으므로 String으로 변환하여 비교
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const shopsToDisplay = filteredLikedShops.slice(startIndex, endIndex);

    renderLikedShopsAsCards(shopsToDisplay); // 카드 형태로 렌더링
    renderPaginationButtons(filteredLikedShops.length); // 필터링된 찜한 가게 수로 페이지네이션 계산
}

// DOMContentLoaded 이벤트 발생 시 JSON 데이터를 로드하고 초기화
document.addEventListener("DOMContentLoaded", () => {
    // '이전'/'다음' 버튼 이벤트 리스너
    if (prevButton) {
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                updateLikedShopListAndPagination();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            const likedShopIds = JSON.parse(
                localStorage.getItem("likedShopIds") || "[]"
            );
            const totalFilteredShops = allShops.filter((shop) =>
                likedShopIds.includes(String(shop.id))
            );
            const totalPages = Math.ceil(
                totalFilteredShops.length / ITEMS_PER_PAGE
            );
            if (currentPage < totalPages) {
                currentPage++;
                updateLikedShopListAndPagination();
            }
        });
    }

    // 페이지당 항목 수 변경 드롭다운 이벤트 리스너
    if (itemsPerPageSelect) {
        // HTML에서 기본으로 선택된 값으로 ITEMS_PER_PAGE 초기화
        ITEMS_PER_PAGE = parseInt(itemsPerPageSelect.value);

        itemsPerPageSelect.addEventListener("change", (event) => {
            ITEMS_PER_PAGE = parseInt(event.target.value);
            currentPage = 1; // 항목 수 변경 시 첫 페이지로 이동
            updateLikedShopListAndPagination();
        });
    }

    // shopData.json 파일 로드
    loadShopData("/data/shopData.json") // shopData.json 경로 확인
        .then((data) => {
            allShops = data; // 모든 가게 데이터를 저장
            updateLikedShopListAndPagination(); // 찜 목록 렌더링 시작
        })
        .catch((error) => {
            console.error("Failed to load shopData.json:", error);
            contentList.innerHTML =
                '<p style="text-align: center; color: red; padding: 50px;">찜한 가게 데이터를 불러오는 데 실패했습니다.</p>';
            paginationList.innerHTML = "";
            if (prevButton) prevButton.disabled = true;
            if (nextButton) nextButton.disabled = true;
            if (itemsPerPageSelect) itemsPerPageSelect.disabled = true;
        });
});
