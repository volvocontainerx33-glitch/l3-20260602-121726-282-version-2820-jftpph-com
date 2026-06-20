(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    var slides = selectAll(".hero-slide");
    var dots = selectAll(".hero-dot");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 4600);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startSlider();
        });
    });

    startSlider();

    selectAll(".category-filter").forEach(function (form) {
        var input = form.querySelector("input");
        var select = form.querySelector("select");
        var grid = document.querySelector(".category-movie-grid");
        var cards = grid ? selectAll(".movie-card", grid) : [];

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var type = select ? select.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                var cardType = card.getAttribute("data-type") || "";
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !type || cardType.indexOf(type) !== -1;
                var matched = matchedKeyword && matchedType;

                card.classList.toggle("is-filter-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (grid) {
                var old = grid.querySelector(".empty-state");
                if (old) {
                    old.remove();
                }
                if (!visible) {
                    var empty = document.createElement("div");
                    empty.className = "empty-state";
                    empty.textContent = "没有找到匹配内容，试试换个关键词。";
                    grid.appendChild(empty);
                }
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (select) {
            select.addEventListener("change", applyFilter);
        }
    });

    function cardTemplate(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + movie.url + "\" class=\"movie-card-link\">",
            "<div class=\"movie-thumb\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"movie-region\">" + escapeHtml(movie.region) + "</span></div>",
            "<div class=\"movie-card-body\"><h2>" + escapeHtml(movie.title) + "</h2><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"movie-meta\"><span>" + escapeHtml(movie.genre) + "</span><span>" + escapeHtml(movie.year) + "</span></div></div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    var searchInput = document.getElementById("site-search-input");
    var searchType = document.getElementById("site-search-type");
    var results = document.getElementById("search-results");
    var searchTitle = document.getElementById("search-title");
    var searchSubtitle = document.getElementById("search-subtitle");

    function runSearch() {
        if (!searchInput || !results || !window.SITE_MOVIES) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        var type = searchType ? searchType.value : "";
        var items = window.SITE_MOVIES.filter(function (movie) {
            var text = [movie.title, movie.oneLine, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.category].join(" ").toLowerCase();
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !type || movie.type.indexOf(type) !== -1;
            return matchedKeyword && matchedType;
        }).slice(0, 80);

        if (searchTitle) {
            searchTitle.textContent = keyword ? "搜索结果" : "推荐浏览";
        }
        if (searchSubtitle) {
            searchSubtitle.textContent = keyword ? "点击影片卡片进入详情页。" : "可直接查看下方精选内容，或使用搜索框定位影片。";
        }
        if (!items.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容，试试换个关键词。</div>";
            return;
        }
        results.innerHTML = items.map(cardTemplate).join("");
    }

    if (searchInput && results) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        searchInput.value = query;
        searchInput.addEventListener("input", runSearch);
        if (searchType) {
            searchType.addEventListener("change", runSearch);
        }
        runSearch();
    }
})();
