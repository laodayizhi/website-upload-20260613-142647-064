(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(active + 1);
            }, 5000);
        }
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    filterPanels.forEach(function(panel) {
        var container = panel.parentElement;
        var searchInput = panel.querySelector("[data-filter-search]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var scope = container ? container.querySelector("[data-filter-items]") : null;
        var items = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row")) : [];
        var emptyState = container ? container.querySelector("[data-empty-state]") : null;

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            items.forEach(function(item) {
                var searchable = normalize(item.getAttribute("data-search"));
                var itemYear = normalize(item.getAttribute("data-year"));
                var itemRegion = normalize(item.getAttribute("data-region"));
                var itemType = normalize(item.getAttribute("data-type"));
                var queryMatched = !query || searchable.indexOf(query) !== -1;
                var yearMatched = !year || itemYear === year;
                var regionMatched = !region || itemRegion === region;
                var typeMatched = !type || itemType === type;
                var matched = queryMatched && yearMatched && regionMatched && typeMatched;
                item.classList.toggle("is-filter-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0 && items.length > 0);
            }
        }

        [searchInput, yearSelect, regionSelect, typeSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();
