/**
 * userModify.js - 회원 정보 수정 전용
 */
let userPk = 0;
let userSocialType = "LOCAL";
let isNickOk = true; // 수정 시 기존 본인 닉네임은 초기값 OK

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 초기 유저 정보 로드
    await fetchUserInfo();

    const nickInput = document.getElementById('nickName');
    const msgNick = document.getElementById('nickNameMsg');

    // 2. 닉네임 포커스 아웃(blur) 시 실시간 중복 체크
    if (nickInput) {
        nickInput.addEventListener('blur', async () => {
            const nick = nickInput.value.trim();
            if (!nick) return;

            // 중복 체크 API 호출
            const response = await fetch(`/user/check-duplicate?nickName=${nick}`);
            const result = await response.json();

            if (result.data) { // true: 중복됨
                isNickOk = false;
                msgNick.textContent = "이미 사용 중인 닉네임입니다.";
                msgNick.style.color = "red";
            } else {
                isNickOk = true;
                msgNick.textContent = "사용 가능한 닉네임입니다.";
                msgNick.style.color = "green";
            }
        });

        // 입력 중에는 다시 확인 상태로 변경
        nickInput.addEventListener('input', () => {
            isNickOk = false;
            if (msgNick) {
                msgNick.textContent = "중복 확인 중...";
                msgNick.style.color = "gray";
            }
        });
    }

    document.getElementById('registerForm').addEventListener('submit', handleUpdate);
});

// userModify.js 상단
async function fetchUserInfo() {
    try {
        const response = await authFetch("/user/me");
        if (response.ok) {
            const result = await response.json();
            const user = result.data;
            userPk = user.userId;
            userSocialType = user.social || "LOCAL";

            const emailField = document.getElementById('userEmail');
            const passField = document.getElementById('userPassword');

            // 소셜 유저 스타일 강제 적용
            if (userSocialType !== "LOCAL") {
                if (emailField) {
                    emailField.readOnly = true;
                    emailField.classList.add('readonly-field');
                }
                if (passField) {
                    passField.readOnly = true;
                    passField.value = "********";
                    passField.classList.add('readonly-field');
                }
            }

            // 필드 채우기
            document.getElementById('userId').value = user.id || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('nickName').value = user.nickName || '';
            document.getElementById('selAge').value = user.birth || '';
            document.getElementById('selPreference').value = user.taste || '';
        }
    } catch (e) { console.error(e); }
}

async function handleUpdate(e) {
    e.preventDefault();
    if (!isNickOk) return alert("닉네임 중복 여부를 확인해주세요.");

    const updateData = {
        userId: userPk,
        id: document.getElementById('userId').value,
        // 소셜 유저면 빈 값, 로컬 유저면 입력값 전송
        password: userSocialType === "LOCAL" ? document.getElementById('userPassword').value : "",
        email: document.getElementById('userEmail').value,
        nickName: document.getElementById('nickName').value,
        gender: document.getElementById('selGender').value,
        taste: document.getElementById('selPreference').value,
        birth: document.getElementById('selAge').value
    };

    if (confirm("정보를 수정하시겠습니까?")) {
        const response = await authFetch("/user/api/my/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });
        if (response.ok) {
            alert("수정 완료");
            location.reload();
        } else {
            alert("수정에 실패했습니다.");
        }
    }
}