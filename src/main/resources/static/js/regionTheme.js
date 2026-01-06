const regionLists = [];
const categoryLists = [];
const thicknessLists = [];
const noodleTypes = [];
const brothCategories = [];
const brothStyles = [];
const brothRichs = [];
const brothRichness = [];

const valueList = [];
const shopList = [];

let currentPage = 1;
const itemsPerPage = 8;
let pagedData = [];
let regionViewCount = 9;
let isHeader = false;
let headerTitle = '';

// valueList를 아래처럼 그룹별로 분리해서 관리
const filterState = {
    region: [],
    kind: [],
    thickness: [],
    shape: [],
    category: [],
    type: [],
    rich: [],
    richness: [],
    style: [],
};

import {LoadData} from './utils.js';

const filterWrapper = document.getElementById('filterWrapper');
const selectWrapper = document.getElementById('selectorWrapper');
const contentList = document.getElementById('contentList');
/** @type {HTMLTemplateElement} */
const contentItemTemplate = document.getElementById('contentItemTemplate');

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        LoadData('/data/region.json'),
        LoadData('/data/category.json'),
        LoadData('/data/noodle.json'),
        LoadData('/data/broth.json'),
        LoadData('/data/shopData.json'),
    ]).then(([regionData, categoryData, noodleData, brothData, shopData]) => {
        regionLists.push(...regionData);
        setLists(regionLists);

        categoryLists.push(...categoryData);
        setLists(categoryLists);

        thicknessLists.push(
            ...noodleData.filter((item) => item.type === 'thickness')
        );
        setLists(thicknessLists, 'noodle');

        noodleTypes.push(...noodleData.filter((item) => item.type === 'shape'));
        setLists(noodleTypes, 'noodle');

        brothCategories.push(
            ...brothData.filter((item) => item.type === 'category')
        );
        setLists(brothCategories, 'broth');

        brothStyles.push(...brothData.filter((item) => item.type === 'style'));
        setLists(brothStyles, 'broth');

        brothRichs.push(...brothData.filter((item) => item.type === 'rich'));
        setLists(brothRichs, 'broth');

        brothRichness.push(
            ...brothData.filter((item) => item.type === 'richness')
        );
        setLists(brothRichness, 'broth');

        const regionMapByName = {};
        regionData.forEach((region) => {
            regionMapByName[region.name] = region.id;
        });

        const kindMapByName = {};
        categoryData.forEach((kind) => {
            kindMapByName[kind.name] = kind.id;
        });

        const noodleMapByName = {};
        noodleData.forEach((noodle) => {
            noodleMapByName[noodle.name] = noodle.id;
        });

        const brothNameCategory = {};
        const brothNameType = {};
        const brothNameRich = {};
        const brothNameRichness = {};
        brothData.forEach((broth) => {
            if (broth.type === 'category') {
                broth.name.split('/').forEach((name) => {
                    brothNameCategory[name.trim()] = broth.id;
                });
            } else if (broth.type === 'style') {
                broth.name.split('/').forEach((name) => {
                    brothNameType[name.trim()] = broth.id;
                });
            } else if (broth.type === 'rich') {
                broth.name.split('/').forEach((name) => {
                    brothNameRich[name.trim()] = broth.id;
                });
            } else if (broth.type === 'richness') {
                broth.name.split('/').forEach((name) => {
                    brothNameRichness[name.trim()] = broth.id;
                });
            }
        });

        // shopData에 id값 자동 추가
        shopData.forEach((item) => {
            // 지역(region)
            if (!item.regionID && item.region && regionMapByName[item.region]) {
                item.regionID = regionMapByName[item.region];
            }
            // 종류(kind)
            if (!item.kindID && item.kind && kindMapByName[item.kind]) {
                item.kindID = kindMapByName[item.kind];
            }
            // 두께(thickness)
            if (
                !item.thicknessID &&
                item.thickness &&
                noodleMapByName[item.thickness]
            ) {
                item.thicknessID = noodleMapByName[item.thickness];
            }
            // 모양(shape)
            if (
                !item.shapeID &&
                item['shape'] &&
                noodleMapByName[item['shape']]
            ) {
                item.shapeID = noodleMapByName[item['shape']];
            }

            // 카테고리 (여러 값 처리)
            if (item.category) {
                item.categoryID = item.category
                    .split('/')
                    .map((cat) => brothNameCategory[cat.trim()])
                    .filter((id) => !!id);
            } else {
                item.categoryID = [];
            }
            // 계열
            if (
                !item.styleID &&
                item['style'] &&
                brothNameType[item['style']]
            ) {
                item.styleID = brothNameType[item['style']];
            }
            // 타입 (여러 값 처리)
            if (item.type) {
                item.typeID = item.type
                    .split('/')
                    .map((type) => brothMapByName[type.trim()])
                    .filter((id) => !!id);
            } else {
                item.typeID = [];
            }
            // 진함/담백함 (여러 값 처리)
            if (item.rich) {
                item.richID = item.rich
                    .split('/')
                    .map((rich) => brothNameRich[rich.trim()])
                    .filter((id) => !!id);
            } else {
                item.richID = [];
            }
            // 진함정도 (여러 값 처리)
            if (item.richness) {
                item.richnessID = item.richness
                    .split('/')
                    .map((richness) => brothNameRichness[richness.trim()])
                    .filter((id) => !!id);
            } else {
                item.richnessID = [];
            }
        });
        shopList.push(...shopData);
        renderContent();
    });
});

