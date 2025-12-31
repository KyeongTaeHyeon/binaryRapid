// boardList.js

// 전역 변수 (필요에 따라 설정)
const ITEMS_PER_PAGE = 5; // 한 페이지당 표시할 게시글 수

document.addEventListener("DOMContentLoaded", function () {
    const currentPageFileName = window.location.pathname.split("/").pop();

    // 전역적으로 사용할 변수들
    let filterLinks; // 전체, 자유게시판, 식당인증, 식당신청 필터 링크들
    let postListContainer; // 게시글 리스트를 표시할 #postNumber
    let writingButton; // '글쓰기' 버튼

    // boardList2.html (상세/작성 페이지) 관련 요소들
    let detailViewTitleH1;
    let detailContentView;
    let detailButtons; // 목록, 수정, 삭제 버튼을 담는 컨테이너
    let detailCommentSection;
    let detailCommentList;

    let allPostsData = []; // 모든 게시글 데이터를 저장할 배열
    let currentCategory = "전체"; // 현재 선택된 카테고리 (초기값 '전체')
    let currentPage = 1; // 현재 활성화된 페이지 번호 (초기값 1)

    // --- JSON 데이터 로드 함수 ---
    async function loadBoardData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("게시글 데이터를 로드하는 데 실패했습니다:", error);
            return []; // 에러 발생 시 빈 배열 반환
        }
    }

    // --- 페이지별 초기화 및 요소 참조 ---
    if (
        currentPageFileName.includes("boardList") ||
        currentPageFileName === ""
    ) {
        // boardList.html (게시판 목록)
        filterLinks = document.querySelectorAll(".filter a");
        postListContainer = document.getElementById("postNumber"); // 게시글 리스트를 표시할 곳
        writingButton = document.querySelector("#contentNav .writing"); // '글쓰기' 버튼 (<a> 태그)

        // JSON 데이터 로드 후 초기화 진행
        loadBoardData("/data/board.json").then((data) => {
            allPostsData = data; // 로드된 데이터를 전역 변수에 저장

            // '글쓰기' 버튼 이벤트 리스너 추가
            if (writingButton) {
                console.log("DEBUG: '글쓰기' 버튼(a.writing)을 찾았습니다.");
                writingButton.addEventListener("click", function (event) {
                    event.preventDefault(); // <a> 태그의 기본 이동 동작 방지
                    window.location.href = "boardList2.html?mode=write"; // 새 글 작성 모드로 이동
                });
            } else {
                console.warn(
                    "WARNING: '글쓰기' 버튼(#contentNav .writing)을 찾을 수 없습니다. HTML을 확인하세요."
                );
            }

            // 초기 로드 시 '전체' 게시글을 표시하고 페이지네이션 업데이트
            const initialActiveLinkSpan = document.querySelector(
                ".filter a.active span"
            );
            if (initialActiveLinkSpan) {
                currentCategory = initialActiveLinkSpan.textContent.trim();
            } else {
                currentCategory = "전체"; // 기본값
            }
            updatePostListAndPagination(); // 첫 로드 시 게시글 및 페이지네이션 업데이트

            // 공통 필터 링크 이벤트 리스너 설정
            setupFilterEvents();
        });
    } else if (currentPageFileName === "boardList2.html") {
        // boardList2.html (게시글 상세 보기 또는 작성 페이지)
        detailViewTitleH1 = document.querySelector(
            "#boardcreat .creatPost .title h1"
        );
        detailContentView = document.querySelector(
            "#boardcreat .contentPost input, #boardcreat .contentPost textarea"
        );
        detailButtons = document.querySelector("#boardcreat #bTn"); // 버튼 컨테이너

        // '목록' 버튼 찾기 (detailButtons 내의 첫 번째 버튼)
        const listButton = detailButtons
            ? detailButtons.querySelector("button:nth-child(1)")
            : null;

        // '목록' 버튼 이벤트 리스너 추가
        if (listButton) {
            console.log("DEBUG: '목록' 버튼을 찾았습니다.");
            listButton.addEventListener("click", function () {
                window.location.href = "boardList.html"; // 게시판 목록으로 돌아가기
            });
        } else {
            console.warn(
                "WARNING: '목록' 버튼 (#boardcreat #bTn 내의 첫 번째 button)을 찾을 수 없습니다. HTML을 확인하세요."
            );
        }

        // 수정 및 삭제 버튼 찾기 (있다면 여기에 이벤트 리스너 추가)
        const editButton = detailButtons
            ? detailButtons.querySelector("button:nth-child(2)")
            : null;
        const deleteButton = detailButtons
            ? detailButtons.querySelector("button:nth-child(3)")
            : null;

        // 댓글 섹션 관련 요소
        detailCommentSection = document.querySelector("#boardcreat .comment");
        detailCommentList = document.querySelector("#boardcreat .commentList");

        // URL 파라미터를 확인하여 모드 결정
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        const postId = urlParams.get("post_id");
        const postType = urlParams.get("post_type");

        if (mode === "write") {
            // 새 글 작성 모드
            if (detailViewTitleH1) detailViewTitleH1.textContent = "새 글 작성";
            if (detailContentView)
                detailContentView.placeholder =
                    "새 글 내용을 입력해주세요.....";

            // 작성 모드에서는 수정/삭제 버튼 및 댓글 섹션 숨김
            if (editButton) editButton.style.display = "none";
            if (deleteButton) deleteButton.style.display = "none";
            if (detailCommentSection)
                detailCommentSection.style.display = "none";
            if (detailCommentList) detailCommentList.style.display = "none";
        } else if (postId && postType) {
            // 게시글 상세 보기 모드 - JSON에서 해당 게시글 로드
            loadBoardData("/data/board.json").then((data) => {
                const post = data.find(
                    (p) => p.id === postId && p.type === postType
                );
                if (post) {
                    console.log(
                        `DEBUG: 게시글 (ID: ${postId}, Type: ${postType})을 찾았습니다.`
                    );
                    if (detailViewTitleH1)
                        detailViewTitleH1.textContent = post.title;
                    if (detailContentView)
                        detailContentView.value = post.contents;

                    // 상세 보기 모드에서는 수정/삭제 버튼 및 댓글 섹션 표시
                    if (editButton) editButton.style.display = ""; // 기본값으로 되돌려 표시
                    if (deleteButton) deleteButton.style.display = "";
                    if (detailCommentSection)
                        detailCommentSection.style.display = "";
                    if (detailCommentList) {
                        detailCommentList.style.display = "";
                        // 댓글 데이터가 있다면 렌더링
                        renderComments(post.comments); // 댓글 렌더링 함수 호출
                    }
                } else {
                    console.warn(
                        `WARNING: 게시글 (ID: ${postId}, Type: ${postType})을 찾을 수 없습니다. 목록으로 돌아갑니다.`
                    );
                    window.location.href = "boardList.html";
                }
            });
        } else {
            console.warn(
                "WARNING: boardList2.html에 모드, 게시글 ID, 또는 게시글 타입이 지정되지 않았습니다. 목록으로 돌아갑니다."
            );
            window.location.href = "boardList.html";
        }
    } else if (currentPageFileName === "boardList3.html") {
        // boardList3.html (식당 신청 페이지)
        filterLinks = document.querySelectorAll(".filter a");
        if (filterLinks) {
            filterLinks.forEach((link) => {
                if (
                    link.querySelector("span").textContent.trim() === "식당신청"
                ) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }
        setupFilterEvents();
    }

    // --- 공통 필터 링크 이벤트 리스너 함수 ---
    function setupFilterEvents() {
        if (filterLinks) {
            filterLinks.forEach((link) => {
                link.addEventListener("click", function (event) {
                    event.preventDefault(); // <a> 태그의 기본 이동 동작 방지

                    const linkText =
                        this.querySelector("span").textContent.trim();
                    console.log(`DEBUG: 필터 링크 클릭: ${linkText}`);

                    // HTML에 data-filter 속성이 없기 때문에 텍스트로 필터 타입을 결정합니다.
                    let filterType;
                    switch (linkText) {
                        case "전체":
                            filterType = "all";
                            break;
                        case "자유게시판":
                            filterType = "A00";
                            break;
                        case "식당인증":
                            filterType = "B00";
                            break;
                        case "식당신청":
                            filterType = "C00";
                            break;
                        default:
                            filterType = "all"; // 기본값
                    }

                    if (
                        currentPageFileName === "boardList.html" ||
                        currentPageFileName === ""
                    ) {
                        if (linkText === "식당신청") {
                            window.location.href = "boardList3.html"; // '식당신청' 필터 클릭 시 boardList3.html로 이동
                        } else {
                            filterLinks.forEach((item) =>
                                item.classList.remove("active")
                            );
                            this.classList.add("active");
                            currentCategory = linkText; // 현재 카테고리 업데이트
                            currentPage = 1; // 카테고리 변경 시 첫 페이지로 리셋
                            updatePostListAndPagination(); // 게시글 및 페이지네이션 업데이트
                        }
                    } else if (currentPageFileName === "boardList3.html") {
                        // boardList3.html에서 필터 클릭 시 boardList.html로 이동하여 해당 목록 표시
                        if (
                            linkText === "전체" ||
                            linkText === "자유게시판" ||
                            linkText === "식당인증"
                        ) {
                            window.location.href = "boardList.html";
                        } else if (linkText === "식당신청") {
                            // 현재 식당신청 페이지이므로 새로고침 또는 아무 동작 안함
                            window.location.href = "boardList3.html";
                        }
                    }
                });
            });
        }
    }

    /**
     * 게시글 목록을 업데이트하고 페이지네이션 버튼을 렌더링하는 통합 함수
     */
    function updatePostListAndPagination() {
        if (!postListContainer) return;
        postListContainer.innerHTML = ""; // 기존 게시글 모두 비우기

        let filteredPosts = [];

        // 현재 카테고리에 따라 게시글 필터링
        if (currentCategory === "전체") {
            filteredPosts = allPostsData;
        } else if (currentCategory === "자유게시판") {
            filteredPosts = allPostsData.filter((post) =>
                post.type.startsWith("A00")
            );
        } else if (currentCategory === "식당인증") {
            filteredPosts = allPostsData.filter((post) =>
                post.type.startsWith("B00")
            );
        } else if (currentCategory === "식당신청") {
            filteredPosts = allPostsData.filter((post) =>
                post.type.startsWith("C00")
            );
        }

        // ⭐ 참고: 이 부분에 특정 정렬 로직이 필요하다면 추가할 수 있습니다. ⭐
        // 예: 필터링된 게시글을 최신 순(creatAt 내림차순)으로 정렬 (기본 정렬)
        filteredPosts.sort(
            (a, b) =>
                new Date(b.creatAt).getTime() - new Date(a.creatAt).getTime()
        );

        // 페이지네이션 로직에 따라 현재 페이지에 보여줄 게시글만 선택
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        // 게시글 데이터를 기반으로 HTML 요소 생성 및 추가
        if (postsToShow.length === 0) {
            // 표시할 게시글이 없는 경우 메시지
            const noPostMessage = document.createElement("p");
            noPostMessage.textContent = "표시할 게시글이 없습니다.";
            noPostMessage.style.textAlign = "center";
            noPostMessage.style.padding = "20px";
            postListContainer.appendChild(noPostMessage);
        } else {
            // ⭐ 이 부분이 게시글을 렌더링하는 유일한 forEach 루프입니다. ⭐
            postsToShow.forEach((post, index) => {
                const article = document.createElement("article");
                article.classList.add("post");
                article.setAttribute("data-post-id", post.id);
                article.setAttribute("data-post-type", post.type);

                let tagText = "알 수 없음";
                let tagClass = "tage";

                if (post.type.startsWith("A00")) {
                    tagText = "자유게시판";
                    tagClass = "tageone";
                } else if (post.type.startsWith("B00")) {
                    tagText = "식당인증";
                    tagClass = "tage";
                } else if (post.type.startsWith("C00")) {
                    tagText = "식당신청";
                    tagClass = "tage";
                }

                // 현재 페이지에서의 게시글 번호 (1부터 시작)
                const currentPostDisplayId = startIndex + index + 1;

                // --- ⭐ 이 부분이 user 필드를 가장 마지막에 렌더링하도록 수정되었습니다 ⭐ ---
                article.innerHTML = `
                    <div class="name">
                        <a href="#">
                            <span class="post-id">${currentPostDisplayId}.</span>
                            <span class="${tagClass}">${tagText}</span>
                            ${post.title}
                        </a>
                    </div>
                    <div class="userTime"></div>
                    <div class="user">${post.user}</div> `;
                postListContainer.appendChild(article);

                // 생성된 게시글(article) 클릭 시 boardList2.html (상세 보기 모드)로 이동
                article.addEventListener("click", function (event) {
                    event.preventDefault(); // <a> 태그의 기본 이동 동작 방지
                    const clickedPostId = this.getAttribute("data-post-id");
                    const clickedPostType = this.getAttribute("data-post-type");
                    console.log(
                        `DEBUG: 게시글 클릭 - ID: ${clickedPostId}, Type: ${clickedPostType}`
                    );
                    window.location.href = `boardList2.html?post_id=${clickedPostId}&post_type=${clickedPostType}`;
                });
            });
        }

        // 필터링된 게시글의 총 개수를 기준으로 페이지네이션 버튼 렌더링
        renderPaginationButtons(filteredPosts.length);
    }

    /**
     * 페이지네이션 숫자 버튼을 렌더링하고 이벤트 리스너를 설정하는 함수
     * @param {number} totalItems - 현재 카테고리의 전체 게시글 수
     */
    function renderPaginationButtons(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE); // 전체 페이지 수 계산
        // ⭐ 변경: ".page-number" 대신 HTML에 있는 ".page-list"를 참조하도록 수정 ⭐
        const paginationList = document.querySelector(".page-list");
        if (!paginationList) {
            console.warn(
                "WARNING: 페이지네이션 목록(.page-list)을 찾을 수 없습니다. HTML을 확인하세요."
            );
            return;
        }
        paginationList.innerHTML = ""; // 기존 페이지 버튼 초기화

        // '이전' 버튼 (prevButton) 로직
        const prevButton = document.querySelector(".page-btn.prev");
        if (prevButton) {
            prevButton.onclick = () => {
                if (currentPage > 1) {
                    currentPage--; // 페이지 감소
                    updatePostListAndPagination(); // 게시글 및 페이지네이션 다시 렌더링
                }
            };
            prevButton.disabled = currentPage === 1; // 첫 페이지면 비활성화
            prevButton.style.opacity = currentPage === 1 ? "0.5" : "1"; // CSS 비활성화 효과
            prevButton.style.pointerEvents =
                currentPage === 1 ? "none" : "auto"; // 클릭 이벤트 비활성화
        }

        // --- 페이지 번호 생성 및 생략 기호(…) 로직 ---
        const maxPageButtons = 10; // 화면에 표시할 최대 페이지 버튼 수
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPageButtons / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // 만약 끝 페이지가 totalPages에 도달하여 10개를 채우지 못하는 경우,
        // 시작 페이지를 조정하여 뒤에서부터 10개의 페이지가 보이도록 함
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        // 첫 페이지로 가는 생략 기호 (...) 표시 로직
        if (startPage > 1) {
            // 첫 페이지 버튼 추가
            const firstPageItem = document.createElement("li");
            firstPageItem.classList.add("page-item");
            const firstPageButton = document.createElement("button");
            firstPageButton.textContent = 1;
            firstPageButton.onclick = () => {
                currentPage = 1;
                updatePostListAndPagination();
            };
            firstPageItem.appendChild(firstPageButton);
            paginationList.appendChild(firstPageItem);

            if (startPage > 2) {
                // 1페이지 다음 바로 startPage가 아니면 ... 추가
                const ellipsisItem = document.createElement("li");
                ellipsisItem.classList.add("page-item", "ellipsis");
                ellipsisItem.innerHTML = `<span>...</span>`;
                paginationList.appendChild(ellipsisItem);
            }
        }

        // 계산된 범위 내의 페이지 번호 버튼 생성
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("page-item");
            if (i === currentPage) {
                pageItem.classList.add("active"); // 현재 페이지 활성화
            }

            const pageButton = document.createElement("button");
            pageButton.textContent = i; // 버튼 텍스트는 페이지 번호
            pageButton.onclick = () => {
                currentPage = i; // 클릭된 페이지로 현재 페이지 설정
                updatePostListAndPagination(); // 게시글 및 페이지네이션 다시 렌더링
            };
            pageItem.appendChild(pageButton);
            paginationList.appendChild(pageItem);
        }

        // 마지막 페이지로 가는 생략 기호 (...) 및 마지막 페이지 번호 표시 로직
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                // 마지막 페이지 바로 전이 아니면 ... 추가
                const ellipsisItem = document.createElement("li");
                ellipsisItem.classList.add("page-item", "ellipsis");
                ellipsisItem.innerHTML = `<span>...</span>`;
                paginationList.appendChild(ellipsisItem);
            }

            // 마지막 페이지 번호 버튼 추가
            const lastPageItem = document.createElement("li");
            lastPageItem.classList.add("page-item");
            if (totalPages === currentPage) {
                lastPageItem.classList.add("active"); // 마지막 페이지가 현재 페이지면 활성화
            }
            const lastPageButton = document.createElement("button");
            lastPageButton.textContent = totalPages;
            lastPageButton.onclick = () => {
                currentPage = totalPages; // 클릭 시 마지막 페이지로 이동
                updatePostListAndPagination();
            };
            lastPageItem.appendChild(lastPageButton);
            paginationList.appendChild(lastPageItem);
        }

        // '다음' 버튼 (nextButton) 로직
        const nextButton = document.querySelector(".page-btn.next");
        if (nextButton) {
            nextButton.onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++; // 페이지 증가
                    updatePostListAndPagination(); // 게시글 및 페이지네이션 다시 렌더링
                }
            };
            nextButton.disabled = currentPage === totalPages; // 마지막 페이지면 비활성화
            nextButton.style.opacity = currentPage === totalPages ? "0.5" : "1"; // CSS 비활성화 효과
            nextButton.style.pointerEvents =
                currentPage === totalPages ? "none" : "auto"; // 클릭 이벤트 비활성화
        }
    }

    /**
     * 댓글과 대댓글을 렌더링하는 함수
     * @param {Array} comments - 게시글에 포함된 댓글 데이터 배열
     */
    function renderComments(comments) {
        if (!detailCommentList) {
            console.warn(
                "WARNING: 댓글 목록 컨테이너(.commentList)를 찾을 수 없습니다."
            );
            return;
        }
        detailCommentList.innerHTML = ""; // 기존 댓글 비우기

        if (!comments || comments.length === 0) {
            const noCommentMessage = document.createElement("p");
            noCommentMessage.textContent = "작성된 댓글이 없습니다.";
            noCommentMessage.style.textAlign = "center";
            noCommentMessage.style.padding = "10px";
            detailCommentList.appendChild(noCommentMessage);
            return;
        }

        comments.forEach((comment) => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("commentItem"); // 댓글 아이템 클래스 추가

            commentDiv.innerHTML = `
                <span class="commentUser">${comment.author}</span> :
                <span class="commentContent">${comment.content}</span>
                <span class="commentDate">${comment.date}</span>
                <button class="editBtn">수정</button>
                <button class="deleteBtn">삭제</button>
            `;
            detailCommentList.appendChild(commentDiv);

            // 대댓글이 있다면 대댓글 렌더링
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach((reply) => {
                    const replyDiv = document.createElement("div");
                    replyDiv.classList.add("replyItem"); // 대댓글 아이템 클래스 추가
                    replyDiv.innerHTML = `
                        <span class="arrow">ㄴ</span>
                        <span class="commentUser">${reply.author}</span> :
                        <span class="commentContent">${reply.content}</span>
                        <span class="commentDate">${reply.date}</span>
                        <button class="editBtn">수정</button>
                        <button class="deleteBtn">삭제</button>
                    `;
                    detailCommentList.appendChild(replyDiv);
                });
            }
        });
    }
});
