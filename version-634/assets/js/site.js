(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var opened = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));

    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle('is-active', idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === current);
        });
      };

      dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () {
          showSlide(idx);
        });
      });

      window.setInterval(function () {
        showSlide(current + 1);
      }, 5500);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-list .movie-card'));
    var activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = '';
      searchInputs.forEach(function (input) {
        if (input.value.trim()) {
          query = input.value.trim();
        }
      });
      var needle = normalize(query);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchesText = !needle || haystack.indexOf(needle) !== -1;
        var matchesFilter = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
    });

    Array.prototype.slice.call(document.querySelectorAll('.filter-chip')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var group = chip.parentElement;
        Array.prototype.slice.call(group.querySelectorAll('.filter-chip')).forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });

    var player = document.getElementById('main-player');
    var overlay = document.getElementById('player-overlay');
    var hlsInstance = null;

    function activatePlayer() {
      if (!player || !window.__player || !window.__player.url) {
        return;
      }

      var url = window.__player.url;

      if (!player.getAttribute('src') && !hlsInstance) {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.setAttribute('src', url);
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(player);
        } else {
          player.setAttribute('src', url);
        }
      }

      player.setAttribute('controls', 'controls');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = player.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', activatePlayer);
    }

    if (player) {
      player.addEventListener('click', function () {
        if (player.paused) {
          activatePlayer();
        }
      });
    }
  });
})();
