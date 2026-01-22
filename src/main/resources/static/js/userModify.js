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
    const passInput = document.getElementById('userPassword');
    const msgPass = document.getElementById('passwordMsg');

    // 2. 닉네임 실시간 중복 체크
    if (nickInput) {
        nickInput.addEventListener('blur', async () => {
            const nick = nickInput.value.trim();
            if (!nick) return;

            // 현재 내 닉네임과 같으면 중복 체크 패스
            const currentNick = document.getElementById('nickName').defaultValue;
            if (nick === currentNick) {
                isNickOk = true;
                msgNick.textContent = "현재 사용 중인 닉네임입니다.";
                msgNick.style.color = "green";
                return;
            }

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

    // 3. 비밀번호 입력 시 메시지 초기화
    if (passInput) {
        passInput.addEventListener('input', () => {
            if (msgPass) {
                msgPass.textContent = "본인 확인을 위해 비밀번호를 입력해야 변경이 가능합니다.";
                msgPass.style.color = ""; // 기본 색상으로 복구
            }
        });
    }

    document.getElementById('registerForm').addEventListener('submit', handleUpdate);
    
    // 탈퇴 버튼 이벤트 연결
    const btnDelete = document.getElementById('btnDelete');
    if(btnDelete) {
        btnDelete.addEventListener('click', handleDelete);
    }
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
            
            const nickField = document.getElementById('nickName');
            nickField.value = user.nickName || '';
            nickField.defaultValue = user.nickName || ''; // 초기값 저장 (중복체크 예외용)

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
    } catch (e) {
        console.error("데이터 로드 에러:", e);
    }
}

async function handleUpdate(e) {
    e.preventDefault();
    if (!isNickOk) return alert("닉네임 중복 여부를 확인해주세요.");

    const passInput = document.getElementById('userPassword');
    const msgPass = document.getElementById('passwordMsg');
    
    // 로컬 유저인 경우 비밀번호 공란 체크
    if (userSocialType === "LOCAL") {
        const password = passInput.value.trim();
        if (!password) {
            if (msgPass) {
                msgPass.textContent = "비밀번호를 입력해주세요.";
                msgPass.style.color = "red";
            }
            passInput.focus();
            return;
        }
    }

    // 현재 선택된 성별 값을 직접 가져옴 (M 또는 F)
    const currentGender = document.getElementById('selGender').value;

    const updateData = {
        userId: userPk,
        id: document.getElementById('userId').value,
        password: userSocialType === "LOCAL" ? passInput.value : null, // 빈 문자열 대신 null 전송
        email: document.getElementById('userEmail').value,
        nickName: document.getElementById('nickName').value,
        gender: currentGender, // "M" 또는 "F"
        taste: document.getElementById('selPreference').value,
        birth: document.getElementById('selAge').value
    };


    if (confirm("정보를 수정하시겠습니까?")) {
        const response = await authFetch("/user/api/my/update", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert("수정 완료");
            location.reload(); // 새로고침하여 반영 확인
        } else {
            // 응답 본문을 텍스트로 먼저 읽음
            const text = await response.text();
            let errorMsg = "알 수 없는 오류";
            
            try {
                // JSON 파싱 시도
                const errorResult = JSON.parse(text);
                errorMsg = errorResult.message || errorMsg;
            } catch (err) {
                errorMsg = text.length > 100 ? text.substring(0, 100) + "..." : text;
            }

            // 에러 메시지에 따라 처리 분기
            if (errorMsg.includes("비밀번호")) {
                if (msgPass) {
                    msgPass.textContent = errorMsg; // "비밀번호가 일치하지 않습니다." 등
                    msgPass.style.color = "red";
                }
                passInput.focus();
            } else {
                alert("수정 실패: " + errorMsg);
            }
        }
    }
}

// 탈퇴 처리 함수
async function handleDelete() {
    let password = "";
    if (userSocialType === "LOCAL") {
        password = document.getElementById('userPassword').value;
        if (!password || password === "********") {
            alert("탈퇴를 위해 비밀번호 확인이 필요합니다.");
            document.getElementById('userPassword').focus();
            return;
        }
    }

    if (!confirm("정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 정보는 복구되지 않습니다.")) {
        return;
    }

    try {
        const response = await authFetch("/user/api/my/delete", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId: userPk,
                password: password
            })
        });

        if (response.ok) {
            alert("그동안 이용해 주셔서 감사합니다.");
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("cachedUser");
            window.location.href = "/";
        } else {
            const errorMsg = await response.text();
            alert("탈퇴 실패: " + errorMsg);
        }
    } catch (e) {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
}
