/**
 * register.js - 중복 확인 + 실시간 검증 + 소셜 가입 대응 통합본
 */

let isIdChecked = false;
let isPassOk = false;
let isEmailOk = false;
let isNickNameOk = false;
let isSocialMode = false;

const reUid = /^[a-z]+[a-z0-9]{4,10}$/;
const rePass = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{5,15}$/;
const reEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

const fetchDuplicate = async (type, value) => {
    try {
        const response = await fetch(`/user/check-duplicate?${type}=${value}`);
        if (!response.ok) throw new Error("서버 에러");
        const result = await response.json();
        return result.data; // true: 중복됨
    } catch (e) {
        console.error("중복 체크 에러:", e);
        return true;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const idInput = document.querySelector('#userName');
    const idBtn = document.querySelector('#btnIdDupCheck');
    const pass1 = document.querySelector('#userPassword');
    const pass2 = document.querySelector('#userPasswordCheck');
    const emailInput = document.querySelector('#userEmail');
    const nameInput = document.querySelector('#name');
    const nickInput = document.querySelector('#nickName');
    const registerForm = document.querySelector('#registerForm');

    const msgUid = document.querySelector('#userNameMsg');
    const msgPass = document.querySelector('#passwordCheckMsg');
    const msgEmail = document.querySelector('#emailMsg');
    const msgNick = document.querySelector('#nickNameMsg');

    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const nameParam = urlParams.get('name');
    const socialParam = urlParams.get('social');

    // [A] 소셜 가입 모드 활성화 및 초기 세팅
    if (socialParam && socialParam !== 'LOCAL') {
        isSocialMode = true;

        if (emailParam) {
            emailInput.value = emailParam;
            emailInput.readOnly = true;
            emailInput.style.backgroundColor = "#f0f0f0";

            idInput.value = emailParam.split('@')[0];
            idInput.readOnly = true;
            idInput.style.backgroundColor = "#f0f0f0";
            if (idBtn) idBtn.style.display = 'none';
        }

        if (nameInput && nameParam) {
            nameInput.value = nameParam;
            nameInput.readOnly = true;
            nameInput.style.backgroundColor = "#f0f0f0";
        }

        const dummyPass = "OAUTH2_USER_" + Math.random().toString(36).substring(2, 10);
        if (pass1) pass1.value = dummyPass;
        if (pass2) pass2.value = dummyPass;

        const passGroups = document.querySelectorAll('.inputGroup');
        passGroups.forEach(group => {
            if (group.contains(pass1) || group.contains(pass2)) {
                group.style.display = 'none';
            }
        });

        isIdChecked = true;
        isPassOk = true;
        isEmailOk = true;

        if (msgEmail) {
            msgEmail.textContent = socialParam + " 인증 완료 계정";
            msgEmail.style.color = "green";
        }
    }

    // [B] 아이디 실시간 중복 확인 (일반 가입 시 blur)
    if (idInput && !isSocialMode) {
        idInput.addEventListener('blur', async () => {
            const uid = idInput.value.trim();
            if (!reUid.test(uid)) {
                msgUid.textContent = "아이디 형식이 올바르지 않습니다.";
                msgUid.style.color = "red";
                return;
            }
            const isDuplicate = await fetchDuplicate('id', uid);
            if (isDuplicate) {
                isIdChecked = false;
                msgUid.textContent = '이미 사용 중인 아이디입니다.';
                msgUid.style.color = 'red';
            } else {
                isIdChecked = true;
                msgUid.textContent = '사용 가능한 아이디입니다.';
                msgUid.style.color = 'green';
            }
        });
    }

    // [C] 비밀번호 실시간 검사
    const validatePassword = () => {
        if (isSocialMode) return;
        const v1 = pass1.value;
        const v2 = pass2.value;
        if (!rePass.test(v1)) {
            msgPass.textContent = '5~15자 영문, 숫자, 특수문자 조합 필요';
            msgPass.style.color = 'red';
            isPassOk = false;
        } else if (v1 !== v2) {
            msgPass.textContent = '비밀번호 불일치';
            msgPass.style.color = 'red';
            isPassOk = false;
        } else {
            msgPass.textContent = '사용 가능';
            msgPass.style.color = 'green';
            isPassOk = true;
        }
    };
    if (pass1 && pass2 && !isSocialMode) {
        pass1.addEventListener('input', validatePassword);
        pass2.addEventListener('input', validatePassword);
    }

    // [D] 이메일 포커스 아웃 중복 확인
    if (emailInput && !isSocialMode) {
        emailInput.addEventListener('blur', async () => {
            const email = emailInput.value.trim();
            if (!email || !reEmail.test(email)) {
                isEmailOk = false;
                msgEmail.textContent = "유효한 이메일을 입력해주세요.";
                msgEmail.style.color = "red";
                return;
            }
            const isDuplicate = await fetchDuplicate('email', email);
            if (isDuplicate) {
                isEmailOk = false;
                msgEmail.textContent = '이미 등록된 이메일입니다.';
                msgEmail.style.color = 'red';
            } else {
                isEmailOk = true;
                msgEmail.textContent = '사용 가능한 이메일입니다.';
                msgEmail.style.color = 'green';
            }
        });
    }

    // [E] 닉네임 실시간 중복 확인 (blur)
    if (nickInput) {
        nickInput.addEventListener('blur', async () => {
            const nick = nickInput.value.trim();
            if (!nick) return;

            const isDuplicate = await fetchDuplicate('nickName', nick);
            if (isDuplicate) {
                isNickNameOk = false;
                msgNick.textContent = '이미 사용 중인 닉네임입니다.';
                msgNick.style.color = 'red';
            } else {
                isNickNameOk = true;
                msgNick.textContent = '사용 가능한 닉네임입니다.';
                msgNick.style.color = 'green';
            }
        });

        nickInput.addEventListener('input', () => {
            isNickNameOk = false;
            if (msgNick) {
                msgNick.textContent = '중복 확인 중...';
                msgNick.style.color = 'gray';
            }
        });
    }

    // [F] 최종 제출 - social 컬럼 명시
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isIdChecked) return alert("아이디 중복 확인을 해주세요.");
            if (!isPassOk) return alert("비밀번호를 확인해주세요.");
            if (!isEmailOk) return alert("이메일을 확인해주세요.");
            if (!isNickNameOk) return alert("닉네임 중복 확인을 해주세요.");
// register.js 내 제출 로직
            const socialParam = urlParams.get('social'); // "GOOGLE"

            const formData = {
                id: idInput.value,
                password: pass1.value,
                name: nameInput.value,
                email: emailInput.value,
                nickName: nickInput.value,
                birth: document.querySelector('#selAge').value,
                gender: document.querySelector('#selGender').value,
                taste: document.querySelector('#selPreference').value,
                role: 'USER',
                // 이 부분이 핵심입니다. 
                // console.log로 찍었을 때 이 키가 반드시 존재해야 합니다.
                social: isSocialMode ? (socialParam ? socialParam.toUpperCase() : 'GOOGLE') : 'LOCAL'
            };

            console.log("최종 전송 데이터:", JSON.stringify(formData, null, 2)); // 전체 데이터를 예쁘게 출력

            console.log("전송 데이터 확인:", formData); // 콘솔에서 social 값이 GOOGLE인지 확인하세요!
            
            if (!confirm("가입하시겠습니까?")) return;

            try {
                const response = await fetch("/user/LocalSignup", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert("가입 성공! 로그인 해주세요.");
                    location.href = "/login";
                } else {
                    const result = await response.json();
                    alert(result.message || "가입 실패");
                }
            } catch (err) { alert("서버 오류"); }
        });
    }
});