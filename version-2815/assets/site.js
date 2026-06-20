const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
  const toggle = qs('[data-nav-toggle]');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });
}

function setupHeroCarousel() {
  const carousel = qs('[data-hero-carousel]');
  if (!carousel) return;
  const slides = qsa('[data-hero-slide]', carousel);
  const dots = qsa('[data-hero-dot]', carousel);
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  if (slides.length > 1) {
    window.setInterval(() => show(index + 1), 5600);
  }
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function setupLocalFilters() {
  qsa('[data-filter-scope]').forEach((scope) => {
    const input = qs('[data-filter-input]', scope);
    const yearFilter = qs('[data-year-filter]', scope);
    const sortSelect = qs('[data-sort-select]', scope);
    const list = qs('[data-card-list]') || scope.parentElement.querySelector('[data-card-list]');
    if (!list) return;

    const cards = qsa('.movie-card', list);

    function apply() {
      const keyword = normalize(input ? input.value : '');
      const yearValue = yearFilter ? yearFilter.value : '';
      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
      });

      if (sortSelect) {
        const visibleCards = cards.slice().sort((a, b) => {
          if (sortSelect.value === 'score-desc') {
            return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
          }
          if (sortSelect.value === 'title-asc') {
            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        visibleCards.forEach((card) => list.appendChild(card));
      }
    }

    [input, yearFilter, sortSelect].filter(Boolean).forEach((control) => {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  });
}

function cardTemplate(movie) {
  const tags = String(movie.tags || '')
    .split(/[，,、/]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');

  return `
    <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${movie.year}" data-region="${escapeHtml(movie.region)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml(movie.tags)}" data-score="${movie.hotScore}">
      <a class="poster-frame" href="${movie.href}" aria-label="${escapeHtml(movie.title)}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="year-badge">${movie.year}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line"><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.type)}</span></div>
        <h3><a href="${movie.href}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function setupGlobalSearch() {
  const input = qs('#global-search-input');
  const button = qs('#global-search-button');
  const results = qs('#global-search-results');
  const count = qs('#global-search-count');
  if (!input || !button || !results) return;

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  let movies = [];
  try {
    const response = await fetch('./assets/movies.json');
    movies = await response.json();
  } catch (error) {
    count.textContent = '搜索数据加载失败，请通过分类页浏览。';
    return;
  }

  function runSearch() {
    const keyword = normalize(input.value);
    const matches = movies
      .filter((movie) => normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(' ')).includes(keyword))
      .sort((a, b) => Number(b.year) - Number(a.year) || Number(b.hotScore) - Number(a.hotScore))
      .slice(0, 200);

    results.innerHTML = matches.map(cardTemplate).join('');
    count.textContent = keyword ? `找到 ${matches.length} 条相关影片` : '默认展示近期更新影片';
  }

  button.addEventListener('click', runSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') runSearch();
  });
  if (initialQuery) runSearch();
}

setupNavigation();
setupHeroCarousel();
setupLocalFilters();
setupGlobalSearch();
