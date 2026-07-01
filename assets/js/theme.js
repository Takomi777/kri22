// --- FUNKCJE DLA KARUZELI (Globalne, żeby HTML je widział) ---
window.manualScroll = function(id, distance) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollBy({ left: distance, behavior: 'smooth' });
    if (typeof window.pauseTrack === 'function') window.pauseTrack(id);
  }
};

const trackStates = {};

window.pauseTrack = function(trackId) {
  if (!trackStates[trackId]) return;
  trackStates[trackId].isPaused = true;
  clearTimeout(trackStates[trackId].resumeTimeout);
  // Wznowienie po 3 sekundach
  trackStates[trackId].resumeTimeout = setTimeout(() => {
    trackStates[trackId].isPaused = false;
  }, 3000);
};

// --- GŁÓWNA LOGIKA DOTYKU I PRZESUWANIA ---
document.addEventListener('DOMContentLoaded', () => {
  // Prędkości według Twoich wytycznych:
  const setups = [
    { id: 'track-1', speed: 2.0 }, // Górny pasek
    { id: 'track-2', speed: 2.5 }  // Dolny pasek
  ];

  setups.forEach(setup => {
    const slider = document.getElementById(setup.id);
    if (!slider) return;
    
    const container = slider.querySelector('.logo-scroll-container');
    if (!container) return;

    // Klonowanie logotypów, żeby pasek kręcił się w nieskończoność
    container.innerHTML += container.innerHTML + container.innerHTML;

    trackStates[setup.id] = {
      isPaused: false,
      resumeTimeout: null,
      isDown: false,
      startX: 0,
      scrollLeft: 0
    };

    const state = trackStates[setup.id];

    // --- IDENTYCZNA MECHANIKA DOTYKU DLA OBU PASKÓW ---
    const startAction = (e) => {
      state.isDown = true;
      state.isPaused = true;
      clearTimeout(state.resumeTimeout);
      state.startX = (e.pageX || (e.touches ? e.touches[0].pageX : 0)) - slider.offsetLeft;
      state.scrollLeft = slider.scrollLeft;
    };

    const endAction = () => {
      if (state.isDown) {
        state.isDown = false;
        window.pauseTrack(setup.id);
      }
    };

    const moveAction = (e) => {
      if (!state.isDown) return;
      const x = (e.pageX || (e.touches ? e.touches[0].pageX : 0)) - slider.offsetLeft;
      
      // ZWIĘKSZONA CZUŁOŚĆ DOTYKU NA TELEFONIE (z 1.5 na 2.5)
      // Dzięki temu pasek nie stawia oporu i reaguje szybciej na ruch palca
      const walk = (x - state.startX) * 2.5; 
      
      slider.scrollLeft = state.scrollLeft - walk;
    };

    // Nasłuchiwacze (Touch na telefony, Mouse na komputery)
    slider.addEventListener('mousedown', startAction);
    slider.addEventListener('touchstart', startAction, {passive: true});
    
    window.addEventListener('mouseup', endAction);
    slider.addEventListener('touchend', endAction);
    
    slider.addEventListener('mousemove', moveAction);
    slider.addEventListener('touchmove', moveAction, {passive: true});

    // Pętla auto-przesuwania
    function step() {
      if (!state.isPaused && !state.isDown) {
        slider.scrollLeft += setup.speed;
        if (slider.scrollLeft >= (slider.scrollWidth / 3) * 2) {
          slider.scrollLeft = slider.scrollWidth / 3;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // --- Przycisk "Do góry" ---
  const backTop = document.querySelector(".back-to-top");
  if (backTop) {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        backTop.style.visibility = window.scrollY > 400 ? 'visible' : 'hidden';
      });
    });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Fancybox Init ---
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind('[data-fancybox="gallery"]', {});    
  }
});

// --- ŁADOWANIE STRONY (AOS, WOW, Loader) ---
window.addEventListener('load', () => {
  if (typeof AOS !== "undefined") AOS.init(); 
  if (typeof WOW !== "undefined") new WOW().init();
  
  // Ukrycie loadera
  setTimeout(() => {
    if (typeof jQuery !== 'undefined') {
      $('.loader-container').fadeOut();
    } else {
      const loader = document.querySelector('.loader-container');
      if(loader) loader.style.display = 'none';
    }
  }, 200);
});

// --- OWL CAROUSEL & ISOTOPE ---
if (typeof jQuery !== 'undefined') {
  $(function() {
    if ($(".hero-carousel").length) {
      $(".hero-carousel").owlCarousel({
        items: 1, nav: true, loop: true, autoplay: true, autoplayTimeout: 5000,
        navText: ["<span class='mai-chevron-back'></span>", "<span class='mai-chevron-forward'></span>"]
      });
    }

    if ($(".team-carousel").length) {
      $(".team-carousel").owlCarousel({
        margin: 16,
        responsive: { 0: { items: 1 }, 600: { items: 2 }, 800: { items: 3 } }
      });
    }

    if ($(".testimonial-carousel").length) {
      $(".testimonial-carousel").owlCarousel({
        responsive: { 0: { items: 1, margin: 16 }, 768: { items: 2, margin: 24 }, 992: { items: 3, margin: 24 } }
      });
    }

    // Isotope z minimalnym opóźnieniem, żeby ramka zdjęć nie zasłoniła Twojej karuzeli
    setTimeout(function() {
      if ($('.grid').length) {
        var $grid = $('.grid');
        $grid.isotope({
          itemSelector: '.grid-item',
          layoutMode: 'fitRows'
        });

        $('.filterable-btn').on('click', 'button', function() {
          var filterValue = $(this).attr('data-filter');
          $(this).toggleClass('active').siblings().removeClass('active');
          $grid.isotope({ filter: filterValue });
        });

        // Start domyślnej kategorii
        $('.filterable-btn button[data-filter=".1"]').trigger('click');
      }
    }, 500);
  });
}