(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".nav-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-slide") || 0);
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
            var scope = panel.parentElement.querySelector(".filter-scope");
            if (!scope) {
                return;
            }
            var input = panel.querySelector("input[type='search']");
            var select = panel.querySelector("select");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var region = normalize(select ? select.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
                    card.style.display = okKeyword && okRegion ? "" : "none";
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
        });
    }

    function setupPlayer() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (root) {
            var video = root.querySelector("video");
            var overlay = root.querySelector(".player-overlay");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var attached = false;
            var hlsInstance = null;

            function attach() {
                if (attached || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                attached = true;
            }

            function play() {
                attach();
                root.classList.add("is-playing");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        root.classList.remove("is-playing");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }

            video.addEventListener("play", function () {
                root.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    root.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                root.classList.remove("is-playing");
            });

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
