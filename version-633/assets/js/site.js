(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupImageFallbacks() {
        var images = document.querySelectorAll('img');
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                var parent = image.parentElement;
                if (!parent) {
                    return;
                }
                var fallback = parent.querySelector('.poster-fallback');
                if (fallback) {
                    image.style.display = 'none';
                    fallback.hidden = false;
                }
            }, { once: true });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var grids = document.querySelectorAll('[data-filter-grid]');
        grids.forEach(function (grid) {
            var scope = grid.closest('main') || document;
            var input = scope.querySelector('[data-filter-input]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var emptyState = scope.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            function applyFilter() {
                var keyword = normalize(input ? input.value : '');
                var year = normalize(yearSelect ? yearSelect.value : '');
                var type = normalize(typeSelect ? typeSelect.value : '');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre
                    ].join(' '));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesYear = !year || normalize(card.dataset.year) === year;
                    var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1 || normalize(card.dataset.genre).indexOf(type) !== -1;
                    var isVisible = matchesKeyword && matchesYear && matchesType;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visibleCount !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', applyFilter);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', applyFilter);
            }
            applyFilter();
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll('[data-player]');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var overlay = player.querySelector('[data-player-overlay]');
            var message = player.querySelector('[data-player-message]');
            var source = player.getAttribute('data-src');
            var hlsInstance = null;
            var initialized = false;

            if (!video || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function initializePlayer() {
                if (initialized) {
                    return Promise.resolve();
                }
                initialized = true;
                setMessage('正在连接播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        maxBufferLength: 30
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('播放源已就绪。');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源连接失败，请刷新页面或稍后再试。');
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                            initialized = false;
                        }
                    });
                    return Promise.resolve();
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setMessage('浏览器已使用原生 HLS 播放。');
                    return Promise.resolve();
                }

                setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或移动浏览器访问。');
                return Promise.reject(new Error('HLS is not supported'));
            }

            function playVideo() {
                initializePlayer().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
                        });
                    }
                }).catch(function () {});
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupImageFallbacks();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
