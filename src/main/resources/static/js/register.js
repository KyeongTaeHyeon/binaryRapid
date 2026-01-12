/**
 * register.js - 중복 확인 + 실시간 검증 + 가입 요청 통합
 */

// 1. 상태 변수 및 정규식 (어디서든 접근 가능하도록 최상단 배치)
let isIdChecked = false;
let isPassOk = false;
let isEmailOk = false;
let isNickNameOk = false;

const reUid = /^[a-z]+[a-z0-9]{4,10}$/;
const rePass = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{5,15}$/;
const reEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

// 공통 중복 체크 API 호출 함수
const fetchDuplicate = async (type, value) => {
    try {
        const response = await fetch(`/user/check-duplicate?${type}=${value}`);
        if (!response.ok) throw new Error("Security 또는 서버 에러");
        const result = await response.json();
        return result.data; // true: 중복됨, false: 사용가능
    } catch (e) {
        console.error("중복 체크 에러:", e);
        return true; // 에러 시 가입 방지를 위해 중복으로 처리
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const idInput = document.querySelector('#userName');
    const idBtn = document.querySelector('#btnIdDupCheck');
    const pass1 = document.querySelector('#userPassword');
    const pass2 = document.querySelector('#userPasswordCheck');
    const emailInput = document.querySelector('#userEmail');
    const nickInput = document.querySelector('#nickName');
    const registerForm = document.querySelector('#registerForm');

    // 메시지 출력 요소
    const msgUid = document.querySelector('#userNameMsg');
    const msgPass = document.querySelector('#passwordCheckMsg');
    const msgEmail = document.querySelector('#emailMsg');
    const msgNick = document.querySelector('#nickNameMsg') || (() => {
        const span = document.createElement('span');
        span.id = 'nickNameMsg';
        span.className = 'msg';
        nickInput.parentNode.after(span);
        return span;
    })();

    /** [A] 아이디 중복 확인 */
    if (idBtn && idInput) {
        idBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // 버튼 클릭 시 폼 제출 방지
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

        idInput.addEventListener('input', () => {
            isIdChecked = false;
            msgUid.textContent = '아이디 변경 시 중복 확인이 다시 필요합니다.';
            msgUid.style.color = 'orange';
        });
    }

    /** [B] 비밀번호 실시간 검사 */
    const validatePassword = () => {
        const v1 = pass1.value;
        const v2 = pass2.value;
        if (!rePass.test(v1)) {
            msgPass.textContent = '5~15자 영문, 숫자, 특수문자 조합이어야 합니다.';
            msgPass.style.color = 'red';
            isPassOk = false;
        } else if (v1 !== v2) {
            msgPass.textContent = '비밀번호가 일치하지 않습니다.';
            msgPass.style.color = 'red';
            isPassOk = false;
        } else {
            msgPass.textContent = '사용 가능하며 일치합니다.';
            msgPass.style.color = 'green';
            isPassOk = true;
        }
    };
    if (pass1 && pass2) {
        pass1.addEventListener('input', validatePassword);
        pass2.addEventListener('input', validatePassword);
    }

    /** [C] 이메일 중복 확인 (Focusout) */
    if (emailInput) {
        emailInput.addEventListener('focusout', async () => {
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

    /** [D] 닉네임 중복 확인 (Focusout) */
    if (nickInput) {
        nickInput.addEventListener('focusout', async () => {
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
    }

    /** [E] 최종 회원가입 제출 */
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isIdChecked) return alert("아이디 중복 확인을 해주세요.");
            if (!isPassOk) return alert("비밀번호를 확인해주세요.");
            if (!isEmailOk) return alert("이메일 중복 확인을 해주세요.");
            if (!isNickNameOk) return alert("닉네임 중복 확인을 해주세요.");

            const formData = {
                id: idInput.value,
                password: pass1.value,
                name: document.querySelector('#name').value,
                email: emailInput.value,
                nickName: nickInput.value,
                birth: document.querySelector('#selAge').value,
                gender: document.querySelector('#selGender').value,
                taste: document.querySelector('#selPreference').value,
                role: 'USER',
                social: 'LOCAL'
            };

            try {
                const response = await fetch("/user/LocalSignup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok) {
                    alert("가입 성공!");
                    location.href = "/login";
                } else {
                    alert(result.message || "가입 실패");
                }
            } catch (err) {
                alert("서버 오류가 발생했습니다.");
            }
        });
    }
});