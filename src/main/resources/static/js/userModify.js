/**
 * userModify.js - 회원 정보 수정 전용
 */
let userPk = 0;
let userSocialType = "LOCAL";
let isNickOk = true; 

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 초기 유저 정보 로드
    await fetchUserInfo();

    const nickInput = document.getElementById('nickName');
    const msgNick = document.getElementById('nickNameMsg');

    // 2. 닉네임 실시간 중복 체크
    if (nickInput) {
        nickInput.addEventListener('blur', async () => {
            const nick = nickInput.value.trim();
            if (!nick) return;

            const response = await fetch(`/user/check-duplicate?nickName=${nick}`);
            const result = await response.json();

            if (result.data) {
                isNickOk = false;
                msgNick.textContent = "이미 사용 중인 닉네임입니다.";
                msgNick.style.color = "red";
            } else {
                isNickOk = true;
                msgNick.textContent = "사용 가능한 닉네임입니다.";
                msgNick.style.color = "green";
            }
        });
    }

    document.getElementById('registerForm').addEventListener('submit', handleUpdate);
});

async function fetchUserInfo() {
    try {
        const response = await authFetch("/user/me");
        if (response.ok) {
            const result = await response.json();
            const user = result.data;
            
            userPk = user.userId;
            userSocialType = user.social || "LOCAL";

            // 필드 채우기
            document.getElementById('userId').value = user.id || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('nickName').value = user.nickName || '';
            document.getElementById('selAge').value = user.birth || '';
            document.getElementById('selPreference').value = user.taste || '';
            
            // 🔥 성별 데이터 매핑 (서버 필드명이 gender인지 확인 필수)
            const genderSelect = document.getElementById('selGender');
            if (user.gender === 'M' || user.gender === 'F') {
                genderSelect.value = user.gender;
            }

            // 소셜 유저 처리
            if (userSocialType !== "LOCAL") {
                const emailField = document.getElementById('userEmail');
                const passField = document.getElementById('userPassword');
                if (emailField) emailField.readOnly = true;
                if (passField) {
                    passField.readOnly = true;
                    passField.value = "********";
                }
            }
        }
    } catch (e) { console.error("데이터 로드 에러:", e); }
}

async function handleUpdate(e) {
    e.preventDefault();
    if (!isNickOk) return alert("닉네임 중복 여부를 확인해주세요.");

    // 현재 선택된 성별 값을 직접 가져옴 (M 또는 F)
    const currentGender = document.getElementById('selGender').value;

    const updateData = {
        userId: userPk,
        id: document.getElementById('userId').value,
        password: userSocialType === "LOCAL" ? document.getElementById('userPassword').value : "",
        email: document.getElementById('userEmail').value,
        nickName: document.getElementById('nickName').value,
        gender: currentGender, // "M" 또는 "F"
        taste: document.getElementById('selPreference').value,
        birth: document.getElementById('selAge').value
    };

    console.log("전송 데이터:", updateData); // 개발자 도구 콘솔에서 전송 직전 데이터 확인용

    if (confirm("정보를 수정하시겠습니까?")) {
        const response = await authFetch("/user/api/my/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            alert("수정 완료");
            location.reload(); // 새로고침하여 반영 확인
        } else {
            const errorResult = await response.json();
            alert("수정 실패: " + (errorResult.message || "알 수 없는 오류"));
        }
    }
}