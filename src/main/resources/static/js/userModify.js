/**
 * userModify.js
 */

// 전역 변수로 유저 고유 PK를 저장 (불러올 때 채우고 수정할 때 사용)
let userPk = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 페이지 로드 시 유저 데이터 호출 및 매핑
    await fetchUserInfo();

    const modifyForm = document.getElementById('registerForm');
    const deleteBtn = document.getElementById('btnDelete');

    // 2. 정보 수정 이벤트
    modifyForm.addEventListener('submit', handleUpdate);

    // 3. 회원 탈퇴 이벤트
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteUser);
    }
});

/**
 * [GET] /user/me 데이터를 가져와 폼에 채움
 */
async function fetchUserInfo() {
    try {
        const response = await authFetch("/user/me");
        if (response.ok) {
            const result = await response.json();
            const user = result.data; // SelectUserResponseForJwtDto

            // [가장 중요] 서버에서 준 고유 PK(userId)를 변수에 보관
            userPk = user.userId;
            console.log("로그인 유저 PK 저장 완료:", userPk);

            // HTML 요소 매핑
            const idField = document.getElementById('userId');
            const emailField = document.getElementById('userEmail');
            const nickField = document.getElementById('nickName');
            const ageField = document.getElementById('selAge');
            const genderField = document.getElementById('selGender');
            const prefField = document.getElementById('selPreference');

            // 값 대입
            if (idField) idField.value = user.id;
            if (emailField) emailField.value = user.email || '';
            if (nickField) nickField.value = user.nickName || '';
            if (ageField) ageField.value = user.birth || '';

            // 성별 고정 (m/f 변환 후 클릭 방지)
            if (genderField && user.gender) {
                const genderVal = user.gender.toLowerCase() === 'm' ? 'male' :
                    user.gender.toLowerCase() === 'f' ? 'female' : user.gender;
                genderField.value = genderVal;
                genderField.style.backgroundColor = "#f1f5f9";
                genderField.style.pointerEvents = "none";
            }

            // 취향 매핑 (한글 -> 코드 변환)
            if (prefField && user.taste) {
                const tasteMap = { '소유': 'SOY', '돈코츠': 'TONKOTSU', '미소': 'MISO', '시오': 'SHIO' };
                prefField.value = tasteMap[user.taste] || user.taste;
            }
        }
    } catch (e) {
        console.error("데이터 로딩 중 에러:", e);
    }
}

/**
 * 정보 수정 요청
 */
async function handleUpdate(e) {
    e.preventDefault();

    const password = document.getElementById('userPassword').value;
    if (!password) {
        alert("본인 확인을 위해 비밀번호를 입력해주세요.");
        return;
    }

    // 전송 데이터 구성 (userPk 포함)
    const updateData = {
        userId: userPk, // 조회 시 저장했던 PK 숫자
        id: document.getElementById('userId').value,
        password: password,
        email: document.getElementById('userEmail').value,
        nickName: document.getElementById('nickName').value,
        gender: document.getElementById('selGender').value,
        taste: document.getElementById('selPreference').value,
        birth: document.getElementById('selAge').value
    };

    if (confirm("정보를 수정하시겠습니까?")) {
        try {
            const response = await authFetch("/user/api/my/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert("성공적으로 변경되었습니다.");
                location.reload();
            } else {
                const errMsg = await response.text();
                alert(errMsg || "비밀번호가 일치하지 않거나 수정에 실패했습니다.");
            }
        } catch (e) {
            alert("서버 통신 중 에러가 발생했습니다.");
        }
    }
}

/**
 * 회원 탈퇴 요청
 */
async function handleDeleteUser() {
    const password = prompt("탈퇴를 원하시면 비밀번호를 입력해주세요.");
    if (!password) return;

    if (confirm("정말로 탈퇴하시겠습니까?")) {
        try {
            const response = await authFetch("/user/api/my/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: password })
            });

            if (response.ok) {
                alert("탈퇴 처리가 완료되었습니다.");
                sessionStorage.clear();
                location.href = "/";
            } else {
                alert("비밀번호가 틀렸거나 탈퇴 처리에 실패했습니다.");
            }
        } catch (e) {
            alert("서버 통신 에러");
        }
    }
}