/**
 * Résumé logo ribbon: infinite marquee + pointer tilt / glow.
 */
(function () {
  "use strict";

  var SPEED = 0.45; // px per frame at ~60fps
  var PAUSED_SPEED = 0.08;

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function bindTilt(root) {
    root.addEventListener("pointermove", function (e) {
      var item = e.target.closest(".logo-ribbon__item");
      if (!item || !root.contains(item)) return;
      var rect = item.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      var py = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      item.style.setProperty("--tilt-x", py.toFixed(2) + "deg");
      item.style.setProperty("--tilt-y", px.toFixed(2) + "deg");
      item.classList.add("is-lit");
    });

    root.addEventListener(
      "pointerout",
      function (e) {
        var item = e.target.closest(".logo-ribbon__item");
        if (!item || !root.contains(item)) return;
        if (e.relatedTarget && item.contains(e.relatedTarget)) return;
        item.classList.remove("is-lit");
        item.style.setProperty("--tilt-x", "0deg");
        item.style.setProperty("--tilt-y", "0deg");
      },
      true
    );
  }

  function init() {
    var ribbon = document.querySelector(".logo-ribbon");
    if (!ribbon) return;

    var track = ribbon.querySelector(".logo-ribbon__track");
    var set = ribbon.querySelector(".logo-ribbon__set");
    if (!track || !set) return;

    bindTilt(track);

    if (prefersReducedMotion()) {
      ribbon.classList.add("is-static");
      return;
    }

    // Duplicate the set for a seamless loop
    var clone = set.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);

    var offset = 0;
    var hovering = false;
    var rafId = 0;
    var setWidth = 0;

    function measure() {
      setWidth = set.getBoundingClientRect().width;
    }

    function tick() {
      var speed = hovering ? PAUSED_SPEED : SPEED;
      offset += speed;
      if (setWidth > 0 && offset >= setWidth) {
        offset -= setWidth;
      }
      track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
      rafId = window.requestAnimationFrame(tick);
    }

    ribbon.addEventListener("pointerenter", function () {
      hovering = true;
      ribbon.classList.add("is-paused");
    });
    ribbon.addEventListener("pointerleave", function () {
      hovering = false;
      ribbon.classList.remove("is-paused");
    });

    measure();
    window.addEventListener("resize", measure);
    Array.prototype.forEach.call(set.querySelectorAll("img"), function (img) {
      if (img.complete) return;
      img.addEventListener("load", measure);
    });

    rafId = window.requestAnimationFrame(tick);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