let setLists = (lists, groupType) => {
    if (!filterWrapper) return;
    const filter = filterWrapper.querySelector('.filters');
    if (!filter) return;

    // 면/육수 그룹일 때 기존 sectionDiv/groupWrap 재사용
    let sectionDiv, groupWrap;
    if (groupType === 'noodle' || groupType === 'broth') {
        sectionDiv = filter.querySelector(
            `.filterSection[data-type="${groupType}"]`
        );
        if (!sectionDiv) {
            sectionDiv = document.createElement('div');
            sectionDiv.className = 'filterSection filterOutline';
            sectionDiv.dataset.type = groupType;

            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'filterHeaderTitle';
            sectionTitle.textContent =
                groupType === 'noodle' ? '면  ▼' : '육수  ▼';
            sectionDiv.appendChild(sectionTitle);

            groupWrap = document.createElement('div');
            groupWrap.className = 'filterGroupWrap';
            sectionDiv.appendChild(groupWrap);

            filter.appendChild(sectionDiv);
        } else {
            groupWrap = sectionDiv.querySelector('.filterGroupWrap');
        }

        const sectionTitle = sectionDiv.querySelector('.filterHeaderTitle');
        // 여기서 groupWrap을 다시 선언하지 마세요!
        if (sectionTitle && groupWrap && !sectionTitle.dataset.toggleAdded) {
            sectionTitle.style.cursor = 'pointer';
            sectionTitle.addEventListener('click', () => {
                if (groupWrap.style.display === 'none') {
                    sectionTitle.innerHTML = sectionTitle.innerHTML.replace(
                        '▲',
                        '▼'
                    );
                    groupWrap.style.display = '';
                } else {
                    sectionTitle.innerHTML = sectionTitle.innerHTML.replace(
                        '▼',
                        '▲'
                    );
                    groupWrap.style.display = 'none';
                }
            });
            sectionTitle.dataset.toggleAdded = 'true'; // 중복 방지
        }
    }

    const filterDiv = document.createElement('div');
    if (groupType != 'noodle' && groupType != 'broth') {
        filterDiv.classList.add('filterOutline');
    }
    const filterTitle = document.createElement('div');
    filterTitle.classList.add('filterTitle');
    const filterList = document.createElement('div');
    filterList.classList.add('filterList');
    const filterContents = document.createElement('ul');
    filterContents.classList.add('filterContents');

    const allLi = document.createElement('li');
    allLi.classList.add('filterAll');
    allLi.innerHTML = '전체';
    allLi.dataset.title = lists.length > 0 ? lists[0].type : '';
    allLi.dataset.value = 'all';

    allLi.addEventListener('click', function (e) {
        const group = allLi.dataset.title;
        if (!group) return;

        // filterState에 모든 값 추가
        filterState[group] = lists.map((list) => list.id);

        // UI에 모든 li에 selected 클래스 추가
        filterContents.querySelectorAll('li').forEach((li) => {
            if (li !== allLi) li.classList.add('selected');
            else li.classList.remove('selected');
        });

        // selectorContents에는 lists의 값만 추가 (전체는 추가하지 않음)
        lists.forEach((list) => {
            const selectLi = document.createElement('li');
            selectLi.innerHTML = `${list.name}<span class="removeBtn" style="display:none;">×</span>`;
            selectLi.dataset.value = list.id;
            selectLi.dataset.title = list.type;

            selectWrapper
                .querySelector('.selectorContents')
                .appendChild(selectLi);

            gsap.fromTo(
                selectLi,
                {opacity: 0, y: 20, scale: 0.95},
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                }
            );

            // 삭제 이벤트: selectLi의 dataset을 사용
            selectLi.addEventListener('click', function () {
                this.remove();
                const value = this.dataset.value;
                const group = this.dataset.title;
                if (filterState[group]) {
                    const idx = filterState[group].indexOf(value);
                    if (idx > -1) filterState[group].splice(idx, 1);
                    currentPage = 1;
                }
                const filterList =
                    filterWrapper.querySelectorAll('.filterContents li');
                filterList.forEach((li) => {
                    if (
                        li.dataset.value === value &&
                        li.dataset.title === group
                    ) {
                        li.classList.remove('selected');
                    }
                });
                renderContent();
            });

            selectLi.addEventListener('mouseenter', function () {
                this.querySelector('.removeBtn').style.display = 'inline';
            });
            selectLi.addEventListener('mouseleave', function () {
                this.querySelector('.removeBtn').style.display = 'none';
            });
        });
    });

    filterContents.appendChild(allLi); // "전체" li를 맨 앞에 추가

    lists.forEach((list, idx) => {
        if (list.title.includes('/')) {
            filterTitle.innerHTML =
                list.title.split('/')[1].toString().trim() || '';
        } else {
            filterTitle.innerHTML = list.title || '';
        }

        const filterLI = document.createElement('li');
        filterLI.innerHTML = list.name;
        filterLI.dataset.value = list.id;
        filterLI.dataset.title = list.type || '';
        if (lists === regionLists && idx > regionViewCount) {
            filterLI.style.display = 'none';
        }
        filterContents.appendChild(filterLI);
    });

    filterDiv.appendChild(filterTitle);
    filterList.appendChild(filterContents);
    filterDiv.appendChild(filterList);

    // 면/육수 그룹이면 groupWrap에, 아니면 filter에 바로 추가
    if (groupType === 'noodle' || groupType === 'broth') {
        groupWrap.appendChild(filterDiv);
    } else {
        filter.appendChild(filterDiv);
    }

    if (lists === regionLists) {
        // ... 버튼 생성
        const moreBtn = document.createElement('button');
        moreBtn.className = 'regionMoreBtn';
        moreBtn.type = 'button';
        moreBtn.style.width = '50px';
        moreBtn.innerText = '...';

        let expanded = false;
        moreBtn.addEventListener('click', function () {
            expanded = !expanded;
            filterContents.querySelectorAll('li').forEach((li, idx) => {
                if (idx > regionViewCount)
                    li.style.display = expanded ? '' : 'none';
            });
            moreBtn.innerText = expanded ? '접기 ▲' : '...';
        });

        filterList.appendChild(moreBtn);
    }

    filter.addEventListener('click', filterClick);

    const selectorContents = selectWrapper.querySelector('.selectorContents');
    let clearAllBtn = document.querySelector('.clearAllBtn');
    if (!clearAllBtn) {
        clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clearAllBtn';
        clearAllBtn.innerText = '전체삭제';
        clearAllBtn.style.display = 'none'; // 버튼 생성 시 바로 숨김!
        clearAllBtn.onclick = function () {
            selectorContents.innerHTML = '';
            Object.keys(filterState).forEach((key) => (filterState[key] = []));
            const filterSelected = filterWrapper.querySelectorAll(
                '.filterContents li.selected'
            );
            filterSelected.forEach((li) => li.classList.remove('selected'));
            currentPage = 1;
            renderContent();
            updateClearAllBtnVisibility();
        };
        selectorContents.parentNode.insertBefore(clearAllBtn, selectorContents);
        updateClearAllBtnVisibility();
    }
    window.clearAllBtn = clearAllBtn;
};

