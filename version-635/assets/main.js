(function() {
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      const open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function(carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    let index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        show(index + 1);
      }, 5000);
    }
  });

  document.querySelectorAll(".searchable-section, .search-panel").forEach(function(section) {
    const input = section.querySelector(".js-search-input");
    const grid = section.querySelector("[data-card-grid]") || document;
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const chips = Array.from(section.querySelectorAll(".filter-chip"));
    let chipValue = "";

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function applyFilter() {
      const query = input ? normalize(input.value) : "";
      const selected = normalize(chipValue);
      cards.forEach(function(card) {
        const text = cardText(card);
        const queryMatch = !query || text.includes(query);
        const chipMatch = !selected || text.includes(selected);
        card.classList.toggle("is-hidden-card", !(queryMatch && chipMatch));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chipValue = chip.getAttribute("data-filter") || "";
        chips.forEach(function(item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilter();
      });
    });
  });
}());
