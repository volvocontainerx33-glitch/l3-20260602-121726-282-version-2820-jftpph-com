(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function restart() {
        window.clearInterval(timer);
        start();
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      show(0);
      start();
    }

    function filterGrid(targetSelector, keyword, year) {
      var grid = document.querySelector(targetSelector);
      if (!grid) {
        return;
      }
      var text = (keyword || "").trim().toLowerCase();
      var yearValue = (year || "").trim();
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-card"));
      cards.forEach(function (card) {
        var searchable = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
        var raw = card.getAttribute("data-tags") || card.textContent || "";
        var haystack = (searchable + " " + raw).toLowerCase();
        var cardYear = card.getAttribute("data-year") || raw;
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = !yearValue || String(cardYear).indexOf(yearValue) !== -1;
        card.classList.toggle("is-hidden-card", !(matchText && matchYear));
      });
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    searchInputs.forEach(function (input) {
      var target = input.getAttribute("data-target") || ".movie-grid";
      var yearSelect = document.querySelector('.year-filter[data-target="' + target + '"]');
      var params = new URLSearchParams(window.location.search);
      if (input.getAttribute("data-query-param") && params.get(input.getAttribute("data-query-param"))) {
        input.value = params.get(input.getAttribute("data-query-param"));
      }
      function run() {
        filterGrid(target, input.value, yearSelect ? yearSelect.value : "");
      }
      input.addEventListener("input", run);
      if (yearSelect) {
        yearSelect.addEventListener("change", run);
      }
      run();
    });
  });
})();
