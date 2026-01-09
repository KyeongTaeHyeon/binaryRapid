/**
 * adminUserList.js
 */

// [초기화 기능]
function resetSearch() {
    const inputs = ['searchCategory', 'searchKeyword', 'startDate', 'endDate'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    location.href = '/admin/users';
}

// [체크박스 전체 선택]
document.addEventListener('DOMContentLoaded', () => {
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('input[name="ids"]');
            checkboxes.forEach(cb => cb.checked = checkAll.checked);
        });
    }
});

// 전역 변수로 현재 선택된 유저 ID 저장
let currentUserId = null;

// 1. 모달 열기 (데이터 바인딩)
function openUserModal(element) {
    const data = element.dataset; // data-* 속성
    currentUserId = data.id;

    // input 값 채우기 (없는 값 방어 로직 포함)
    document.getElementById('modalNo').value = data.id || '';
    document.getElementById('modalEmail').value = data.email || '';
    document.getElementById('modalNickname').value = data.nickname || '';

    // undefined 방지
    document.getElementById('modalTaste').value = (data.taste && data.taste !== 'null') ? data.taste : '-';

    document.getElementById('modalAge').value = data.age || 0;
    document.getElementById('modalGender').value = data.gender || '';
    document.getElementById('modalJoinDate').value = data.join || '';

    // 정지 여부에 따른 버튼/배지 처리
    const isDeleted = data.deleted === 'true';

    const btnSuspend = document.getElementById('btnSuspend');
    const btnRestore = document.getElementById('btnRestore');
    const statusBadge = document.getElementById('statusBadge');

    if (isDeleted) {
        // 이미 정지됨 -> 복구 버튼 노출
        btnSuspend.style.display = 'none';
        btnRestore.style.display = 'block';

        statusBadge.textContent = '이용 정지';
        statusBadge.style.background = '#ff4d4f';
        statusBadge.style.color = '#fff';
    } else {
        // 정상 -> 정지 버튼 노출
        btnSuspend.style.display = 'block';
        btnRestore.style.display = 'none';

        statusBadge.textContent = '정상 이용 중';
        statusBadge.style.background = '#52c41a';
        statusBadge.style.color = '#fff';
    }

    // 모달 표시
    document.getElementById('userModal').style.display = 'flex';
}

// 2. 모달 닫기
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    currentUserId = null;
}

// 3. 상태 변경 (정지/복구)
function changeStatus(action) {
    if (!currentUserId) return;

    let confirmMsg = action === 'suspend'
        ? "정말 해당 회원을 '이용 정지' 처리하시겠습니까?\n(사용자가 로그인할 수 없게 됩니다.)"
        : "해당 회원의 정지를 해제하시겠습니까?";

    if (!confirm(confirmMsg)) return;

    // [수정된 부분] CSRF 토큰 처리 안전하게 변경
    const csrfTokenMeta = document.querySelector('meta[name="_csrf"]');
    const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');

    const headers = {
        'Content-Type': 'application/json'
    };

    // ★ 중요: 메타 태그가 있고, 그 안의 내용(content)도 비어있지 않을 때만 헤더 추가
    if (csrfTokenMeta && csrfHeaderMeta && csrfHeaderMeta.content && csrfTokenMeta.content) {
        headers[csrfHeaderMeta.content] = csrfTokenMeta.content;
    }

    fetch(`/admin/users/${currentUserId}/status`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({action: action})
    })
        .then(response => {
            if (response.ok) {
                alert('처리가 완료되었습니다.');
                location.reload();
            } else {
                return response.text().then(text => {
                    throw new Error(text || '처리 실패');
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('처리 중 오류가 발생했습니다.\n' + error.message);
        });
}
