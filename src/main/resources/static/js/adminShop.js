/**
 * 식당 인가 관리 스크립트
 */

// 1. [대기 탭] 즉시 승인/반려 처리
function processShopDirectly(btn, action) {
    const id = btn.dataset.id;
    let msg = "";

    if (action === 'APPROVE') msg = '승인하시겠습니까?';
    else if (action === 'REJECT') msg = '반려하시겠습니까?';
    else if (action === 'HOLD') msg = '보류하시겠습니까?'; // [추가]

    if (!confirm(msg)) return;
    callApi(id, action);
}

// 2. [처리 내역 탭] 상태 변경 모달 열기
function openStatusModal(id, name, currentType) {
    document.getElementById('modalShopId').value = id;
    document.getElementById('modalShopName').value = name;

    // 라디오 버튼 초기화
    document.querySelectorAll('input[name="statusType"]').forEach(el => el.checked = false);

    if (currentType === 'Y') {
        document.getElementById('radioApprove').checked = true;
    } else if (currentType === 'N') {
        document.getElementById('radioReject').checked = true;
    } else if (currentType === 'P') { // [추가] 보류 상태 체크
        document.getElementById('radioHold').checked = true;
    }

    document.getElementById('statusModal').style.display = 'flex';
}

// 3. 모달 닫기
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// 4. [모달] 변경 내용 저장
function updateStatusFromModal() {
    const id = document.getElementById('modalShopId').value;

    // 선택된 라디오 버튼 값 가져오기
    const checkedRadio = document.querySelector('input[name="statusType"]:checked');
    if (!checkedRadio) return alert("상태를 선택해주세요.");

    const action = checkedRadio.value;

    if (!confirm('상태를 변경하시겠습니까?')) return;

    callApi(id, action);
}

// 5. 공통 API 호출 함수 (AJAX)
function callApi(id, action) {
    fetch('/admin/shops/status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: id, action: action})
    })
        .then(res => {
            if (res.ok) {
                alert('처리되었습니다.');
                location.reload(); // 목록 갱신을 위해 새로고침
            } else {
                alert('오류가 발생했습니다.');
            }
        })
        .catch(err => console.error("Error:", err));
}