function updateClearAllBtnVisibility() {
    if (window.clearAllBtn) {
        // selectorContents에 li가 하나라도 있으면 버튼 표시
        const hasLi = !!selectWrapper.querySelector('.selectorContents li');
        window.clearAllBtn.style.display = hasLi ? '' : 'none';
    }
}

let filterClick = (e) => {
    if (e.target.tagName === 'LI') {
        const group = e.target.dataset.title;
        const value = e.target.dataset.value;

        // 이미 선택된 값이면 선택 해제
        if (filterState[group] && filterState[group].includes(value)) {
            // filterState에서 제거
            filterState[group] = filterState[group].filter((v) => v !== value);

            // selectorContents에서 해당 li 제거
            const selectedLis = selectWrapper.querySelectorAll(
                '.selectorContents li'
            );

            selectedLis.forEach((li) => {
                if (li.dataset.value === value && li.dataset.title === group) {
                    console.log(1);
                    li.remove();
                    console.log(2);
                }
            });

            // 원본 필터 리스트에서 selected 클래스 제거
            console.log(e.target);
            e.target.classList.remove('selected');
            console.log(e.target);

            currentPage = 1;
            renderContent();
            updateClearAllBtnVisibility();
            // return;  ❌ 이 줄을 삭제하세요!
        }

        // 선택 추가 로직 (이미 선택된 값이 아니면 실행)
        else if (
            filterState[group] &&
            !filterState[group].includes(value) &&
            value !== 'all'
        ) {
            filterState[group].push(value);
            currentPage = 1;

            // 선택된 항목 UI 추가
            const selectLi = document.createElement('li');
            selectLi.innerHTML = `${e.target.innerHTML}<span class="removeBtn" style="display:none;">×</span>`;
            selectLi.dataset.value = e.target.dataset.value;
            selectLi.dataset.title = e.target.dataset.title;

            e.target.classList.add('selected');

            gsap.fromTo(
                selectLi,
                {opacity: 0, y: 20, scale: 0.95},
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                }
            );

            selectLi.addEventListener('click', function () {
                this.remove();
                const value = this.dataset.value;
                const group = this.dataset.title;
                if (filterState[group]) {
                    const idx = filterState[group].indexOf(value);
                    if (idx > -1) filterState[group].splice(idx, 1);
                    currentPage = 1;
                }
                const filterList =
                    filterWrapper.querySelectorAll('.filterContents li');
                filterList.forEach((li) => {
                    if (
                        li.dataset.value === value &&
                        li.dataset.title === group
                    ) {
                        li.classList.remove('selected');
                    }
                });
                renderContent();
                updateClearAllBtnVisibility();
            });
            selectLi.addEventListener('mouseenter', function () {
                this.querySelector('.removeBtn').style.display = 'inline';
            });
            selectLi.addEventListener('mouseleave', function () {
                this.querySelector('.removeBtn').style.display = 'none';
            });

            selectWrapper
                .querySelector('.selectorContents')
                .appendChild(selectLi);
            updateClearAllBtnVisibility();
        }

        renderContent();
    }
};

function renderPaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage); // 전체 페이지 수 계산
    const paginationList = document.querySelector('.pageList'); // 페이지 번호 목록 (ul)
    if (!paginationList) {
        console.warn(
            'WARNING: 페이지네이션 목록(.pageList)을 찾을 수 없습니다. HTML을 확인하세요.'
        );
        return;
    }
    paginationList.innerHTML = ''; // 기존 페이지 버튼 초기화

    // '이전' 버튼 (prevButton) 로직
    const prevButton = document.querySelector('.pageBtn.prev');
    if (prevButton) {
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--; // 페이지 감소
                renderContent();
            }
        };
        prevButton.disabled = currentPage === 1; // 첫 페이지면 비활성화
        prevButton.style.opacity = currentPage === 1 ? '0.5' : '1'; // CSS 비활성화 효과
        prevButton.style.pointerEvents = currentPage === 1 ? 'none' : 'auto'; // 클릭 이벤트 비활성화
    }

    // --- 페이지 번호 생성 및 생략 기호(…) 로직 ---
    const maxPageButtons = 10; // 화면에 표시할 최대 페이지 버튼 수
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // 만약 끝 페이지가 totalPages에 도달하여 10개를 채우지 못하는 경우,
    // 시작 페이지를 조정하여 뒤에서부터 10개의 페이지가 보이도록 함
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // 첫 페이지로 가는 생략 기호 (...) 표시 로직
    if (startPage > 1) {
        // 첫 페이지 버튼 추가
        const firstPageItem = document.createElement('li');
        firstPageItem.classList.add('page-item');
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = 1;
        firstPageButton.onclick = () => {
            currentPage = 1;
            renderContent();
        };
        firstPageItem.appendChild(firstPageButton);
        paginationList.appendChild(firstPageItem);

        if (startPage > 2) {
            // 1페이지 다음 바로 startPage가 아니면 ... 추가
            const ellipsisItem = document.createElement('li');
            ellipsisItem.classList.add('page-item', 'ellipsis');
            ellipsisItem.innerHTML = `<span>...</span>`;
            paginationList.appendChild(ellipsisItem);
        }
    }

    // 계산된 범위 내의 페이지 번호 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage) {
            pageItem.classList.add('active'); // 현재 페이지 활성화
        }

        const pageButton = document.createElement('button');
        pageButton.textContent = i; // 버튼 텍스트는 페이지 번호
        pageButton.onclick = () => {
            currentPage = i; // 클릭된 페이지로 현재 페이지 설정
            renderContent();
        };
        pageItem.appendChild(pageButton);
        paginationList.appendChild(pageItem);
    }

    // 마지막 페이지로 가는 생략 기호 (...) 및 마지막 페이지 번호 표시 로직
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            // 마지막 페이지 바로 전이 아니면 ... 추가
            const ellipsisItem = document.createElement('li');
            ellipsisItem.classList.add('page-item', 'ellipsis');
            ellipsisItem.innerHTML = `<span>...</span>`;
            paginationList.appendChild(ellipsisItem);
        }

        // 마지막 페이지 번호 버튼 추가
        const lastPageItem = document.createElement('li');
        lastPageItem.classList.add('page-item');
        if (totalPages === currentPage) {
            lastPageItem.classList.add('active'); // 마지막 페이지가 현재 페이지면 활성화
        }
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages; // 클릭 시 마지막 페이지로 이동
            renderContent();
        };
        lastPageItem.appendChild(lastPageButton);
        paginationList.appendChild(lastPageItem);
    }

    // '다음' 버튼 (nextButton) 로직
    const nextButton = document.querySelector('.pageBtn.next');
    if (nextButton) {
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++; // 페이지 증가
                renderContent();
            }
        };
        nextButton.disabled = currentPage === totalPages; // 마지막 페이지면 비활성화
        nextButton.style.opacity = currentPage === totalPages ? '0.5' : '1'; // CSS 비활성화 효과
        nextButton.style.pointerEvents =
            currentPage === totalPages ? 'none' : 'auto'; // 클릭 이벤트 비활성화
    }
}

