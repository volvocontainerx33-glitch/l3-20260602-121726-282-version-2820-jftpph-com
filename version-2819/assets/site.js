(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function uniqueValues(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return a.localeCompare(b, "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    document.querySelectorAll(".js-filter-scope").forEach(function (panel) {
      var section = panel.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var input = panel.querySelector(".js-filter-input");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));
      var clear = panel.querySelector(".js-filter-clear");
      var counter = panel.querySelector("[data-filter-count]");

      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter");
        fillSelect(select, uniqueValues(cards, key));
      });

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var active = {};
        selects.forEach(function (select) {
          active[select.getAttribute("data-filter")] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          Object.keys(active).forEach(function (key) {
            if (active[key] && card.getAttribute("data-" + key) !== active[key]) {
              matched = false;
            }
          });
          card.classList.toggle("is-filter-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = visible;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          apply();
        });
      }
      apply();
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function attachStream(video, source) {
    if (!source || video.getAttribute("data-stream-ready") === "true") {
      return;
    }
    video.setAttribute("data-stream-ready", "true");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = source;
  }

  function setupPlayers() {
    document.querySelectorAll(".js-player").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".play-overlay");
      var source = box.getAttribute("data-stream");
      if (!video || !overlay || !source) {
        return;
      }

      function startPlayback() {
        attachStream(video, source);
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
