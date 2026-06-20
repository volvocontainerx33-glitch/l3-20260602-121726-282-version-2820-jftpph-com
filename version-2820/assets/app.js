(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      const opened = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showHero(activeIndex + 1);
    }, 5600);
  }

  const filter = document.querySelector('[data-card-filter]');
  if (filter) {
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    filter.addEventListener('input', function () {
      const q = filter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.year || '',
          card.dataset.tags || '',
          card.dataset.genre || ''
        ].join(' ').toLowerCase();
        card.style.display = haystack.includes(q) ? '' : 'none';
      });
    });
  }

  const searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && Array.isArray(globalThis.SITE_MOVIES)) {
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').trim().toLowerCase();
    const empty = document.querySelector('.search-empty');
    const results = globalThis.SITE_MOVIES.filter(function (item) {
      if (!q) {
        return true;
      }
      return [item.title, item.year, item.genre, item.tags, item.category].join(' ').toLowerCase().includes(q);
    }).slice(0, 120);

    searchRoot.innerHTML = results.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-dot">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.year) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.line) + '</p>' +
        '<div class="tag-row">' + item.tags.split(',').slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag.trim()) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '</article>';
    }).join('');

    if (empty) {
      empty.style.display = results.length ? 'none' : 'block';
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const player = document.querySelector('[data-player]');
  const configNode = document.getElementById('movie-player-config');

  if (player && configNode) {
    const video = player.querySelector('video');
    const layer = player.querySelector('.player-layer');
    let config = {};

    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (err) {
      config = {};
    }

    function applyStream() {
      const stream = config.stream || '';
      if (!stream || !video) {
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        return video.play();
      }
      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        if (!video.__hlsReady) {
          const hls = new globalThis.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.__hlsReady = true;
        }
        return video.play();
      }
      return loadHls().then(function () {
        if (globalThis.Hls && globalThis.Hls.isSupported()) {
          const hls = new globalThis.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.__hlsReady = true;
          return new Promise(function (resolve) {
            hls.on(globalThis.Hls.Events.MANIFEST_PARSED, function () {
              resolve(video.play());
            });
          });
        }
      });
    }

    function loadHls() {
      return new Promise(function (resolve, reject) {
        if (globalThis.Hls) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    function start() {
      if (layer) {
        layer.classList.add('is-hidden');
      }
      applyStream().catch(function () {});
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  }
})();
