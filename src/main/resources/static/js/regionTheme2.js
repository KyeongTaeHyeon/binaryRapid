// document.addEventListener("DOMContentLoaded", async function () {
//     // 요소 선택
//     const shopNameElement = document.getElementById("shopName");
//     const detailTagsSection = document.getElementById("detailTagsSection");
//     const shopImageElement = document.getElementById("shopImage");
//     const shopRegionElement = document.getElementById("shopRegion");
//     const shopAddressElement = document.getElementById("shopAddress");
//     const shopContentElement = document.getElementById("shopContent");
//     const detailPageTitle =
//         document.getElementById("detailPageTitle") ||
//         document.querySelector("title");
//
//     // JSON 데이터 로드 함수
//     async function loadJsonData(url) {
//         try {
//             const response = await fetch(url);
//             if (!response.ok)
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             return await response.json();
//         } catch (error) {
//             console.error(`${url} 데이터를 로드하는 데 실패했습니다:`, error);
//             return [];
//         }
//     }
//
//     // URL에서 shopId 파라미터 추출
//     const urlParams = new URLSearchParams(window.location.search);
//     const shopId = urlParams.get("shopId");
//
//     if (!shopId) {
//         if (shopNameElement) shopNameElement.textContent = "❗ 오류: 가게 정보를 찾을 수 없습니다.";
//         if (shopContentElement) shopContentElement.textContent =
//             "URL에 유효한 가게 ID(shopId)가 없습니다.";
//         return;
//     }
//
//     // shopData.json 로드
//     const allShopData = await loadJsonData("/data/shopData.json");
//
//     if (!allShopData || allShopData.length === 0) {
//         if (shopNameElement) shopNameElement.textContent =
//             "🚧 오류: 가게 데이터를 불러올 수 없습니다.";
//         if (shopContentElement) shopContentElement.textContent =
//             "데이터 파일 경로나 형식을 확인해주세요.";
//         return;
//     }
//
//     // ID로 가게 찾기
//     const shop = allShopData.find((s) => String(s.id) === String(shopId));
//
//     if (!shop) {
//         if (shopNameElement) shopNameElement.textContent = `🤷‍♂️ 가게를 찾을 수 없습니다 (ID: ${shopId})`;
//         if (shopContentElement) shopContentElement.textContent =
//             "요청하신 라멘 가게 정보가 존재하지 않습니다.";
//         return;
//     }
//
//     // ✅ 데이터 바인딩 시작
//     if (detailPageTitle) detailPageTitle.textContent = `${shop.name} - 라멘 상세 정보`;
//     if (shopNameElement) shopNameElement.textContent = shop.name || "이름 없음";
//
//     // 이미지
//     if (shopImageElement) {
//         shopImageElement.src = shop.imageURL || "";
//         shopImageElement.alt = shop.name || "라멘 이미지";
//     }
//
//     // 지역/주소/내용
//     if (shopRegionElement) shopRegionElement.textContent = shop.region || "-";
//     if (shopAddressElement) shopAddressElement.textContent = shop.address || "-";
//     if (shopContentElement) shopContentElement.textContent = shop.content || "설명 없음";
//
//     // 태그 생성
//     const tags = [
//         shop.category,
//         shop.kind,
//         shop.thickness,
//         shop.shape,
//         shop.style,
//         shop.rich,
//         shop.richness,
//     ].filter((tag) => tag && tag.trim() !== "");
//
//     if (detailTagsSection) {
//         detailTagsSection.innerHTML = ""; // 기존 초기화
//         tags.forEach((tagText) => {
//             const tagSpan = document.createElement("span");
//             tagSpan.classList.add("tag");
//             tagSpan.textContent = tagText;
//             detailTagsSection.appendChild(tagSpan);
//         });
//     }
// });
