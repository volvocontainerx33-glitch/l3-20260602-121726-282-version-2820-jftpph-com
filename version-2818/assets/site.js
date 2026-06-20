(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('open') ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const thumbs = Array.from(document.querySelectorAll('[data-hero-thumb]'));
  let activeSlide = 0;
  let heroTimer = null;

  const activateSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    thumbs.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('is-active', thumbIndex === activeSlide);
    });
  };

  const startHero = () => {
    if (slides.length <= 1) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => {
      activateSlide(activeSlide + 1);
    }, 5600);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      activateSlide(index);
      startHero();
    });
  });

  activateSlide(0);
  startHero();

  const heroSearch = document.querySelector('[data-hero-search]');

  if (heroSearch) {
    heroSearch.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = heroSearch.querySelector('input');
      const value = input ? input.value.trim() : '';
      const url = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
      window.location.href = url;
    });
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const searchInput = filterRoot.querySelector('[data-filter-search]');
    const regionSelect = filterRoot.querySelector('[data-filter-region]');
    const typeSelect = filterRoot.querySelector('[data-filter-type]');
    const yearSelect = filterRoot.querySelector('[data-filter-year]');
    const cards = Array.from(filterRoot.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    const applyFilters = () => {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();

        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedRegion = !region || card.dataset.region === region;
        const matchedType = !type || card.dataset.type === type;
        const matchedYear = !year || card.dataset.year === year;

        card.classList.toggle('is-hidden', !(matchedKeyword && matchedRegion && matchedType && matchedYear));
      });
    };

    [searchInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const toggle = player.querySelector('[data-player-toggle]');
    const source = player.getAttribute('data-src');
    let loaded = false;
    let hlsInstance = null;

    const loadVideo = () => {
      if (!video || !source || loaded) {
        return;
      }

      loaded = true;

      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    };

    const playVideo = () => {
      loadVideo();

      if (video) {
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {});
        }
      }
    };

    if (toggle) {
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        playVideo();
      });
    }

    player.addEventListener('click', (event) => {
      if (event.target.closest('button')) {
        return;
      }

      playVideo();
    });

    if (video) {
      video.addEventListener('play', () => {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', () => {
        player.classList.remove('is-playing');
      });

      video.addEventListener('ended', () => {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
