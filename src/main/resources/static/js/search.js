document.addEventListener('DOMContentLoaded', () => {
  const newsWrapper = document.querySelector('#newsWrapper .wrapperContent');
  const regionWrapper = document.querySelector('#regionWrapper .wrapperContent');
  const originWrapper = document.querySelector('#originWrapper .wrapperContent');

  loadAndRender('/data/news.json', newsWrapper, renderNews);
  loadAndRender('/data/shopdata.json', regionWrapper, renderShop);
  loadAndRender('/data/board.json', originWrapper, renderBoard);



  async function loadAndRender(jsonPath, wrapper, renderFn) {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
      const data = await response.json();
      renderFn(data, wrapper);
    } catch (err) {
      wrapper.innerHTML = '<p>데이터를 불러올 수 없습니다.</p>';
    }
  }

  function renderNews(data, target) {
    const items = data.slice(0, 3);
    let html = '<ul class="news-list">';
    items.forEach((item, index) => {
      html += `
        <li class="news-item">
          <span class="item-index">${index + 1}.</span>
          <a href="${item.links}" target="_blank" class="item-title">${item.title}</a>
          <span class="item-tag">[${item.tags}]</span>
        </li>
      `;
    });
    html += '</ul>';
    target.innerHTML = html;
  }

  function renderShop(data, target) {
    const items = data.slice(0, 3);
    let html = '<ul class="region-list">';
    items.forEach((item, index) => {
      const firstLine = item.content ? item.content.split('\n')[0] : '(내용 없음)';
      html += `
        <li class="region-item">
          <img src="${item.imageURL}" alt="${item.name}" class="item-image" />
          <div class="item-text">
            <div class="item-top">
              <span class="item-index">${index + 1}.</span>
              <span class="item-title">${item.name}</span>
              <span class="item-category">${item.category ?? '분류 없음'}</span>
            </div>
            <div class="item-content">${firstLine}</div>
            <div class="item-link-wrapper">
              <a href="${item.siteURL}" target="_blank" class="item-link">사이트 바로가기</a>
            </div>
          </div>
        </li>
      `;
    });
    html += '</ul>';
    target.innerHTML = html;
  }

  function renderBoard(data, target) {
    const filtered = data.filter(item => item.type?.startsWith('A')).slice(0, 3);
    let html = '<ul class="origin-list">';
    filtered.forEach((item, index) => {
      html += `
        <li class="origin-item">
          <span class="item-index">${index + 1}.</span>
          <span class="item-title">${item.title}</span>
          <span class="item-user">${item.user}</span>
          <span class="item-date">${item.creatAt}</span>
        </li>
      `;
    });
    html += '</ul>';
    target.innerHTML = html;
  }
});
