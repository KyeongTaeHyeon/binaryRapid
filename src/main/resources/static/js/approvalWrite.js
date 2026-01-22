// approvalWrite.js - 승인 신청(식당 신청) 글쓰기 폼 스크립트

// 로그 출력 위치 안내:
// - console.log/console.error: "브라우저 개발자도구(F12) > Console" 에 출력됩니다.
// - 서버 로그(log4j2/slf4j): IntelliJ Run/Debug 콘솔(또는 bootRun 터미널) 에 출력됩니다.

/**
 * 카테고리 로딩
 * - /api/category/map 응답을 config(groupId) 기준으로 각 select(category1~8)에 채움
 * - 중복 DOMContentLoaded/중복 fetch 제거
 * - option 중복/누적 방지(항상 초기화 후 채움)
 */
async function loadCategoryOptions() {
    // HTML ID와 서버 groupId 매핑 (현재 네가 쓰던 매핑 유지)
    const config = {
        category1: "region",
        category2: "category",
        category3: "shape",
        category4: "thickness",
        category5: "style",
        category6: "kind",
        category7: "rich",
        category8: "richness",
    };

    try {
        const response = await fetch("/api/category/map", {
            method: "GET",
            headers: buildAuthHeaders(),
        });
        if (!response.ok) throw new Error(`카테고리 API 실패: ${response.status}`);
        const categoryMap = await response.json();

        Object.entries(config).forEach(([selectId, groupId]) => {
            const selectEl = document.getElementById(selectId);
            if (!selectEl) return;

            // 항상 초기화(중복 append 방지)
            const ph = selectEl.getAttribute("data-placeholder") || "선택안함";
            selectEl.innerHTML = `<option value="">${ph}</option>`;

            const items = categoryMap?.[groupId];
            if (!items || !Array.isArray(items)) return;

            // items 형태가 [{id,name}] 이거나 ["라멘", "초밥"] 같은 문자열 배열일 수도 있으니 둘 다 처리
            items.forEach((item) => {
                const option = document.createElement("option");
                if (typeof item === "string") {
                    option.value = item;
                    option.textContent = item;
                } else {
                    option.value = item.id ?? item.value ?? "";
                    option.textContent = item.name ?? item.label ?? String(option.value);
                }
                if (option.value !== "") selectEl.appendChild(option);
            });
        });
    } catch (error) {
        console.error("카테고리 로드 실패:", error);
    }
}

/**
 * JWT 토큰 헤더(있으면 붙임)
 * - 프로젝트마다 키가 다를 수 있어서, 흔히 쓰는 키들을 순서대로 시도
 * - 쿠키 기반이면 여기서 헤더를 안 붙여도 될 수 있음(서버 설정에 따라)
 */