let renderContent = () => {
    // if (!contentList || !contentItemTemplate) return;
    // let showData = shopList;
    // let filteredList = getFilteredList(showData);
    //
    // contentList.innerHTML = '';
    // // 페이징 처리
    // const startIdx = (currentPage - 1) * itemsPerPage;
    // const endIdx = startIdx + itemsPerPage;
    // const pageItems = filteredList.slice(startIdx, endIdx);
    //
    // const likedShopIds = JSON.parse(
    //     localStorage.getItem('likedShopIds') || '[]'
    // );
    //
    // pageItems.forEach((item) => {
    //     const contentItem =
    //         contentItemTemplate.content.firstElementChild.cloneNode(true);
    //
    //     const contentlink = contentItem.querySelector("a");
    //     // 리스트에서 상세 페이지로 연결되도록 변경
    //     contentlink.href = `regionTheme2.html?shopId=${item.id}`;
    //     contentlink.target = "_self"; // 현재 탭에서 열기 (선택사항)
    //
    //     const contentImage = contentItem.querySelector(".contentImage img");
    //     contentImage.src = item.imageURL || "";
    //
    //     const contentTitle = contentItem.querySelector(".contentTitle");
    //     contentTitle.innerHTML = item.name || "";
    //
    //     const categoryList = contentItem.querySelector(".categoryList");
    //     // 지역
    //     if (item.region) {
    //         const li = document.createElement("li");
    //         li.innerHTML = item.region;
    //         li.dataset.value = item.regionID;
    //         categoryList.appendChild(li);
    //     }
    //     // 종류
    //     if (item.kind) {
    //         const li = document.createElement("li");
    //         li.innerHTML = item.kind;
    //         li.dataset.value = item.kindID;
    //         categoryList.appendChild(li);
    //     }
    //     // 두께
    //     if (item.thickness) {
    //         const li = document.createElement("li");
    //         li.innerHTML = item.thickness;
    //         li.dataset.value = item.thicknessID;
    //         categoryList.appendChild(li);
    //     }
    //     // 형태
    //     if (item.shape) {
    //         let shapeDataList = item.shape.split("/");
    //         shapeDataList.forEach((shape) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = shape.trim();
    //             li.dataset.value = shape.shapeID;
    //             categoryList.appendChild(li);
    //         });
    //     }
    //     // 카테고리
    //     if (item.category) {
    //         // console.log(item.category);
    //         // console.log(item.categoryID);
    //         let categoryDataList = item.category.split("/");
    //         categoryDataList.forEach((category, idx) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = category.trim();
    //             li.dataset.value = item.categoryID[idx] || "";
    //             categoryList.appendChild(li);
    //         });
    //     }
    //     // 계열
    //     if (item.type) {
    //         let typeDataList = item.type.split("/");
    //         typeDataList.forEach((type, idx) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = type.trim();
    //             li.dataset.value = item.typeID[idx] || "";
    //             categoryList.appendChild(li);
    //         });
    //     }
    //     // 기름기
    //     if (item.rich) {
    //         let richDataList = item.rich.split("/");
    //         richDataList.forEach((rich, idx) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = rich.trim();
    //             li.dataset.value = item.richID[idx] || "";
    //             categoryList.appendChild(li);
    //         });
    //     }
    //     // 농도
    //     if (item.richness) {
    //         let richnessDataList = item.richness.split("/");
    //         richnessDataList.forEach((richness, idx) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = richness.trim();
    //             li.dataset.value = item.richnessID[idx];
    //             categoryList.appendChild(li);
    //         });
    //     }
    //
    //     const contentDescription = contentItem.querySelector(
    //         ".contentDescription"
    //     );
    //     contentDescription.innerHTML = item.content || "";
    //
    //     const contentLike = contentItem.querySelector(".contentLike");
    //     if (contentLike) {
    //         if (likedShopIds.includes(String(item.id))) {
    //             contentLike.classList.add("liked");
    //         } else {
    //             contentLike.classList.remove("liked");
    //         }
    //
    //         // 클릭 이벤트
    //         contentLike.onclick = function () {
    //             let liked = JSON.parse(
    //                 localStorage.getItem("likedShopIds") || "[]"
    //             );
    //             const itemId = String(item.id);
    //             if (liked.includes(itemId)) {
    //                 liked = liked.filter((id) => id !== itemId);
    //                 contentLike.classList.remove("liked");
    //             } else {
    //                 liked.push(itemId);
    //                 contentLike.classList.add("liked");
    //             }
    //             localStorage.setItem("likedShopIds", JSON.stringify(liked));
    //         };
    //     }
    //
    //     contentList.appendChild(contentItem);
    //
    //     gsap.fromTo(
    //         contentList.children,
    //         {opacity: 0, y: 30, scale: 0.96},
    //         {
    //             opacity: 1,
    //             y: 0,
    //             scale: 1,
    //             duration: 0.5,
    //             ease: "power2.out",
    //             stagger: 0.07,
    //         }
    //     );
    // });
    //
    // renderPaginationButtons(filteredList.length);
    //
    // updateClearAllBtnVisibility();
};

