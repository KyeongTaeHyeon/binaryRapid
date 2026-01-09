// 전역 변수
let currentGroupId = '';
let currentMajor = '';
let currentMinor = '';

// 1. 페이지 로드 시 자동 선택 로직 (안전한 방식 + 디버깅 로그 추가)
document.addEventListener('DOMContentLoaded', function () {
    const targetInput = document.getElementById('targetGroupId');

    // 디버깅: 값이 잘 넘어왔는지 확인
    if (!targetInput) {
        console.error("❌ HTML에 <input type='hidden' id='targetGroupId'> 태그가 없습니다.");
        return;
    }

    const targetGroupId = targetInput.value;
    console.log("🔍 서버에서 받은 그룹 ID:", targetGroupId);

    if (targetGroupId) {
        // 해당 groupId를 가진 요소를 찾습니다.
        const targetElement = document.querySelector(`.group-item[data-groupid='${targetGroupId}']`);

        if (targetElement) {
            console.log("✅ 해당 그룹을 찾았습니다. 클릭합니다.", targetElement);
            targetElement.click();
            targetElement.scrollIntoView({behavior: 'smooth', block: 'center'});
        } else {
            console.warn("⚠️ 그룹 ID는 받았지만, 좌측 목록에서 해당 요소를 찾을 수 없습니다. (ID 불일치?)");
        }
    } else {
        console.log("ℹ️ 전달받은 그룹 ID가 없습니다. (초기 진입)");
    }
});

// 2. 우측 리스트 불러오기 (ID 컬럼 제거 버전)
function loadItems(element) {
    const groupId = element.dataset.groupid;
    const major = element.dataset.major;
    const minor = element.dataset.minor;

    // 전역 변수 업데이트
    currentGroupId = groupId;
    currentMajor = major;
    currentMinor = minor;

    // active 스타일 적용
    document.querySelectorAll('.group-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');

    // 타이틀 변경
    document.getElementById('currentGroupTitle').innerText = `${major} > ${minor} (${groupId})`;
    document.getElementById('addItemBtn').style.display = 'block';

    // AJAX 데이터 요청
    fetch(`/admin/categories/items?groupId=${groupId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('itemListBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">등록된 항목이 없습니다.</td></tr>';
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.minor}</td>
                    <td style="font-weight:bold; text-align:left; padding-left:15px;">${item.name}</td>
                    <td>${item.view}</td>
                    <td>
                        <button class="btn-mini" onclick='openEditItem(${JSON.stringify(item)})'>수정</button>
                        <button class="btn-mini red" onclick="deleteItem('${item.id}')">삭제</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading items:", err));
}

// 3. 항목 추가 모달 열기
function openAddItemModal() {
    if (!currentGroupId) return alert("그룹을 먼저 선택해주세요.");

    document.querySelector('#itemModal form').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemGroupId').value = currentGroupId;
    document.getElementById('itemMajor').value = currentMajor;
    document.getElementById('itemMinor').value = currentMinor;

    // 순서 자동 계산
    const currentCount = document.querySelectorAll('#itemListBody tr').length;
    const hasNoData = document.querySelector('#itemListBody tr td')?.innerText.includes("없습니다");
    const nextView = hasNoData ? 1 : currentCount + 1;
    document.getElementById('itemView').value = nextView;

    document.getElementById('itemModalTitle').innerText = `[${currentMajor}] 항목 추가`;
    document.getElementById('itemModal').style.display = 'flex';
    setTimeout(() => document.getElementById('itemName').focus(), 100);
}

// 4. 삭제 함수 (그룹ID 유지)
function deleteItem(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        document.getElementById('deleteId').value = id;
        document.getElementById('deleteGroupId').value = currentGroupId;
        document.getElementById('deleteForm').submit();
    }
}

// (나머지 모달 관련 함수들 - 기존 그대로 유지)
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openNewGroupModal() {
    document.querySelector('#newGroupModal form').reset();
    document.getElementById('prefixMsg').innerText = '';
    document.getElementById('btnCreateGroup').disabled = true;
    document.getElementById('newGroupModal').style.display = 'flex';
}

function openEditItem(item) {
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemGroupId').value = item.groupId;
    document.getElementById('itemMajor').value = item.major;
    document.getElementById('itemMinor').value = item.minor;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemView').value = item.view;
    document.getElementById('itemModalTitle').innerText = '항목 수정';
    document.getElementById('itemModal').style.display = 'flex';
}

function handlePrefixInput(input) {
    input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    const val = input.value;
    const msgBox = document.getElementById('prefixMsg');
    const submitBtn = document.getElementById('btnCreateGroup');
    if (val.length === 0) {
        msgBox.innerText = "";
        submitBtn.disabled = true;
        return;
    }
    fetch(`/admin/categories/check-prefix?prefix=${val}`).then(res => res.json()).then(isAvailable => {
        if (isAvailable) {
            msgBox.style.color = 'green';
            msgBox.innerText = "사용 가능";
            submitBtn.disabled = false;
        } else {
            msgBox.style.color = 'red';
            msgBox.innerText = "중복된 코드";
            submitBtn.disabled = true;
        }
    });
}

function validateNewGroup() {
    return !document.getElementById('btnCreateGroup').disabled;
}

window.onload = function () {
    const targetInput = document.getElementById('targetGroupId');

    // targetGroupId 값이 있을 때만 실행
    if (targetInput && targetInput.value) {
        const targetGroupId = targetInput.value;

        // 1. 해당 그룹 찾아서 클릭 (자동 선택)
        const targetElement = document.querySelector(`.group-item[data-groupid='${targetGroupId}']`);
        if (targetElement) {
            targetElement.click();
            targetElement.scrollIntoView({behavior: 'smooth', block: 'center'});
        }

        // 2. [추가] 기능 수행 후 URL 파라미터 제거
        // history.replaceState를 사용해 페이지 새로고침 없이 URL만 깔끔하게 변경합니다.
        history.replaceState({}, null, location.pathname);
    }
}