function buildAuthHeaders() {
    const headers = {};

    // localStorage에 토큰이 저장되는 케이스 대응
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

/**
 * 신청 제출
 * - FormData로 전송(multipart)
 * - category1~8은 그대로 두고, 추가로 categories[]도 같이 보냄(서버에서 둘 중 편한 걸 사용)
 */
async function submitApproval() {
    const form = document.getElementById("approvalWriteForm");
    if (!form) throw new Error("approvalWriteForm을 찾을 수 없습니다.");

    const editId = getQueryParam("id");
    const isEdit = !!editId;

    const fd = new FormData(form);

    // [브라우저 Console] 제출 시점 상태 확인
    const fileInput = document.getElementById("images");

    // categories[] 추가
    for (let i = 1; i <= 8; i++) {
        const v = document.getElementById(`category${i}`)?.value;
        if (v) fd.append("categories", v);
    }

    // 삭제 체크된 기존 이미지 seq들
    const deleted = Array.from(document.querySelectorAll('input[name="deletedImgSeq"]:checked'))
        .map(el => el.value)
        .filter(v => v !== "");
    deleted.forEach(v => fd.append("deletedImgSeq", v));

    // 대표 이미지 선택(기존 이미지 중 하나 선택)
    const main = document.querySelector('input[name="mainImgSeq"]:checked')?.value;
    if (main) fd.append("mainImgSeq", main);

    // [브라우저 Console] FormData 키/값 확인(파일은 이름/사이즈만 출력)
    try {
        const entries = [];
        for (const [k, v] of fd.entries()) {
            if (v instanceof File) entries.push([k, `File(name=${v.name}, size=${v.size})`]);
            else entries.push([k, v]);
        }
    } catch (e) {
        console.error("[approvalWrite] FormData dump failed", e);
    }

    const url = isEdit ? `/api/approval/${encodeURIComponent(editId)}` : "/api/approval";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
        method,
        headers: buildAuthHeaders(),
        body: fd,
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
    }
    if (!res.ok) {
        let msg = "";
        try {
            msg = await res.text();
        } catch (_) {
        }
        throw new Error(`${isEdit ? "수정" : "신청"} 실패: ${res.status}${msg ? ` - ${msg}` : ""}`);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const editId = getQueryParam("id");
    const isEdit = !!editId;

    // 카테고리 로딩(먼저 옵션 채워야 선택값 세팅 가능)
    await loadCategoryOptions();

    // 새 이미지 선택 시 미리보기 렌더링
    wireNewImagePreview();

    if (isEdit) {
        // 버튼 글자 변경(approvalWrite.html에서 submitBtn id 추가 필요)
        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) submitBtn.textContent = "수정";

        // ✅ 상세 조회해서 폼에 세팅
        const res = await fetch(`/api/approval/detail/${encodeURIComponent(editId)}`, {
            method: "GET",
            headers: buildAuthHeaders(),
        });

        if (!res.ok) {
            alert("수정 데이터를 불러오지 못했습니다.");
            return;
        }

        const data = await res.json();

        // 기존 이미지 렌더링(대표 선택 + 삭제 체크)
        renderExistingImages(data?.images);

        // 기본값 세팅
        document.getElementById("name").value = data?.name ?? "";
        document.getElementById("address").value = data?.address ?? "";
        document.getElementById("content").value = data?.content ?? "";

        // 카테고리: API는 name 배열(예: '츄카소바')로 내려오므로 option text로 매칭
        const cats = Array.isArray(data?.categories) ? data.categories : [];
        for (let i = 1; i <= 8; i++) {
            const sel = document.getElementById(`category${i}`);
            const target = cats[i - 1];
            if (sel && target) setSelectValueByOptionTextOrValue(sel, target);
        }
    }

    // 제출 이벤트
    const form = document.getElementById("approvalWriteForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            await submitApproval();
            alert(isEdit ? "수정이 완료되었습니다." : "신청이 완료되었습니다.");
            window.location.href = "/approval";
        } catch (err) {
            console.error(err);
            alert(err?.message || (isEdit ? "수정 중 오류가 발생했습니다." : "신청 중 오류가 발생했습니다."));
        }
    });
});

function getQueryParam(key) {
    return new URL(window.location.href).searchParams.get(key);
}

function setSelectValueByOptionTextOrValue(selectEl, target) {
    if (!selectEl || !target) return;
    const opts = Array.from(selectEl.options);
    const found = opts.find(o => o.value === target || o.textContent === target);
    if (found) selectEl.value = found.value;
}

function renderExistingImages(images) {
    const wrap = document.getElementById("existingImages");
    if (!wrap) return;

    wrap.innerHTML = "";

    const list = Array.isArray(images) ? images : [];
    if (list.length === 0) {
        wrap.innerHTML = '<div class="hint">저장된 이미지가 없습니다.</div>';
        return;
    }

    const grid = document.createElement("div");
    grid.className = "existing-grid";

    list.forEach((img) => {
        const seq = img?.imgSeq;
        const url = img?.imgUrl;
        const isMain = (img?.mainImg === "Y");
        if (!seq || !url) return;

        const card = document.createElement("div");
        card.className = "existing-card";

        card.innerHTML = `
            <div class="existing-thumb">
                <img src="${url}" alt="기존 이미지 ${seq}" />
            </div>
            <div class="existing-actions">
                <label class="existing-radio">
                    <input type="radio" name="mainImgSeq" value="${seq}" ${isMain ? "checked" : ""} />
                    대표
                </label>
                <label class="existing-check">
                    <input type="checkbox" name="deletedImgSeq" value="${seq}" />
                    삭제
                </label>
                <div class="existing-meta">SEQ: ${seq}${isMain ? " · 현재 대표" : ""}</div>
            </div>
        `;

        // 대표로 선택된 이미지가 삭제 체크되면 대표 해제(충돌 방지)
        const del = card.querySelector('input[name="deletedImgSeq"]');
        const radio = card.querySelector('input[name="mainImgSeq"]');
        del?.addEventListener("change", () => {
            if (del.checked && radio?.checked) {
                radio.checked = false;
            }
            if (del.checked) {
                card.classList.add("marked-delete");
            } else {
                card.classList.remove("marked-delete");
            }
        });

        // 대표 선택 시 삭제 체크 해제(충돌 방지)
        radio?.addEventListener("change", () => {
            if (radio.checked && del?.checked) {
                del.checked = false;
                card.classList.remove("marked-delete");
            }
        });

        grid.appendChild(card);
    });

    wrap.appendChild(grid);
}

