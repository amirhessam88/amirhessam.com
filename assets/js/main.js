!(function ($) {
  "use strict";

  // Cache busting functionality
  function initCacheBuster() {
    // Get version from server
    fetch('assets/php/version.php')
      .then(response => response.json())
      .then(data => {
        window.CACHE_VERSION = data.version;

        // Update all images with cache busting
        $('img').each(function () {
          const $img = $(this);
          const src = $img.attr('src');
          if (src && !src.includes('v=')) {
            $img.attr('src', src + (src.includes('?') ? '&' : '?') + 'v=' + data.version);
          }
        });

        // Update background images
        $('[style*="background-image"]').each(function () {
          const $el = $(this);
          const style = $el.attr('style');
          if (style && style.includes('url(') && !style.includes('v=')) {
            const newStyle = style.replace(/url\(['"]?([^'"]+)['"]?\)/g, function (match, url) {
              const separator = url.includes('?') ? '&' : '?';
              return `url(${url}${separator}v=${data.version})`;
            });
            $el.attr('style', newStyle);
          }
        });
      })
      .catch(error => {
        console.log('Cache busting: Using fallback version');
        // Fallback to timestamp-based version
        const version = Date.now();
        $('img').each(function () {
          const $img = $(this);
          const src = $img.attr('src');
          if (src && !src.includes('v=')) {
            $img.attr('src', src + (src.includes('?') ? '&' : '?') + 'v=' + version);
          }
        });
      });
  }

  // Initialize cache busting when DOM is ready
  $(document).ready(function () {
    initCacheBuster();
  });

  // Hero typed
  if ($('.typed').length) {
    var typed_strings = $(".typed").data('typed-items');
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  // Smooth scroll for the navigation menu and links with .scrollto classes
  $(document).on('click', '.nav-menu a, .scrollto', function (e) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      e.preventDefault();
      var target = $(this.hash);
      if (target.length) {

        var scrollto = target.offset().top;

        $('html, body').animate({
          scrollTop: scrollto
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu, .mobile-nav').length) {
          $('.nav-menu .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
        }
        return false;
      }
    }
  });

  $(document).on('click', '.mobile-nav-toggle', function (e) {
    $('body').toggleClass('mobile-nav-active');
    $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
  });

  $(document).click(function (e) {
    var container = $(".mobile-nav-toggle");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      if ($('body').hasClass('mobile-nav-active')) {
        $('body').removeClass('mobile-nav-active');
        $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.nav-menu, #mobile-nav');

  $(window).on('scroll', function () {
    var cur_pos = $(this).scrollTop() + 10;

    nav_sections.each(function () {
      var top = $(this).offset().top,
        bottom = top + $(this).outerHeight();

      if (cur_pos >= top && cur_pos <= bottom) {
        if (cur_pos <= bottom) {
          main_nav.find('li').removeClass('active');
        }
        main_nav.find('a[href="#' + $(this).attr('id') + '"]').parent('li').addClass('active');
      }
      if (cur_pos < 200) {
        $(".nav-menu ul:first li:first").addClass('active');
      }
    });
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function () {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // Load citation metrics: show cached data immediately, refresh in background if stale
  function fetchCounts() {
    loadCachedStats()
      .then(function (data) {
        updateCounts(data);
        if (isStatsStale(data)) {
          refreshStatsInBackground();
        }
      })
      .catch(function () {
        // Embedded HTML values are already visible; nothing else to do
      });
  }

  function loadCachedStats() {
    const jsonPaths = [
      'assets/data/stats.json',
      './assets/data/stats.json',
      '/assets/data/stats.json'
    ];

    return tryJsonPaths(jsonPaths, 0);
  }

  function tryJsonPaths(paths, index) {
    if (index >= paths.length) {
      return Promise.reject(new Error('No stats.json found'));
    }

    const cacheBuster = '?t=' + Date.now();
    return fetch(paths[index] + cacheBuster, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Stats file not found');
        }
        return response.json();
      })
      .catch(function () {
        return tryJsonPaths(paths, index + 1);
      });
  }

  function isStatsStale(data) {
    if (!data || !data.last_updated) {
      return true;
    }

    const updated = new Date(data.last_updated.replace(' ', 'T'));
    if (isNaN(updated.getTime())) {
      return true;
    }

    const hoursSinceUpdate = (Date.now() - updated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24;
  }

  function refreshStatsInBackground() {
    const phpPaths = [
      'assets/php/fetch_citations.php',
      './assets/php/fetch_citations.php',
      '/assets/php/fetch_citations.php'
    ];

    tryPhpPaths(phpPaths, 0);

    function tryPhpPaths(paths, index) {
      if (index >= paths.length) {
        return;
      }

      const cacheBuster = '?refresh=1&t=' + Date.now();
      fetch(paths[index] + cacheBuster, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Refresh failed');
          }
          return response.json();
        })
        .then(function (data) {
          if (data.citations || data.papers || data.hindex) {
            updateCounts(data, true);
          }
        })
        .catch(function () {
          tryPhpPaths(paths, index + 1);
        });
    }
  }

  // Function to update all counts
  function updateCounts(data, silent) {
    if (data.citations) {
      updateCounter('#citation-count', data.citations, silent);
    }

    if (data.papers) {
      updateCounter('#papers-count', data.papers, silent);
    }

    if (data.hindex) {
      updateCounter('#hindex-count', data.hindex, silent);
    }
  }

  function updateCounter(selector, value, silent) {
    const $el = $(selector);
    const currentValue = parseInt($el.text().replace(/,/g, ''), 10);

    if (!isNaN(currentValue) && currentValue === value) {
      return;
    }

    $el.text(value);

    if (!silent) {
      $el.counterUp({
        delay: 10,
        time: 1000
      });
    }
  }

  // Function to trigger counter animation on existing values
  function triggerCounterAnimation() {
    console.log('Triggering counter animation on embedded values');

    // The values are already in the HTML, just trigger the counter animation
    $('#citation-count').counterUp({
      delay: 10,
      time: 1000
    });

    $('#papers-count').counterUp({
      delay: 10,
      time: 1000
    });

    $('#hindex-count').counterUp({
      delay: 10,
      time: 1000
    });
  }

  // Function to load default values (fallback)
  function loadDefaults() {
    console.log('Loading default values as final fallback');

    // Set default values
    $('#citation-count').text('1457');
    $('#citation-count').counterUp({
      delay: 10,
      time: 1000
    });

    $('#papers-count').text('93');
    $('#papers-count').counterUp({
      delay: 10,
      time: 1000
    });

    $('#hindex-count').text('18');
    $('#hindex-count').counterUp({
      delay: 10,
      time: 1000
    });
  }

  // Fetch focus areas dynamically - refresh from server when available
  function fetchFocusAreas() {
    const phpPaths = [
      'assets/php/fetch_focus_areas.php',
      './assets/php/fetch_focus_areas.php',
      '/assets/php/fetch_focus_areas.php'
    ];

    const jsonPaths = [
      'assets/data/focus_areas.json',
      './assets/data/focus_areas.json',
      '/assets/data/focus_areas.json'
    ];

    tryFocusPaths(phpPaths, 0, function () {
      tryFocusPaths(jsonPaths, 0, function () {
        console.log('Focus areas: using static HTML fallback');
      });
    });
  }

  function tryFocusPaths(paths, index, onFailure) {
    if (index >= paths.length) {
      if (onFailure) {
        onFailure();
      }
      return;
    }

    fetchFreshFocusData(paths[index])
      .then(data => renderFocusAreas(data))
      .catch(function () {
        tryFocusPaths(paths, index + 1, onFailure);
      });
  }

  function fetchFreshFocusData(path) {
    const cacheBuster = '?t=' + Date.now() + '&r=' + Math.random() + '&v=' + Math.floor(Math.random() * 1000);
    return fetch(path + cacheBuster, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Focus areas fetch failed - Status: ' + response.status);
        }
        return response.json();
      });
  }

  function renderFocusAreas(data) {
    const container = document.getElementById('focus-areas-content');
    if (!container || !data.areas) {
      return;
    }

    const cardsHtml = data.areas.map(function (area, index) {
      const delayAttr = index > 0 ? ' data-aos-delay="' + (index * 100) + '"' : '';
      return (
        '<div class="col-lg-3 col-md-6" data-aos="fade-up"' + delayAttr + '>' +
          '<div class="focus-box">' +
            '<div class="icon"><i class="' + area.icon + '"></i></div>' +
            '<h4>' + area.title + '</h4>' +
            '<p>' + area.description + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    const tagsHtml = (data.tags || []).map(function (tag) {
      return '<span>' + tag + '</span>';
    }).join('');

    container.innerHTML =
      '<div class="row">' + cardsHtml + '</div>' +
      '<div class="focus-tags" data-aos="fade-up" data-aos-delay="400">' + tagsHtml + '</div>';

    if (typeof AOS !== 'undefined') {
      AOS.refreshHard();
    }
  }

  // Load counts when page loads
  $(document).ready(function () {
    fetchCounts();
    fetchFocusAreas();
  });

  // jQuery counterUp
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // Porfolio isotope and filter
  $(window).on('load', function () {
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows'
    });

    $('#portfolio-flters li').on('click', function () {
      $("#portfolio-flters li").removeClass('filter-active');
      $(this).addClass('filter-active');

      portfolioIsotope.isotope({
        filter: $(this).data('filter')
      });
    });

    // Initiate venobox (lightbox feature used in portofilo)
    $(document).ready(function () {
      $('.venobox').venobox();
    });
  });

  // Testimonials carousel (uses the Owl Carousel library)
  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 2
      },
      900: {
        items: 3
      }
    }
  });

  // Portfolio details carousel
  $(".portfolio-details-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });

  // Initi AOS
  AOS.init({
    duration: 1000,
    easing: "ease-in-out-back"
  });

})(jQuery);
