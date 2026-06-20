document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot') || 0);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeChip = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function activeQuery() {
    for (var i = 0; i < filterInputs.length; i += 1) {
      if (filterInputs[i].value.trim()) {
        return filterInputs[i].value.trim();
      }
    }

    return '';
  }

  function applyFilters() {
    var query = normalize(activeQuery());
    var chip = normalize(activeChip);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-keywords'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre')
      ].join(' '));
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedChip = !chip || text.indexOf(chip) !== -1;
      var matched = matchedQuery && matchedChip;

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0 && cards.length > 0);
    }
  }

  if (filterInputs.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      filterInputs.forEach(function (input) {
        input.value = initialQuery;
      });
    }

    filterInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        filterInputs.forEach(function (otherInput) {
          if (otherInput !== input) {
            otherInput.value = input.value;
          }
        });
        applyFilters();
      });
    });
  }

  chips.forEach(function (chipButton) {
    chipButton.addEventListener('click', function () {
      activeChip = chipButton.getAttribute('data-filter-chip') || '';
      chips.forEach(function (button) {
        button.classList.toggle('is-active', button === chipButton);
      });
      applyFilters();
    });
  });

  applyFilters();

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 560);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