// ===== New images preview (create/edit) =====
let _newImagesDT = new DataTransfer();

function wireNewImagePreview() {
    const input = document.getElementById("images");
    if (!input) return;

    // 기존 선택 초기화
    _newImagesDT = new DataTransfer();
    input.addEventListener("change", () => {
        _newImagesDT = new DataTransfer();
        const files = Array.from(input.files || []);
        files.forEach(f => _newImagesDT.items.add(f));
        input.files = _newImagesDT.files;
        renderNewImagesPreview();
    });

    renderNewImagesPreview();
}

function renderNewImagesPreview() {
    const wrap = document.getElementById("newImagesPreview");
    if (!wrap) return;

    wrap.innerHTML = "";

    const files = Array.from(_newImagesDT.files || []);
    if (files.length === 0) {
        wrap.innerHTML = '<div class="hint">선택된 새 이미지가 없습니다.</div>';
        return;
    }

    const grid = document.createElement("div");
    grid.className = "new-grid";

    files.forEach((file, idx) => {
        const card = document.createElement("div");
        card.className = "new-card";

        const url = URL.createObjectURL(file);
        const sizeKB = Math.round((file.size || 0) / 1024);

        card.innerHTML = `
            <div class="new-thumb"><img src="${url}" alt="새 이미지 ${idx + 1}" /></div>
            <div class="new-actions">
                <div class="new-title">${escapeHtml(file.name)}</div>
                <div class="new-meta">${sizeKB} KB</div>
                <div class="new-buttons">
                    <button type="button" class="btn-mini" data-act="up" data-idx="${idx}">▲</button>
                    <button type="button" class="btn-mini" data-act="down" data-idx="${idx}">▼</button>
                    <button type="button" class="btn-mini danger" data-act="remove" data-idx="${idx}">삭제</button>
                </div>
            </div>
        `;

        // 버튼 이벤트(순서/삭제)
        card.querySelectorAll("button[data-act]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const act = btn.getAttribute("data-act");
                const i = parseInt(btn.getAttribute("data-idx"), 10);
                if (Number.isNaN(i)) return;
                if (act === "remove") removeNewImageAt(i);
                if (act === "up") moveNewImage(i, -1);
                if (act === "down") moveNewImage(i, +1);
            });
        });

        // ObjectURL 정리
        card.addEventListener("remove", () => URL.revokeObjectURL(url));

        grid.appendChild(card);
    });

    wrap.appendChild(grid);
}

function removeNewImageAt(index) {
    const files = Array.from(_newImagesDT.files || []);
    if (index < 0 || index >= files.length) return;
    files.splice(index, 1);
    _newImagesDT = new DataTransfer();
    files.forEach(f => _newImagesDT.items.add(f));
    const input = document.getElementById("images");
    if (input) input.files = _newImagesDT.files;
    renderNewImagesPreview();
}

function moveNewImage(index, delta) {
    const files = Array.from(_newImagesDT.files || []);
    const to = index + delta;
    if (index < 0 || index >= files.length) return;
    if (to < 0 || to >= files.length) return;
    const tmp = files[index];
    files[index] = files[to];
    files[to] = tmp;
    _newImagesDT = new DataTransfer();
    files.forEach(f => _newImagesDT.items.add(f));
    const input = document.getElementById("images");
    if (input) input.files = _newImagesDT.files;
    renderNewImagesPreview();
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
