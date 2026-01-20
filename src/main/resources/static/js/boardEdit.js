// boardEdit.js (첨부 삭제 + 신규 추가 + 본문 수정)

let serverMaxFileSize = 1 * 1024 * 1024;
let serverMaxRequestSize = 20 * 1024 * 1024;

let loginUserId = (typeof window !== "undefined" && window.loginUserId != null && window.loginUserId !== 0)
    ? window.loginUserId
    : null;

// 삭제 예정인 기존 파일 seq 목록
const deletedFileSeqs = new Set();

function getPostId() {
    return new URLSearchParams(window.location.search).get("id");
}

function bytesToMB(bytes) {
    return Math.floor(bytes / (1024 * 1024));
}

function renderExistingFiles(files) {
    const container = document.getElementById("existingFileList");
    const wrapper = document.getElementById("existingFileArea");
    if (!container || !wrapper) return;

    if (!Array.isArray(files) || files.length === 0) {
        wrapper.style.display = "none";
        container.innerHTML = "";
        return;
    }

    wrapper.style.display = "block";
    container.innerHTML = "";

    const postId = getPostId();

    files.forEach(f => {
        const seq = f?.fileSeq;
        if (!seq) return;

        const src = `/api/board/file/${encodeURIComponent(postId)}/${encodeURIComponent(seq)}`;

        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.flexDirection = "column";
        item.style.gap = "8px";

        const img = document.createElement("img");
        img.className = "gallery-item";
        img.src = src;
        img.alt = "기존 첨부 이미지";
        img.loading = "lazy";
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
            if (typeof openImageModal === "function") openImageModal(src);
        });

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-danger";
        btn.textContent = "삭제";
        btn.style.padding = "6px 10px";
        btn.style.borderRadius = "6px";
        btn.style.fontSize = "12px";
        btn.style.cursor = "pointer";

        btn.addEventListener("click", () => {
            deletedFileSeqs.add(Number(seq));
            item.style.opacity = "0.35";
            btn.disabled = true;
            btn.textContent = "삭제됨";
        });

        item.appendChild(img);
        item.appendChild(btn);
        container.appendChild(item);
    });
}

function renderNewFilePreviews(fileList) {
    const filePreviewArea = document.getElementById("filePreviewArea");
    const filePreviewList = document.getElementById("filePreviewList");
    if (!filePreviewArea || !filePreviewList) return;

    const list = Array.from(fileList || []);
    filePreviewList.innerHTML = "";

    if (list.length === 0) {
        filePreviewArea.style.display = "none";
        return;
    }

    filePreviewArea.style.display = "block";

    list.forEach((file) => {
        if (!file || !file.type || !file.type.startsWith("image/")) return;

        const img = document.createElement("img");
        img.className = "gallery-item";
        img.alt = file.name;
        img.loading = "lazy";

        const url = URL.createObjectURL(file);
        img.src = url;
        img.addEventListener("load", () => {
            try {
                URL.revokeObjectURL(url);
            } catch (_) {
            }
        });

        filePreviewList.appendChild(img);
    });
}

async function loadServerLimits() {
    try {
        const res = await fetch('/api/board/config');
        const config = await res.json();
        if (config?.maxFileSize) serverMaxFileSize = config.maxFileSize;
        if (config?.maxRequestSize) serverMaxRequestSize = config.maxRequestSize;
    } catch (e) {
        console.warn("파일 제한 설정 로드 실패(기본값 사용)", e);
    }
}

async function loadPostForEdit() {
    const postId = getPostId();
    if (!postId) return;

    const res = await fetch(`/api/board/detail/${postId}`);
    if (!res.ok) return;
    const post = await res.json();

    // ✅ 카테고리 값 설정 (select는 disabled, hidden에 값 저장)
    const categorySelect = document.getElementById("boardCategory");
    const categoryHidden = document.getElementById("boardCategoryHidden");
    
    if (categorySelect) categorySelect.value = post.category;
    if (categoryHidden) categoryHidden.value = post.category;

    document.getElementById("postTitle").value = post.title;
    document.getElementById("postContent").value = post.contents;

    renderExistingFiles(post.files || []);
}

async function submitUpdate() {
    const postId = getPostId();
    if (!postId) return;

    if (!loginUserId) {
        // boardWrite.js와 동일한 흐름 유지
        const sessionData = sessionStorage.getItem("cachedUser");
        if (sessionData) {
            try {
                loginUserId = JSON.parse(sessionData)?.userId ?? null;
            } catch (_) {
            }
        }
    }

    if (!loginUserId) {
        alert("로그인이 필요합니다.");
        location.href = "/login";
        return;
    }

    // ✅ 수정: disabled된 select 대신 hidden input 값 사용
    const category = document.getElementById('boardCategoryHidden').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title.trim()) {
        alert("제목을 입력해주세요.");
        return;
    }
    if (!content.trim()) {
        alert("내용을 입력해주세요.");
        return;
    }

    const fileInput = document.getElementById("fileInput");
    const newFiles = fileInput?.files ? Array.from(fileInput.files) : [];

    // 용량 체크 (신규 파일 기준)
    if (newFiles.length > 0) {
        let totalSize = 0;
        for (const f of newFiles) {
            totalSize += f.size;
            if (f.size > serverMaxFileSize) {
                alert(`첨부파일은 개당 ${bytesToMB(serverMaxFileSize)}MB를 초과할 수 없습니다.\n(${f.name})`);
                return;
            }
        }
        if (totalSize > serverMaxRequestSize) {
            alert(`첨부파일 총합은 ${bytesToMB(serverMaxRequestSize)}MB를 초과할 수 없습니다.`);
            return;
        }
    }

    const formData = new FormData();
    formData.append("id", postId);
    formData.append("category", category);
    formData.append("title", title);
    formData.append("contents", content);
    formData.append("userId", String(loginUserId));

    if (deletedFileSeqs.size > 0) {
        formData.append("deleteFileSeqs", Array.from(deletedFileSeqs).join(","));
    }

    newFiles.forEach(f => formData.append("files", f));

    const res = await fetch('/api/board/updateWithFiles', {
        method: 'POST',
        headers: (typeof buildAuthHeaders === 'function') ? buildAuthHeaders() : undefined,
        credentials: 'include',
        body: formData
    });

    if (res.status === 401 || res.status === 403) {
        alert("로그인이 필요합니다.");
        location.href = "/login";
        return;
    }

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert("수정 실패" + (txt ? (": " + txt) : ""));
        return;
    }

    alert("게시글이 수정되었습니다.");
    location.href = `/board/boardDetail?id=${encodeURIComponent(postId)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadServerLimits();
    await loadPostForEdit();

    const fileInputEl = document.getElementById("fileInput");
    const clearFilesBtn = document.getElementById("clearFilesBtn");
    const updateBtn = document.getElementById("updatePostBtn");

    // 신규 파일 미리보기 영역은 기본 숨김
    const filePreviewArea = document.getElementById("filePreviewArea");
    if (filePreviewArea) filePreviewArea.style.display = "none";

    if (fileInputEl) {
        fileInputEl.addEventListener("change", (e) => {
            renderNewFilePreviews(e.target.files);
        });
    }

    if (clearFilesBtn && fileInputEl) {
        clearFilesBtn.addEventListener("click", () => {
            fileInputEl.value = "";
            renderNewFilePreviews([]);
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await submitUpdate();
        });
    }
});
