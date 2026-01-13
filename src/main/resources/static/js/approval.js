function renderList(data) {
    const listContent = document.getElementById("listContent");
    let html = "";

    data.forEach((item, index) => {
        html += `
        <div class="list-item">
            <div class="col-id">${index + 1}</div>
            <div class="col-name"><a href="/approval/detail?id=${item.id}">${item.name}</a></div>
            <div class="col-writer">${item.writerName || '익명'}</div>
            <div class="col-date">${item.createDate.split('T')[0]}</div>
        </div>`;
    });
    listContent.innerHTML = html;
}

/** 목록 페이지 로직 (페이징 포함) */
async function loadApprovalList(page = 1) {
    const listContent = document.getElementById("listContent");
    if (!listContent) return;

    const size = 10;

    try {
        const res = await fetch(`/api/approval/list?page=${page}&size=${size}`);

        // 서버 응답 확인용 (500 에러 방지)
        if (!res.ok) {
            throw new Error(`서버 에러: ${res.status}`);
        }

        const data = await res.json();
        const items = data.items || [];

        listContent.innerHTML = items.map((item, index) => {
            const rowNo = (page - 1) * size + index + 1;
            return `
        <div class="list-item">
            <div class="col-id">${rowNo}</div>
            <div class="col-name">
                <img src="${item.mainImgUrl || '/images/no-image.png'}" class="list-thumb">
                <a href="/approval/detail?id=${item.id}">${item.name}</a>
            </div>
            <div class="col-writer">${item.writerName || '익명'}</div>
            <div class="col-date">${item.createDate ? item.createDate.split('T')[0] : '-'}</div>
        </div>
    `;
        }).join('');

        // 페이징 UI 렌더링
        renderPagination(data.page || page, data.totalPages || 1);

    } catch (error) {
        console.error("데이터 로드 실패:", error);
        listContent.innerHTML = '<div style="text-align:center; padding:20px;">데이터를 불러오는 중 오류가 발생했습니다.</div>';

        // 오류 시 페이징 숨김
        renderPagination(1, 1);
    }
}