function getFilteredList(data) {
    return data.filter((item) => {
        if (
            filterState.region.length > 0 &&
            !filterState.region.includes(item.regionID)
        ) {
            return false;
        }
        if (
            filterState.kind.length > 0 &&
            !filterState.kind.includes(item.kindID)
        ) {
            return false;
        }
        if (
            filterState.thickness.length > 0 &&
            !filterState.thickness.includes(item.thicknessID)
        ) {
            return false;
        }
        if (
            filterState.shape.length > 0 &&
            !filterState.shape.includes(item.shapeID)
        ) {
            return false;
        }
        if (
            filterState.category.length > 0 &&
            (!Array.isArray(item.categoryID)
                ? !filterState.category.includes(item.categoryID)
                : !item.categoryID.some((id) =>
                    filterState.category.includes(id)
                ))
        ) {
            return false;
        }
        if (
            filterState.type.length > 0 &&
            (!Array.isArray(item.typeID)
                ? !filterState.type.includes(item.typeID)
                : !item.typeID.some((id) => filterState.type.includes(id)))
        ) {
            return false;
        }
        if (
            filterState.rich.length > 0 &&
            (!Array.isArray(item.richID)
                ? !filterState.rich.includes(item.richID)
                : !item.richID.some((id) => filterState.rich.includes(id)))
        ) {
            return false;
        }
        if (
            filterState.richness.length > 0 &&
            (!Array.isArray(item.richnessID)
                ? !filterState.richness.includes(item.richnessID)
                : !item.richnessID.some((id) =>
                    filterState.richness.includes(id)
                ))
        ) {
            return false;
        }
        if (
            filterState.style.length > 0 &&
            !filterState.style.includes(item.styleID)
        ) {
            return false;
        }
        return true;
    });
}
