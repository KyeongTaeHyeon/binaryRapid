// [초기화 기능]
function resetSearch() {
    // 1. 눈에 보이는 입력값 지우기
    document.getElementById('searchCategory').value = '';
    document.getElementById('searchKeyword').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';

    // 2. 페이지를 '검색 조건 없이' 다시 불러오기 (리셋 효과)
    location.href = '/admin/users';
}

// [체크박스 전체 선택 기능] (필요하면 유지)
document.addEventListener('DOMContentLoaded', () => {
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('input[name="ids"]');
            checkboxes.forEach(cb => cb.checked = checkAll.checked);
        });
    }
});
