/**
 * Résumé interactions (light theme):
 * 1) scroll-linked spine
 * 3) chronolog reveal on enter
 * 4) Industry / Academia / All filters
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function visibleItems(track) {
    return Array.prototype.slice
      .call(track.querySelectorAll(".resume-item"))
      .filter(function (item) {
        return !item.classList.contains("is-filtered-out");
      });
  }

  function initTrack(track) {
    var progress = track.querySelector(".resume-progress");
    var ticking = false;
    var reduceMotion = prefersReducedMotion();

    function update() {
      ticking = false;
      var items = visibleItems(track);
      if (!items.length) {
        if (progress) progress.style.height = "0px";
        return;
      }

      var viewportMid = window.innerHeight * 0.4;
      var bestIndex = 0;
      var bestDist = Infinity;

      for (var i = 0; i < items.length; i++) {
        var rect = items[i].getBoundingClientRect();
        var itemMid = rect.top + Math.min(rect.height, 80) * 0.35;
        var dist = Math.abs(itemMid - viewportMid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }

      var trackRect = track.getBoundingClientRect();
      if (trackRect.bottom < viewportMid) bestIndex = items.length - 1;
      else if (trackRect.top > viewportMid + 80) bestIndex = 0;

      var allItems = track.querySelectorAll(".resume-item");
      for (var k = 0; k < allItems.length; k++) {
        allItems[k].classList.remove("is-active", "is-past");
      }

      for (var j = 0; j < items.length; j++) {
        items[j].classList.toggle("is-active", j === bestIndex);
        items[j].classList.toggle("is-past", j < bestIndex);
      }

      if (progress) {
        var trackTop = track.getBoundingClientRect().top + window.pageYOffset;
        var activeTop =
          items[bestIndex].getBoundingClientRect().top + window.pageYOffset;
        var height = Math.max(0, activeTop - trackTop + 8);
        if (reduceMotion) progress.style.transition = "none";
        progress.style.height = height + "px";
      }
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0] && entries[0].isIntersecting) onScrollOrResize();
        },
        { rootMargin: "20% 0px 20% 0px", threshold: [0, 0.1, 0.5, 1] }
      );
      observer.observe(track);
    }

    update();
    return { update: update };
  }

  function initFilters(section, tracks) {
    var buttons = section.querySelectorAll(".resume-filter");
    if (!buttons.length) return;

    function applyFilter(filter) {
      var items = section.querySelectorAll(".resume-item[data-track]");
      for (var i = 0; i < items.length; i++) {
        var show = filter === "all" || items[i].getAttribute("data-track") === filter;
        items[i].classList.toggle("is-filtered-out", !show);
      }

      var eduCol = section.querySelector('[data-resume-col="academia"]');
      if (eduCol) eduCol.classList.toggle("is-hidden", filter === "industry");

      var expCol = section.querySelector('[data-resume-col="experience"]');
      if (expCol) {
        if (filter === "industry") {
          expCol.classList.remove("col-lg-8");
          expCol.classList.add("col-lg-12");
        } else {
          expCol.classList.add("col-lg-8");
          expCol.classList.remove("col-lg-12");
        }
      }

      for (var t = 0; t < tracks.length; t++) {
        if (tracks[t] && tracks[t].update) tracks[t].update();
      }
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener("click", function (e) {
        var btn = e.currentTarget;
        var filter = btn.getAttribute("data-filter") || "all";
        for (var i = 0; i < buttons.length; i++) {
          var active = buttons[i] === btn;
          buttons[i].classList.toggle("is-active", active);
          buttons[i].setAttribute("aria-selected", active ? "true" : "false");
        }
        applyFilter(filter);
      });
    }
  }

  function initChronolog(section) {
    var items = section.querySelectorAll(".resume-item");
    if (!items.length) return;
    var reduceMotion = prefersReducedMotion();

    function reveal() {
      if (section.classList.contains("has-booted")) return;
      section.classList.add("has-booted");

      if (reduceMotion) {
        for (var i = 0; i < items.length; i++) items[i].classList.add("is-revealed");
        return;
      }

      section.classList.add("is-booting");
      for (var j = 0; j < items.length; j++) {
        (function (item, index) {
          window.setTimeout(function () {
            item.classList.add("is-revealed");
            if (index === items.length - 1) section.classList.remove("is-booting");
          }, 70 * index);
        })(items[j], j);
      }
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0] && entries[0].isIntersecting) {
            reveal();
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(section);
    } else {
      reveal();
    }
  }

  function init() {
    var section = document.getElementById("resume");
    if (!section) return;

    var trackEls = section.querySelectorAll(".resume-track");
    var tracks = [];
    for (var i = 0; i < trackEls.length; i++) {
      tracks.push(initTrack(trackEls[i]));
    }

    initFilters(section, tracks);
    initChronolog(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