async function loadApprovalDetail(id) {
    if (!id) return;

    try {
        const res = await fetch(`/api/approval/detail/${id}`);
        if (!res.ok) throw new Error("데이터를 가져올 수 없습니다.");

        const data = await res.json();

        // 1) 기본 텍스트 정보
        document.getElementById("shopName").innerText = data.name || "이름 없음";
        document.getElementById("shopAddress").innerText = data.address || "주소 정보가 없습니다.";
        document.getElementById("shopContent").innerText = data.content || "등록된 상세 내용이 없습니다.";
        document.getElementById("writerName").innerText = data.writerName || "익명";
        document.getElementById("createDate").innerText = data.createDate ? data.createDate.split("T")[0] : "-";

        // 2) 카테고리(태그)
        const tagSection = document.getElementById("detailTagsSection");
        tagSection.innerHTML = (data.categories && data.categories.length > 0)
            ? data.categories.map(cat => `<span class="tag-badge">${cat}</span>`).join("")
            : "";

        // 3) 이미지
        const shopImg = document.getElementById("shopImage");
        const thumbsWrap = document.getElementById("shopThumbs");

        const imgPrevBtn = document.getElementById("imgPrevBtn");
        const imgNextBtn = document.getElementById("imgNextBtn");
        const counterEl = document.getElementById("imgCounter");

        const thumbPrevBtn = document.getElementById("thumbPrevBtn");
        const thumbNextBtn = document.getElementById("thumbNextBtn");
        const dotsWrap = document.getElementById("thumbDots");

        const images = (Array.isArray(data.images) ? data.images : [])
            .filter(i => i && i.imgUrl)
            .sort((a, b) => (a.imgSeq || 0) - (b.imgSeq || 0));

        if (!shopImg || !thumbsWrap) return;

        if (images.length === 0) {
            shopImg.src = "/images/no_image.png";
            thumbsWrap.innerHTML = "";
            if (counterEl) counterEl.textContent = "";
            if (dotsWrap) {
                dotsWrap.innerHTML = "";
                dotsWrap.style.display = "none";
            }
            toggleNavButtons(false);
            return;
        }

        // 대표(mainImg=Y)가 있으면 그걸로 시작, 없으면 0
        let currentIndex = Math.max(0, images.findIndex(i => i.mainImg === "Y"));
        if (currentIndex < 0) currentIndex = 0;

        // 썸네일: PC 3 / 모바일 2
        let thumbsPerPage = window.matchMedia("(max-width: 640px)").matches ? 2 : 3;
        let thumbPage = Math.floor(currentIndex / thumbsPerPage);

        // 초기 렌더
        setMainByIndex(currentIndex);
        renderThumbPage();
        renderThumbDots();
        updateThumbNavAndDots();
        toggleNavButtons(images.length > 1);

        // 메인 좌/우
        if (imgPrevBtn) imgPrevBtn.addEventListener("click", () => moveMain(-1));
        if (imgNextBtn) imgNextBtn.addEventListener("click", () => moveMain(+1));

        // 썸네일 좌/우(묶음 이동)
        if (thumbPrevBtn) thumbPrevBtn.addEventListener("click", () => setThumbPage(thumbPage - 1));
        if (thumbNextBtn) thumbNextBtn.addEventListener("click", () => setThumbPage(thumbPage + 1));

        // 리사이즈 시 2/3 전환 처리
        window.addEventListener("resize", () => {
            const nextPerPage = window.matchMedia("(max-width: 640px)").matches ? 2 : 3;
            if (nextPerPage !== thumbsPerPage) thumbsPerPage = nextPerPage;
            thumbPage = Math.floor(currentIndex / thumbsPerPage);
            renderThumbPage();
            renderThumbDots();
            updateThumbNavAndDots();
        });

        function setMainByIndex(idx) {
            if (!images[idx]) return;
            currentIndex = idx;

            const img = images[currentIndex];
            shopImg.src = img.imgUrl;
            shopImg.title = `순번: ${img.imgSeq}`;

            if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${images.length}`;

            if (imgPrevBtn) imgPrevBtn.disabled = (currentIndex === 0);
            if (imgNextBtn) imgNextBtn.disabled = (currentIndex === images.length - 1);

            // 메인 바뀌면 해당 썸네일 페이지로 점프
            const nextPage = Math.floor(currentIndex / thumbsPerPage);
            if (nextPage !== thumbPage) {
                thumbPage = nextPage;
                renderThumbPage();
                renderThumbDots();
            } else {
                // 같은 페이지면 active만 갱신
                updateThumbActive();
            }
            updateThumbNavAndDots();
        }

        function moveMain(delta) {
            const next = currentIndex + delta;
            if (next < 0 || next >= images.length) return;
            setMainByIndex(next);
        }

        function getTotalPages() {
            return Math.max(1, Math.ceil(images.length / thumbsPerPage));
        }

        function setThumbPage(p) {
            const pages = getTotalPages();
            thumbPage = clamp(p, 0, pages - 1);
            renderThumbPage();
            updateThumbNavAndDots();
        }

        function renderThumbPage() {
            thumbsWrap.innerHTML = "";

            const start = thumbPage * thumbsPerPage;
            const end = Math.min(images.length, start + thumbsPerPage);

            for (let idx = start; idx < end; idx++) {
                const img = images[idx];
                const el = document.createElement("img");
                el.className = "thumb" + (idx === currentIndex ? " active" : "");
                el.src = img.imgUrl;
                el.alt = `이미지 ${idx + 1}`;
                el.dataset.idx = String(idx);

                el.addEventListener("error", () => {
                    el.src = "/images/no_image.png";
                    el.classList.add("broken");
                }, {once: true});

                el.addEventListener("click", () => setMainByIndex(idx));
                thumbsWrap.appendChild(el);
            }
        }

        function updateThumbActive() {
            thumbsWrap.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
            const active = thumbsWrap.querySelector(`.thumb[data-idx='${currentIndex}']`);
            if (active) active.classList.add("active");
        }

        function renderThumbDots() {
            if (!dotsWrap) return;

            const pages = getTotalPages();
            dotsWrap.innerHTML = "";

            if (pages <= 1) {
                dotsWrap.style.display = "none";
                return;
            }

            dotsWrap.style.display = "flex";
            for (let p = 0; p < pages; p++) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "dot" + (p === thumbPage ? " active" : "");
                b.addEventListener("click", () => setThumbPage(p));
                dotsWrap.appendChild(b);
            }
        }

        function updateThumbNavAndDots() {
            const pages = getTotalPages();
            if (thumbPrevBtn) thumbPrevBtn.disabled = (pages <= 1 || thumbPage <= 0);
            if (thumbNextBtn) thumbNextBtn.disabled = (pages <= 1 || thumbPage >= pages - 1);

            if (dotsWrap) {
                dotsWrap.querySelectorAll(".dot").forEach((d, idx) => {
                    d.classList.toggle("active", idx === thumbPage);
                });
            }
        }

        function toggleNavButtons(enabled) {
            if (imgPrevBtn) imgPrevBtn.style.display = enabled ? "" : "none";
            if (imgNextBtn) imgNextBtn.style.display = enabled ? "" : "none";
            if (thumbPrevBtn) thumbPrevBtn.style.display = enabled ? "" : "none";
            if (thumbNextBtn) thumbNextBtn.style.display = enabled ? "" : "none";
            if (counterEl) counterEl.style.display = enabled ? "" : "none";
            if (dotsWrap) dotsWrap.style.display = enabled ? "flex" : "none";
        }

        function clamp(v, min, max) {
            return Math.max(min, Math.min(max, v));
        }

    } catch (error) {
        console.error("상세 정보 로드 실패:", error);
    }
}

/** 페이징 UI 렌더링 */
function renderPagination(currentPage, totalPages) {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    // 1페이지면 숨김
    if (!totalPages || totalPages <= 1) {
        paginationEl.innerHTML = "";
        return;
    }

    const windowSize = 5; // 보여줄 페이지 숫자 개수
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const prevDisabled = currentPage <= 1 ? "disabled" : "";
    const nextDisabled = currentPage >= totalPages ? "disabled" : "";

    let html = `
        <button type="button" class="page-btn" ${prevDisabled} onclick="loadApprovalList(${currentPage - 1})">&lt;</button>
    `;

    for (let p = start; p <= end; p++) {
        const active = p === currentPage ? "active" : "";
        html += `<button type="button" class="page-btn ${active}" onclick="loadApprovalList(${p})">${p}</button>`;
    }

    html += `
        <button type="button" class="page-btn" ${nextDisabled} onclick="loadApprovalList(${currentPage + 1})">&gt;</button>
    `;

    paginationEl.innerHTML = html;
}

/** 페이지 로드 시 경로에 따라 실행 */
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const path = window.location.pathname;

    // 상세 페이지: /approval/detail
    if (path.includes("/approval/detail") && id) {
        loadApprovalDetail(id);

        // ✅ 수정 버튼 이동
        const editBtn = document.getElementById("editBtn");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                window.location.href = `/approval/edit?id=${encodeURIComponent(id)}`;
            });
        }

        // ✅ 삭제 버튼: 확인 → DELETE 호출 → 목록으로 이동
        const deleteBtn = document.getElementById("deleteBtn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                const ok = confirm("정말 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.");
                if (!ok) return;

                try {
                    const res = await fetch(`/api/approval/delete/${encodeURIComponent(id)}`, {
                        method: "DELETE",
                        headers: buildAuthHeaders(),
                    });

                    if (res.status === 401 || res.status === 403) {
                        throw new Error("권한이 없습니다. 로그인 후 본인 글만 삭제할 수 있습니다.");
                    }

                    if (!res.ok) throw new Error(`삭제 실패: ${res.status}`);

                    alert("삭제되었습니다.");
                    window.location.href = "/approval";
                } catch (e) {
                    console.error(e);
                    alert(e?.message || "삭제 중 오류가 발생했습니다.");
                }
            });
        }

        return;
    }

    // 목록 페이지: /approval
    if (path === "/approval" || path.startsWith("/approval/")) {
        loadApprovalList(1);
    }
});

// JWT 토큰 헤더(있으면 붙임)
function buildAuthHeaders() {
    const headers = {};
    const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("ACCESS_TOKEN") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return headers;
}
