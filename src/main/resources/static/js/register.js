// register.js

let isUidOk = false;
let isPassOk1 = false;
let isPassOk2 = false;
let isEmailOk = false;
let isNickNameOk = false;

// 정규 표현식
const reUid = /^[a-z]+[a-z0-9]{4,10}$/; // 아이디 정규식
const rePass =
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{5,15}$/; // 비밀번호 정규식
const reEmail =
  /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i; // 이메일 정규식

// 아이디 검사 함수
const checkUid = () => {
  const uid = document.querySelector('#userName').value;
  const msgUid = document.querySelector('#userNameMsg');
  if (uid === '') {
    msgUid.textContent = '';
    isUidOk = false;
  } else if (reUid.test(uid)) {
    isUidOk = true;
    msgUid.textContent = '사용할 수 있는 아이디입니다.';
    msgUid.style.color = 'green';
  } else {
    isUidOk = false;
    msgUid.textContent = '아이디는 5~20자의 영문 및 숫자만 가능합니다.';
    msgUid.style.color = 'red';
  }
};

// 비밀번호 검사 함수
const checkPassword = () => {
  const pass1 = document.querySelector('#userPassword').value;
  const pass2 = document.querySelector('#userPasswordCheck').value;
  const msgPass = document.querySelector('#passwordCheckMsg');

  if (pass1 === '') {
    msgPass.textContent = '';
    isPassOk1 = false;
    return;
  }
  if (rePass.test(pass1)) {
    isPassOk1 = true;
    msgPass.textContent = '사용할 수 있는 비밀번호입니다.';
    msgPass.style.color = 'green';
  } else {
    isPassOk1 = false;
    msgPass.textContent =
      '비밀번호는 5~16자 영문, 숫자, 특수문자가 포함되어야 합니다.';
    msgPass.style.color = 'red';
    return;
  }

  if (pass1 === pass2) {
    isPassOk2 = true;
    msgPass.textContent = '비밀번호가 일치합니다.';
    msgPass.style.color = 'green';
  } else {
    isPassOk2 = false;
    msgPass.textContent = '비밀번호가 일치하지 않습니다.';
    msgPass.style.color = 'red';
  }
};

// 이메일 검사 함수
const checkEmail = () => {
  const email = document.querySelector('#userEmail').value;
  const msgEmail = document.querySelector('#emailMsg');
  if (email === '') {
    msgEmail.textContent = '';
    isEmailOk = false;
  } else if (reEmail.test(email)) {
    isEmailOk = true;
    msgEmail.textContent = '유효한 이메일입니다.';
    msgEmail.style.color = 'green';
  } else {
    isEmailOk = false;
    msgEmail.textContent = '유효한 이메일 형식이 아닙니다.';
    msgEmail.style.color = 'red';
  }
};

// 닉네임 검사 함수
const checkNickName = () => {
  const nickName = document.querySelector('#nickName').value;
  const msgNickName = document.querySelector('#nickNameMsg');
  if (nickName === '') {
    msgNickName.textContent = '';
    isNickNameOk = false;
  } else {
    isNickNameOk = true;
    msgNickName.textContent = '사용할 수 있는 닉네임입니다.';
    msgNickName.style.color = 'green';
  }
};

// 각 입력 필드의 이벤트 리스너
document.querySelector('#userName').addEventListener('input', checkUid);
document
  .querySelector('#userPassword')
  .addEventListener('input', checkPassword);
document
  .querySelector('#userPasswordCheck')
  .addEventListener('input', checkPassword);
document.querySelector('#userEmail').addEventListener('input', checkEmail);
document.querySelector('#nickName').addEventListener('input', checkNickName);
