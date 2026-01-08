import {LoadData} from './utils.js';

const heroContents = document.getElementById('heroSlideContent');
// 섹션1 데이터 뿌리기
const template1 = document.getElementById('Boxtype01');
// 섹션2 데이터 뿌리기
const template2 = document.getElementById('Boxtype02');
// GSAP ScrollTrigger 등록
gsap.registerPlugin(ScrollTrigger);
let mainSwiper;

document.addEventListener('DOMContentLoaded', function () {
    // 히어로 영역
    const heroSlideList = document.getElementById('heroSlideList');
    LoadData('/api/ramen/hero')
        .then((data) => {
            data.forEach((item) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';

                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.name;

                const slideTextDiv = document.createElement('div');
                slideTextDiv.className = 'slideText';
                const slideTitleDiv = document.createElement('div');
                slideTitleDiv.classList.add('slideTitle');
                slideTitleDiv.textContent = item.name;
                const slideDataDiv = document.createElement('div');
                slideDataDiv.innerHTML = '라멘 데이터';
                slideDataDiv.classList.add('modal');
                slideDataDiv.classList.add('heroData');
                slideDataDiv.setAttribute('data-id', item.id);

                slideDataDiv.addEventListener('click', (e) => {
                    e.preventDefault();
                    modalUp(item.id); // 모달 팝업 호출
                });

                slideTextDiv.appendChild(slideTitleDiv);
                slideTextDiv.appendChild(slideDataDiv);

                slide.appendChild(img);
                slide.appendChild(slideTextDiv);
                heroSlideList.appendChild(slide);
            });

            mainSwiper = new Swiper('.mainSlides', {
                loop: true,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                speed: 800,
            });
        })
        .catch((error) => {
            console.error('히어로 데이터 불러오기 실패:', error);
        });

    // 라멘 소개 영역1
    const section1 = document.querySelector('.section1');
    if (section1) {
        section1.addEventListener('click', function (e) {
            const btn = e.target.closest('.modal');
            if (!btn) return;

            e.preventDefault();
            const id = btn.getAttribute('data-id');
            modalUp(id);
        });
    }

    LoadData('/api/ramen/sect1')
        .then((data) => {
            data.forEach((ramenData, index) => {
                if (ramenData && template1) {
                    const clone =
                        template1.content.firstElementChild.cloneNode(true);

                    if (index % 2 !== 0) {
                        clone.classList.add('reverse');
                    }

                    clone.querySelector('.ramenTitle').textContent =
                        ramenData.name;
                    clone.querySelector('.subTitle').textContent =
                        ramenData.title;
                    clone.querySelector('.ramenText').textContent =
                        ramenData.info;
                    clone.querySelector(
                        '.price'
                    ).textContent = `▲ ${ramenData.name}`;
                    clone.querySelector('.shopIcon img').src = ramenData.image;
                    clone.querySelector('.shopIcon img').alt = ramenData.name;
                    clone
                        .querySelector('.modal')
                        .setAttribute('data-id', ramenData.id);

                    clone.querySelector('.btnShop a').href = `/shop?ramenId=${ramenData.id}`;

                    document.querySelector('.section1').appendChild(clone);
                }
            });

            // section1의 각 라멘 박스에 애니메이션 적용
            // document
            //     .querySelectorAll('.section1 .contentsBox')
            //     .forEach((box, idx) => {
            //         gsap.fromTo(
            //             box,
            //             { scale: 0.8, opacity: 0 },
            //             {
            //                 scale: 1,
            //                 opacity: 1,
            //                 duration: 0.7,
            //                 ease: 'power2.out',
            //                 scrollTrigger: {
            //                     trigger: box,
            //                     start: 'top 85%',
            //                     end: 'bottom 40%',
            //                     toggleActions: 'reverse play reverse play',
            //                     once: true, // 한 번만 실행
            //                 },
            //             }
            //         );
            //     });
        })
        .catch((error) => {
            console.error('데이터 불러오기 실패:', error);
        });

    // 라멘소개영역2 ( Feature ) 
    LoadData('/api/ramen/sect2')
        .then((data) => {
            // const ramenData = data.find((item) => item.id === "etc1");
            data.forEach((ramenData, index) => {
                if (ramenData && template2) {
                    // 템플릿 가져오기
                    const clone =
                        template2.content.firstElementChild.cloneNode(true);

                    // 데이터 삽입
                    clone.querySelector('.featureNum').textContent =
                        ramenData.name;
                    clone.querySelector('.subTitle').textContent =
                        ramenData.title;
                    clone.querySelector('.etcInfo').textContent =
                        ramenData.info;
                    clone.querySelector('.etcLeft img').src = ramenData.image;
                    clone.querySelector('.etcLeft img').alt = ramenData.title;

                    // 원하는 위치에 삽입
                    document.querySelector('.section2').appendChild(clone);
                }
            });

            // document
            //     .querySelectorAll('.section2 .feature')
            //     .forEach((box, idx) => {
            //         gsap.fromTo(
            //             box,
            //             {scale: 0.8, opacity: 0},
            //             {
            //                 scale: 1,
            //                 opacity: 1,
            //                 duration: 0.7,
            //                 ease: 'power2.out',
            //                 scrollTrigger: {
            //                     trigger: box,
            //                     start: 'top 85%',
            //                     end: 'bottom 40%',
            //                     toggleActions: 'reverse play reverse play',
            //                     once: true, // 한 번만 실행
            //                 },
            //             }
            //         );
            //     });
        })
        .catch((error) => {
            console.error('데이터 불러오기 실패:', error);
        });
});

