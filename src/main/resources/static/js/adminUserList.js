// [초기화 기능]
function resetSearch() {
    // 1. 입력창 비우기 (시각적)
    document.getElementById('searchCategory').value = '';
    document.getElementById('searchKeyword').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';

    // 2. 중요: 페이지를 '파라미터 없이' 다시 호출 (완전 초기화)
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
