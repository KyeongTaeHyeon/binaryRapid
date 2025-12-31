import { LoadData } from './utils.js';
let contentsList = [];
const tabBtns = document.getElementById('tabLists');
const contentsWrapper = document.getElementById('contentsWrapper');

/* 유래내용 불러오도록 설정 */
document.addEventListener('DOMContentLoaded', () => {
    LoadData('/data/origin.json').then((data) => {
        contentsList = data;
        showTabButtons();
        showTabContents();
    });
});

let showTabButtons = () => {
    if (!tabBtns) return;
    // 유래 내용별 버튼 생성
    let idList = [];
    const buttonList = contentsList
        .map((content) => {
            if (!idList.includes(content.id)) {
                idList.push(content.id);
                if (idList.length == 1) {
                    return `<button class="tabBtn active" data-tab="tab${content.id}">${content.header}</button>`;
                } else {
                    return `<button class="tabBtn" data-tab="tab${content.id}">${content.header}</button>`;
                }
            }
        })
        .filter(Boolean);

    tabBtns.innerHTML = buttonList.join('');

    // 버튼별 내용 표현 관련 이벤트 추가
    document.querySelectorAll('.tabBtn').forEach((btn) => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tabContent.active').forEach((c) => {
                gsap.to(c, {
                    opacity: 0,
                    x: -50,
                    duration: 0.3,
                    onComplete: () => {
                        c.classList.remove('active');
                        c.style.opacity = '';
                        c.style.transform = '';
                    },
                });
            });

            // 버튼 active 처리
            document
                .querySelectorAll('.tabBtn')
                .forEach((b) => b.classList.remove('active'));
            this.classList.add('active');

            // 새 탭 내용 애니메이션 (등장)
            const newTab = document.getElementById(this.dataset.tab);
            newTab.classList.add('active');
            gsap.fromTo(
                newTab,
                { opacity: 0, x: 50 },
                { opacity: 1, x: 0, duration: 0.4 }
            );
        });
    });
};

let showTabContents = () => {
    if (!contentsWrapper) return;
    // 유래내용 표현부분 관련 생성
    contentsWrapper.innerHTML = ''; // Clear existing content
    if (contentsList.length === 0) {
        contentsWrapper.innerHTML = '<p>No content available.</p>';
        return;
    }

    let idList = [];
    contentsList.forEach((content) => {
        if (idList.includes(content.id)) {
            const existingContent = document.getElementById(`tab${content.id}`);
            existingContent.innerHTML += `
                <h2>${content.title}</h2>
                <ul>
                    ${content.description
                        .map((desc) => `<li>${desc}</li>`)
                        .join('')}
                </ul>
            `;
            contentsWrapper.appendChild(existingContent);
        } else {
            const tabContent = document.createElement('div');
            tabContent.id = `tab${content.id}`;
            tabContent.className = 'tabContent';
            if (content.id === 1) {
                tabContent.classList.add('active');
            }
            idList.push(content.id);
            tabContent.innerHTML = `
            <h2>${content.title}</h2>
            <ul>
                ${content.description
                    .map((desc) => `<li>${desc}</li>`)
                    .join('')}
            </ul>
        `;
            contentsWrapper.appendChild(tabContent);
        }
    });
};
