const checkDupleBtn = document.getElementById('btnIdDupCheck');
const checkDupleName = document.getElementById('userName');

// localStorege에 닮긴 유저 이름 비교를 위해 선언한 변수
let userName = null;

// 유저 아이디 중복 체크를 위한 함수
const regCheckDuplicate = () => {
  const checkDName = checkDupleName.value;
  const checkLocalName = localStorage.getItem('userRegistForm');
  const msgUid = document.querySelector('#userNameMsg');

  if (checkLocalName) {
    const parseData = JSON.parse(checkLocalName);
    userName = parseData.userName;
  } else {
    console.log('로컬 스토리지에 데이터 존재하지 않음;;;;');
  }

  if (userName.trim() === checkDName.trim()) {
    msgUid.textContent =
      '이미 존재하는 아이디입니다. 새로운 아이디를 작성해 주세요.';
    msgUid.style.color = 'red';
    isUidOk = false;
  } else {
    msgUid.textContent = '중복되지 않는 아이디입니다.';
    msgUid.style.color = 'green';
    isUidOk = true;
  }
};

checkDupleBtn.addEventListener('click', regCheckDuplicate);
