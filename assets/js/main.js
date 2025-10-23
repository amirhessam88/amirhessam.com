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

  // Fetch citation and papers count dynamically - ALWAYS fetch fresh data
  function fetchCounts() {
    console.log('Starting to fetch fresh statistics from Google Scholar...');

    // Try multiple paths for the PHP script (which fetches fresh data)
    const phpPaths = [
      'assets/php/fetch_citations.php',
      './assets/php/fetch_citations.php',
      '/assets/php/fetch_citations.php'
    ];

    // Try to load fresh data from PHP script with multiple paths
    tryPhpPaths(phpPaths, 0);

    function tryPhpPaths(paths, index) {
      if (index >= paths.length) {
        console.log('All PHP paths failed, trying static JSON as fallback...');
        tryStaticJson();
        return;
      }

      const currentPath = paths[index];
      console.log(`Trying PHP path: ${currentPath}`);

      // Add multiple cache-busting parameters for Chrome
      const cacheBuster = '?t=' + Date.now() + '&r=' + Math.random() + '&v=' + Math.floor(Math.random() * 1000);
      fetch(currentPath + cacheBuster, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(response => {
          console.log(`PHP fetch response status for ${currentPath}:`, response.status);
          if (!response.ok) {
            throw new Error(`PHP script failed - Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`Successfully loaded fresh data from PHP script (${currentPath}):`, data);
          updateCounts(data);
        })
        .catch(error => {
          console.log(`PHP path ${currentPath} failed:`, error.message);
          tryPhpPaths(paths, index + 1);
        });
    }

    function tryStaticJson() {
      console.log('Trying static JSON as fallback...');
      const jsonPaths = [
        'assets/data/stats.json',
        './assets/data/stats.json',
        '/assets/data/stats.json'
      ];

      tryJsonPaths(jsonPaths, 0);

      function tryJsonPaths(paths, index) {
        if (index >= paths.length) {
          console.log('All paths failed, using default values');
          loadDefaults();
          return;
        }

        const currentPath = paths[index];
        console.log(`Trying JSON path: ${currentPath}`);

        // Add multiple cache-busting parameters for JSON as well
        const cacheBuster = '?t=' + Date.now() + '&r=' + Math.random() + '&v=' + Math.floor(Math.random() * 1000);
        fetch(currentPath + cacheBuster, {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
          .then(response => {
            console.log(`JSON fetch response status for ${currentPath}:`, response.status);
            if (!response.ok) {
              throw new Error(`Static file not found - Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(`Successfully loaded from static JSON (${currentPath}):`, data);
            updateCounts(data);
          })
          .catch(error => {
            console.log(`JSON path ${currentPath} failed:`, error.message);
            tryJsonPaths(paths, index + 1);
          });
      }
    }
  }

  // Function to update all counts
  function updateCounts(data) {
    console.log('updateCounts called with data:', data);

    if (data.citations) {
      console.log('Updating citations to:', data.citations);
      $('#citation-count').text(data.citations);
      $('#citation-count').counterUp({
        delay: 10,
        time: 1000
      });
    }

    if (data.papers) {
      console.log('Updating papers to:', data.papers);
      $('#papers-count').text(data.papers);
      $('#papers-count').counterUp({
        delay: 10,
        time: 1000
      });
    }

    if (data.hindex) {
      console.log('Updating hindex to:', data.hindex);
      $('#hindex-count').text(data.hindex);
      $('#hindex-count').counterUp({
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

  // Load counts when page loads
  console.log('Main.js loaded, calling fetchCounts...');

  // Ensure jQuery is loaded before calling fetchCounts
  $(document).ready(function () {
    console.log('jQuery ready, calling fetchCounts...');
    // Add a small delay to ensure all elements are ready
    setTimeout(function () {
      fetchCounts();
    }, 500);
  });

  // jQuery counterUp
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // Skills section
  $('.skills-content').waypoint(function () {
    $('.progress .progress-bar').each(function () {
      $(this).css("width", $(this).attr("aria-valuenow") + '%');
    });
  }, {
    offset: '80%'
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
