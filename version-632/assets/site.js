(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                play();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function setupFilters() {
        selectAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var category = panel.querySelector('[data-filter-category]');
            var scope = panel.parentElement || document;
            var cards = selectAll('.movie-card[data-title]', scope);
            var empty = panel.querySelector('[data-empty-result]');

            function valueOf(element) {
                return element ? element.value.trim() : 'all';
            }

            function apply() {
                var text = valueOf(input).toLowerCase();
                var selectedRegion = valueOf(region);
                var selectedType = valueOf(type);
                var selectedCategory = valueOf(category);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-category') || ''
                    ].join(' ').toLowerCase();
                    var okText = !text || haystack.indexOf(text) !== -1;
                    var okRegion = selectedRegion === 'all' || card.getAttribute('data-region') === selectedRegion;
                    var okType = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
                    var okCategory = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
                    var ok = okText && okRegion && okType && okCategory;
                    card.classList.toggle('hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, region, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector('[data-player]');
        var overlay = document.querySelector('[data-play-overlay]');
        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.getAttribute('src') !== streamUrl) {
                    video.setAttribute('src', streamUrl);
                }
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video.__hlsInstance) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    video.__hlsInstance = hls;
                }
                return Promise.resolve();
            }
            if (video.getAttribute('src') !== streamUrl) {
                video.setAttribute('src', streamUrl);
            }
            return Promise.resolve();
        }

        function start() {
            attach().then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playAttempt = video.play();
                if (playAttempt && typeof playAttempt.catch === 'function') {
                    playAttempt.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
