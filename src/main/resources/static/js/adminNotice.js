/**
 * adminNotice.js
 * 공지사항 관리 스크립트
 */

// 1. 모달 열기
function openNoticeModal() {
    const modal = document.getElementById('noticeModal');

    // (선택사항) 등록 모달을 열 때 폼을 초기화하려면 아래 코드 사용
    const form = modal.querySelector('form');
    if (form) form.reset();

    modal.style.display = 'flex';
}

// 2. 모달 닫기
function closeNoticeModal() {
    document.getElementById('noticeModal').style.display = 'none';
}

// 3. 수정 모달 열기 (데이터 바인딩)
function openEditModal(button) {
    const modal = document.getElementById('editNoticeModal');

    // 버튼의 data-* 속성에서 값 가져오기
    const id = button.dataset.id;
    const type = button.dataset.type;
    const title = button.dataset.title;
    const content = button.dataset.content;
    const yn = button.dataset.yn;

    // 모달 내부의 input/select 요소 찾기
    document.getElementById('editId').value = id;
    document.getElementById('editType').value = type;
    document.getElementById('editTitle').value = title;
    document.getElementById('editContent').value = content;

    // 라디오 버튼(게시여부) 체크 처리
    if (yn === 'Y') {
        document.getElementById('editYn_Y').checked = true;
    } else {
        document.getElementById('editYn_N').checked = true;
    }

    // 모달 보이기
    modal.style.display = 'flex';
}

// 4. 수정 모달 닫기
function closeEditModal() {
    document.getElementById('editNoticeModal').style.display = 'none';
}
