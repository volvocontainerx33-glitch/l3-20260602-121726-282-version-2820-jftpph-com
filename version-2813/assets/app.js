(function () {
    var menu = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menu && mobileNav) {
        menu.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var carousel = document.querySelector("[data-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    var filterInput = document.querySelector(".movie-filter-input");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-select"));
    var filterRoot = document.querySelector(".filterable");
    var filterItems = filterRoot ? Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card, .rank-row")) : [];

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function matchItem(item, text, filters) {
        var haystack = normalize([
            item.dataset.title,
            item.dataset.year,
            item.dataset.region,
            item.dataset.type,
            item.dataset.genre
        ].join(" "));

        if (text && haystack.indexOf(text) === -1) {
            return false;
        }

        return Object.keys(filters).every(function (key) {
            if (!filters[key]) {
                return true;
            }
            return normalize(item.dataset[key]).indexOf(filters[key]) !== -1;
        });
    }

    function applyFilter() {
        if (!filterItems.length) {
            return;
        }

        var text = normalize(filterInput ? filterInput.value : "");
        var filters = {};
        filterSelects.forEach(function (select) {
            filters[select.dataset.filter] = normalize(select.value);
        });

        filterItems.forEach(function (item) {
            item.classList.toggle("hidden", !matchItem(item, text, filters));
        });
    }

    if (filterInput) {
        var q = getQueryParam("q");
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener("input", applyFilter);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
    });

    applyFilter();
}());