// 기존의 중복된 이벤트 리스너 제거 (DOMContentLoaded 내부로 이동함)
function modalUp(id) {
    document.body.style.overflow = 'hidden';
    const modal = document.getElementById('modal');
    const modalTemp = document.getElementById('ramenPopup');
    if (!modal || !modalTemp) return;
    modal.innerHTML = '';
    const cloneTemp = modalTemp.content.firstElementChild.cloneNode(true);
    const modalWrap = cloneTemp.querySelector('.tempWrap');
    if (id) {
        modalData(id, cloneTemp);
    }
    // if (id.startsWith('RM')) {
    //     modalData(id, cloneTemp); // cloneTemp를 전달해서 팝업에 데이터 삽입
    // } else if (id.startsWith('HR')) {
    //     modalHeroData(id, cloneTemp); // cloneTemp를 전달해서 팝업에 데이터 삽입
    // }
    if (mainSwiper && mainSwiper.autoplay) {
        mainSwiper.autoplay.stop();
    }
    modal.style.zIndex = '9999';
    modalWrap.style.display = 'flex'; // 또는 block
    modal.appendChild(cloneTemp);

    gsap.fromTo(
        cloneTemp.querySelector('.tempWrap'),
        {scale: 0.7, opacity: 0, rotation: 8},
        {scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'power2.out'}
    );

    const closeBtn = cloneTemp.querySelector('.closeBtn');
    closeBtn.addEventListener('click', () => {
        modal.innerHTML = '';
        modal.style.zIndex = '-1';
        document.body.style.overflow = '';
        if (mainSwiper && mainSwiper.autoplay) {
            mainSwiper.autoplay.start();
        }
    });
}

// 모달데이터 뿌리기
let cachedPopData = null;
let cachedCateData = null;

function modalData(id, cloneTemp) {
    const dataPromise = (cachedPopData && cachedCateData)
        ? Promise.resolve([cachedPopData, cachedCateData]) // 이미 있다면 즉시 사용
        : Promise.all([                                    // 없다면 처음 한 번만 호출
            LoadData('/api/ramen/popup'),
            LoadData('/api/ramen/cate')
        ]);

    return dataPromise.then(([popData, cateData]) => {
        cachedPopData = popData;
        cachedCateData = cateData;
        let dataList = popData.find(
            (item) => String(item.id) === String(id)
        );
        if (!dataList) {
            return;
        }

        // 팝업 내부에 라멘 데이터를 삽입합니다.
        cloneTemp.querySelector('.tempRamenName').textContent =
            dataList.name;
        cloneTemp.querySelector(
            '.tempText .tempList .rightbox'
        ).textContent = dataList.soup;
        // 스프 농도
        const richnessList = cloneTemp.querySelector(
            '.tempText .richness .tempCircle'
        );
        richnessList.innerHTML = '';
        let richnessData = cateData.filter(
            (item) => item.type === 'richness'
        );
        richnessData.forEach((item) => {
            const richnessDiv = document.createElement('div'); // 수정!
            richnessDiv.dataset.id = item.id;
            if (item.id === dataList.richness) {
                richnessDiv.classList.add('active');
            }
            richnessList.appendChild(richnessDiv); // 부모에 추가
        });
        // 기름진 정도
        const richList = cloneTemp.querySelector(
            '.tempText .rich .tempCircle'
        );
        richList.innerHTML = '';
        let richData = cateData.filter((item) => item.type === 'rich');
        richData.forEach((item) => {
            const richDiv = document.createElement('div'); // 수정!
            richDiv.dataset.id = item.id;
            if (item.id === dataList.rich) {
                richDiv.classList.add('active');
            }
            richList.appendChild(richDiv); // 부모에 추가
        });
        // 면의 굵기
        const thicknessList = cloneTemp.querySelector(
            '.tempText .thickness .tempCircle'
        );
        thicknessList.innerHTML = '';
        let thicknessData = cateData.filter(
            (item) => item.type === 'thickness'
        );
        thicknessData.forEach((item) => {
            const thicknessDiv = document.createElement('div'); // 수정!
            thicknessDiv.dataset.id = item.id;
            if (item.id === dataList.thickness) {
                thicknessDiv.classList.add('active');
            }
            thicknessList.appendChild(thicknessDiv); // 부모에 추가
        });
    })
        .catch((error) => {
            console.error('데이터 불러오기 실패:', error);
        });
}

// 히어로 버튼
document.addEventListener('DOMContentLoaded', () => {

});
