!(function ($) {
  "use strict";

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

  // Fetch citation and papers count dynamically
  function fetchCounts() {
    fetch('fetch_citations.php')
      .then(response => response.json())
      .then(data => {
        if (data.citations) {
          // Update the citation count in the HTML
          $('#citation-count').text(data.citations);

          // Re-initialize counterUp for the updated citation count
          $('#citation-count').counterUp({
            delay: 10,
            time: 1000
          });
        }

        if (data.papers) {
          // Update the papers count in the HTML
          $('#papers-count').text(data.papers);

          // Re-initialize counterUp for the updated papers count
          $('#papers-count').counterUp({
            delay: 10,
            time: 1000
          });
        }

        if (data.hindex) {
          // Update the hindex count in the HTML
          $('#hindex-count').text(data.hindex);

          // Re-initialize counterUp for the updated hindex count
          $('#hindex-count').counterUp({
            delay: 10,
            time: 1000
          });
        }
      })
      .catch(error => {
        console.log('Error fetching counts:', error);
        // Fallback to cached values or defaults
        fetch('assets/data/citations.txt')
          .then(response => response.text())
          .then(text => {
            const citations = parseInt(text.trim());
            if (!isNaN(citations)) {
              $('#citation-count').text(citations);
              $('#citation-count').counterUp({
                delay: 10,
                time: 1000
              });
            }
          })
          .catch(err => {
            console.log('Error loading cached citations:', err);
            // Final fallback to a default value
            $('#citation-count').text('1251');
          });

        fetch('assets/data/papers.txt')
          .then(response => response.text())
          .then(text => {
            const papers = parseInt(text.trim());
            if (!isNaN(papers)) {
              $('#papers-count').text(papers);
              $('#papers-count').counterUp({
                delay: 10,
                time: 1000
              });
            }
          })
          .catch(err => {
            console.log('Error loading cached papers:', err);
            // Final fallback to a default value
            $('#papers-count').text('83');
          });

        fetch('assets/data/hindex.txt')
          .then(response => response.text())
          .then(text => {
            const hindex = parseInt(text.trim());
            if (!isNaN(hindex)) {
              $('#hindex-count').text(hindex);
              $('#hindex-count').counterUp({
                delay: 10,
                time: 1000
              });
            }
          })
          .catch(err => {
            console.log('Error loading cached hindex:', err);
            // Final fallback to a default value
            $('#hindex-count').text('16');
          });
      });
  }

  // Load counts when page loads
  fetchCounts();

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
